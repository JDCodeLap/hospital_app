"""FastAPI 앱 진입점.

역할: 화면(Next.js)에서 오는 요청을 받아, DB(PostgreSQL)에서 데이터를 꺼내 돌려준다.
- 1.2: 화면↔백엔드↔DB 연결 증명(test-data)
- 1.3: 직원 로그인(토큰 발급)
"""

import re
from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta

from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import or_, text
from sqlalchemy.exc import IntegrityError, OperationalError
from sqlmodel import Session, col, select

from .config import settings
from .database import engine, get_session, init_db
from .models import (
    Billing,
    ChecklistCheck,
    Diagnosis,
    HandoverNote,
    LabResult,
    Medication,
    MedicationAdministration,
    Patient,
    SafetyAck,
    StageEntry,
    Staff,
    TestItem,
    Visit,
)
from .realtime import manager
from .safety import check_contraindications
from .security import (
    authenticate_ws_token,
    create_access_token,
    get_current_admin,
    get_current_user,
    hash_password,
    verify_password,
)


class VisitIn(BaseModel):
    """방문기록 추가 요청 본문(시연용 쓰기)."""

    department: str
    reason: str = ""


class MedicationIn(BaseModel):
    """처방(투약) 추가 요청 본문.

    acknowledged=True는 "알레르기 경고를 보고도 직원이 책임지고 계속 진행"을 뜻한다(Story 3.1).
    """

    drug_name: str
    dose: str = ""
    schedule: str = ""
    acknowledged: bool = False


class AdministerIn(BaseModel):
    """투약 완료 처리 요청 본문(Story 3.3). 어느 예정 시각 슬롯을 줬는지."""

    scheduled_time: str


class ChecklistToggleIn(BaseModel):
    """필수 절차 체크 토글 요청 본문(Story 3.4). True=체크, False=해제."""

    checked: bool


class HandoverNoteIn(BaseModel):
    """부서 간 인계 메모 작성 요청 본문(Story 4.2, FR8). 내용만 받는다.

    from_stage(작성 시점의 단계)는 클라이언트가 보내지 않고 서버가 자동 기록한다(조작 방지).
    """

    note: str


class StaffCreateIn(BaseModel):
    """직원 등록 요청 본문(Story 5.2, FR11)."""

    username: str
    password: str
    full_name: str = ""
    role: str = "staff"
    job_title: str = ""


class StaffUpdateIn(BaseModel):
    """직원 수정 요청 본문(Story 5.2). 부분 수정 — 보낸 필드만 변경한다.

    password는 None/빈 값이면 기존 비밀번호를 그대로 유지한다(빈 해시 덮어쓰기 방지).
    """

    full_name: str | None = None
    role: str | None = None
    job_title: str | None = None
    is_active: bool | None = None
    password: str | None = None


# 인계 메모 길이 상한(Story 4.2). 메모는 모든 조회 묶음·broadcast에 실려 나가므로
# 무한 길이 입력이 응답을 비대화하지 않도록 서버에서 상한을 강제(빈 메모 422와 같은 게이트).
HANDOVER_NOTE_MAX_LEN = 2000


# 필수 절차 체크리스트의 표준 항목(Story 3.4, FR6).
# 항목 추가/편집은 관리자 기능(Epic 5) — 지금은 백엔드 상수 단일 세트.
CHECKLIST_ITEMS = [
    {"key": "identity", "label": "본인 확인"},
    {"key": "fasting", "label": "금식 확인"},
    {"key": "consent", "label": "동의서 확인"},
]
CHECKLIST_KEYS = {item["key"] for item in CHECKLIST_ITEMS}

# 환자 진행 단계 순서(접수→진료→검사→수납). "다음 단계로"는 이 순서로 이동.
STAGE_ORDER = ["접수", "진료", "검사", "수납"]

# 한 단계에 이 분(分) 이상 머물면 '대기 초과'로 판정(Story 4.4, FR10).
# 관리자가 직접 바꾸는 기능(FR14)은 Story 5.5 — 지금은 백엔드 상수 단일 기준.
STAGE_OVERDUE_MINUTES = 30


# 권한(role)은 2단계만 — 관리자 페이지 접근 여부(Story 5.2). 세분화 권한은 Story 5.3.
VALID_ROLES = {"admin", "staff"}
# 직군(job_title)은 분류·표시용(권한과 무관). 자유 입력 대신 권장 목록을 둔다("기타"로 여유).
JOB_TITLES = ["의사", "간호사", "원무과", "기타"]


def normalize_role(raw: str) -> str:
    """권한 표기를 정규화(Story 5.2). 'admin'/'staff'만 허용, 그 외는 422.

    5.1에서 미뤄둔 항목 이행: 관리자가 역할을 편집하므로 ' Admin'·'ADMIN' 같은 입력이
    조용히 권한 미부여(메뉴/게이트 불일치)를 일으키지 않도록 strip().lower()로 정규화한다.
    프론트(=== "admin")·백엔드(get_current_admin)·DB 값이 항상 일치하게 만든다.
    """
    role = (raw or "").strip().lower()
    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=422, detail="권한은 admin 또는 staff만 가능합니다"
        )
    return role


def staff_public(s: Staff) -> dict[str, object]:
    """직원 1명을 화면용으로 직렬화(Story 5.2). 비밀번호 해시는 절대 포함하지 않는다.

    응답 직렬화를 이 한 곳으로 모아 'hashed_password 노출' 실수를 원천 차단한다(NFR3).
    """
    return {
        "id": s.id,
        "username": s.username,
        "full_name": s.full_name,
        "role": s.role,
        "job_title": s.job_title,
        "is_active": s.is_active,
    }


def assert_not_last_admin(session: Session, target: Staff) -> None:
    """대상이 '활성 관리자'인데 그가 마지막 1명이면 강등/삭제/비활성화를 막는다(Story 5.2).

    관리자가 0명이 되면 누구도 /admin에 못 들어가는 영구 잠금(self-lockout)이 되므로,
    활성 admin 수가 1명 이하일 때 마지막 관리자에 대한 그런 변경을 409로 거부한다.
    """
    if target.role == "admin" and target.is_active:
        active_admins = session.exec(
            select(Staff).where(
                Staff.role == "admin",
                Staff.is_active == True,  # noqa: E712 (SQL 비교 — `is True` 아님)
            )
        ).all()
        if len(active_admins) <= 1:
            raise HTTPException(
                status_code=409,
                detail="마지막 관리자는 강등·삭제·비활성화할 수 없습니다",
            )


def next_stage(stage: str) -> str | None:
    """현재 단계의 다음 단계를 반환. 마지막(수납)이거나 알 수 없는 값이면 None."""
    if stage in STAGE_ORDER:
        idx = STAGE_ORDER.index(stage)
        if idx + 1 < len(STAGE_ORDER):
            return STAGE_ORDER[idx + 1]
    return None


