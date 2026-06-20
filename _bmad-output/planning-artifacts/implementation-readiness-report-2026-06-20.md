---
stepsCompleted: ['step-01-document-discovery', 'step-02-prd-analysis', 'step-03-epic-coverage-validation', 'step-04-ux-alignment', 'step-05-epic-quality-review', 'step-06-final-assessment']
documentsIncluded:
  prd: 'prds/prd-hospital-app-2026-06-20/prd.md'
  ux: 'ux-designs/ux-hospital-app-2026-06-20/DESIGN.md, EXPERIENCE.md'
  architecture: 'architecture.md'
  epics: 'epics.md'
---

# Implementation Readiness Assessment Report

**Date:** 2026-06-20
**Project:** hospital-app

## 1. Document Inventory

| 문서 종류 | 파일 | 형식 | 상태 |
|-----------|------|------|------|
| PRD | `prds/prd-hospital-app-2026-06-20/prd.md` | 단일 | ✅ 발견 |
| UX | `ux-designs/ux-hospital-app-2026-06-20/DESIGN.md`, `EXPERIENCE.md` | 단일 | ✅ 발견 |
| Architecture | `architecture.md` | 단일 | ✅ 발견 |
| Epics & Stories | `epics.md` | 단일 | ✅ 발견 |

**중복(duplicate) 문서:** 없음
**누락(missing) 문서:** 없음

## 2. PRD Analysis

### Functional Requirements (기능 요구사항)

- **FR1.** 환자 한 명 선택 시 기본정보·방문기록·진단·투약·검사결과·수납상태를 한 화면에서 조회 (환자 통합 화면)
- **FR2.** 환자를 이름 또는 등록번호로 빠르게 검색
- **FR3.** 새 정보(진료 기록, 검사 결과 등) 입력 시 해당 환자 화면에 즉시 반영
- **FR4.** 등록된 알레르기/금기 약물과 충돌하는 처방 입력 시 경고 알림
- **FR5.** 정해진 투약 시간 도래 시 담당 직원에게 알림
- **FR6.** 주요 절차 필수 체크리스트(동의서·금식 등) 제공, 전부 체크해야 다음 단계 진행 가능
- **FR7.** 안전 알림은 직원이 확인·조치하기 전까지 화면에서 사라지지 않음 (지속 알림)
- **FR8.** 한 부서가 입력·완료한 내용이 다음 부서 화면에 자동 전달 (부서 간 인수인계)
- **FR9.** 환자가 현재 어느 단계(접수→진료→검사→수납)에 있는지 실시간 표시
- **FR10.** 한 단계에서 대기 초과 시 담당 직원에게 알림

**총 FR: 10개**

### Non-Functional Requirements (비기능 요구사항)

- **NFR1. 멀티 화면 지원** — 휴대폰 + 웹 양쪽에서 모두 동작
- **NFR2. 단순 접근(1차)** — 로그인 직원이면 환자 정보 열람 가능 (직군별 세밀 권한은 범위 밖)
- **NFR3. 정보 보호** — 로그인한 직원만 접근 (간단한 로그인 수준)
- **NFR4. 빠른 반응** — 한 부서 입력이 다른 부서 화면에 몇 초 내 반영
- **NFR5. 쉬운 사용** — 직관적 화면, 적은 클릭 수

**총 NFR: 5개**

### Additional Requirements / Constraints (추가 제약·가정)

- **범위 밖(Out of Scope):** 건강 변화 그래프, 이중 확인 자동화, 에스컬레이션(상급자 자동 보고), 직군별 세밀 권한, 병원 전체 통계 대시보드, 외부 시스템 연동/법적 인증
- **가정:** 환자 정보는 앱에 직접 입력 (기존 병원 시스템 연동 없음)
- **열린 질문:** ①기능 그룹 우선순위(A→B 권장) ②"대기 초과" 기준 시간 미확정

### PRD Completeness Assessment

- FR/NFR이 번호로 명확히 정리되어 traceability(추적) 양호.
- 우선순위 표시(🥇🥈🥉) 명확.
- ⚠️ 단, "대기 초과 기준 시간"(FR10 관련)이 미확정 상태 — 에픽/스토리 단계에서 구체화 여부 확인 필요.

