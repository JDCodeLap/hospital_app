# 🏥 병원 앱 프로젝트 (hospital-app)

> **클로드에게:** 이 파일은 작업 시작할 때 자동으로 읽는 파일이에요.
> 아래 "작업 기록"을 먼저 확인해서 어디까지 진행했는지 파악하고 맥락을 이어서 작업하세요.
> 그리고 **새로운 작업을 끝낼 때마다 "작업 기록"에 날짜와 함께 내용을 추가**해주세요.

---

## 🗣️ 설명 규칙 (가장 중요 — 항상 지키기)

> **사용자는 비개발자(바이브코딩 입문자)예요.** 모든 답변·작업 안내는 아래 규칙을 **무조건** 따르세요.

1. **어려운 용어는 그 자리에서 쉽게 풀어주기**
   - 전문 용어(영어 약자, 기술 이름 등)가 나오면 → 바로 옆에 **괄호로 쉬운 우리말 풀이**를 붙여요.
   - 예: "API(앱끼리 정보를 주고받는 통로)", "배포(만든 걸 실제 인터넷에 올려 남들도 쓰게 하는 것)".

2. **"왜 이게 나왔는지 · 무슨 목적인지"도 같이 설명하기**
   - 어떤 개념이나 단계를 언급할 때는 **그게 왜 필요한지, 무엇을 위한 건지**를 한 줄이라도 덧붙여요.
   - 예: "지금 점검을 하는 이유는, 공사(개발) 들어가기 전에 설계도끼리 안 맞는 부분이 없는지 미리 확인해서 나중에 고치는 수고를 줄이기 위해서예요."

3. **순서: "무슨 역할인지" 먼저 → 기술 세부사항은 최소화**
   - 코드나 설정을 설명할 때는 **"이게 무슨 일을 하는 부분인지"를 먼저** 말하고, 기술적 디테일은 꼭 필요한 만큼만.

4. **비유·예시 적극 활용**
   - 추상적인 개념은 일상 비유(집 짓기, 요리, 택배 등)로 그림이 그려지게 설명해요.

5. **진행 상황은 단계별로 직관적으로**
   - "지금 몇 단계 중 어디" / "방금 한 일" / "다음에 할 일"을 짧고 명확하게 짚어줘요.

6. **동작(실행) 우선**
   - 설명만 길게 늘어놓지 말고, 실제로 **막힘없이 다음 작업이 굴러가도록** 도와주는 걸 목표로 해요. 막히면 선택지를 제시하고 추천안을 함께 줘요.

---

## 📌 프로젝트 한눈에 보기

- **프로젝트 이름:** hospital-app (병원 앱)
- **사용 도구:** BMAD Method (기획부터 개발까지 단계별로 도와주는 도구)
- **문서 언어:** 한국어
- **시작일:** 2026-06-20
- **사용자:** 비개발자 (바이브코딩 입문자) — 쉬운 말로 설명해주세요.

---

## 🗺️ 전체 작업 단계 (체크리스트)

진행하면서 완료한 항목에 체크(✅)를 채워나갈 거예요.

### 1단계: 분석 (아이디어 정리) — 선택
- [x] 브레인스토밍 (`bmad-brainstorming`) ✅ 완료 (2026-06-20)
- [ ] 제품 브리프 (`bmad-product-brief`)
- [ ] 도메인/시장/기술 조사 (`bmad-*-research`)

### 2단계: 기획 — **필수**
- [x] PRD 작성 (`bmad-prd`) ✅ 완료 (2026-06-20)
- [x] UX 설계 (`bmad-ux`) ✅ 완료 (2026-06-20)

### 3단계: 설계 — **필수**
- [x] 기술 구조 설계 (`bmad-create-architecture`) ✅ 완료 (2026-06-20)
- [x] 에픽 & 스토리 작성 (`bmad-create-epics-and-stories`) ✅ 완료 (2026-06-20)
- [x] 구현 준비 점검 (`bmad-check-implementation-readiness`) ✅ 완료 (2026-06-20)

### 4단계: 개발 — **필수**
- [x] 스프린트 계획 (`bmad-sprint-planning`) ✅ 완료 (2026-06-20)
- [ ] 스토리 작성 → 개발 → 코드 리뷰 (반복)
  - [x] **Epic 1: 앱 토대 + 로그인** ✅ 완료 (2026-06-20)
  - [x] **Epic 2: 환자 정보 한눈에 보기** ✅ 완료 (2026-06-20) — 데이터·검색·통합화면·실시간
  - [x] **Epic 3: 환자 안전 지키기** ✅ 완료 (2026-06-20) — 알레르기경고·배너유지·투약알림·필수절차체크리스트
  - [ ] **Epic 4: 부서 협업 + 환자 흐름 추적** ◀ 다음 시작점 (Story 4.1 환자 단계 타임라인)
  - [ ] Epic 5: 관리자 페이지
  - [ ] Epic 6: 모바일 앱 패키징

---

## 📝 작업 기록 (최신순)

### 2026-06-20 — 🔍 Story 3.4 코드 리뷰 완료 → done! 🎉 Epic 3 전체 완료!
- 검사관 3종 병렬(**절차 우회 가능성 집중**) ✅ — **AC 1~8 전부 PASS, 범위 침범 없음, 안전 게이트 우회 불가**(직접 API 호출 409·가짜 항목키 400·동시 호출도 첫 advance가 체크 삭제 → 2번째 409)
- **patch 0건**(Acceptance Auditor가 AC 전부 PASS·구현이 3.2/3.3 패턴 충실히 재사용·서버 강제 견고로 판정 → 고칠 in-scope 버그 없음)
- defer 3건 → `deferred-work.md`: ①**advance 동시성 가드 없음**(행 잠금 X — 멀티워커 배포 시 SELECT FOR UPDATE/조건부 UPDATE로 원자화, 단 우회는 아님) ②**단계 진행 시 체크 기록 하드 삭제**(감사 추적 소실 — Epic 5 리포트에서 archive 설계) ③**비표준 stage·항목세트 버전닝**(단계/항목 편집 기능=Epic 5 도입 시)
- dismiss 8건 기각(프론트 staleness=서버가 진짜 자물쇠 / 전 전이 같은3항목=의도 / RBAC=Epic5 / 2차쿼리 삭제 무해 등)
- 상태: **3-4 = done, epic-3 = done** → Epic 3(환자 안전 지키기) 4개 스토리 전부 완료 🎉
- ▶▶ **다음: Epic 4 (부서 협업 + 환자 흐름 추적) — Story 4.1(환자 단계 타임라인)** → `bmad-create-story`
  - 인계: 3.4에서 만든 `current_stage`(접수→진료→검사→수납) + `STAGE_ORDER` 그대로 사용해 **점+선 타임라인 그래픽**으로 시각화(현재는 텍스트 배지만). 단계 변경 유일 경로=advance-stage. `manager.broadcast` 실시간 파이프 재사용.

### 2026-06-20 — 🛠️ Story 3.4 개발 완료! (필수 절차 체크리스트) → review ✅
- 🗄️ 백엔드: 새 테이블 `ChecklistCheck`(models.py — **(환자·항목) unique**, 토글식·날짜키 없음=시술1회 단위) + `get_patient` 묶음에 **`checklist` 블록**(items[본인확인·금식·동의서]·all_checked·next_stage) 추가(기존 키 보존=하위호환) + `POST .../checklist/{item_key}`(async, 토글: 체크=행 생성 IntegrityError 멱등 / 해제=행 삭제, broadcast) + `POST .../advance-stage`(async, **모든 항목 체크 아니면 409 거부** → current_stage 다음 단계로 + 그 환자 체크 전부 삭제(초기화) + broadcast, 마지막 단계 400). 상수 `CHECKLIST_ITEMS/KEYS`·`STAGE_ORDER`(접수→진료→검사→수납)·`next_stage()`
- 🖥️ 프론트: `ProcedureChecklist.tsx`(NEW) — 항목 탭 체크(`check_circle`/`radio_button_unchecked` 아이콘+라벨+"완료" 글자 = 색+아이콘+글자 병행, 44px) + **"다음 단계로" 버튼**(all_checked일 때만 초록 활성, 미체크면 회색 비활성, 클릭→advance→reload, 409면 안내+reload, 마지막 단계면 "최종 단계입니다"). `PatientDetail`에 `Checklist` 타입·`checklist` 필드·컴포넌트(헤더 카드 아래) 연결. 기존 배너·카드·폼·WS 보존
- ★ 핵심 판단: **체크 상태 백엔드 저장**(3.2/3.3 기록 패턴, 단 **날짜키 없음**) / **진행 안전강제는 서버 409**(프론트 비활성만 의존 X, 3.1 철학) / **"다음 단계로"가 current_stage 실제 진행+체크 초기화**(FR6 충족) / 항목=백엔드 상수 단일세트 / 새 테이블 마이그레이션 0 / 묶음에 checklist 추가(하위호환) / 2.4 broadcast 재사용
- ★ 막힌 점: 포트 8000은 예전 서버 점유 → 검증은 8001에 새 코드로 / 콘솔 한글 깨짐 → UTF-8로 단계순서 재확인
- 검증: 백엔드 16개 시나리오(묶음 checklist→전부체크→미완료 409→완료 advance 200·단계이동·초기화→400 항목/404/401/마지막 400/멱등/해제) + 단계순서(접수→진료→검사→수납) **전부 PASS**, build·lint·타입 통과(오류 0)
- **다음 할 일:** 🔍 `bmad-code-review`(권장, 환자 안전 기능) → 통과 시 **Epic 3 전체 완료** 🎉 → 이후 Epic 4(부서 협업·환자 흐름)