def stage_wait_info(
    entered_at: datetime | None, now: datetime
) -> tuple[int | None, bool]:
    """현재 단계 진입 시각 → (대기 분, 대기초과 여부)(Story 4.4).

    진입 기록이 없으면 (None, False). 음수(시계 역행)는 0으로 보정.
    기준(STAGE_OVERDUE_MINUTES) 이상이면 대기 초과(True).
    """
    if entered_at is None:
        return None, False
    minutes = int((now - entered_at).total_seconds() // 60)
    if minutes < 0:
        minutes = 0
    return minutes, minutes >= STAGE_OVERDUE_MINUTES


# 투약 시간 문자열에서 유효한 "HH:MM"만 골라내는 정규식(00:00~23:59)
_HM_PATTERN = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def parse_schedule_times(schedule: str) -> list[str]:
    """투약 시간 문자열(예 "08:00,20:00")에서 유효한 HH:MM 시각만 정렬해 반환.

    "필요시"처럼 시각이 아닌 토큰은 무시한다(알림 대상에서 제외).
    """
    times: list[str] = []
    for token in (schedule or "").split(","):
        t = token.strip()
        if _HM_PATTERN.match(t) and t not in times:
            times.append(t)
    return sorted(times)


def calc_age(birth: date, today: date | None = None) -> int:
    """생년월일 → 만 나이 계산."""
    today = today or date.today()
    age = today.year - birth.year - (
        (today.month, today.day) < (birth.month, birth.day)
    )
    return max(age, 0)  # 잘못 입력된 미래 생년월일에서 음수 나이 방지


def seed_patients(session: Session) -> None:
    """샘플 환자 8명 + 진단·투약·검사·수납을 다양하게 시드(비어 있을 때만).

    실제로 써볼 수 있도록 이름·진행단계·알레르기·수납상태를 골고루 섞었다.
    김철수(P0001)에는 페니실린 알레르기 — EXPERIENCE Flow 1 / Epic 3 안전경고 대비.
    """
    if session.exec(select(Patient)).first() is not None:
        return  # 이미 환자가 있으면 다시 넣지 않음(중복 방지)

    # (환자, 진단들, 투약들, 검사들, 수납들, 방문들) 묶음으로 정의
    seed_data = [
        {
            "patient": Patient(
                registration_number="P0001", name="김철수",
                birth_date=date(1970, 3, 5), gender="M",
                allergies="페니실린", current_stage="진료",
            ),
            "diagnoses": [
                Diagnosis(name="고혈압", diagnosed_at=date(2026, 6, 1)),
                Diagnosis(name="제2형 당뇨", diagnosed_at=date(2025, 11, 20)),
            ],
            "medications": [
                Medication(drug_name="암로디핀", dose="5mg", schedule="08:00"),
                Medication(drug_name="메트포르민", dose="500mg", schedule="08:00,20:00"),
            ],
            "labs": [
                LabResult(test_name="혈압", value="150/95", unit="mmHg",
                          flag="abnormal", measured_at=datetime(2026, 6, 20, 9, 0)),
                LabResult(test_name="공복혈당", value="160", unit="mg/dL",
                          flag="abnormal", measured_at=datetime(2026, 6, 20, 9, 10)),
            ],
            "billings": [Billing(item="진료비", amount=15000, status="unpaid")],
            "visits": [Visit(visited_at=datetime(2026, 6, 20, 8, 50),
                             department="내과", reason="혈압 조절")],
        },
        {
            "patient": Patient(
                registration_number="P0002", name="이영희",
                birth_date=date(1985, 7, 22), gender="F",
                allergies="", current_stage="검사",
            ),
            "diagnoses": [Diagnosis(name="편두통", diagnosed_at=date(2026, 6, 18))],
            "medications": [Medication(drug_name="수마트립탄", dose="50mg", schedule="필요시")],
            "labs": [LabResult(test_name="뇌 CT", value="정상", unit="",
                               flag="normal", measured_at=datetime(2026, 6, 20, 10, 30))],
            "billings": [Billing(item="영상검사비", amount=88000, status="unpaid")],
            "visits": [Visit(visited_at=datetime(2026, 6, 20, 10, 0),
                             department="신경과", reason="두통")],
        },
        {
            "patient": Patient(
                registration_number="P0003", name="박민수",
                birth_date=date(1992, 1, 15), gender="M",
                allergies="아스피린,조영제", current_stage="수납",
            ),
            "diagnoses": [Diagnosis(name="발목 염좌", diagnosed_at=date(2026, 6, 20))],
            "medications": [Medication(drug_name="아세트아미노펜", dose="650mg",
                                       schedule="08:00,14:00,20:00")],
            "labs": [LabResult(test_name="발목 X-ray", value="골절 없음", unit="",
                               flag="normal", measured_at=datetime(2026, 6, 20, 11, 0))],
            "billings": [Billing(item="진료비", amount=12000, status="paid"),
                         Billing(item="처치료", amount=23000, status="paid")],
            "visits": [Visit(visited_at=datetime(2026, 6, 20, 10, 40),
                             department="정형외과", reason="발목 통증")],
        },
        {
            "patient": Patient(
                registration_number="P0004", name="최지우",
                birth_date=date(2001, 9, 9), gender="F",
                allergies="", current_stage="접수",
            ),
            "diagnoses": [Diagnosis(name="급성 위염", diagnosed_at=date(2026, 6, 20))],
            "medications": [Medication(drug_name="판토프라졸", dose="40mg", schedule="08:00")],
            "labs": [LabResult(test_name="복부 초음파", value="특이소견 없음", unit="",
                               flag="normal", measured_at=datetime(2026, 6, 20, 11, 40))],
            "billings": [Billing(item="진료비", amount=11000, status="unpaid")],
            "visits": [Visit(visited_at=datetime(2026, 6, 20, 11, 20),
                             department="내과", reason="복통")],
        },
        {
            "patient": Patient(
                registration_number="P0005", name="정해성",
                birth_date=date(1958, 12, 1), gender="M",
                allergies="설파제", current_stage="진료",
            ),
            "diagnoses": [
                Diagnosis(name="만성 신부전", diagnosed_at=date(2024, 3, 10)),
                Diagnosis(name="고지혈증", diagnosed_at=date(2025, 5, 2)),
            ],
            "medications": [Medication(drug_name="아토르바스타틴", dose="20mg", schedule="20:00")],
            "labs": [LabResult(test_name="크레아티닌", value="2.4", unit="mg/dL",
                               flag="abnormal", measured_at=datetime(2026, 6, 20, 8, 30))],
            "billings": [Billing(item="진료비", amount=15000, status="unpaid"),
                         Billing(item="검사비", amount=42000, status="unpaid")],
            "visits": [Visit(visited_at=datetime(2026, 6, 20, 8, 15),
                             department="신장내과", reason="정기 추적")],
        },
        {
            "patient": Patient(
                registration_number="P0006", name="강서연",
                birth_date=date(1996, 4, 18), gender="F",
                allergies="", current_stage="검사",
            ),
            "diagnoses": [Diagnosis(name="갑상선 기능저하", diagnosed_at=date(2026, 2, 14))],
            "medications": [Medication(drug_name="레보티록신", dose="50mcg", schedule="07:00")],
            "labs": [LabResult(test_name="TSH", value="6.2", unit="mIU/L",
                               flag="abnormal", measured_at=datetime(2026, 6, 20, 9, 40))],
            "billings": [Billing(item="검사비", amount=35000, status="unpaid")],
            "visits": [Visit(visited_at=datetime(2026, 6, 20, 9, 20),
                             department="내분비내과", reason="갑상선 추적")],
        },
        {
            "patient": Patient(
                registration_number="P0007", name="윤도현",
                birth_date=date(1978, 8, 30), gender="M",
                allergies="", current_stage="수납",
            ),
            "diagnoses": [Diagnosis(name="역류성 식도염", diagnosed_at=date(2026, 6, 19))],
            "medications": [Medication(drug_name="에소메프라졸", dose="40mg", schedule="08:00")],
            "labs": [LabResult(test_name="위내시경", value="경미한 염증", unit="",
                               flag="abnormal", measured_at=datetime(2026, 6, 20, 10, 10))],
            "billings": [Billing(item="내시경비", amount=120000, status="paid")],
            "visits": [Visit(visited_at=datetime(2026, 6, 20, 9, 50),
                             department="소화기내과", reason="속쓰림")],
        },
        {
            "patient": Patient(
                registration_number="P0008", name="한가람",
                birth_date=date(2015, 5, 25), gender="F",
                allergies="땅콩,계란", current_stage="진료",
            ),
            "diagnoses": [Diagnosis(name="알레르기성 비염", diagnosed_at=date(2026, 6, 20))],
            "medications": [Medication(drug_name="세티리진", dose="5mg", schedule="20:00")],
            "labs": [LabResult(test_name="알레르기 검사", value="땅콩 양성", unit="",
                               flag="abnormal", measured_at=datetime(2026, 6, 20, 11, 30))],
            "billings": [Billing(item="진료비", amount=9000, status="unpaid")],
            "visits": [Visit(visited_at=datetime(2026, 6, 20, 11, 10),
                             department="소아청소년과", reason="코막힘")],
        },
    ]

    for entry in seed_data:
        patient = entry["patient"]
        session.add(patient)
        session.flush()  # commit 없이 id만 확보 → 전체를 한 트랜잭션으로(중간 실패 시 통째 롤백)
        children = (
            entry["diagnoses"] + entry["medications"]
            + entry["labs"] + entry["billings"] + entry["visits"]
        )
        for child in children:
            child.patient_id = patient.id
        session.add_all(children)
    session.commit()  # 모든 환자+자식을 한 번에 커밋(원자성)


# 기존 환자 백필용 진입 시각 오프셋(분). 데모 가시성을 위해 분산 →
# 30분 기준으로 일부(50·40·35·70·45 = 5명)가 즉시 '대기 초과'로 보이게.
_BACKFILL_OFFSETS_MIN = [50, 5, 40, 10, 35, 70, 20, 45]


def backfill_stage_entries(session: Session) -> None:
    """진입 기록이 없는 환자에 StageEntry를 1건씩 채운다(Story 4.4, 멱등).

    이 기능 이후 advance한 환자에게만 진입 시각이 생기므로, 이미 시드된 환자는
    여기서 채운다. 데모로 일부가 대기 초과로 보이도록 entered_at을 과거로 분산한다.
    이미 기록이 있는 환자는 건너뛴다 → 서버를 재시작해도 시각이 다시 바뀌지 않음.
    """
    now = datetime.now()
    existing = {e.patient_id for e in session.exec(select(StageEntry)).all()}
    patients = session.exec(select(Patient).order_by(Patient.id)).all()
    added = False
    for i, p in enumerate(patients):
        if p.id in existing:
            continue  # 이미 기록 있음 → 건너뜀(멱등)
        offset = _BACKFILL_OFFSETS_MIN[i % len(_BACKFILL_OFFSETS_MIN)]
        session.add(
            StageEntry(
                patient_id=p.id,
                stage=p.current_stage,
                entered_at=now - timedelta(minutes=offset),
            )
        )
        added = True
    if added:
        session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 시작 시: 테이블 생성 + 비어 있으면 테스트/계정 샘플 시드
    try:
        init_db()
        with Session(engine) as session:
            # 기존 staff 테이블에 job_title(직군) 컬럼 보강(Story 5.2) — 멱등.
            # create_all은 없는 테이블만 만들고 기존 테이블에 컬럼을 ALTER하지 못한다(1-2 deferred).
            # 직군은 Staff의 1:1 속성이라 새 테이블로 우회하지 않고 컬럼을 더한다.
            # Postgres ADD COLUMN IF NOT EXISTS는 멱등 → 재시작·기존 DB 모두 안전, 데이터 보존.
            # (빈 DB라면 create_all이 이미 컬럼을 포함해 만들었으므로 IF NOT EXISTS가 건너뛴다.)
            session.execute(
                text(
                    "ALTER TABLE staff "
                    "ADD COLUMN IF NOT EXISTS job_title VARCHAR NOT NULL DEFAULT ''"
                )
            )
            session.commit()
            # 연결 증명용 테스트 데이터(1.2)
            if session.exec(select(TestItem)).first() is None:
                session.add_all(
                    [
                        TestItem(name="연결 테스트 1", note="백엔드↔DB 연결 확인용 샘플"),
                        TestItem(name="연결 테스트 2", note="두 번째 샘플 행"),
                        TestItem(name="연결 테스트 3", note="세 번째 샘플 행"),
                    ]
                )
                session.commit()
            # 로그인 테스트용 직원 계정(1.3)
            if session.exec(select(Staff)).first() is None:
                session.add(
                    Staff(
                        username="nurse1",
                        hashed_password=hash_password("test1234"),
                        full_name="김지영",
                        role="staff",
                    )
                )
                session.commit()
            # 관리자 계정(5.1) — username으로 존재 확인 후 없으면 생성(멱등).
            # 위 "비었을 때만" 분기는 이미 nurse1이 있으면 안 타므로 별도 블록이 필요하다.
            if (
                session.exec(
                    select(Staff).where(Staff.username == "admin1")
                ).first()
                is None
            ):
                session.add(
                    Staff(
                        username="admin1",
                        hashed_password=hash_password("admin1234"),
                        full_name="관리자",
                        role="admin",
                    )
                )
                session.commit()
            # 시드 계정 직군 백필(5.2, 멱등) — 직군이 비어 있을 때만 채운다(데모 가시성).
            _seed_job_titles = {"nurse1": "간호사", "admin1": "원무과"}
            _jt_changed = False
            for _uname, _jt in _seed_job_titles.items():
                _s = session.exec(
                    select(Staff).where(Staff.username == _uname)
                ).first()
                if _s is not None and not _s.job_title:
                    _s.job_title = _jt
                    session.add(_s)
                    _jt_changed = True
            if _jt_changed:
                session.commit()
            # 샘플 환자 데이터(2.1) — 비어 있을 때만
            seed_patients(session)
            # 환자 단계 진입 시각 백필(4.4) — 기록 없는 환자만(멱등)
            backfill_stage_entries(session)
    except OperationalError as exc:
        # DB가 꺼져 있을 때 알 수 없는 스택트레이스 대신 친절한 안내 후 시작 중단
        raise RuntimeError(
            "DB에 연결할 수 없습니다 — PostgreSQL(서비스 postgresql-17)이 켜져 있는지, "
            "backend/.env 의 DATABASE_URL 이 올바른지 확인하세요."
        ) from exc
    yield


app = FastAPI(title="hospital-app API", lifespan=lifespan)

# CORS: 화면(프론트, localhost:3000)에서 오는 요청만 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_credentials=False,  # 현재 쿠키/인증 미사용 → 끄는 게 안전(로그인 도입 시 재검토)
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    """서버가 살아있는지 확인(DB 없이)."""
    return {"status": "ok"}


@app.get("/api/db-check")
def db_check(session: Session = Depends(get_session)) -> dict[str, str]:
    """DB까지 실제로 연결되는지 확인(SELECT 1 실행)."""
    session.execute(text("SELECT 1"))
    return {"db": "connected"}


@app.get("/api/test-data")
def test_data(session: Session = Depends(get_session)) -> list[TestItem]:
    """테스트 데이터를 DB에서 읽어 화면으로 돌려준다(연결 증명)."""
    return list(session.exec(select(TestItem)).all())


@app.post("/api/auth/login")
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
) -> dict[str, str]:
    """아이디·비밀번호로 로그인 → 성공 시 토큰 발급, 실패 시 401."""
    staff = session.exec(
        select(Staff).where(Staff.username == form.username)
    ).first()
    valid = False
    if staff is not None:
        try:
            valid = verify_password(form.password, staff.hashed_password)
        except ValueError:
            # 비정상적으로 긴 비밀번호(예: bcrypt 72바이트 초과) 등은 잘못된 자격증명으로 처리
            valid = False
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 올바르지 않습니다",
        )
    token = create_access_token(str(staff.id))  # 토큰 sub = 불변 id
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/auth/me")
def me(current: Staff = Depends(get_current_user)) -> dict[str, object]:
    """현재 로그인한 직원 정보(토큰 동작 확인용). 비밀번호 해시는 절대 노출하지 않음."""
    return {
        "id": current.id,
        "username": current.username,
        "full_name": current.full_name,
        "role": current.role,
    }


