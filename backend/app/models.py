"""데이터 모델(테이블 정의).

- TestItem: 1.2에서 만든 연결 증명용 테스트 테이블
- Staff: 직원 계정(로그인용). 비밀번호는 반드시 해시(hashed_password)로만 저장.
- Patient + 자식 5종(Visit/Diagnosis/Medication/LabResult/Billing): 2.1 환자 데이터 구조.
  각 자식은 patient_id(FK)로 어느 환자 것인지 연결된다.
"""

from datetime import date, datetime

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, SQLModel


class TestItem(SQLModel, table=True):
    __tablename__ = "test_item"

    id: int | None = Field(default=None, primary_key=True)
    name: str
    note: str = ""


class Staff(SQLModel, table=True):
    __tablename__ = "staff"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str  # 평문 금지 — pwdlib 해시값만 저장
    full_name: str = ""
    # 권한(role)과 직군(job_title)은 다른 개념이다(Story 5.2) — 섞지 않는다.
    #  - role: "admin" / "staff" — 관리자 페이지 접근 가능 여부(get_current_admin 게이트). 세분화는 5.3.
    #  - job_title: 의사/간호사/원무과/기타 — 어떤 일을 하는 사람인지(분류·표시). 화면을 제한하지 않음.
    role: str = "staff"
    job_title: str = ""  # 직군(Story 5.2). 빈 값 허용. 기존 staff 테이블엔 멱등 ALTER로 보강.
    # 정보 영역 접근 범위(Story 5.3, FR12). "all"(전체) 또는 영역 키 콤마 목록
    # (visits,diagnoses,medications,labs,billing). role(접근 게이트)·job_title(분류)과 또 다른 축 —
    # 이 직원이 환자 통합화면에서 '어떤 정보 영역'을 볼 수 있는지. 기존 테이블엔 멱등 ALTER로 보강.
    access_scope: str = "all"
    is_active: bool = True


class Patient(SQLModel, table=True):
    __tablename__ = "patient"

    id: int | None = Field(default=None, primary_key=True)
    registration_number: str = Field(unique=True, index=True)  # 등록번호(유니크)
    name: str = Field(index=True)  # 이름(2.2 검색 대비 인덱스)
    birth_date: date  # 생년월일 → 나이는 조회 시 계산
    gender: str = "기타"  # "M" / "F" / "기타"
    allergies: str = ""  # 콤마구분, Epic 3 안전경고용 (예: "페니실린")
    current_stage: str = "접수"  # 접수/진료/검사/수납 (Epic 4 대비 기본값)


class Visit(SQLModel, table=True):
    __tablename__ = "visit"

    id: int | None = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id", index=True)
    visited_at: datetime
    department: str  # 방문 부서(예: 내과)
    reason: str = ""  # 방문 사유


class Diagnosis(SQLModel, table=True):
    __tablename__ = "diagnosis"

    id: int | None = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id", index=True)
    name: str  # 진단명
    diagnosed_at: date
    status: str = "active"  # active / resolved


class Medication(SQLModel, table=True):
    __tablename__ = "medication"

    id: int | None = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id", index=True)
    drug_name: str  # 약 이름
    dose: str = ""  # 용량(예: 5mg)
    schedule: str = ""  # 투약 시간(예: "08:00,20:00")
    status: str = "active"  # active / done


class LabResult(SQLModel, table=True):
    __tablename__ = "lab_result"

    id: int | None = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id", index=True)
    test_name: str  # 검사명
    value: str = ""  # 결과값(문자/숫자 혼용 대비 문자열)
    unit: str = ""  # 단위(예: mmHg)
    flag: str = "normal"  # normal / abnormal
    measured_at: datetime


class Billing(SQLModel, table=True):
    __tablename__ = "billing"

    id: int | None = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id", index=True)
    item: str  # 수납 항목(예: 진료비)
    amount: int = 0  # 금액(원)
    status: str = "unpaid"  # unpaid / paid


class SafetyAck(SQLModel, table=True):
    """안전 경고 확인 기록(Story 3.2, FR7).

    환자에게 위험 정보(알레르기 등)가 있을 때 뜨는 빨간 경고 배너를 담당자가 "확인"하면
    그 사실을 여기에 1건 남긴다 → 모든 직원/재진입에 확인 상태가 공유된다(누구도 안 놓침).
    환자당 1건만(patient_id unique). 새 테이블이라 create_all로 생성(마이그레이션 불필요).
    """

    __tablename__ = "safety_ack"

    id: int | None = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id", index=True, unique=True)  # 환자당 1건
    acknowledged_by: int = Field(foreign_key="staff.id")  # 확인한 직원
    acknowledged_at: datetime  # 확인 시각
    note: str = ""