### 2026-06-20 — 📝 Story 3.4 작성 완료 (ready-for-dev) — Epic 3 마지막 ✅
- `bmad-create-story`로 **Story 3.4 (필수 절차 체크리스트, FR6)** 작성 ✅
- 결과 파일: `_bmad-output/implementation-artifacts/3-4-필수-절차-체크리스트.md`
- 범위: ①백엔드 — 새 테이블 `ChecklistCheck`((환자·항목) unique, 토글식) + `get_patient` 묶음에 **`checklist` 블록** 추가(3.2 safety_ack 방식) + `POST .../checklist/{item_key}`(토글·멱등·broadcast) + `POST .../advance-stage`(**모든 항목 체크 강제 409** → `current_stage` 진행 + 체크 초기화 + broadcast) ②프론트 — `ProcedureChecklist.tsx`(NEW: 항목 탭 체크 + "다음 단계로" 버튼 = all_checked 시 활성/초록, 미체크면 회색 비활성) + `PatientDetail` 연결
- ★ 핵심 판단: **체크 상태 백엔드 저장**(3.2/3.3 기록 패턴 재사용, 단 **날짜키 없음** — 절차는 시술 1회 단위라 unique=(patient_id,item_key)) / **진행 안전강제는 서버 409**(3.1 철학, 프론트 비활성만 의존 X) / **"다음 단계로"가 current_stage 실제 진행 + 체크 초기화**(FR6 충족) / 필수 항목=백엔드 상수 단일세트(본인확인·금식·동의서) / 묶음 응답에 checklist 추가(하위호환)
- ★ 범위 밖: 단계 타임라인 그래픽(점+선)=4.1(텍스트 배지 유지) / 단계별 다른 항목세트=후속 / 항목 편집·감사 리포트=Epic 5 / 자동 진행·대기초과=Epic 4
- **다음 할 일:** 🛠️ `bmad-dev-story`로 Story 3.4 개발 → 끝나면 코드 리뷰 → **Epic 3 전체 완료** 🎉

### 2026-06-20 — 🔍 Story 3.3 코드 리뷰 완료 → done! ⏰
- 검사관 3종 병렬(시간계산·멱등·예외 집중) ✅ — **AC 1~7 전부 PASS, 범위 침범 없음, 슬롯별 완료(status 토글 X) 견고**
- patch 3건 즉시 수정: ①**IntegrityError 좁힘**(rollback 후 기존 기록 재조회·없으면 re-raise → 진짜 실패를 성공으로 오인 X) ②**중단(status≠active) 약 완료 400 거부**(GET 알림과 일관) ③**프론트 loadSeq 가드**(자동갱신/완료 reload 경쟁으로 완료 슬롯 부활 방지)
- defer 3건(⭐**자정 넘기면 미투약 약 사라짐**=overdue 추적은 예정 datetime 모델 필요·후속 / datetime 타임존 naive=앱 전반 / schedule 편집 stale=편집기능 없어 미발생) → `deferred-work.md`
- 노이즈 7건 기각(N+1·>vs>=·멱등 broadcast 생략 등)
- 재검증: 중단 약 400·멱등 재호출 200·404·401 PASS, build·lint 통과 → **sprint-status: 3-3 = done**
- ▶▶ **다음: Story 3.4 (필수 절차 체크리스트) — Epic 3 마지막** → `bmad-create-story`
  - 인계: 체크 상태 저장은 3.3의 `MedicationAdministration`처럼 (대상·항목·날짜) 기록 테이블 패턴 재사용 / 디자인은 새 흰색 테마·AppShell·Material 아이콘 자동 적용

### 2026-06-20 — 🛠️ Story 3.3 개발 완료! (투약 시간 알림) → review ⏰
- 🗄️ 백엔드: 새 테이블 `MedicationAdministration`(슬롯별 완료 기록·unique) + `parse_schedule_times`(HH:MM만, "필요시" 제외) + `GET /api/medication-alerts`(서버 시각 기준 due 계산) + `POST /api/medications/{id}/administer`(async, 멱등 IntegrityError, broadcast)
- 🖥️ 프론트: `/alerts` 페이지(AuthGuard) + `MedicationAlerts.tsx`(NEW) — 앰버 카드(약·환자링크·예정시각)·초록 "완료" 버튼·빈/로딩/오류/401·**60초 자동 갱신**+새로고침·항목별 재진입 가드·낙관적 제거. 홈에 "🔔 알림 모아보기" 링크
- ★ 핵심 판단: **"시간 되면"=서버 시각 pull 계산**(예약 푸시 X) / **완료=슬롯 단위 기록**(status 토글 X → 매일 반복 유지) / 새 테이블 마이그레이션 0 / 멱등=unique+IntegrityError / 2.4 broadcast·3.1·3.2 패턴 재사용
- 검증: 백엔드 7시나리오(목록→완료→정리 7→6→멱등→400→404→401) + 단위 6케이스 **전부 PASS**, build·lint 통과
- **다음 할 일:** 🔍 `bmad-code-review`(권장) → 통과 시 Story 3.4(필수 절차 체크리스트) = Epic 3 마지막

### 2026-06-20 — 📝 Story 3.3 작성 완료 (ready-for-dev) ⏰
- `bmad-create-story`로 **Story 3.3 (투약 시간 알림, FR5)** 작성 ✅
- 결과 파일: `_bmad-output/implementation-artifacts/3-3-투약-시간-알림.md`
- 범위: ①백엔드 — 새 테이블 `MedicationAdministration`(슬롯별 완료 기록·unique) + `GET /api/medication-alerts`(서버 시각 기준 due 계산) + `POST /api/medications/{id}/administer`(멱등·broadcast) + `parse_schedule_times` ②프론트 — `/alerts` 화면(`MedicationAlerts`: 앰버 카드·완료 버튼·60초 자동갱신) + 홈 "알림 모아보기" 링크
- ★ 핵심 판단: **"시간 되면"=서버 시각 기준 pull 계산**(화면 열 때·새로고침·60초) — 진짜 예약 푸시(cron)는 범위 밖 / **완료는 슬롯 단위 기록**(status 토글 X → 매일 반복 투약 유지) / 새 테이블로 마이그레이션 0 / 멱등=unique+IntegrityError / 2.4 broadcast·3.1·3.2 패턴 재사용
- ★ 범위 밖: 예약 푸시/스케줄러·🔔 배지·담당 배정 필터(전 직원이 모든 알림 봄, Epic 5)·복잡 스케줄·대기초과(4.4)
- **다음 할 일:** 🛠️ `bmad-dev-story`로 Story 3.3 개발