@app.get("/api/admin/overview")
def admin_overview(
    current: Staff = Depends(get_current_admin),  # 관리자만(NFR2) — 일반 직원은 403
    session: Session = Depends(get_session),
) -> dict[str, int]:
    """관리자 페이지 랜딩용 최소 요약(Story 5.1). 전체 직원 수·환자 수.

    이 엔드포인트의 목적은 ①관리자 게이트(get_current_admin) 증명 ②랜딩의 최소 콘텐츠.
    오늘 환자 수·과별 혼잡도·평균 대기시간 등 본격 대시보드는 Story 5.4(FR13).
    """
    staff_count = len(session.exec(select(Staff)).all())
    patient_count = len(session.exec(select(Patient)).all())
    return {"staff_count": staff_count, "patient_count": patient_count}


@app.get("/api/admin/staff")
def list_staff(
    current: Staff = Depends(get_current_admin),  # 관리자만(NFR2)
    session: Session = Depends(get_session),
) -> list[dict[str, object]]:
    """직원 목록(Story 5.2, FR11). 비밀번호 해시는 노출하지 않는다(staff_public)."""
    rows = session.exec(select(Staff).order_by(Staff.username)).all()
    return [staff_public(s) for s in rows]


@app.post("/api/admin/staff")
def create_staff(
    payload: StaffCreateIn,
    current: Staff = Depends(get_current_admin),  # 관리자만(NFR2)
    session: Session = Depends(get_session),
) -> dict[str, object]:
    """직원 등록(Story 5.2). 아이디 중복 409, 빈 아이디/비번 422, 권한 정규화."""
    username = payload.username.strip()
    if not username:
        raise HTTPException(status_code=422, detail="아이디를 입력하세요")
    if not payload.password.strip():
        raise HTTPException(status_code=422, detail="비밀번호를 입력하세요")
    role = normalize_role(payload.role)

    # 사전 중복 확인(친절한 메시지) + IntegrityError 폴백(동시 등록 경합 안전)
    if session.exec(
        select(Staff).where(Staff.username == username)
    ).first() is not None:
        raise HTTPException(status_code=409, detail="이미 사용 중인 아이디입니다")

    staff = Staff(
        username=username,
        hashed_password=hash_password(payload.password),  # 1.3 해시 재사용(평문 금지)
        full_name=payload.full_name.strip(),
        role=role,
        job_title=payload.job_title.strip(),
        is_active=True,
    )
    session.add(staff)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=409, detail="이미 사용 중인 아이디입니다")
    session.refresh(staff)
    return staff_public(staff)


