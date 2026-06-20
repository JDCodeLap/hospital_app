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
    role: str = "staff"  # 1차는 staff 단일. 역할 세분화는 Epic 5
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