### 2026-06-20 — 🔍 Story 3.2 코드 리뷰 완료 → done! 🛡️
- 검사관 3종 병렬(확인 우회·멱등·상태공유 집중) ✅ — **AC 1~7 전부 PASS, 범위 침범 없음, 핵심 설계(백엔드 공유 확인·멱등·하위호환) 견고**
- patch 3건 즉시 수정: ①**동시 확인 IntegrityError 방어**(두 직원 동시 클릭 시 500 → `try/except IntegrityError`로 깔끔한 멱등 200) ②**위험 없는 환자 확인 400 거부**(직접 API 호출 시 무의미 행 방지) ③**확인 후 배너 stuck 방지**(reload 실패해도 `justAcked` 낙관적 상태로 즉시 "확인됨" 전환)
- defer 2건(확인이 **알레르기 내용에 미연동** → 알레르기 편집 기능 도입 시 재무장 설계 · **datetime 타임존** naive → 앱 전반 UTC 정리) → `deferred-work.md` / 노이즈 6건 기각
- 재검증: 백엔드 6케이스(+무위험 400) PASS, build·lint 통과 → **sprint-status: 3-2 = done**
- ▶▶ **다음: Story 3.3 (투약 시간 알림)** → `bmad-create-story`
  - 인계: 3.1에서 추가한 `Medication.schedule`(예 "08:00,20:00") 사용 / 저장·완료 체크 시 `manager.broadcast` 재사용 / SafetyAck 패턴(확인 기록)도 참고 가능

### 2026-06-20 — 🛠️ Story 3.2 개발 완료! (안전 경고 배너 유지) → review 🛡️
- 🗄️ 백엔드: 새 테이블 `SafetyAck`(models.py — 환자당 1건 unique·확인자·시각) + `POST /api/patients/{id}/safety-ack`(async, 보호됨, **멱등**: 있으면 그대로·없을 때만 생성+broadcast) + `get_patient` 묶음에 **`safety_ack`** 추가(None=미확인 / 확인자·이름·시각). 기존 키 유지=하위호환
- 🖥️ 프론트: `SafetyBanner.tsx`(NEW) — allergies 없으면 안 뜸 / **미확인=빨간 경고+"확인" 버튼**(POST→조용한 reload, 401 로그아웃, submittingRef 재진입 락) / **확인됨=차분 배너**(확인자·시각). `PatientDetail`의 2.3 정적 배너를 이걸로 교체 + `PatientBundle`에 safety_ack 타입(기존 fetch·WS·카드·처방폼 보존)
- ★ 핵심 판단 구현: **확인 상태 백엔드 저장**(전 직원·재진입 공유=FR7) / **새 테이블로 마이그레이션 0** / **멱등**(unique patient_id) / 확인 후 빨강→차분 톤만 낮춤(알레르기 영구 표시) / 2.4 broadcast·3.1 제출패턴 재사용
- 검증: 백엔드 7케이스(확인전 null→확인→채워짐+이름(김지영)→멱등(시각 동일)→404→401→무알레르기 하위호환) **전부 PASS**, build·lint 통과
- **다음 할 일:** 🔍 `bmad-code-review`(권장, 안전 기능) → 통과 시 Story 3.3(투약 시간 알림)

### 2026-06-20 — 📝 Story 3.2 작성 완료 (ready-for-dev)
- `bmad-create-story`로 **Story 3.2 (안전 경고 배너 유지, FR7)** 작성 ✅
- 결과 파일: `_bmad-output/implementation-artifacts/3-2-안전-경고-배너-유지.md`
- 범위: ①백엔드 — 새 테이블 `SafetyAck`(환자당 1건·확인자·시각) + `POST /api/patients/{id}/safety-ack`(멱등, 보호됨, broadcast) + `get_patient` 묶음에 `safety_ack` 추가 ②프론트 — `SafetyBanner`(NEW)로 2.3 정적 배너 교체(미확인=빨간 경고+확인 버튼 / 확인됨=차분 배너)
- ★ 핵심 판단: **확인 상태는 백엔드 저장**(전 직원·재진입 공유=FR7 "누구도 안 놓침", localStorage 부적합) / **새 테이블로 마이그레이션 회피**(Patient 컬럼 추가 시 create_all이 ALTER 못 함) / **멱등**(unique patient_id) / **확인 후 빨강→차분 톤만 낮춤**(알레르기는 영구 위험이라 안 없앰) / 2.4 broadcast·3.1 제출패턴 재사용
- ★ 범위 밖: 위험 종류 확장(allergies 1종만)·확인 해제/만료·확인 권한/감사 리포트(Epic 5)·투약알림(3.3)·체크리스트(3.4)
- **다음 할 일:** 🛠️ `bmad-dev-story`로 Story 3.2 개발

### 2026-06-20 — 🔍 Story 3.1 코드 리뷰 완료 → done! 🛡️ (Epic 3 첫 스토리)
- 검사관 3종 병렬(안전장치 우회 가능성 집중) ✅ — **AC 1~7 전부 PASS, 안전 강제 우회 불가(백엔드 409), 범위 침범 없음(배너유지/투약알림/체크리스트/감사로그 미구현 확인)**
- patch 4건 즉시 수정: ①**빈/공백 약이름 422 거부**(API 직접 호출 시 빈 처방 저장+안전검사 건너뜀 방어, 입력 trim) ②**계열 매핑 소문자 조회 통일**(직접일치와 같은 기준) ③**프론트 이중제출 ref 락**(빠른 더블클릭 중복 처방 방지) ④**경고-처방 약 일치**(409 띄운 그 약을 `pending`에 고정해 재전송 → 입력 바꿔도 경고 본 약 그대로 저장)
- defer 4건(위험처방 오버라이드 **감사로그**=Epic5 · **판정 커버리지 한계**(영문/상품명·교차반응=약품DB 필요, 범위 밖) · async 동기DB(2.4와 동일) · 멱등성) → `deferred-work.md` / 노이즈 7건 기각
- 재검증: 백엔드 6시나리오(공백 422 포함) PASS, 안전검사 단위 6케이스 PASS, build·lint 통과 → **sprint-status: 3-1 = done**
- ▶▶ **다음: Story 3.2 (안전 경고 배너 유지)** → `bmad-create-story`
  - 인계: 2.3의 정적 알레르기 배너를 "담당자 확인 전까지 유지(확인 버튼)"로 확장 / 이번 `safety.py`의 충돌 표현 재사용 가능 / 처방 파이프(broadcast)·통합화면 그대로

### 2026-06-20 — 🛠️ Story 3.1 개발 완료! (알레르기/금기 경고) → review 🛡️
- 🔌 백엔드: `safety.py`(NEW: `check_contraindications` + 계열매핑 `CONTRAINDICATION_MAP`) + `main.py`에 `MedicationIn`·`POST /api/patients/{id}/medications`(async, 보호됨). **충돌+미확인이면 409로 저장 거부**(detail에 conflicts/약이름/메시지), 확인(ack=true)·무충돌이면 저장 후 `manager.broadcast`(2.4 파이프 재사용). 모델 변경 0
- 🖥️ 프론트: `PrescribeForm.tsx`(NEW) — 약이름·용량·시간 폼 + 제출 분기(200 성공·폼리셋·조용한reload / 409 **빨간 경고팝업** `role=alertdialog` "이 환자는 OO 알레르기입니다" + [취소]/[계속 처방=ack 재요청] / 401 로그아웃 / 기타 인라인오류). `PatientDetail` 투약 카드 아래에 끼움(기존 fetch·WS·카드 보존)
- ★ 핵심 판단 구현: **안전 강제는 백엔드 409**(프론트 우회 불가), 팝업은 UX / **계열 매칭**으로 김철수(페니실린)+`아목시실린`도 차단 / 저장 후 갱신은 2.4 broadcast 재사용
- ★ 막힌 점: 백엔드는 venv 파이썬으로 실행해야 의존성 잡힘 / 포인트색 토큰은 `accent-primary`(`accent`아님) → 버튼 색 수정
- 검증: 백엔드 5시나리오(409 미저장/ack 저장/무충돌 저장/404/401) **전부 PASS**, 안전검사 단위 6케이스 PASS, build·lint 통과 (검증 중 김철수에 아목시실린·타이레놀 2건 데모 저장 — 무해)
- **다음 할 일:** 🔍 `bmad-code-review`(권장, 환자 안전 민감) → 통과 시 Story 3.2(안전 경고 배너 유지)