@app.patch("/api/admin/staff/{staff_id}")
def update_staff(
    staff_id: int,
    payload: StaffUpdateIn,
    current: Staff = Depends(get_current_admin),  # 관리자만(NFR2)
    session: Session = Depends(get_session),
) -> dict[str, object]:
    """직원 수정(Story 5.2). 보낸 필드만 변경. 비번은 새 값일 때만 교체(빈 값=유지).

    마지막 관리자를 강등(admin→staff)하거나 비활성화하려 하면 거부(self-lockout 방지).
    """
    staff = session.get(Staff, staff_id)
    if staff is None:
        raise HTTPException(status_code=404, detail="직원을 찾을 수 없습니다")

    # 마지막 관리자 보호: '관리자에서 빠지는' 변경(강등/비활성화)이면 먼저 검사
    new_role = normalize_role(payload.role) if payload.role is not None else staff.role
    demoting = staff.role == "admin" and new_role != "admin"
    deactivating = payload.is_active is False and staff.is_active
    if demoting or deactivating:
        assert_not_last_admin(session, staff)

    if payload.full_name is not None:
        staff.full_name = payload.full_name.strip()
    if payload.job_title is not None:
        staff.job_title = payload.job_title.strip()
    if payload.role is not None:
        staff.role = new_role
    if payload.is_active is not None:
        staff.is_active = payload.is_active
    # 비밀번호는 새로 입력했을 때만 교체 — 빈 값/None이면 기존 해시 유지(빈 해시 덮어쓰기 방지)
    if payload.password is not None and payload.password.strip():
        staff.hashed_password = hash_password(payload.password)

    session.add(staff)
    session.commit()
    session.refresh(staff)
    return staff_public(staff)


@app.delete("/api/admin/staff/{staff_id}")
def delete_staff(
    staff_id: int,
    current: Staff = Depends(get_current_admin),  # 관리자만(NFR2)
    session: Session = Depends(get_session),
) -> dict[str, object]:
    """직원 삭제(Story 5.2). 자기 자신·마지막 관리자 보호. 활동 기록 있으면 비활성화 안내.

    하드 삭제를 시도하되, 이 직원이 남긴 기록(SafetyAck/투약완료/체크/인계메모의 FK)이 있으면
    IntegrityError → 409로 "비활성화하세요" 안내(is_active=False면 토큰이 거부되어 로그인 차단).
    """
    staff = session.get(Staff, staff_id)
    if staff is None:
        raise HTTPException(status_code=404, detail="직원을 찾을 수 없습니다")
    if staff.id == current.id:
        raise HTTPException(status_code=409, detail="자기 계정은 삭제할 수 없습니다")
    assert_not_last_admin(session, staff)  # 대상이 마지막 관리자면 막음

    session.delete(staff)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="이 직원은 활동 기록이 있어 삭제할 수 없습니다. 대신 비활성화하세요.",
        )
    return {"deleted": staff_id}


