"use client";

// 데이터베이스 스키마 ERD(까마귀발 표기법) — Mermaid erDiagram으로 렌더링.
// - 까마귀발 표기: `||--o{` = 1 대 다(0개 이상), `||--o|` = 1 대 0~1(unique FK).
// - 비개발자도 읽도록 테이블 제목은 한글 별칭 ENTITY["한글 (영문)"], 각 컬럼엔 한글 설명을 주석으로.
//   (실제 컬럼명은 영어 그대로 두되 옆에 뜻을 단다 — 정확성 + 이해 둘 다.)
// - 아래 DEFINITION은 backend/app/models.py를 그대로 반영(모델이 바뀌면 같이 갱신).
//   런타임 DB introspection이 아니라 모델 미러 — 백엔드 변경 0, 마이그레이션 0.
// - Mermaid는 클라이언트 전용 → SSR 회피 위해 useEffect 안에서 동적 import.

import { useEffect, useState } from "react";

// PK=기본키, FK=외래키, UK=유니크. patient_id FK,UK = 환자당 1건(1:0~1 관계).
const DEFINITION = `erDiagram
    STAFF ||--o{ SAFETY_ACK : "확인"
    STAFF ||--o{ MEDICATION_ADMINISTRATION : "투약"
    STAFF ||--o{ CHECKLIST_CHECK : "체크"
    STAFF ||--o{ HANDOVER_NOTE : "작성"

    PATIENT ||--o{ VISIT : "방문"
    PATIENT ||--o{ DIAGNOSIS : "진단"
    PATIENT ||--o{ MEDICATION : "처방"
    PATIENT ||--o{ LAB_RESULT : "검사"
    PATIENT ||--o{ BILLING : "수납"
    PATIENT ||--o| SAFETY_ACK : "안전확인"
    PATIENT ||--o{ CHECKLIST_CHECK : "절차"
    PATIENT ||--o{ HANDOVER_NOTE : "인계"
    PATIENT ||--o| STAGE_ENTRY : "단계진입"

    MEDICATION ||--o{ MEDICATION_ADMINISTRATION : "투약완료"

    STAFF["직원 (staff)"] {
        int id PK "직원 번호"
        string username UK "로그인 아이디"
        string hashed_password "암호화된 비밀번호"
        string full_name "이름"
        string role "권한 admin·staff"
        string job_title "직군 의사·간호사·원무과"
        bool is_active "활성 여부"
    }
    PATIENT["환자 (patient)"] {
        int id PK "환자 번호"
        string registration_number UK "등록번호"
        string name "이름"
        date birth_date "생년월일"
        string gender "성별"
        string allergies "알레르기"
        string current_stage "현재 단계"
    }
    VISIT["방문기록 (visit)"] {
        int id PK "방문 번호"
        int patient_id FK "환자"
        datetime visited_at "방문 시각"
        string department "방문 부서"
        string reason "방문 사유"
    }
    DIAGNOSIS["진단 (diagnosis)"] {
        int id PK "진단 번호"
        int patient_id FK "환자"
        string name "진단명"
        date diagnosed_at "진단일"
        string status "상태"
    }
    MEDICATION["처방약 (medication)"] {
        int id PK "처방 번호"
        int patient_id FK "환자"
        string drug_name "약 이름"
        string dose "용량"
        string schedule "투약 시간"
        string status "상태"
    }
    LAB_RESULT["검사결과 (lab_result)"] {
        int id PK "검사 번호"
        int patient_id FK "환자"
        string test_name "검사명"
        string value "결과값"
        string unit "단위"
        string flag "정상·이상"
        datetime measured_at "측정 시각"
    }
    BILLING["수납 (billing)"] {
        int id PK "수납 번호"
        int patient_id FK "환자"
        string item "항목"
        int amount "금액 원"
        string status "미납·완납"
    }
    SAFETY_ACK["안전경고확인 (safety_ack)"] {
        int id PK "기록 번호"
        int patient_id FK,UK "환자 1건"
        int acknowledged_by FK "확인한 직원"
        datetime acknowledged_at "확인 시각"
        string note "메모"
    }
    MEDICATION_ADMINISTRATION["투약완료기록 (medication_administration)"] {
        int id PK "기록 번호"
        int medication_id FK "처방약"
        string scheduled_time "예정 시각"
        date administered_date "완료 날짜"
        int administered_by FK "투약한 직원"
        datetime administered_at "완료 시각"
    }
    CHECKLIST_CHECK["절차체크 (checklist_check)"] {
        int id PK "기록 번호"
        int patient_id FK "환자"
        string item_key "항목 본인확인·금식·동의서"
        int checked_by FK "체크한 직원"
        datetime checked_at "체크 시각"
    }
    HANDOVER_NOTE["인계메모 (handover_note)"] {
        int id PK "메모 번호"
        int patient_id FK "환자"
        string from_stage "작성 시점 단계"
        string note "메모 내용"
        int author_id FK "작성한 직원"
        datetime created_at "작성 시각"
    }
    STAGE_ENTRY["단계진입시각 (stage_entry)"] {
        int id PK "기록 번호"
        int patient_id FK,UK "환자 1건"
        string stage "현재 단계"
        datetime entered_at "진입 시각"
    }
    TEST_ITEM["테스트용 (test_item)"] {
        int id PK "번호"
        string name "이름"
        string note "메모"
    }
`;

type RenderState =
  | { status: "loading" }
  | { status: "ready"; svg: string }
  | { status: "error" };

export function SchemaErd() {
  const [state, setState] = useState<RenderState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        // Mermaid는 브라우저 전용 → 여기서 동적 import(SSR 프리렌더 회피)
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark", // 앱이 다크 모드라 다크 테마로 맞춤
          securityLevel: "strict", // SVG에 임의 스크립트 주입 방지
          er: {
            useMaxWidth: true, // 화면 너비에 맞춰 스케일(가로 스크롤 없이)
            // 좌→우 흐름: 부모(staff·patient) 옆에 자식 테이블들이 세로로 쌓여
            // 다이어그램이 '세로로 길어짐' → 아래로 스크롤하며 크게 볼 수 있다.
            layoutDirection: "LR",
          },
        });
        // 고정 id로 1회 렌더 → SVG 문자열을 받아 직접 삽입
        const { svg } = await mermaid.render("hospital-erd", DEFINITION);
        if (!cancelled) setState({ status: "ready", svg });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return <p className="text-sm text-text-muted">스키마 다이어그램을 그리는 중…</p>;
  }
  if (state.status === "error") {
    return (
      <p role="alert" className="text-sm text-danger">
        다이어그램을 표시할 수 없습니다. 잠시 후 새로고침해 주세요.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle bg-bg-surface p-4">
      {/* mermaid가 만든 SVG를 그대로 삽입(securityLevel:strict로 정화된 출력).
          useMaxWidth:true와 맞춰 svg를 컨테이너 너비에 채운다(가로 스크롤 최소화). */}
      <div
        className="[&_svg]:h-auto [&_svg]:w-full"
        dangerouslySetInnerHTML={{ __html: state.svg }}
      />
    </div>
  );
}