### 2026-06-20 — 📝 Story 3.1 작성 완료 (ready-for-dev) — Epic 3 진입 🛡️
- `bmad-create-story`로 **Story 3.1 (알레르기/금기 경고, FR4)** 작성 ✅ → epic-3 = in-progress
- 결과 파일: `_bmad-output/implementation-artifacts/3-1-알레르기-금기-경고.md`
- 범위: ①백엔드 — `safety.py`(NEW: `check_contraindications` + **계열 매핑** `CONTRAINDICATION_MAP`) + `POST /api/patients/{id}/medications`(처방 추가, async, 보호됨) ②프론트 — `PatientDetail`에 **처방 입력 폼** + **빨간 경고 팝업**(취소/계속 처방)
- ★ 핵심 판단: **안전검사는 백엔드가 강제** — 충돌인데 `acknowledged` 없으면 **409로 저장 거부**(프론트 우회 불가), 확인(계속 처방)하면 `acknowledged:true` 재요청으로 저장. 프론트 팝업은 UX, 진짜 자물쇠는 백엔드.
- ★ **계열 매칭**: 김철수(페니실린) + `아목시실린`(페니실린계) 처방도 충돌 잡음(EXPERIENCE.md Flow ③ "페니실린 계열" 요구 충족). 직접 일치 + 작은 매핑까지만(실제 DDI 엔진·약품 DB는 범위 밖)
- ★ **재사용**: 2.4의 `manager.broadcast`(실시간 파이프) 그대로 호출 → 저장 후 화면 자동 갱신. `add_visit` 엔드포인트 패턴·`Medication` 모델 그대로(모델 변경 0, 마이그레이션 불필요)
- ★ 범위 밖: 안전배너 "확인 전 유지"=3.2 / 투약알림=3.3 / 체크리스트=3.4 / 투약 수정·삭제·DDI·권한·감사로그
- **다음 할 일:** 🛠️ `bmad-dev-story`로 Story 3.1 개발

### 2026-06-20 — 🔍 Story 2.4 코드 리뷰 완료 → done! 🎉 Epic 2 전체 완료!
- 검사관 3종 병렬(실시간 수명주기·WS 보안·2.3 보존 집중) ✅ — **AC 1~7 전부 PASS, 폴링 아닌 WebSocket·신호만 전송(PHI 미노출)·2.3 동작 보존·범위 준수**
- patch 4건 즉시 수정(전부 프론트 실시간 안정성): ①**재연결 타이머 cleanup**(떠난 뒤 좀비 WS 생성 방지) ②**조용한 갱신 중 401/404 화면 가로챔 차단**(남의 동작에 강제 로그아웃/사라짐 X) ③**onopen에서 재연결 카운터 리셋**(오래 켠 화면도 계속 회복) ④**재연결 때 토큰 다시 읽기**(만료 대응)
- defer 4건(WS 토큰 쿼리 노출·async 핸들러의 동기 DB·WS Origin 검증·broadcast half-open 지연) → `deferred-work.md` (배포/부하 단계 사안) / 노이즈 6건 기각
- 재검증: build·lint 통과 → **sprint-status: 2-4 = done, epic-2 = done**
- ▶▶ **다음: Epic 3 (환자 안전 지키기) — Story 3.1(알레르기/금기 경고)** → `bmad-create-story`
  - 인계: 실시간 파이프(`manager.broadcast`) 재사용 가능 / 안전배너는 2.3에 정적 표시 있음 → 3.2에서 "확인 전 유지"로 확장 / 김철수=페니실린 등 알레르기 시드 활용

### 2026-06-20 — 🛠️ Story 2.4 개발 완료! (입력 즉시 반영 / 실시간) → review
- 🔌 백엔드: `realtime.py`(ConnectionManager=환자별 WS 방·broadcast) + `WS /ws/patients/{id}`(쿼리 `?token=` 인증, 무효 close 1008) + 시연용 `POST /api/patients/{id}/visits`(async, 방문 저장→broadcast) + `security.py`에 `authenticate_token`/`authenticate_ws_token`(get_current_user도 공용함수로 리팩터)
- 🖥️ 프론트: `lib/api.ts`에 `WS_BASE`(http→ws) + `PatientDetail`에 WS 구독(신호 `patient_updated` 받으면 `GET /api/patients/{id}` 조용히 재호출=실시간 갱신). 기존 fetch는 `loadBundle(signal, silent)`로 정리(2.3 동작 보존), 끊기면 3초·2회 재연결, WS 실패는 화면에 오류 안 띄움(보조 채널)
- ★ 핵심 판단 구현: **WS는 "다시 불러와" 신호만**(데이터는 보호된 GET) / **토큰은 쿼리로**(브라우저 WS 헤더 불가) / **폴링 아님**(진짜 WebSocket) / 읽기전용이라 **시연용 쓰기(방문추가) 1개**만
- ★ 새 패키지 설치 0 (uvicorn[standard]에 websockets 포함). 검증도 파이썬 websockets 클라로 자동화
- ★ 막힌 점: lint `set-state-in-effect` → 초기 로딩 effect를 `void (async()=>{ await loadBundle() })()`로 감싸 해결
- 검증(자동): 유효토큰 WS 연결·가짜/무토큰 거부·POST→`patient_updated` 수신·visits 1→2·POST 401/404 / build·lint 통과
- **다음 할 일:** 🔍 `bmad-code-review`(권장, 실시간+PHI) → 통과 시 **Epic 2 전체 완료** 🎉 → 이후 Epic 3(환자 안전)

### 2026-06-20 — 📝 Story 2.4 작성 완료 (ready-for-dev) — Epic 2 마지막 🔚
- `bmad-create-story`로 **Story 2.4 (입력 즉시 반영 / 실시간 자동 갱신, FR3·NFR4)** 작성 ✅
- 결과 파일: `_bmad-output/implementation-artifacts/2-4-입력-즉시-반영.md`
- 범위(WebSocket 실시간 파이프): ①백엔드 — `realtime.py`(ConnectionManager) + `WS /ws/patients/{id}`(쿼리 `?token=` 인증) + 브로드캐스트 + **시연용 쓰기 `POST /api/patients/{id}/visits`**(방문 추가→broadcast) + `security.py`에 WS 토큰 검증 헬퍼 ②프론트 — `PatientDetail`에 WS 구독 추가(신호 받으면 `GET /api/patients/{id}` 재호출=reload), `lib/api.ts`에 `WS_BASE`
- ★ 핵심 판단: **읽기 전용 앱이라 실시간 증명용 최소 쓰기 1개(방문기록) 필요** / **브라우저 WS는 헤더 불가 → 토큰 쿼리** / **WS는 "다시 불러와" 신호만, 데이터는 GET 재호출**(권한 일관·단순) / WS는 보조채널(실패 조용히) / **폴링 금지**(NFR4=WebSocket)
- ★ `uvicorn[standard]`에 websockets 포함 → 새 패키지 설치 없음. 검증도 파이썬 websockets 클라 스크립트로 자동화 가능
- ★ 범위 밖: 정식 입력 폼 UI·전체 항목 편집(후속), WS Origin 화이트리스트·권한(Epic 5), 낙관적 업데이트
- **다음 할 일:** 🛠️ `bmad-dev-story`로 Story 2.4 개발 → 끝나면 **Epic 2 완료** 🎉

### 2026-06-20 — 🔍 Story 2.3 코드 리뷰 완료 → done! (⭐ 환자 통합 화면)
- 검사관 3종 병렬(PHI 보호·범위 준수 집중) ✅ — **AC 1~9 전부 PASS, 범위 침범 없음(타임라인/체크리스트/투약알림/약물충돌/배너확인/WebSocket 미구현 확인), 1.4 RSC 준수, 백엔드 변경 0**
- patch 2건 즉시 수정: ①**응답 형태 방어**(목록 `?? []`·금액 `?? 0`·patient 가드 → 백엔드가 키 누락/null 줘도 화면 안 깨짐) ②**잘못된 id 처리**(숫자 아니면 호출 없이 "환자 없음", `!pid` 첫렌더 스킵, 422도 notfound, 배열 id 방어)
- defer 2건(403→로그아웃은 Epic 5 RBAC에서 재검토 · 오류문구 `localhost:8000` 노출은 배포 시 정리) → `deferred-work.md` / 노이즈 6건 기각
- 재검증: build·lint 통과 → **sprint-status: 2-3 = done**
- ▶▶ **다음: Story 2.4 (입력 즉시 반영, WebSocket) → Epic 2 마지막** → `bmad-create-story`
  - 인계: 이 상세 화면(PatientDetail)에 WebSocket 구독을 얹어, 해당 환자 정보가 바뀌면 새로고침 없이 갱신(NFR4). 읽기 fetch는 이미 PatientDetail에 있음.