@app.get("/api/patients")
def list_patients(
    q: str | None = None,  # 검색어(선택): 이름 또는 등록번호 부분일치. 비면 전체 목록(2.2)
    current: Staff = Depends(get_current_user),  # 로그인한 직원만(NFR3)
    session: Session = Depends(get_session),
) -> list[dict[str, object]]:
    """환자 목록(요약). q가 있으면 이름·등록번호로 대소문자 무시 부분일치 검색."""
    stmt = select(Patient)
    term = q.strip() if q else ""  # 앞뒤 공백 제거 → 공백만 입력은 '검색어 없음'으로 취급
    if term:
        # 사용자 입력은 ilike 파라미터로 바인딩 → SQL 인젝션 방지.
        # 추가로 LIKE 특수문자(\, %, _)를 이스케이프 → 사용자가 친 글자 그대로 매칭(과매칭 방지).
        escaped = term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        like = f"%{escaped}%"
        stmt = stmt.where(
            or_(
                col(Patient.name).ilike(like, escape="\\"),
                col(Patient.registration_number).ilike(like, escape="\\"),
            )
        )
    patients = session.exec(stmt.order_by(Patient.registration_number)).all()
    # 대기 시간(4.4): 전 환자의 단계 진입 시각을 한 번에 조회해 맵으로(N+1 방지).
    now = datetime.now()
    entered_map = {
        e.patient_id: e.entered_at
        for e in session.exec(select(StageEntry)).all()
    }
    result = []
    for p in patients:
        waiting_minutes, is_overdue = stage_wait_info(entered_map.get(p.id), now)
        result.append(
            {
                "id": p.id,
                "registration_number": p.registration_number,
                "name": p.name,
                "age": calc_age(p.birth_date),
                "gender": p.gender,
                "current_stage": p.current_stage,
                "allergies": p.allergies or "",  # null 방어(프론트 카드 배지 안전) + 하위호환
                "waiting_minutes": waiting_minutes,  # 4.4: 현재 단계 대기 분(기록 없으면 null)
                "is_overdue": is_overdue,  # 4.4: 기준 초과 여부
            }
        )
    return result


@app.get("/api/patients/{patient_id}")
def get_patient(
    patient_id: int,
    current: Staff = Depends(get_current_user),  # 로그인한 직원만(NFR3)
    session: Session = Depends(get_session),
) -> dict[str, object]:
    """환자 한 명의 모든 정보 묶음(기본정보 + 방문·진단·투약·검사·수납)."""
    patient = session.get(Patient, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="환자를 찾을 수 없습니다")

    def by_pid(model: type) -> list:
        # id 순 정렬 → 요청마다 순서가 흔들리지 않게(임상 정보 순서 안정성)
        return list(
            session.exec(
                select(model)
                .where(model.patient_id == patient_id)
                .order_by(model.id)
            ).all()
        )

    # 안전 경고 확인 상태(3.2): 없으면 None(미확인), 있으면 확인자/시각(이름 포함)
    ack = session.exec(
        select(SafetyAck).where(SafetyAck.patient_id == patient_id)
    ).first()
    safety_ack: dict[str, object] | None = None
    if ack is not None:
        acker = session.get(Staff, ack.acknowledged_by)
        safety_ack = {
            "acknowledged_by": ack.acknowledged_by,
            "acknowledged_by_name": acker.full_name if acker else "",
            "acknowledged_at": ack.acknowledged_at.isoformat(),
        }

    # 필수 절차 체크리스트(3.4): 체크된 항목 키 집합 → 표준 항목별 checked 여부
    checked_keys = {
        c.item_key
        for c in session.exec(
            select(ChecklistCheck).where(ChecklistCheck.patient_id == patient_id)
        ).all()
    }
    checklist_items = [
        {"key": it["key"], "label": it["label"], "checked": it["key"] in checked_keys}
        for it in CHECKLIST_ITEMS
    ]
    checklist = {
        "items": checklist_items,
        "all_checked": all(i["checked"] for i in checklist_items),
        "next_stage": next_stage(patient.current_stage),
    }

    # 부서 간 인계 메모(4.2): 최신 5건(작성자 이름 포함). 메모가 없으면 빈 목록.
    # 정렬은 created_at 내림차순 + id 내림차순(보조키) — 같은 시각(동틱)에 저장된 메모도
    # 결정적 순서로 최신이 위에 오게(AC1·AC5 "새 메모 최상단"). id가 클수록 나중에 저장됨.
    notes_raw = list(
        session.exec(
            select(HandoverNote)
            .where(HandoverNote.patient_id == patient_id)
            .order_by(col(HandoverNote.created_at).desc(), col(HandoverNote.id).desc())
            .limit(5)
        ).all()
    )
    handover_notes = []
    for n in notes_raw:
        author = session.get(Staff, n.author_id)
        handover_notes.append(
            {
                "id": n.id,
                "from_stage": n.from_stage,
                "note": n.note,
                "author_name": author.full_name if author else "",
                "created_at": n.created_at.isoformat(),
            }
        )

    return {
        "patient": {
            "id": patient.id,
            "registration_number": patient.registration_number,
            "name": patient.name,
            "age": calc_age(patient.birth_date),
            "birth_date": patient.birth_date.isoformat(),
            "gender": patient.gender,
            "allergies": patient.allergies,
            "current_stage": patient.current_stage,
        },
        "visits": by_pid(Visit),
        "diagnoses": by_pid(Diagnosis),
        "medications": by_pid(Medication),
        "lab_results": by_pid(LabResult),
        "billings": by_pid(Billing),
        "safety_ack": safety_ack,  # 3.2: 미확인=None / 확인됨=확인자·시각
        "checklist": checklist,  # 3.4: 필수 절차 항목·전체체크여부·다음단계
        "handover_notes": handover_notes,  # 4.2: 부서 간 인계 메모 최신 5건
    }


@app.post("/api/patients/{patient_id}/visits")
async def add_visit(
    patient_id: int,
    payload: VisitIn,
    current: Staff = Depends(get_current_user),  # 로그인한 직원만(NFR3)
    session: Session = Depends(get_session),
) -> dict[str, object]:
    """방문기록 1건 추가(실시간 반영 시연용 '입력'). 저장 후 해당 환자 구독자에게 갱신 신호.

    ※ 정식 입력 폼/전체 항목 편집은 범위 밖(후속). 여기선 FR3(입력 즉시 반영) 증명이 목적.
    """
    if session.get(Patient, patient_id) is None:
        raise HTTPException(status_code=404, detail="환자를 찾을 수 없습니다")
    visit = Visit(
        patient_id=patient_id,
        visited_at=datetime.now(),
        department=payload.department,
        reason=payload.reason,
    )
    session.add(visit)
    session.commit()
    session.refresh(visit)
    # 그 환자 화면을 보고 있는 모든 클라이언트에게 "다시 불러와" 신호
    await manager.broadcast(
        patient_id, {"type": "patient_updated", "patient_id": patient_id}
    )
    return {"id": visit.id, "patient_id": patient_id}