class MedicationAdministration(SQLModel, table=True):
    """투약 완료 기록(Story 3.3, FR5).

    "오늘 08:00분 약을 줬다"를 슬롯 단위로 1건 남긴다 → 그 슬롯만 알림에서 정리되고,
    같은 약의 다른 시각(20:00)·다음 날은 계속 알림으로 뜬다(반복 투약 유지).
    같은 약·같은 시각·같은 날은 1건만(unique). 새 테이블이라 create_all로 생성(마이그레이션 불필요).
    """

    __tablename__ = "medication_administration"
    __table_args__ = (
        UniqueConstraint(
            "medication_id", "scheduled_time", "administered_date"
        ),
    )

    id: int | None = Field(default=None, primary_key=True)
    medication_id: int = Field(foreign_key="medication.id", index=True)
    scheduled_time: str  # 완료한 예정 시각(예 "08:00")
    administered_date: date  # 완료한 날짜(슬롯이 어느 날 것인지)
    administered_by: int = Field(foreign_key="staff.id")  # 투약한 직원
    administered_at: datetime  # 실제 완료 처리 시각


class ChecklistCheck(SQLModel, table=True):
    """필수 절차 체크 기록(Story 3.4, FR6).

    시술/검사 전 필수 절차(본인확인·금식·동의서 등)를 직원이 체크하면 1건 남긴다.
    한 환자의 한 항목은 1건만(unique). 체크=행 존재, 해제=행 삭제(토글).
    투약(MedicationAdministration)과 달리 '날마다 반복'이 아니라 '시술 1회 전' 확인이므로
    날짜 키를 두지 않는다. 다음 단계로 진행할 때 그 환자의 행을 전부 삭제(초기화)한다.
    새 테이블이라 create_all로 생성(마이그레이션 불필요).
    """

    __tablename__ = "checklist_check"
    __table_args__ = (UniqueConstraint("patient_id", "item_key"),)

    id: int | None = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id", index=True)
    item_key: str  # 항목 키("identity" / "fasting" / "consent")
    checked_by: int = Field(foreign_key="staff.id")  # 체크한 직원
    checked_at: datetime  # 체크 시각


class HandoverNote(SQLModel, table=True):
    """부서 간 인계 메모(Story 4.2, FR8).

    한 부서가 처리를 마치고 다음 부서로 넘길 때 남기는 인수인계 메모.
    전화·메모지 없이도 다음 부서 직원이 환자 화면에서 바로 확인할 수 있다(자동 전달).
    from_stage(메모 작성 시점의 환자 단계)는 서버가 patient.current_stage를 읽어 자동 기록 →
    클라이언트가 임의 단계를 조작할 수 없다. 메모는 append-only(삭제·수정 없음, 감사 추적).
    새 테이블이라 create_all로 생성(마이그레이션 불필요).
    """

    __tablename__ = "handover_note"

    id: int | None = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id", index=True)
    from_stage: str  # 메모를 남길 당시 환자의 단계(접수/진료/검사/수납) — 서버가 자동 기록
    note: str  # 인계 메모 내용
    author_id: int = Field(foreign_key="staff.id")  # 메모를 남긴 직원
    created_at: datetime  # 작성 시각


class StageEntry(SQLModel, table=True):
    """환자가 현재 단계에 진입한 시각(Story 4.4, FR10).

    "현재 시각 − entered_at = 그 단계에 머문 대기 시간" → 기준(기본 30분) 초과면 대기 초과.
    환자당 1건(unique patient_id)만 두고, 단계가 바뀔 때(3.4 advance-stage) upsert로 갱신한다.
    진입 이력 전체 로그가 아니라 '현재 단계 진입 시각'만 보관(이력 추적은 후속).
    새 테이블이라 create_all로 생성(Patient 컬럼 추가는 create_all이 ALTER 못 하므로 우회 —
    3.2/3.3/3.4/4.2와 동일 패턴). 기존 환자는 서버 시작 시 백필로 채운다.
    """

    __tablename__ = "stage_entry"

    id: int | None = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id", index=True, unique=True)  # 환자당 1건
    stage: str  # 현재 단계(접수/진료/검사/수납)
    entered_at: datetime  # 그 단계에 들어온 시각


class AppSetting(SQLModel, table=True):
    """앱 전역 설정 key/value 저장소(Story 5.5, FR14).

    관리자가 바꾸는 기준값을 DB에 보관한다. 지금은 'stage_overdue_minutes'(대기 초과 기준
    시간) 1개. 값은 문자열로 저장하고(일반 key/value) 읽는 쪽에서 형변환한다 → 향후 다른
    기준값도 같은 테이블 재사용. 새 테이블이라 create_all로 생성(마이그레이션 불필요).
    """

    __tablename__ = "app_setting"

    key: str = Field(primary_key=True)  # 설정 이름(예: "stage_overdue_minutes")
    value: str  # 값(문자열로 저장 — int 등은 읽을 때 변환)