### 2026-06-20 — 🛠️ Story 2.3 개발 완료! (환자 통합 화면 ⭐) → review
- 🖥️ **프론트 전용** — `/patients/[id]` 동적 라우트(`page.tsx`: `AuthGuard`로 `PatientDetail`만 감쌈, **환자 데이터 fetch 없음**) + `PatientDetail.tsx`(핵심)
- 📋 `PatientDetail`: `useParams`로 id → `GET /api/patients/{id}` 호출(2.2 패턴 재사용: **AbortController + cancelled 표식**, 401/403→clearToken+`/login`, 404→"환자를 찾을 수 없습니다", 오류→연결안내). 목업 다크 레이아웃: 상단바(← 뒤로)→**알레르기 정적 배너**(있으면)→환자 헤더(이름·나이·성별·등록번호·현재단계 배지)→카드(방문·진단·투약·검사·수납). 빈 목록 "기록 없음", 검사 abnormal=앰버 "이상" 배지, 수납 완료(초록)/미납, 한국어 날짜·금액, 스켈레톤 로딩
- ★ **백엔드 변경 0** — 2.1의 `GET /api/patients/{id}` 그대로 재사용
- ★ 1.4 가이드 준수: 검증서 `/patients/9` 초기 HTML에 P0001/페니실린 **미노출**(통과 후 클라 fetch). `/patients/[id]`는 ƒ Dynamic이나 환자데이터 프리렌더 없음
- ★ 범위 경계 지킴: 단계 타임라인 그래픽=4.1 / 체크리스트=3.4 / 투약알림=3.3 / 약물충돌=3.1 / 배너 확인유지=3.2 / WebSocket=2.4 → 미구현(현재단계는 텍스트 배지로만)
- ★ 막힌 점: lint `set-state-in-effect` → `setPhase("loading")`를 비동기 콜백 안으로 이동
- 검증: 백엔드 상세(방문1·진단2·투약2·검사2·수납1)·404·401 / 프론트 build·lint 통과
- **다음 할 일:** 🔍 `bmad-code-review`(권장, PHI 표시 화면) → 이후 Story 2.4(입력 즉시 반영, WebSocket) → Epic 2 완료

### 2026-06-20 — 📝 Story 2.3 작성 완료 (ready-for-dev) — Epic 2 핵심 화면 ⭐
- `bmad-create-story`로 **Story 2.3 (환자 통합 화면, FR1)** 작성 ✅
- 결과 파일: `_bmad-output/implementation-artifacts/2-3-환자-통합-화면.md`
- 범위: **프론트 전용** — `/patients/[id]` 동적 라우트(AuthGuard 보호) + `PatientDetail.tsx`(목업 같은 다크 카드 레이아웃: 상단바→알레르기 정적배너→환자헤더→방문·진단·투약·검사·수납 카드, 빈목록 "기록 없음", 로딩/404/401/오류 상태)
- ★ **백엔드 변경 없음** — 2.1의 `GET /api/patients/{id}`(보호됨) 그대로 재사용. 2.2 fetch 패턴(AbortController+cancelled+401→clearToken/login) 재사용
- ★ 1.4 가이드: 환자 데이터 **Server Component 프리렌더 금지** → params의 id만 다루고 통과 후 클라이언트(useParams)에서 토큰 달아 호출
- ★ 범위 경계(목업에 섞인 후속요소 제외): 단계 타임라인 그래픽=4.1 / 체크리스트=3.4 / 투약시간 알림=3.3 / 약물충돌 팝업=3.1 / 배너 확인유지=3.2 / 실시간 갱신=2.4
- **다음 할 일:** 🛠️ `bmad-dev-story`로 Story 2.3 개발

### 2026-06-20 — 🔍 Story 2.2 코드 리뷰 완료 → done!
- 검사관 3종 병렬(PHI 접근보호·SQL 안전·디바운스 race 집중) ✅ — **AC 1~8 전부 PASS, 범위 위반·PHI 누출 없음, 1.4 RSC 프리렌더 가이드 준수**
- patch 5건 즉시 수정: ①**allergies null 방어**(백엔드 `or ""`·프론트 `?? ""` → null이어도 카드 안 깨짐) ②**검색 중 401**(세션만료 시 clearToken+`/login`, "백엔드 다운" 오안내 제거) ③**stale overwrite 가드**(AbortController에 더해 `cancelled` 표식 → 늦은 응답이 최신 결과 못 덮음) ④**LIKE `%`·`_` 이스케이프**(`escape="\\"` → `%` 쳐도 전체매칭 안 됨, 인젝션은 원래 안전) ⑤**검색어 trim**(앞뒤/공백만 입력 정상화)
- defer 2건(페이지네이션·검색어 길이상한) → `deferred-work.md` / 노이즈 4건 기각(첫진입 250ms 로딩·카드 404=설계상정상·일시 에러잔상·카드44px)
- 재검증: 백엔드 이스케이프(q='%'·'_'·'P_0'→0)·공백('  김  '→1, '   '→8)·소문자·allergies / 프론트 build·lint 통과 → **sprint-status: 2-2 = done**
- ▶▶ **다음: Story 2.3 (환자 통합 화면)** → `bmad-create-story`
  - 인계: 카드 클릭 → `/patients/{id}` 페이지 신설 + `GET /api/patients/{id}` 묶음을 다크 카드 레이아웃으로(AuthGuard 보호 + **통과 후 클라 fetch**, RSC 프리렌더 금지). 안전배너(allergies)는 Epic 3 연결.

### 2026-06-20 — 🛠️ Story 2.2 개발 완료! (환자 검색) → review
- 🔌 백엔드: 기존 `GET /api/patients`에 **검색어 `q`** 추가(새 엔드포인트 X) — `or_(col(name).ilike, col(reg).ilike)`로 이름/등록번호 **대소문자 무시 부분일치**, 입력은 파라미터 바인딩(SQL 인젝션 방지). 응답 요약에 **`allergies` 추가**(카드 배지용, 기존 키 유지=하위호환). 보호(`get_current_user`) 유지
- 🖥️ 프론트: `/patients` 검색화면(`AuthGuard` 보호) + `PatientSearch.tsx`(**250ms 디바운스 + AbortController**로 이전요청 취소) — 환자 카드(이름·나이·등록번호·단계배지) + **알레르기 위험배지(⚠ 아이콘+글자, 색만 금지)** + 로딩/빈("검색 결과 없음")/오류 상태. 카드→`/patients/{id}`(2.3 대상, `prefetch={false}`)
- 🏠 홈 "시작하기" 자리표시 → **"환자 검색" 진입 링크**로 교체(Base UI Button은 `asChild` 미지원 → `buttonVariants()` 입힌 `<Link>`, h-11)
- ★ 1.4 RSC 가이드 준수: 환자 데이터 **Server Component 프리렌더 안 함** → 검증서 초기 HTML에 P0001/페니실린 **미노출**, `/patients` Static 확인
- ★ 막힌 점 해결: ①lint `set-state-in-effect` → `setLoading(true)`를 디바운스 콜백 안으로 이동 ②테스트 시 `localhost`(IPv6) 연결 실패 → `127.0.0.1`로 호출(코드 문제 아님)
- 검증: 백엔드 q필터(이름/등록번호/소문자/없는값/빈값)·토큰없으면 401·allergies(보유 4명) / 프론트 build·lint 통과
- **다음 할 일:** 🔍 `bmad-code-review`(권장, 환자 PHI 접근보호 포함) → 이후 Story 2.3(환자 통합 화면)

### 2026-06-20 — 📝 Story 2.2 작성 완료 (ready-for-dev)
- `bmad-create-story`로 **Story 2.2 (환자 검색)** 작성 ✅
- 결과 파일: `_bmad-output/implementation-artifacts/2-2-환자-검색.md`
- 범위: ①백엔드 — 기존 `GET /api/patients`에 검색어 `q`(이름/등록번호 ilike) + 요약에 allergies 추가(새 엔드포인트 X) ②프론트 — `/patients` 검색화면(AuthGuard 보호, 디바운스+AbortController fetch, 환자 카드+알레르기 위험배지, 로딩/빈/오류 상태) + 홈에 "환자 검색" 진입 버튼
- ★ 1.4 리뷰 가이드 준수: 환자 데이터는 Server Component 프리렌더 금지 → 통과 후 클라이언트에서 토큰 달아 호출
- ★ "실시간"=타이핑 즉시 필터(디바운스). WebSocket 자동갱신은 2.4 / 통합화면 상세는 2.3 (범위 밖)
- 카드 클릭 → `/patients/{id}`(2.3에서 생성)
- **다음 할 일:** 🛠️ `bmad-dev-story`로 Story 2.2 개발