@app.post("/api/patients/{patient_id}/medications")
async def add_medication(
    patient_id: int,
    payload: MedicationIn,
    current: Staff = Depends(get_current_user),  # 로그인한 직원만(NFR3)
    session: Session = Depends(get_session),
) -> dict[str, object]:
    """처방(투약) 1건 추가 — 알레르기/금기 충돌 시 '확인' 전까지 저장 거부(FR4 안전 강제).

    - 환자의 allergies와 처방 약을 비교(safety.check_contraindications).
    - 충돌이 있는데 acknowledged=False면 저장하지 않고 409 + 충돌 정보 반환
      → 프론트가 빨간 경고 팝업을 띄우고 '계속 처방'(acknowledged=True)으로 다시 요청.
    - 충돌이 없거나 acknowledged=True면 저장 후 그 환자 구독자에게 갱신 신호(2.4 파이프 재사용).
    """
    patient = session.get(Patient, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="환자를 찾을 수 없습니다")

    # 입력 정리: 약 이름은 필수(공백만 입력 방어 — 프론트는 막지만 API 직접 호출도 차단).
    # 빈 약 이름은 안전검사도 무의미하게 통과하므로 저장 전에 거부한다.
    drug_name = payload.drug_name.strip()
    if not drug_name:
        raise HTTPException(status_code=422, detail="약 이름을 입력하세요")

    conflicts = check_contraindications(patient.allergies or "", drug_name)
    if conflicts and not payload.acknowledged:
        # 위험 처방 — 직원이 아직 확인하지 않음 → 저장하지 않고 경고 정보를 돌려준다
        raise HTTPException(
            status_code=409,
            detail={
                "conflicts": conflicts,
                "drug_name": drug_name,
                "message": f"이 환자는 {', '.join(conflicts)} 알레르기입니다",
            },
        )

    medication = Medication(
        patient_id=patient_id,
        drug_name=drug_name,
        dose=payload.dose.strip(),
        schedule=payload.schedule.strip(),
        status="active",
    )
    session.add(medication)
    session.commit()
    session.refresh(medication)
    # 그 환자 화면을 보고 있는 모든 클라이언트에게 "다시 불러와" 신호(투약 카드 자동 갱신)
    await manager.broadcast(
        patient_id, {"type": "patient_updated", "patient_id": patient_id}
    )
    return {
        "id": medication.id,
        "patient_id": patient_id,
        "drug_name": medication.drug_name,
    }


@app.patch("/api/patients/{patient_id}/medications/{medication_id}")
async def update_medication(
    patient_id: int,
    medication_id: int,
    payload: MedicationIn,
    current: Staff = Depends(get_current_user),  # 로그인한 직원만(NFR3)
    session: Session = Depends(get_session),
) -> dict[str, object]:
    """처방 1건 수정 — 잘못 입력한 처방 정정용.

    약 이름을 바꾸면 알레르기/금기를 다시 검사한다(추가와 똑같은 409 흐름) →
    위험한 약으로 고치려 하면 확인 전까지 저장 거부. 저장 후 broadcast로 화면 자동 갱신.
    """
    patient = session.get(Patient, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="환자를 찾을 수 없습니다")
    med = session.get(Medication, medication_id)
    if med is None or med.patient_id != patient_id:
        raise HTTPException(status_code=404, detail="투약 정보를 찾을 수 없습니다")

    drug_name = payload.drug_name.strip()
    if not drug_name:
        raise HTTPException(status_code=422, detail="약 이름을 입력하세요")

    conflicts = check_contraindications(patient.allergies or "", drug_name)
    if conflicts and not payload.acknowledged:
        raise HTTPException(
            status_code=409,
            detail={
                "conflicts": conflicts,
                "drug_name": drug_name,
                "message": f"이 환자는 {', '.join(conflicts)} 알레르기입니다",
            },
        )

    med.drug_name = drug_name
    med.dose = payload.dose.strip()
    med.schedule = payload.schedule.strip()
    session.add(med)
    session.commit()
    session.refresh(med)
    await manager.broadcast(
        patient_id, {"type": "patient_updated", "patient_id": patient_id}
    )
    return {"id": med.id, "patient_id": patient_id, "drug_name": med.drug_name}


@app.delete("/api/patients/{patient_id}/medications/{medication_id}")
async def delete_medication(
    patient_id: int,
    medication_id: int,
    current: Staff = Depends(get_current_user),  # 로그인한 직원만(NFR3)
    session: Session = Depends(get_session),
) -> dict[str, object]:
    """처방 1건 삭제 — 잘못 입력한 처방 정정용.

    이미 '투약 완료' 기록이 있는 약은 보호한다(FK IntegrityError → 409 안내) →
    실제로 준 약이 흔적 없이 사라지지 않게. 방금 잘못 넣은(완료 기록 없는) 약은 바로 삭제됨.
    """
    med = session.get(Medication, medication_id)
    if med is None or med.patient_id != patient_id:
        raise HTTPException(status_code=404, detail="투약 정보를 찾을 수 없습니다")
    session.delete(med)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="이미 투약 완료 기록이 있어 삭제할 수 없습니다.",
        )
    await manager.broadcast(
        patient_id, {"type": "patient_updated", "patient_id": patient_id}
    )
    return {"deleted": medication_id}


@app.get("/api/medication-alerts")
def medication_alerts(
    current: Staff = Depends(get_current_user),  # 로그인한 직원만(NFR3)
    session: Session = Depends(get_session),
) -> list[dict[str, object]]:
    """지금 '받을 시간이 된' 투약 알림 목록(Story 3.3, FR5).

    현재 시각 기준으로 예정 시각이 지났고(오늘 분) 아직 완료 안 한 active 투약을
    전 환자에서 모아 반환한다. (진짜 예약 푸시가 아니라 화면이 열릴 때 서버가 계산하는 방식)
    """
    now = datetime.now()
    today = now.date()
    current_hm = now.strftime("%H:%M")

    alerts: list[dict[str, object]] = []
    meds = session.exec(
        select(Medication).where(Medication.status == "active")
    ).all()
    for med in meds:
        for t in parse_schedule_times(med.schedule):
            if t > current_hm:
                continue  # 아직 시간이 안 됨(오늘)
            # 오늘 이 슬롯을 이미 완료했는지 확인
            done = session.exec(
                select(MedicationAdministration).where(
                    MedicationAdministration.medication_id == med.id,
                    MedicationAdministration.scheduled_time == t,
                    MedicationAdministration.administered_date == today,
                )
            ).first()
            if done is not None:
                continue  # 이미 줬음 → 알림에서 제외
            patient = session.get(Patient, med.patient_id)
            alerts.append(
                {
                    "medication_id": med.id,
                    "patient_id": med.patient_id,
                    "patient_name": patient.name if patient else "",
                    "drug_name": med.drug_name,
                    "dose": med.dose,
                    "scheduled_time": t,
                }
            )
    # 예정 시각 → 환자명 순으로 정렬(보기 좋게)
    alerts.sort(key=lambda a: (a["scheduled_time"], a["patient_name"]))
    return alerts