## 3. Epic Coverage Validation

### Coverage Matrix (PRD 기능 → 할 일 목록 대조)

| FR | PRD 요구사항 | 에픽/스토리 커버 | 상태 |
|----|-------------|-----------------|------|
| FR1 | 환자 정보 한 화면 통합 | Epic 2 / Story 2.3 | ✅ Covered |
| FR2 | 환자 검색 | Epic 2 / Story 2.2 | ✅ Covered |
| FR3 | 입력 즉시 반영 | Epic 2 / Story 2.4 | ✅ Covered |
| FR4 | 알레르기/금기 경고 | Epic 3 / Story 3.1 | ✅ Covered |
| FR5 | 투약 시간 알림 | Epic 3 / Story 3.3 | ✅ Covered |
| FR6 | 필수 절차 체크리스트 | Epic 3 / Story 3.4 | ✅ Covered |
| FR7 | 안전 알림 지속 | Epic 3 / Story 3.2 | ✅ Covered |
| FR8 | 부서 간 자동 전달 | Epic 4 / Story 4.2 | ✅ Covered |
| FR9 | 단계 실시간 표시 | Epic 4 / Story 4.1 | ✅ Covered |
| FR10 | 대기 초과 알림 | Epic 4 / Story 4.4 (+ Story 5.5 기준값) | ✅ Covered |

### Missing Requirements (누락 기능)

- **없음** — PRD의 FR1~FR10이 모두 에픽/스토리에 매핑됨.

### Coverage Statistics

- 총 PRD FR: 10개
- 에픽에서 커버된 FR: 10개
- **커버리지: 100%** ✅

### ⚠️ 범위 확장 발견 (FRs in Epics but NOT in PRD)

에픽 문서에는 PRD에 없던 **관리자 기능 4개(FR11~FR14)**가 추가됨:
- FR11 직원 계정 관리 / FR12 권한 설정 / FR13 전체 현황 대시보드 / FR14 기준값 설정 → Epic 5에서 커버

**문제점:** PRD는 이 기능들을 명시적으로 **"범위 밖(Out of Scope)"** 으로 적어둠
(PRD 6절: "직군별 세밀한 권한 구분", "병원 전체 통계 대시보드" 제외 / NFR2: "직군별 세밀한 권한 구분은 1차 범위 밖").
즉 **에픽이 PRD보다 범위가 넓어졌고, 두 문서가 서로 어긋남.**

- **원인:** 조교 피드백으로 관리자 기능을 의도적으로 추가 (CLAUDE.md 작업 기록 참고). 의도된 변경으로 보임.
- **권고:** PRD를 업데이트해 관리자 기능(FR11~14)과 역할 구분(일반/관리자)을 정식 범위로 반영 → 두 문서 정합성 회복.
  (개발은 가능하나, "설계도끼리 안 맞는" 상태를 남기지 않는 것이 좋음.)

### ⚠️ NFR 충돌 발견

- PRD **NFR2** = "단순 접근(1차), 직군별 권한 구분은 범위 밖"
- 에픽 **NFR2** = "일반 직원/관리자 역할 구분 + 세부 권한 관리자 설정(FR12)"
- → **정면으로 상충.** PRD 업데이트 시 함께 정리 필요.

## 4. UX Alignment Assessment

### UX Document Status

**발견됨** — `DESIGN.md`(시각 정체성: 색·글꼴·여백·구성요소) + `EXPERIENCE.md`(화면 구조·흐름·상태).

### UX ↔ PRD Alignment

- ✅ FR1~FR10이 6개 화면(로그인/홈/검색/통합화면/알림/흐름판)에 모두 매핑됨. EXPERIENCE.md에 "IA 닫힘 확인: FR1~10 모두 커버 ✅" 명시.
- ✅ UX는 PRD의 "1차 직군 구분 없음(NFR2)"과 **일치** ("1차는 직군 구분 없이 동일 화면").

### UX ↔ Architecture Alignment