### 2026-06-20 — 🔍 Story 2.1 코드 리뷰 완료 → done!
- 검사관 3종 병렬(PHI 접근보호·데이터 정합성 집중) ✅ — **AC 1~7 PASS, 인증 보호 정상**(토큰 없으면 401)
- patch 4건 즉시 수정: ①시드 원자성(한 명씩 commit→flush+단일commit, 반쪽 환자 방지) ②calc_age 음수 나이 방지(미래 생일→0) ③상세 by_pid id 정렬(임상 정보 순서 안정) ④최지우 검사 보강(전원 검사 보유)
- ★ "권한 분기 없음(전 직원 모든 환자 열람)"은 결함 아님 = **1차 설계(NFR2)**, 역할별 권한·접근 감사로그는 **Epic 5**로 명시 deferred
- defer 5건(멀티워커 시드·권한/감사=Epic5·페이지네이션·코드값 표준·value 미검증) → `deferred-work.md`
- 재시드 검증(8명·전원검사·정렬·나이클램프) 통과 → **sprint-status: 2-1 = done**
- ▶▶ **다음: Story 2.2 (환자 검색)** → `bmad-create-story` (name·registration_number 인덱스 활용)

### 2026-06-20 — 🛠️ Story 2.1 개발 완료! (환자 데이터 구조 + 샘플) → review
- 🗄️ 백엔드 모델 6종 추가(`models.py`): `Patient`(등록번호 unique·index, 이름 index, 생년월일, 성별, 알레르기, 진행단계) + Visit/Diagnosis/Medication/LabResult/Billing(각 patient_id FK)
- 🔌 보호된 조회 API 2종(`main.py`): `GET /api/patients`(요약 목록)·`GET /api/patients/{id}`(전체 묶음, 없으면 404). 둘 다 `get_current_user`로 로그인 직원만(NFR3). `calc_age`로 생년월일→나이
- 👥 **샘플 환자 8명 시드(요청 반영: 넉넉·다양)** — 김철수=페니실린(Epic3 대비), 진행단계·수납상태·검사결과 골고루. "비어 있을 때만" → 중복 방지
- ★ 전부 NEW 테이블이라 create_all로 생성 → Alembic 미도입(기존 테이블 변경 시작 시 도입)
- 검증: 토큰없이401·로그인후8명·김철수상세(알레르기+진단2투약2검사2수납1방문1)·없는id404·재시드중복방지 모두 통과
- 프론트 변경 없음(검색=2.2, 통합화면=2.3)
- **다음 할 일:** 🔍 `bmad-code-review`(환자데이터 접근보호 포함 → 권장) → 이후 Story 2.2(환자 검색)

### 2026-06-20 — 📝 Story 2.1 작성 완료 (ready-for-dev) — Epic 2 진입 🚀
- `bmad-create-story`로 **Story 2.1 (환자 데이터 구조 + 샘플 데이터)** 작성 ✅
- 결과 파일: `_bmad-output/implementation-artifacts/2-1-환자-데이터-구조-샘플-데이터.md`
- 범위: **백엔드 전용** — 환자 테이블 6종(`Patient` + 방문·진단·투약·검사결과·수납) + 샘플 환자 3~5명 시드 + 보호된 조회 API(`GET /api/patients`, `/api/patients/{id}`)
- ★ 통합 화면(2.3)이 보여줄 항목(기본정보·방문·진단·투약·검사·수납·안전경고)에 맞춰 미리 설계 / 김철수=페니실린 알레르기(EXPERIENCE Flow1·Epic3 대비)
- ★ 조회 API는 `get_current_user`로 보호(로그인 직원만, NFR3) — 1.3/1.4 인증 재사용
- ★ 전부 NEW 테이블이라 `create_all`로 충분 → **Alembic 미도입**(기존 테이블 변경 시작 시 도입)
- 범위 밖: 검색 화면=2.2 / 통합 화면 UI=2.3 (이때 RSC 프리렌더 금지 규칙 준수)
- **다음 할 일:** 🛠️ `bmad-dev-story`로 Story 2.1 개발

### 2026-06-20 — 🔍 Story 1.4 코드 리뷰 완료 → done! 🎉 Epic 1 전체 완료!
- 검사관 3종 병렬(보안 집중) ✅ — **AC 1~7 전부 PASS, 치명적 인증 우회 없음**(토큰 검증·401 차단·확인 전 본문 시각적 미노출)
- patch 3건 즉시 수정(AuthGuard): ①401/403만 토큰 삭제(5xx·네트워크는 토큰 보존 → 일시 장애로 세션 안 풀림) ②AbortController+8초 타임아웃("확인 중…" 무한멈춤·요청누수 방지) ③토큰 이중 read 제거
- ★ **런타임 검증에서 추가 발견(코드만 본 검사관 3명이 놓친 것):** 정적 렌더 방식 탓에 보호 본문의 정적 뼈대가 페이지 소스(RSC payload)에 직렬화됨. 화면엔 "확인 중"만 보여 **시각적 누출 없음 + 1.4는 민감데이터 없어 무해.** 단 **Epic 2 환자화면은 환자데이터를 Server Component로 프리렌더 금지, 통과 후 토큰 달아 클라이언트 호출**해야 함 → defer 기록
- defer 7건(RSC가이드·크로스탭 로그아웃·만료 재검증·soft logout·HTTPS강제·localStorage XSS·클라가드 한계) → `deferred-work.md`
- 재검증(build·lint·dev 렌더) 통과 → **sprint-status: 1-4 = done, epic-1 = done**
- ▶▶ **다음: Epic 2 진입 — Story 2.1 (환자 데이터 구조 + 샘플 데이터)** → `bmad-create-story`
  - ⚠️ Epic 2 주의: 위 RSC 가이드(환자데이터 프리렌더 금지) 꼭 지키기 / Alembic 마이그레이션 검토(1-2 defer)도 2.1 전후

### 2026-06-20 — 🛠️ Story 1.4 개발 완료! (로그인 보호 & 로그아웃) → review
- 🚪 **화면 문지기 `AuthGuard`**(components/AuthGuard.tsx): 보호 화면 진입 시 토큰 확인 → 없으면 `/login`; 있으면 `/api/auth/me`로 유효성 검증 후 통과(401/실패는 토큰 삭제+`/login`). **확인 중("확인 중…")엔 본문 미노출**(깜빡임/정보유출 방지), `replace()`로 뒤로가기 복귀 차단.
- 🚪 **로그아웃 버튼 `LogoutButton`**: `clearToken()` 후 `/login`. 홈 우측 상단 배치, 44px 접근성.
- 🏠 홈(`page.tsx`) 본문을 `AuthGuard`로 감쌈 + `lib/api.ts`(API_BASE 공통)·`lib/auth.ts authHeader()` 추가. **백엔드 변경 없음**(1.3의 get_current_user·/me 재사용).
- ★ 핵심 판단: localStorage 토큰이라 서버 미들웨어로 못 막음 → 클라이언트 가드 채택. 진짜 자물쇠는 백엔드.
- 검증: 백엔드 로그인/me(유효 200·가짜 401·없음 401) 런타임 OK / `/` 초기 HTML "확인 중"만 노출 확인 / build·lint 통과
- **다음 할 일:** 🔍 `bmad-code-review`(권장, 보안 민감) → 이후 Story 2.1(환자 데이터 구조·샘플) — Epic 2 진입

### 2026-06-20 — 📝 Story 1.4 작성 완료 (ready-for-dev)
- `bmad-create-story`로 **Story 1.4 (로그인 보호 & 로그아웃)** 작성 ✅
- 결과 파일: `_bmad-output/implementation-artifacts/1-4-로그인-보호-로그아웃.md`
- ★ 핵심 설계 판단: 토큰을 **localStorage**에 보관하는 구조라 서버 미들웨어로는 못 막음 → **화면 쪽(클라이언트) 문지기 `AuthGuard`** 채택. 진입 시 `GET /api/auth/me`로 토큰 유효성까지 검증(만료/위조 차단). 진짜 자물쇠는 이미 백엔드(`get_current_user`).
- 범위: ①미로그인/무효토큰 → `/login`으로 차단 ②로그아웃 버튼(토큰 삭제) ③확인 중 본문 미노출(깜빡임 방지). **프론트 전용**(AuthGuard·LogoutButton·홈 보호), 백엔드 변경 없음.
- 범위 밖: 역할별 권한·관리자 화면 = Epic 5 / 쿠키+미들웨어 전환 = deferred
- 재사용 자산: `lib/auth.ts`(get/clearToken) + 백엔드 `/api/auth/me`(둘 다 1.3에서 완비)
- **다음 할 일:** 🛠️ `bmad-dev-story`로 Story 1.4 개발