@app.post("/api/medications/{medication_id}/administer")
async def administer_medication(
    medication_id: int,
    payload: AdministerIn,
    current: Staff = Depends(get_current_user),  # 로그인한 직원만(NFR3)
    session: Session = Depends(get_session),
) -> dict[str, object]:
    """투약 완료 처리(Story 3.3). 해당 슬롯을 오늘 완료로 기록 → 알림에서 정리된다.

    같은 약·같은 시각·같은 날은 1건만(unique). 이미 완료면 멱등(IntegrityError 방어).
    """
    med = session.get(Medication, medication_id)
    if med is None:
        raise HTTPException(status_code=404, detail="투약 정보를 찾을 수 없습니다")
    if med.status != "active":
        # 중단/완료된 투약은 알림 대상이 아님 → 완료 처리도 막는다(GET 알림과 일관)
        raise HTTPException(status_code=400, detail="진행 중인 투약이 아닙니다")
    if payload.scheduled_time not in parse_schedule_times(med.schedule):
        raise HTTPException(status_code=400, detail="유효한 투약 시간이 아닙니다")

    today = datetime.now().date()
    record = MedicationAdministration(
        medication_id=medication_id,
        scheduled_time=payload.scheduled_time,
        administered_date=today,
        administered_by=current.id,
        administered_at=datetime.now(),
    )
    session.add(record)
    try:
        session.commit()
    except IntegrityError:
        # 같은 슬롯 기록이 이미 있는지 확인 → 있으면 중복(동시/재클릭)이니 멱등 성공,
        # 없으면 unique 충돌이 아닌 다른 무결성 오류 → 진짜 실패이므로 다시 던진다(500).
        session.rollback()
        existing = session.exec(
            select(MedicationAdministration).where(
                MedicationAdministration.medication_id == medication_id,
                MedicationAdministration.scheduled_time == payload.scheduled_time,
                MedicationAdministration.administered_date == today,
            )
        ).first()
        if existing is None:
            raise
    else:
        # 그 환자 화면을 보는 클라이언트에도 갱신 신호(2.4 파이프 재사용)
        await manager.broadcast(
            med.patient_id, {"type": "patient_updated", "patient_id": med.patient_id}
        )

    return {
        "medication_id": medication_id,
        "scheduled_time": payload.scheduled_time,
        "status": "administered",
    }


@app.post("/api/patients/{patient_id}/safety-ack")
async def acknowledge_safety(
    patient_id: int,
    current: Staff = Depends(get_current_user),  # 로그인한 직원만(NFR3)
    session: Session = Depends(get_session),
) -> dict[str, object]:
    """안전 경고 배너를 담당자가 '확인'했음을 기록(FR7). 환자당 1건(멱등).

    이미 확인 기록이 있으면 그대로 두고(중복 생성 방지) 현재 상태를 돌려준다.
    새로 확인하면 저장 후 그 환자 구독자에게 갱신 신호 → 다른 화면도 '확인됨'으로 바뀐다.
    """
    patient = session.get(Patient, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="환자를 찾을 수 없습니다")
    # 확인할 위험(알레르기 등)이 없으면 기록을 만들지 않음 — 직접 API 호출 방어(무의미한 확인 행 방지)
    if not (patient.allergies or "").strip():
        raise HTTPException(status_code=400, detail="확인할 안전 경고가 없습니다")

    ack = session.exec(
        select(SafetyAck).where(SafetyAck.patient_id == patient_id)
    ).first()
    if ack is None:
        ack = SafetyAck(
            patient_id=patient_id,
            acknowledged_by=current.id,
            acknowledged_at=datetime.now(),
        )
        session.add(ack)
        try:
            session.commit()
        except IntegrityError:
            # 동시에 다른 직원이 먼저 확인을 기록함(unique 충돌) → 그 기록을 재사용(깔끔한 멱등)
            session.rollback()
            ack = session.exec(
                select(SafetyAck).where(SafetyAck.patient_id == patient_id)
            ).first()
        else:
            session.refresh(ack)
            # 같은 환자 화면을 보고 있는 다른 클라이언트도 '확인됨'으로 갱신
            await manager.broadcast(
                patient_id, {"type": "patient_updated", "patient_id": patient_id}
            )

    if ack is None:  # 이론상 도달 불가(충돌이면 행이 존재) — 방어적 처리
        raise HTTPException(status_code=500, detail="확인 기록 처리에 실패했습니다")
    return {
        "patient_id": patient_id,
        "acknowledged_by": ack.acknowledged_by,
        "acknowledged_at": ack.acknowledged_at.isoformat(),
    }


@app.post("/api/patients/{patient_id}/checklist/{item_key}")
async def toggle_checklist(
    patient_id: int,
    item_key: str,
    payload: ChecklistToggleIn,
    current: Staff = Depends(get_current_user),  # 로그인한 직원만(NFR3)
    session: Session = Depends(get_session),
) -> dict[str, object]:
    """필수 절차 체크 항목 하나를 체크/해제(Story 3.4, FR6).

    - checked=True: 체크 기록(행) 생성. 이미 있으면 멱등(중복 생성 X, 동시 클릭 방어).
    - checked=False: 체크 해제 = 그 행 삭제. 없어도 무해(멱등).
    - 변경 시 그 환자 구독자에게 갱신 신호(2.4 broadcast) → 통합 화면 자동 반영.
    """
    if session.get(Patient, patient_id) is None:
        raise HTTPException(status_code=404, detail="환자를 찾을 수 없습니다")
    if item_key not in CHECKLIST_KEYS:
        raise HTTPException(status_code=400, detail="유효한 체크 항목이 아닙니다")

    row = session.exec(
        select(ChecklistCheck).where(
            ChecklistCheck.patient_id == patient_id,
            ChecklistCheck.item_key == item_key,
        )
    ).first()

    if payload.checked and row is None:
        session.add(
            ChecklistCheck(
                patient_id=patient_id,
                item_key=item_key,
                checked_by=current.id,
                checked_at=datetime.now(),
            )
        )
        try:
            session.commit()
        except IntegrityError:
            # 동시에 다른 직원이 먼저 체크함(unique 충돌) → 그대로 멱등 처리
            session.rollback()
        else:
            await manager.broadcast(
                patient_id, {"type": "patient_updated", "patient_id": patient_id}
            )
    elif not payload.checked and row is not None:
        session.delete(row)
        session.commit()
        await manager.broadcast(
            patient_id, {"type": "patient_updated", "patient_id": patient_id}
        )

    return {
        "patient_id": patient_id,
        "item_key": item_key,
        "checked": payload.checked,
    }