- ✅ 다크 모드 디자인 토큰 → Tailwind CSS + shadcn/ui로 구현 가능.
- ✅ 실시간 갱신(FR3/FR8) → FastAPI WebSocket이 지원.
- ✅ 반응형(폰 하단탭 / 웹 좌측메뉴) + 모바일 앱(Flutter WebView)로 NFR1 지원.
- 기술 스택이 UX 요구를 받쳐줌 (큰 충돌 없음).

### ⚠️ Alignment Issues (어긋남)

1. **[중] 관리자 화면 UX 누락**
   - 에픽 Epic 5(관리자 페이지, 스토리 5.1~5.5)와 에픽 문서의 UX-DR10("관리자 전용 화면")이 존재하나,
   - **UX 문서(DESIGN/EXPERIENCE)에는 관리자 화면이 전혀 없음** (화면 목록 6개 모두 일반 직원용).
   - → Epic 5 개발 시 **디자인 기준 문서가 없는 상태.** 관리자 화면(계정목록·권한설정·현황 대시보드·기준값) UX 보강 권장.

2. **[중] 3자(PRD·UX·에픽) 권한 정책 불일치**
   - PRD·UX = "1차 권한 구분 없음" / 에픽 = "관리자 역할 추가".
   - 위 3번(Epic Coverage)에서 발견한 것과 같은 뿌리. PRD 수정 시 UX도 함께 관리자 영역 반영 필요.

### ⚠️ Minor (낮은 우선순위)

- EXPERIENCE.md의 "단계 표시 바 = **가로 막대**"(line 55) 표현이, 최종 결정(점+선 **타임라인**, 에픽 Story 4.1 / UX-DR4)과 불일치. 목업은 이미 타임라인으로 개선됨 → EXPERIENCE.md 문구만 갱신하면 깔끔.

## 5. Epic Quality Review (할 일 목록 품질 검사)

### 잘 된 점 (강점)

- ✅ **에픽 순서/독립성 양호:** 1(토대)→2(환자조회)→3(안전)→4(협업)→5(관리자)→6(모바일). 앞 에픽이 뒤 에픽을 필요로 하지 않음(전방 의존성 없음). 순서가 논리적.
- ✅ **DB 생성 타이밍 적절:** 모든 테이블을 Epic 1에 몰아넣지 않고, 환자 구조는 Story 2.1에서 필요할 때 생성. (베스트 프랙티스 부합)
- ✅ **인수 조건(AC) 품질 양호:** 대부분 Given/When/Then 형식, 정상 흐름 + 에러 흐름(로그인 실패, 검색 결과 없음 등)을 포함. 테스트 가능.
- ✅ **그린필드 셋업 스토리 존재:** Story 1.1(프로젝트 기본 세팅)이 첫 작업으로 배치됨.
- ✅ **FR 추적성 유지:** 각 스토리에 (FRn) 표기.

### 🟠 Major Issue — 기술 스택 불일치 (Supabase 잔재)

> 🔴 **이번 점검에서 가장 중요한 발견.** 개발 시작 전 반드시 정리 권장.

기술 구조 문서(architecture.md)는 백엔드를 **FastAPI + PostgreSQL**로 확정했는데, 에픽 문서에 **옛날 도구 "Supabase"가 2곳 남아 있음:**
- **Epic 1 설명**(epics.md line 87): "...**Supabase 연결**, 로그인/인증..."
- **Story 2.1 AC**(epics.md line 172): "**Given** **Supabase 창고에**..."

→ Story 1.2는 올바르게 "FastAPI + PostgreSQL"이라 적혀 있어 **같은 문서 안에서도 도구 이름이 엇갈림.**
→ 개발자가 "창고가 Supabase야 PostgreSQL이야?" 하고 혼란. **두 곳을 PostgreSQL/FastAPI로 수정 권장.**

### 🟡 Minor Concerns (낮은 우선순위)

1. **기준값 기본값 처리(FR10 ↔ FR14):** Story 4.4(대기 초과 알림)는 "기준 시간(예: 30분)"을 예시로 쓰고, Story 5.5(관리자 기준값 설정)에서 그 값을 조정함. → Story 4.4가 **기본값으로 단독 동작**하도록 명시하면 더 안전(관리자 기능 없이도 Epic 4 완결). 현재도 전방 의존성은 아님.
2. **셋업 스토리의 사용자 역할:** Story 1.1·1.2·2.1이 "As a 개발자(YC)" 형식. 기술 준비 스토리라 흔한 패턴이며 허용 범위이나, 순수 사용자 가치 관점에선 약한 스토리(토대 작업이므로 수용 가능).
3. **EXPERIENCE.md 타임라인 문구**(위 4절 Minor와 동일).