### 2026-06-20 — 🔍 Story 1.3 코드 리뷰 완료 → done!  ⏸️ (여기서 세션 정리 예정)
- 검사관 3종 병렬(보안 집중) ✅ — AC 1~7 PASS, 치명적 인증 취약점 없음(alg 고정·exp 검증·해시 미노출·인젝션 없음)
- patch 4건 즉시 수정: ①긴 비밀번호 안전처리(401) ②JWT sub=불변 id ③토큰 검증 예외 확대 ④프론트 access_token 방어
- defer 5건(멀티워커 시드, 토큰 localStorage→쿠키, 배포용 기본계정 차단, 타이밍 방어, 비밀키 길이검증) → `deferred-work.md`
- 재검증(로그인/토큰/잘못된토큰/build/lint) 통과 → **sprint-status: 1-3 = done**
- ▶▶ **다음 세션 시작점: Story 1.4 (로그인 보호 & 로그아웃)** → `bmad-create-story`로 시작
  - 1.4 준비물 이미 있음: 백엔드 `get_current_user`(security.py) + 프론트 `lib/auth.ts`(save/get/clear). 시드계정 nurse1/test1234.

### 2026-06-20 — 🛠️ Story 1.3 개발 완료! (직원 로그인) → review
- 🔐 백엔드 인증: `Staff` 테이블 + 시드(nurse1/test1234), `security.py`(bcrypt 해시·PyJWT 토큰·get_current_user), `POST /api/auth/login`·`GET /api/auth/me`
- 🖥️ 프론트 `/login` 화면: 폼(아이디/비번)·form-urlencoded 호출·성공시 토큰저장 후 홈 이동·실패시 "로그인 실패"
- 🧰 토큰 헬퍼 `lib/auth.ts`(save/get/clear) — 1.4 재사용
- ★ 막힌 점 & 해결: pwdlib `recommended()`가 argon2 요구 → bcrypt 명시 지정으로 해결
- 검증: 로그인 200·틀린비번 401·토큰 검증(/me) OK / 프론트 build·lint·로그인화면 렌더 OK
- 비밀번호 해시 저장·JWT 비밀키 `.env` 관리 ✅
- **다음 할 일:** 🔍 `bmad-code-review`(권장, 보안 민감) → 이후 Story 1.4(로그인 보호·로그아웃)

### 2026-06-20 — 📝 Story 1.3 작성 완료 (ready-for-dev)
- `bmad-create-story`로 **Story 1.3 (직원 로그인)** 작성 ✅
- 결과 파일: `_bmad-output/implementation-artifacts/1-3-직원-로그인.md`
- 인증 스택: **PyJWT(토큰) + pwdlib[bcrypt](비밀번호 암호화) + python-multipart(폼)** — FastAPI 공식 추천 최신 조합
- 범위: 로그인 화면 + `POST /api/auth/login`(토큰 발급) + Staff 테이블·시드계정(nurse1/test1234) + 성공시 홈 이동/실패시 안내
- 범위 밖(다음): 미로그인 페이지 차단·로그아웃 = Story 1.4 / 역할별 권한 = Epic 5
- **다음 할 일:** 🛠️ `bmad-dev-story`로 Story 1.3 개발

### 2026-06-20 — 🔍 Story 1.2 코드 리뷰 완료 → done!
- 검사관 3종 병렬 리뷰 ✅ — 합격 기준 AC 1~8 전부 PASS, 범위·스택 준수
- patch 6건 즉시 수정: ①설정 절대경로+필수화(비번 하드코딩 제거) ②CORS allow_credentials=False ③DB 다운 시 친절 안내 ④pool_pre_ping ⑤프론트 AbortController ⑥빈목록 처리
- defer 3건(멀티워커 시드 중복, 배포용 API주소 필수화, Alembic 마이그레이션)은 `deferred-work.md`
- 재빌드·린트·런타임(엔드포인트·CORS) 재검증 통과 → **sprint-status: 1-2 = done**
- **다음 할 일:** 🚀 Story 1.3 (직원 로그인) → `bmad-create-story`

### 2026-06-20 — 🛠️ Story 1.2 개발 완료! (백엔드↔DB 연결) → review
- ⚙️ 개발 환경 설치(winget): **Python 3.12.10 + PostgreSQL 17.10**, `hospital` DB 생성(슈퍼유저 postgres/postgres)
- 🐍 `backend/` 폴더에 **FastAPI** 앱 구축: FastAPI 0.138 + Uvicorn + SQLModel + psycopg(v3) + pydantic-settings
- 엔드포인트 3종: `/api/health` · `/api/db-check` · `/api/test-data` + 시작 시 테이블 생성·샘플 시드
- 🔗 프론트 연동: `BackendStatus` 컴포넌트가 백엔드 데이터를 홈에 표시 → **화면↔백엔드↔DB 한 줄 연결 완성!**
- 🔐 비밀정보는 `.env`로만(코드에 X), `.gitignore` 처리 / CORS로 프론트(3000) 허용
- 검증: 백엔드 3종 응답·`/docs`·CORS 헤더 OK / 프론트 build·lint 통과
- **다음 할 일:** 🔍 `bmad-code-review`(권장) → 이후 Story 1.3(직원 로그인)

### 2026-06-20 — 🛠️ Story 1.1 개발 완료! (첫 코드 탄생)
- `bmad-dev-story`로 **Story 1.1 (프로젝트 기본 세팅)** 실제 구현 ✅ (Status: review)
- 결과 폴더: `frontend/` (화면 코드 전부 여기 — 다음 스토리의 `backend/`와 분리)
- **설치된 것:** Next.js 16.2.9 + React 19.2.4 + Tailwind CSS v4 + shadcn/ui
- **적용된 것:** DESIGN.md 다크 토큰(`@theme`), 다크 모드 전용, Pretendard 글꼴(layout `<link>`), 홈 자리표시 화면(제목+버튼+상태색)
- **검증:** `npm run build`·`npm run lint` 통과 / dev 서버 200 응답 / 컴파일 CSS에 디자인 색 모두 포함 확인
- ★ 막힌 점 & 해결: Pretendard `@import`가 Tailwind 처리 중 밀려 무시되는 문제 → `<link>` 방식으로 전환
- ★ 인수인계: `frontend/AGENTS.md`에 "Next 16은 예전과 다름, `node_modules/next/dist/docs/` 먼저 읽어라" 경고 있음 / 디자인 토큰 단일 소스 = `frontend/src/app/globals.css`의 `@theme`
- **다음 할 일:** 🔍 (권장) `bmad-code-review`로 코드 리뷰 → 이상 없으면 Story 1.2(FastAPI 백엔드+PostgreSQL) 작성

### 2026-06-20 — 🔍 Story 1.1 코드 리뷰 완료 → done!
- 검사관 3종(Blind/Edge Case/Acceptance) 병렬 리뷰 ✅ — 합격 기준 AC 1~6 전부 충족
- patch 6건 즉시 수정: 글꼴 설정 빈칸(--font-mono), 작동 안 하던 여백 토큰 정리, 모서리 척도 정렬, **버튼 44px 접근성**, 글꼴 preconnect, 문서 표기(Radix→Base UI)
- defer 1건(색 정의 이중화)은 `deferred-work.md`에 기록 / 오탐 4건은 버림
- 재빌드·린트·런타임 재검증 통과 → **sprint-status: 1-1 = done**
- **다음 할 일:** 🚀 Story 1.2 (FastAPI 백엔드 + PostgreSQL 연결) → `bmad-create-story`

### 2026-06-20 — 📝 Story 1.2 작성 완료 (ready-for-dev) — ⚠️ 설치 선행조건 있음
- `bmad-create-story`로 **Story 1.2 (FastAPI 백엔드 + PostgreSQL 연결)** 작성 ✅
- 결과 파일: `_bmad-output/implementation-artifacts/1-2-fastapi-백엔드-postgresql-연결.md`
- 스택: FastAPI + Uvicorn + SQLModel + psycopg(v3) + pydantic-settings / `backend/` 폴더 분리
- 범위: 화면↔백엔드↔DB "한 줄 연결" 증명 + 테스트 데이터 표시 (로그인·실시간은 다음)
- ⛔ **개발 전 준비물(필수): Python 3.12+ 와 PostgreSQL 설치** — 점검 결과 현재 PC에 둘 다 미설치(파이썬은 Store 껍데기만)
- **다음 할 일:** 사용자가 Python·PostgreSQL 설치 → 그 후 `bmad-dev-story`로 개발