@app.post("/api/patients/{patient_id}/advance-stage")
async def advance_stage(
    patient_id: int,
    current: Staff = Depends(get_current_user),  # 로그인한 직원만(NFR3)
    session: Session = Depends(get_session),
) -> dict[str, object]:
    """필수 절차를 모두 마친 환자를 다음 단계로 진행(Story 3.4, FR6).

    - 안전 강제: 표준 필수 항목이 모두 체크돼 있지 않으면 409로 거부
      (프론트 버튼 비활성에만 의존하지 않고 서버에서도 막는다 — 3.1 철학).
    - 통과 시 current_stage를 다음 단계로 변경하고, 그 환자의 체크는 전부 삭제(초기화)
      → 다음 절차를 위해 깨끗한 상태로. 저장 후 broadcast로 화면 자동 갱신.
    - 이미 마지막 단계(수납)면 진행할 곳이 없어 400.
    """
    patient = session.get(Patient, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="환자를 찾을 수 없습니다")

    nxt = next_stage(patient.current_stage)
    if nxt is None:
        raise HTTPException(status_code=400, detail="마지막 단계입니다")

    checked_keys = {
        c.item_key
        for c in session.exec(
            select(ChecklistCheck).where(ChecklistCheck.patient_id == patient_id)
        ).all()
    }
    if not CHECKLIST_KEYS.issubset(checked_keys):
        raise HTTPException(
            status_code=409, detail="필수 절차가 모두 완료되지 않았습니다"
        )

    # 다음 단계로 이동 + 체크 초기화(다음 절차 대비)
    patient.current_stage = nxt
    for row in session.exec(
        select(ChecklistCheck).where(ChecklistCheck.patient_id == patient_id)
    ).all():
        session.delete(row)
    session.add(patient)

    # 단계 진입 시각 갱신(4.4): 새 단계에 '지금' 들어왔으므로 대기 시계 리셋(upsert).
    entry = session.exec(
        select(StageEntry).where(StageEntry.patient_id == patient_id)
    ).first()
    if entry is None:
        session.add(
            StageEntry(patient_id=patient_id, stage=nxt, entered_at=datetime.now())
        )
    else:
        entry.stage = nxt
        entry.entered_at = datetime.now()
        session.add(entry)

    session.commit()
    await manager.broadcast(
        patient_id, {"type": "patient_updated", "patient_id": patient_id}
    )
    return {"patient_id": patient_id, "current_stage": nxt}


@app.post("/api/patients/{patient_id}/handover-note")
async def add_handover_note(
    patient_id: int,
    payload: HandoverNoteIn,
    current: Staff = Depends(get_current_user),  # 로그인한 직원만(NFR3)
    session: Session = Depends(get_session),
) -> dict[str, object]:
    """부서 간 인계 메모를 남긴다(Story 4.2, FR8).

    - from_stage는 서버가 patient.current_stage를 읽어 자동 기록 → 클라이언트가 조작 못 함.
    - 빈 메모(공백만)는 422로 거부(프론트 비활성에만 의존하지 않고 서버에서도 막는다).
    - 저장 후 broadcast → 같은 환자 화면을 보는 다른 클라이언트도 새 메모를 즉시 본다(자동 전달).
    - 메모는 append-only(삭제·수정 없음, 감사 추적).
    """
    patient = session.get(Patient, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="환자를 찾을 수 없습니다")

    note_text = payload.note.strip()
    if not note_text:
        raise HTTPException(status_code=422, detail="메모 내용을 입력하세요")
    if len(note_text) > HANDOVER_NOTE_MAX_LEN:
        raise HTTPException(
            status_code=422,
            detail=f"메모는 {HANDOVER_NOTE_MAX_LEN}자 이하여야 합니다",
        )

    note = HandoverNote(
        patient_id=patient_id,
        from_stage=patient.current_stage,  # 작성 시점의 단계를 서버가 자동 기록
        note=note_text,
        author_id=current.id,
        created_at=datetime.now(),
    )
    session.add(note)
    session.commit()
    session.refresh(note)
    # 같은 환자 화면을 보고 있는 다른 클라이언트도 새 메모로 갱신
    await manager.broadcast(
        patient_id, {"type": "patient_updated", "patient_id": patient_id}
    )
    return {"id": note.id, "patient_id": patient_id}


@app.patch("/api/patients/{patient_id}/handover-note/{note_id}")
async def update_handover_note(
    patient_id: int,
    note_id: int,
    payload: HandoverNoteIn,
    current: Staff = Depends(get_current_user),  # 로그인한 직원만(NFR3)
    session: Session = Depends(get_session),
) -> dict[str, object]:
    """인계 메모 1건 수정 — 잘못 입력한 메모 정정용(빈 메모/길이 상한은 작성과 동일 검증).

    from_stage·작성자·작성 시각은 그대로 두고 내용만 고친다. 저장 후 broadcast로 화면 갱신.
    """
    note = session.get(HandoverNote, note_id)
    if note is None or note.patient_id != patient_id:
        raise HTTPException(status_code=404, detail="메모를 찾을 수 없습니다")

    note_text = payload.note.strip()
    if not note_text:
        raise HTTPException(status_code=422, detail="메모 내용을 입력하세요")
    if len(note_text) > HANDOVER_NOTE_MAX_LEN:
        raise HTTPException(
            status_code=422,
            detail=f"메모는 {HANDOVER_NOTE_MAX_LEN}자 이하여야 합니다",
        )

    note.note = note_text
    session.add(note)
    session.commit()
    await manager.broadcast(
        patient_id, {"type": "patient_updated", "patient_id": patient_id}
    )
    return {"id": note.id, "patient_id": patient_id}


@app.delete("/api/patients/{patient_id}/handover-note/{note_id}")
async def delete_handover_note(
    patient_id: int,
    note_id: int,
    current: Staff = Depends(get_current_user),  # 로그인한 직원만(NFR3)
    session: Session = Depends(get_session),
) -> dict[str, object]:
    """인계 메모 1건 삭제 — 잘못 입력한 메모 정정용. 저장 후 broadcast로 화면 갱신."""
    note = session.get(HandoverNote, note_id)
    if note is None or note.patient_id != patient_id:
        raise HTTPException(status_code=404, detail="메모를 찾을 수 없습니다")
    session.delete(note)
    session.commit()
    await manager.broadcast(
        patient_id, {"type": "patient_updated", "patient_id": patient_id}
    )
    return {"deleted": note_id}


@app.websocket("/ws/patients/{patient_id}")
async def patient_ws(websocket: WebSocket, patient_id: int) -> None:
    """환자별 실시간 구독 채널. 연결 시 토큰(쿼리 ?token=) 검증, 이후 갱신 신호를 받는다.

    브라우저 WebSocket은 Authorization 헤더를 못 붙이므로 토큰을 쿼리로 받는다.
    데이터는 WS로 보내지 않고, 갱신 '신호'만 받아 클라이언트가 GET으로 다시 불러온다.
    """
    token = websocket.query_params.get("token")
    # 요청 스코프 세션 의존성 대신, WS에서는 짧게 직접 세션을 연다
    with Session(engine) as session:
        staff = authenticate_ws_token(token, session)
    if staff is None:
        # 미인증 → 정책 위반 코드로 연결 거부
        await websocket.close(code=1008)
        return

    await manager.connect(patient_id, websocket)
    try:
        while True:
            # 클라이언트 메시지(핑 등)는 무시 — 연결 유지 목적. 끊기면 예외로 빠져나감
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(patient_id, websocket)
    except Exception:
        # 예기치 못한 오류에도 방에서 반드시 정리
        manager.disconnect(patient_id, websocket)