### Best Practices Compliance

| 점검 항목 | 결과 |
|-----------|------|
| 에픽이 사용자 가치 전달 | ✅ (Epic 1·6은 토대성이나 수용 가능) |
| 에픽 독립적 동작 | ✅ |
| 스토리 적절한 크기 | ✅ |
| 전방 의존성 없음 | ✅ |
| DB 테이블 필요 시 생성 | ✅ |
| 명확한 인수 조건 | ✅ |
| FR 추적성 유지 | ✅ |

## 6. Summary and Recommendations (최종 정리)

### Overall Readiness Status

> ## 🟡 NEEDS MINOR WORK (가벼운 손질 후 개발 시작 권장)

기능 커버리지 100%, 에픽/스토리 구조 양호. **개발을 막을 치명적 결함은 없음.**
단, "관리자 기능 추가"와 "Supabase→PostgreSQL 변경"이 일부 문서에 반영 안 된 **문서 정합성 문제**가 있어, 개발 전 짧게 손보면 이후 혼선을 막을 수 있음.

### Critical Issues Requiring Immediate Action (개발 전 정리 권장)

1. **[🟠 Major] 기술 스택 잔재 — Supabase 표기 2곳**
   - epics.md line 87(Epic 1 설명), line 172(Story 2.1 AC)의 "Supabase" → **"PostgreSQL/FastAPI"로 수정.**
   - 같은 문서 내 Story 1.2와 모순. 개발자 혼선 직결. **가장 먼저 처리 권장.**

2. **[🟠 Major] 관리자 기능 범위 불일치 (PRD ↔ 에픽/UX)**
   - 에픽에 FR11~14(관리자 기능) 추가됐으나, PRD는 이를 "범위 밖"으로 명시 + NFR2 권한 정책이 정반대.
   - **권고:** PRD를 업데이트해 관리자 기능·역할 구분(일반/관리자)을 정식 범위로 반영. (의도된 변경이므로 문서만 따라오면 됨)

3. **[🟠 Major] 관리자 화면 UX 누락**
   - Epic 5(관리자 페이지)에 대응하는 화면 디자인이 UX 문서에 없음.
   - **권고:** 관리자 화면(계정목록·권한설정·현황 대시보드·기준값) UX 보강.

### Minor (개발하면서 정리해도 무방)

- Story 4.4 대기 초과 기준값을 "기본값(예: 30분)으로 단독 동작" 명시.
- EXPERIENCE.md "가로 막대" → "타임라인" 문구 갱신.
- PRD의 "대기 초과 기준 시간" 미확정 → 기본값으로 확정.

### Recommended Next Steps (다음 할 일 순서)

1. **epics.md의 Supabase 2곳을 PostgreSQL로 수정** (5분, 즉시 가능)
2. **PRD 업데이트** — 관리자 기능(FR11~14) + 역할 구분을 정식 범위로 반영 (`bmad-prd` update)
3. **UX 보강** — 관리자 화면 디자인 추가 (`bmad-ux`) *(또는 Epic 5 개발 직전에 보강해도 됨)*
4. 정리 후 → **스프린트 계획**(`bmad-sprint-planning`)으로 개발 착수

### Final Note

이 점검은 **3개 카테고리에서 Major 3건 + Minor 3건**을 발견함. 모두 "기능 누락"이 아니라 **"변경 사항이 일부 문서에 반영 안 된 정합성 문제"**로, 빠르게 손질 가능.
1번(Supabase 수정)은 개발 전 필수에 가깝고, 2·3번은 PRD/UX를 맞추는 작업으로 권장. as-is로 개발을 진행할 수도 있으나, 위 항목 정리 시 이후 작업이 한결 매끄러움.

---
**점검자:** Claude (PM 역할) · **날짜:** 2026-06-20