### 2026-06-20 — 첫 스토리 작성 완료 📝 (Story 1.1)
- `bmad-create-story`로 **Story 1.1 (프로젝트 기본 세팅)** 스토리 파일 작성 ✅
- 결과 파일: `_bmad-output/implementation-artifacts/1-1-프로젝트-기본-세팅.md`
- 설계도 4종(epics·architecture·DESIGN·PRD) 분석 + 최신 버전 웹 리서치 반영
- **핵심 내용:** Next.js(App Router)+Tailwind CSS v4+shadcn/ui 빈 프로젝트 + 다크모드, DESIGN.md 토큰을 `@theme`로 등록
- ★ 중요 포인트: Tailwind v4는 `tailwind.config.js` 대신 CSS `@theme` 사용 / 프론트는 `frontend/` 폴더로 분리(1.2 백엔드 대비) / 백엔드·DB·로그인은 범위 밖
- 상태 갱신: epic-1 → in-progress, 1-1 → ready-for-dev
- **다음 할 일:** 🛠️ `bmad-dev-story`로 Story 1.1 실제 개발(코딩) 시작

### 2026-06-20 — 스프린트 계획 완료 🗂️ (개발 진입!)
- 에픽 6 · 스토리 22를 "작업 순서표"로 변환 ✅
- 결과 파일: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- 전체 34개 항목(에픽 6 + 스토리 22 + 회고 6), 모두 `backlog`(대기) 상태로 시작
- ★ 점검에서 찾은 ①Supabase 표기 2곳을 PostgreSQL로 수정 완료(epics.md)
- (②PRD 관리자 기능 반영, ③관리자 화면 UX 보강은 Epic 5 직전에 처리하기로 보류)
- **다음 할 일:** 🚀 첫 스토리 개발! Story 1.1(프로젝트 기본 세팅)
  → `bmad-create-story`로 스토리 파일 작성 → `bmad-dev-story`로 개발

### 2026-06-20 — 구현 준비 점검 완료 ✅🔍
- 설계도 4종(PRD·UX·아키텍처·에픽/스토리)이 서로 맞는지 최종 점검 ✅
- 결과 파일: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-06-20.md`
- **판정: 🟡 가벼운 손질 후 개발 시작 권장** (기능 커버리지 100%, 치명적 결함 없음)
- **발견된 정리 거리 (Major 3건):**
  1. 🟠 epics.md에 옛 도구 "Supabase" 표기 2곳 잔재(line 87, 172) → PostgreSQL로 수정 필요
  2. 🟠 관리자 기능(FR11~14)이 PRD엔 "범위 밖"으로 남아 있음 → PRD 업데이트 권장
  3. 🟠 관리자 화면 UX 디자인 누락 → UX 보강 권장
- (Minor: 대기 초과 기준값 기본값 명시, EXPERIENCE.md "막대→타임라인" 문구 갱신)
- ★ CLAUDE.md에 "🗣️ 설명 규칙" 섹션 추가 (비개발자용 쉬운 설명 원칙 못박음)
- **다음 할 일:** 위 정리(특히 ①Supabase 수정) 후 → 스프린트 계획(`bmad-sprint-planning`)

### 2026-06-20 — 할 일 쪼개기(에픽/스토리) 완료 📋
- 14개 기능을 에픽 6개 · 스토리 22개로 쪼갬 ✅
- 결과 파일: `_bmad-output/planning-artifacts/epics.md`
- **에픽 구성:** ①앱 토대+로그인 ②환자 정보 보기 ③환자 안전 ④부서 협업·흐름 ⑤관리자 페이지 ⑥모바일 앱 패키징
- 관리자 기능(계정/권한/현황/기준값) 추가, Flutter 모바일 패키징 추가
- 최종 점검 통과 (모든 기능 빠짐없이 커버)
- **다음 할 일:** 🚀 개발 시작! Story 1.1(프로젝트 기본 세팅)부터

### 2026-06-20 — 기술 구조 설계 완료 🏗️
- "어떤 기술로 만들지" 도구 세트 결정 ✅
- 결과 파일: `_bmad-output/planning-artifacts/architecture.md`
- **확정된 기술 스택 (★2026-06-20 조교 피드백으로 변경됨):**
  - 프론트엔드(화면): Next.js + Tailwind CSS + shadcn/ui
  - 백엔드(뒷단): FastAPI (파이썬)
  - 데이터 저장: PostgreSQL
  - 모바일 앱: Flutter (WebView 방식으로 웹 화면을 감쌈)
  - ※ 처음엔 Supabase였으나 조교 지시로 FastAPI+PostgreSQL 백엔드 분리 + Flutter 모바일 추가
- **다음 할 일:** 에픽 & 스토리 작성 (`/bmad-create-epics-and-stories`) → 할 일 잘게 쪼개기

### 2026-06-20 — UX 디자인 완료 🎨
- 앱의 화면 모양과 사용 흐름 설계 완료 ✅
- 결과 폴더: `_bmad-output/planning-artifacts/ux-designs/ux-hospital-app-2026-06-20/`
- **확정 사항:**
  - 분위기: 차분한 다크 모드 (하늘색 포인트, 위험=빨강·주의=앰버)
  - 시작 화면: 홈 대시보드 우선
  - 핵심 화면 6개: 로그인 / 홈 / 환자 검색 / ⭐환자 통합 화면 / 알림 / 환자 흐름판
- **산출물:** DESIGN.md, EXPERIENCE.md, 환자 통합 화면 목업(mockups/patient-screen.html)
- **목업 개선:** 단계표시 막대→타임라인, 이모지→아웃라인 아이콘
- 노션 페이지에 전체 진행 과정 Q&A 정리(조교 피드백용)
- **다음 할 일:** 기술 구조 설계 (`/bmad-create-architecture`)

### 2026-06-20 — PRD 작성 완료 📋
- 제품 요구사항 문서(PRD) 초안 작성 및 최종 확정 ✅
- 결과 파일: `_bmad-output/planning-artifacts/prds/prd-hospital-app-2026-06-20/prd.md`
- **진행 방식:** 빠른 길(Fast path), 취미/연습 수준 (2~3장)
- **확정 사항:**
  - 사용 환경: 휴대폰 + 웹 둘 다 / 중간 규모 병원 / 모든 직원
  - 핵심 기능 10개를 4개 그룹으로 정리:
    - A. 환자 정보 통합(FR1~3) / B. 안전 알림(FR4~7) / C. 부서 간 인수인계(FR8) / D. 대기·여정 추적(FR9~10)
  - 권한은 1차 단순하게, 에스컬레이션은 다음 버전으로 미룸
- **다음 할 일:** UX 설계(`/bmad-ux`) 또는 기술 구조 설계(`/bmad-create-architecture`)

### 2026-06-20 — 브레인스토밍 완료 🧠
- 병원 앱 아이디어 발굴 세션 진행 완료 ✅
- 결과 파일: `_bmad-output/brainstorming/brainstorming-session-2026-06-20.md`
- **확정된 컨셉:** 흩어진 환자 정보를 한 화면에 모으고, 위험한 순간엔 먼저 알려주는 **병원 내부 직원용 통합 안전 앱**
- **핵심 기둥 3가지:**
  1. 🛡️ 환자 안전 알림 (위험 경고, 투약 시간, 빠진 절차)
  2. 🔄 부서 간 자동 인수인계
  3. ⏱️ 대기시간·여정 추적
- **다음 할 일:** PRD(제품 요구사항 문서) 작성 → `/bmad-prd`

### 2026-06-20 — 프로젝트 준비
- BMAD 설치 확인 완료 ✅
- 프로젝트용 `CLAUDE.md` 생성 (진행 일지 겸용) ✅

---

## 💡 메모 & 결정 사항

여기에 중요한 결정이나 기억해둘 내용을 자유롭게 적어요.

- (아직 없음)

---

## 📂 산출물 저장 위치 (참고)

BMAD가 만든 문서들은 아래 폴더에 자동 저장돼요.
- 기획 문서: `_bmad-output/planning-artifacts/`
- 개발 문서: `_bmad-output/implementation-artifacts/`
- 프로젝트 지식: `docs/`
