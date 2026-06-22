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
  - [x] **Epic 4: 부서 협업 + 환자 흐름 추적** ✅ 완료 (2026-06-21) — 단계타임라인·인계메모·환자흐름판·대기초과알림
  - [ ] **Epic 5: 관리자 페이지** ◀ 진행 중 (5.1 관리자 진입 ✅ done → 다음 5.2 직원 계정 관리)
  - [ ] Epic 6: 모바일 앱 패키징

---

## 📝 작업 기록 (최신순)

> 📒 **이전 기록(Epic 1~4 · 기획 단계)은 [`docs/작업기록-아카이브.md`](docs/작업기록-아카이브.md)에 보관.** 여기엔 진행 중인 **Epic 5** 기록만 둡니다. 오래된 기록은 주기적으로 아카이브로 옮기세요.

### 2026-06-22 — 🔍 Story 5.4 코드 리뷰 완료 → done! 📊 (전체 현황 대시보드, FR13)
- 검사관 3종 병렬(Blind·Edge·Acceptance) ✅ — **AC 1·3·4·5·6·7·8 PASS**(집계 정확성·관리자 게이트 403/401·빈/0값 안전·범위 준수 견고). 단 **AC2 한 건 위반**을 Acceptance Auditor가 지목
- **patch 1건 적용**: AC2 — 대시보드에 **"전체 직원 수" 카드 누락**(응답·`Dashboard` 타입엔 `staff_count` 있으나 StatCard 미표시) → `AdminDashboard.tsx`에 `전체 직원`(icon=badge) StatCard 추가 + 그리드 `lg:grid-cols-4`→`lg:grid-cols-5`(카드 5장 한 줄), 순서 AC2대로(전체 환자·전체 직원·오늘 방문·평균 대기·대기 초과). build·lint(0 오류)·`/admin/dashboard` 정적 PASS
- defer 2건 → `deferred-work.md`: ①naive datetime이 '오늘 방문' 경계·평균 대기/초과 판정에 load-bearing(앱 전반 기존 추적) ②수동 새로고침 `load()`에 abort/언마운트 가드 없음(React 19라 무해, 일관성 차원)
- dismiss 4건: busyRef 새로고침 no-op(로딩 중 버튼 disabled·Edge가 추적 후 철회)·StageEntry 전체 로드(스펙이 명시 허용)·공백/변형 current_stage 오분류(생성 코드경로 없음)·환자0명 빈 막대(AC8이 허용)
- 상태: **5-4 = done** → Epic 5는 **5.5(기준값 설정, FR14) 하나만** 남음(5.1·5.2·5.3·5.4 done)
- ▶▶ **다음: Story 5.5 (기준값 설정, FR14) = Epic 5 마지막** → `bmad-create-story`
  - 인계: `STAGE_OVERDUE_MINUTES`(하드코딩 상수)를 **DB 설정으로 이관** → 4.4(대기초과 판정)·5.4(대시보드 `overdue_threshold_minutes`)가 자동 반영. **멱등 시드 + `get_current_admin` 보호 PUT**. (예: `AppSetting` key/value 테이블 또는 단일 행 설정)

### 2026-06-22 — 🛠️ Story 5.4 개발 완료! (전체 현황 대시보드) → review 📊 (FR13)
- 🗄️ 백엔드(`main.py`): `func` import + **`admin_overview`를 `func.count()`로 교체**(5.1 deferred "전체 행 메모리 적재" 이행) + **`GET /api/admin/dashboard`**(get_current_admin 보호) — 전체 환자·직원 수(func.count), 오늘 방문 환자 수(func.count distinct), **단계별 혼잡도**(current_stage GROUP BY, STAGE_ORDER 전부+기타), 평균 대기·초과 인원(StageEntry+stage_wait_info), `overdue_threshold_minutes` 동봉
- 🖥️ 프론트: `AdminDashboard.tsx`(NEW: 요약 카드 4개 + **단계별 혼잡도 CSS 막대**, 차트 라이브러리 0, 새로고침·401/403) + `admin/dashboard/page.tsx`(NEW) + `AdminOverview`(전체현황 카드 활성화 + 권한설정 카드 정리=5.3 직원관리 통합 반영, COMING_SOON은 5.5만)
- ★ 핵심: "과별 혼잡도"=진행 단계 기준 / func.count 집계 / CSS 막대(의존성 0) / 읽기 전용(기준값=5.5) / 관리자 전용 백엔드 강제
- ✅ 검증: **백엔드 실호출 검증**(Supabase 연동 후 첫 케이스) — admin 대시보드 200(환자8·단계합8·평균61분·초과8)·nurse **403**·미인증 **401**·overview func.count 정상 / 프론트 build(/admin/dashboard 정적)·lint(0 오류) **전부 PASS**. (오늘 방문 0=시드 방문이 과거라 정상)
- 서버 재기동: 백엔드 8000(새 코드)·프론트 3000 다시 실행 중
- **다음 할 일:** 🔍 `bmad-code-review`(권장) → 통과 시 Story 5.5(기준값 설정, FR14) = Epic 5 마지막

### 2026-06-22 — 🟢 Supabase 연동 + 백엔드·프론트 실서버 기동 (실사용 환경 구성)
- 사용자 요청: "POSTGRESQL 말고 SUPABASE 쓰자" → 로컬 PostgreSQL 설치 대신 **Supabase(호스티드 Postgres, 도쿄 리전)** 사용. 백엔드 코드 변경 0(연결 주소만 교체)
- 이 환경엔 Python·PostgreSQL·.venv·node_modules가 모두 없었음 → **winget으로 Python 3.12.10 설치** + `backend/.venv` 생성 + `requirements.txt` 8종 설치 / 프론트 `npm install` 복구
- `backend/.env` 작성(gitignore됨): `DATABASE_URL`(Supabase **Session pooler, IPv4, aws-1-ap-northeast-1**) + 랜덤 `JWT_SECRET_KEY` + CORS
  - ★ 삽질: Direct(IPv6) 주소는 닿았다 끊겼다 불안정 → **Session pooler(IPv4)로 전환**해야 안정. 사용자명에 프로젝트ID 포함(`postgres.<ref>`), 호스트 prefix는 `aws-1`(aws-0 아님). 비번 특수문자 URL 인코딩
  - ★ 비번 혼선: 처음 `apsxkffj1!!D`(틀림)→재설정 시도→최종 `apsxkffj1!!`로 연결 성공
- 백엔드 8000·프론트 3000 기동 성공: `/api/health` ok, nurse1 로그인 토큰 발급, Supabase에 테이블 생성+시드 자동 완료. **이제 백엔드 런타임 검증 가능**(그동안 5.2·5.3은 코드검토만)
- 로그인 계정: nurse1/test1234(직원), admin1/admin1234(관리자). DB 비번 `apsxkffj1!!`(화면 로그인 아님)
- ERD 화면 개선 커밋(`56fd9b3`): `er.useMaxWidth=true`+`layoutDirection=LR`(세로 배치·너비 맞춤), AppShell `wide` 옵션. ★Mermaid ER은 연결선 곡선만 지원(직선 불가)
- ⚠️ 서버는 이 세션 백그라운드로 실행 중(창 닫으면 종료). `.env`는 git 미추적

### 2026-06-22 — 📝 Story 5.4 작성 완료 (ready-for-dev) — 전체 현황 대시보드 📊 (FR13)
- `bmad-create-story`로 **Story 5.4 (전체 현황 대시보드, FR13)** 작성 ✅
- 결과 파일: `_bmad-output/implementation-artifacts/5-4-전체-현황-대시보드.md`
- 범위: ①백엔드 — `GET /api/admin/dashboard`(get_current_admin 보호) = `func.count()` 집계로 전체 환자·직원·오늘 방문 수 + **단계별 혼잡도**(current_stage 분포) + 평균 대기시간·초과 인원(StageEntry+stage_wait_info 재사용) + `func` import + **admin_overview를 func.count로 교체**(5.1 deferred 이행) ②프론트 — `AdminDashboard.tsx`(통계 카드 + **CSS 막대그래프**, 차트 라이브러리 0) + `/admin/dashboard` 페이지 + AdminOverview "전체 현황" 카드 활성화(+권한설정 카드 정리)
- ★ 핵심 판단: **"과별 혼잡도"=진행 단계(접수/진료/검사/수납) 기준**(current_stage가 실시간 위치라 정확, Visit.department는 이력이라 모호 → 과별 세분화는 후속) / **집계는 func.count**(행 적재 금지) / **그래프=CSS 막대**(의존성 0) / **읽기 전용**(기준값 수정=5.5) / 관리자 전용 백엔드 강제
- ★ 범위 밖: 기준값 설정(5.5)·과(department) 세분화·차트 라이브러리·기간 필터·실시간 자동 갱신·추세
- ★ 5.5 인계: `STAGE_OVERDUE_MINUTES` 하드코딩을 DB 설정으로 옮기면 4.4·5.4가 자동 반영
- **다음 할 일:** 🛠️ `bmad-dev-story`로 Story 5.4 개발 (이제 백엔드 런타임 검증 실제 가능)

### 2026-06-22 — 🔍 Story 5.3 코드 리뷰 완료 → done! 🔐 (권한 설정)
- 검사관 3종 병렬(Blind·Edge·Acceptance, "우회 가능성" 집중) — **Acceptance Auditor AC 1~8 전부 PASS**(스펙 위반 0). Blind·Edge가 **투약 게이트 불완전 매개** 1건 공통 지목
- **patch 1건**(decision-needed → YC 결정 "지금 닫기"): 투약 영역 게이트를 **`/api/medication-alerts`·`/administer`까지 확장**. `get_patient`·투약 CRUD는 막혔으나 투약 제외 직원이 ①`/alerts`로 전 환자 약 이름·용량 열람(읽기 누출) ②administer로 완료 기록 가능했음 → `medication_alerts`는 권한 없으면 빈 목록(프론트 변경 0), `administer`엔 `require_section` 403 가드. 이제 상세·CRUD·알림·완료 **전부 일관 차단**
- defer 3건 → `deferred-work.md`: ①404→403 순서 medication id 존재 탐지(minor) ②프론트 visible_sections 미전송 fallback=전체(실데이터 누출 없음·표시만) ③BE `ACCESS_SECTIONS`/FE `SECTIONS` 정의 이중화(드리프트 위험)
- dismiss 7건: 진단·검사·수납 쓰기 미게이트(엔드포인트 없음)·empty/'all'→전체(의도 무회귀)·full→'all' 단순화·admin 강등 stale scope·403 메시지 하드코딩(투약 전용 컴포넌트)·admin scope 편집 무의미저장·scopeSummary fallback
- ⚠️ **백엔드 런타임은 환경(Python·PostgreSQL) 미설치로 전 과정 미검증** — 코드 정적 검토만. 스토리에 수동 검증 계획 첨부(서버 띄울 때 실행 권장)
- 상태: **5-3 = done**
- ▶▶ **다음: Story 5.4 (전체 현황 대시보드, FR13)** → `bmad-create-story`
  - 인계: 관리자용 통계(오늘 환자 수·과별 혼잡도·평균 대기시간). 5.1 `/api/admin/overview` 확장 또는 `/api/admin/dashboard`. `func.count()` 집계로(5.1 deferred "전체 행 메모리 적재" 정리 함께). `StageEntry`(4.4)·`STAGE_OVERDUE_MINUTES`로 대기 통계, `Visit.department`로 과별 혼잡도.

### 2026-06-22 — 🛠️ Story 5.3 개발 완료! (권한 설정) → review 🔐 (FR12)
- 🗄️ 백엔드(`models.py`·`main.py`): `Staff.access_scope` 컬럼(멱등 ADD COLUMN, 기본 'all'=무회귀) + 상수/헬퍼(`ACCESS_SECTIONS`·`ALL_SECTION_KEYS`·`normalize_scope`(무효키 422·5종→'all')·`allowed_sections`(관리자/‘all’→전체)·`require_section`(403)) + **`get_patient`가 허용 영역만 반환**(`visible_sections` 동봉, 안전·협업 정보는 항상 포함, lab_results·billings 키 보존) + **투약·방문 쓰기 403 게이트** + `staff_public`/`StaffCreateIn`/`StaffUpdateIn`/`create_staff`/`update_staff`에 access_scope
- 🖥️ 프론트: `StaffManagement`(접근범위 편집 — "전체 접근" 토글+5영역 체크박스, 일반직원 배지) + `PatientDetail`(`visible_sections` 분기 + `NoAccessCard` "권한 없음", 투약 범위밖이면 처방폼도 숨김) + `PrescribeForm`·`MedicationList`(**403=인라인 안내 / 401=로그아웃 분리** → 2-3 deferred 이행)
- ★ 핵심: 3축 분리(role·job_title·access_scope) / 백엔드가 진짜 자물쇠(응답 제외+쓰기 403) / 기본 'all' 무회귀 / 안전·협업 항상 표시 / 403≠401
- 검증: 프론트 **lint(0 오류)·build(/schema 등 정적, 타입체크) PASS**. ⚠️ **백엔드 런타임 검증은 환경(Python·PostgreSQL·.venv) 미설치로 미실행** — 코드 작성+정적 검토만. 스토리에 수동 검증 계획 6종 첨부(서버 띄울 때 실행 권장)
- **다음 할 일:** 🔍 `bmad-code-review`(권장, 권한/접근 민감) → 통과 시 Story 5.4(전체 현황 대시보드, FR13)

### 2026-06-22 — 📝 Story 5.3 작성 완료 (ready-for-dev) — 권한 설정 🔐 (FR12)
- `bmad-create-story`로 **Story 5.3 (권한 설정, FR12)** 작성 ✅
- 결과 파일: `_bmad-output/implementation-artifacts/5-3-권한-설정.md`
- ★ 핵심 설계 결정: FR12 "직원별 볼 수 있는 정보 범위"를 **"정보 영역(섹션) 단위 가시성"**으로 구현(행 단위 환자 필터 아님 — Patient에 담당 필드 없어 후속). 영역 5종=방문·진단·투약·검사·수납
- 범위: ①백엔드 — `Staff.access_scope` 컬럼(멱등 ADD COLUMN, 5.2 패턴 / 기본 'all'=무회귀) + 상수/헬퍼(`ACCESS_SECTIONS`·`normalize_scope`(422)·`allowed_sections`·`require_section`) + **`get_patient`가 허용 영역만 반환**(진짜 자물쇠, `visible_sections` 동봉) + **투약·방문 쓰기 403 게이트** + `staff_public`/`StaffCreateIn`/`StaffUpdateIn`에 access_scope ②프론트 — `StaffManagement` 범위 편집 UI("전체 접근"+개별 체크)·배지 + `PatientDetail` 범위 밖 카드→`NoAccessCard`("권한 없음")·범위 밖 폼 숨김
- ★ 3축 분리: role(접근 게이트)·job_title(분류)·**access_scope(정보 영역)** — 섞지 말 것 / 관리자는 scope 무관 전체 / 안전·협업(알레르기·체크리스트·인계메모)은 항상 표시(게이트 안 함) / **403≠401**(2-3 deferred "403→강제 로그아웃 재검토" 이행)
- ★ 범위 밖: 환자 행 필터·알림/흐름판/대시보드 게이팅·감사로그 / 현황 대시보드=5.4 / 기준값=5.5
- ⚠️ baseline_commit=0531e07이나 5.2 리뷰 패치+ERD가 아직 미커밋 상태(working tree) — 개발 전 커밋 권장
- **다음 할 일:** 🛠️ `bmad-dev-story`로 Story 5.3 개발

### 2026-06-22 — 🗺️ 사용자 요청 보완: DB 스키마 ERD 화면 추가 (까마귀발 표기법) — 정식 스토리 밖
- 계기: 사용자가 "사이드탭에 DB 스키마를 ERD 까마귀발 표기법으로 보이게" 요청
- 🖥️ 프론트(백엔드 변경 0): `components/SchemaErd.tsx`(NEW — Mermaid `erDiagram` 동적 import로 렌더, theme dark, `er.useMaxWidth:false`로 가로 스크롤) + `app/schema/page.tsx`(NEW — `<AuthGuard><AppShell>`, /schema 라우트, 정적 생성) + `AppShell.tsx`(NAV에 "스키마" 탭 추가, icon `schema`) + `package.json`(mermaid ^11 의존성 추가)
- ★ ERD 정의는 **`models.py`를 손으로 미러링**(런타임 DB introspection 아님 — 백엔드/마이그레이션 0). 13개 테이블·FK 관계 전부 반영. 모델 바뀌면 `SchemaErd.tsx` 정의도 같이 갱신 필요(컴포넌트 주석에 명시)
- ★ 비개발자 가독성: 테이블 제목 한글 별칭 `ENTITY["환자 (patient)"]` + 각 컬럼 한글 주석 + 관계선 한글 라벨. 특수문자(`/`·괄호)는 mermaid 주석 파싱 안전 위해 가운뎃점 `·`으로
- 검증: `npm install`로 node_modules 복구 후 **lint(0 오류)·build(/schema 정적) PASS** + mermaid `parse()`로 정의 유효성 직접 확인(jsdom --no-save 임시 사용, 정리 완료)
- ★ 미리보기: 백엔드 미설치(이 환경에 Python·PostgreSQL·.venv 없음 → 로그인 불가)라 `erd-preview.html`(루트, mermaid CDN, 서버/로그인 없이 열림)을 만들어 사용자가 직접 확인
- ⚠️ 이 환경 상태 메모: node_modules·.venv 모두 비어 있었음. 프론트는 `npm install`로 복구함. 백엔드 런타임 검증은 불가했음(5.2 패치도 코드 검토로만 확인)

### 2026-06-22 — 🔍 Story 5.2 코드 리뷰 완료 → done! 👥 (직원 계정 관리 + 보완작업)
- 대상: **5.2(직원 계정 관리)** + 끼어든 보완작업(**처방·인계메모 수정·삭제**). 한 커밋(`0531e07`)에 Epic 4·5.1까지 섞여 있어 **in-scope 9개 파일만 추려 diff**(검사관에게 "Epic 4·5.1은 이미 done, 지적 말 것" 범위 못박음)
- 검사관 3종 병렬(Blind·Edge·Acceptance) ✅ — **AC 1~8 전부 PASS, 치명적 결함 0**. 해시 미노출·관리자 게이트(403/401)·중복409·마지막관리자 보호·비번 빈값 유지·처방수정 시 알레르기 재검사·삭제 FK 보호 전부 코드로 확인
- **patch 1건 적용**(decision-needed → YC 결정 "자기 비활성화만 막기"): `update_staff`에 **자기-비활성화 차단 409**(마지막-관리자 체크보다 앞 → 관리자 수 무관하게 차단, delete_staff 자기삭제 차단과 동일 취지). 자기 '강등'은 Dev Notes #3 의도대로 허용 유지. 프론트 `StaffManagement`에 `/api/auth/me`로 본인 id 받아 자기 행 "활성" 토글 잠금(보조 UX)
  - ★ 발견 핵심: delete엔 자기-보호 가드가 있는데 update엔 없어, 관리자 2명↑일 때 자기 계정을 비활성화→자기 세션 즉시 잠김(self-lockout)
- defer 4건 → `deferred-work.md`: ①마지막-관리자 가드 TOCTOU 경쟁(동시성, 단일워커 무해) ②직원 입력 길이상한 없음 ③비번 bcrypt 72바이트·raw/strip ④인계메모 수정/삭제 권한·감사추적 없음(설계변경 중복 환기)
- dismiss 6건 기각: job_title enum 미강제(스펙 의도)·delete_medication 환자체크 생략(소유권 체크로 충분)·투약완료 FK(검증: RESTRICT→409 정상)·공백비번 무시(문서화)·get_current_admin 원시매칭(쓰기 전부 normalize)·PrescribeForm 수정모드 경고약 고정(검증: pending 재전송 정상)
- 검증: 프론트 `npm install` 복구 후 **lint(0 오류)·build(통과, /admin/staff 정적) PASS**. ⚠️ **백엔드는 이 세션에 Python·PostgreSQL 미설치로 런타임 테스트 불가** → 4줄 가드라 코드 검토로 정확성 확인(추후 admin1로 빠른 수동 확인 권장)
- 상태: **5-2 = done**
- ▶▶ **다음: Story 5.3 (권한 설정, FR12)** → `bmad-create-story`
  - 인계: 직원별 **정보 접근 범위**(어떤 환자/정보를 볼 수 있는가)를 `role`(admin/staff)·`job_title`(직군) 위에 더함. 2-3 deferred("403→강제 로그아웃 재검토")도 이때 처리(권한 밖 호출은 401 아닌 403). 직군을 권한 규칙 입력으로 쓸지 별도 권한 테이블 둘지 5.3에서 결정.

### 2026-06-21 — 🔧 사용자 요청 보완: 처방·인계메모 "수정·삭제" 추가 ✏️ (5.2 리뷰 대기 중 끼어든 작업)
- 계기: 사용자가 "처방·인계메모를 잘못 추가하면 못 고친다"고 지적 → 확인 결과 사실(추가만 있고 수정/삭제 통로가 없었음). 사용자 선택 = **"수정·삭제 둘 다 추가"**
- 🗄️ 백엔드(`main.py`): `PATCH·DELETE /api/patients/{id}/medications/{medId}` + `PATCH·DELETE /api/patients/{id}/handover-note/{noteId}` (전부 `get_current_user` 보호, 저장 후 `manager.broadcast`로 실시간 갱신)
  - **처방 수정 시 약 이름 바꾸면 알레르기/금기 재검사**(추가와 동일한 409 흐름 — 위험 약으로 고치려 하면 확인 전 저장 거부) / **처방 삭제는 투약완료 기록 있으면 409 보호**(FK IntegrityError→친절 안내) / 인계메모 수정은 빈값·길이상한 검증(작성과 동일), 내용만 바꾸고 from_stage·작성자·시각 보존
- 🖥️ 프론트: `MedicationList.tsx`(NEW: 투약 항목마다 수정/삭제 버튼, 삭제는 confirm+409 안내) + `PrescribeForm.tsx`(UPDATE: `editing` prop으로 **수정 모드 겸용** — 부모가 key로 리마운트해 입력칸 프리필, PATCH 전환, 알레르기 팝업 재사용) + `PatientDetail.tsx`(UPDATE: `editingMed` 상태로 둘 연결, 투약 타입에 id 추가) + `HandoverNoteSection.tsx`(UPDATE: 메모마다 인라인 수정 textarea + 삭제 confirm)
- ★ 핵심 판단: 처방 수정도 **안전검사 유지**(약 바꾸면 재검사) / 처방 삭제는 **이미 준 약 보호**(완료 기록 있으면 못 지움) / 처방 수정 UI는 PrescribeForm **재사용**(알레르기 경고 흐름 중복 0)
- ⚠️ **설계 변경 주의**: 인계메모는 4.2에서 **일부러 append-only(수정·삭제 금지, 감사 추적)**로 만들었던 것을 **사용자 요청으로 수정·삭제 허용으로 바꿈** → 누가 메모를 고치거나 지운 이력이 안 남음. `deferred-work.md`에 기록(운영 시 감사 로그/정정-기록 방식 재검토 권고)
- 검증: 백엔드 **18시나리오 전부 PASS**(처방 추가·수정·위험약 수정 409·확인 후 허용·빈약 422·없는약 404·미인증 401·삭제·FK보호 409 / 인계메모 수정·반영·빈값 422·없는메모 404·삭제·재삭제 404) + build·lint(오류 0). 테스트 잔여 데이터 정리 완료
- ★ 이건 정식 스토리 밖의 보완 작업(5.2는 여전히 review). 코드 리뷰 시 5.2와 함께 보거나 별도 정리 가능

### 2026-06-21 — 🛠️ Story 5.2 개발 완료! (직원 계정 관리) → review 👥
- 🗄️ 백엔드: `Staff.job_title` 컬럼 추가(**권한 role / 직군 job_title 분리** — 5.1 인계 핵심) + `lifespan`에 **멱등 `ALTER TABLE staff ADD COLUMN IF NOT EXISTS`**(첫 "기존 테이블 변경", create_all ALTER 한계 우회) + 시드 직군 백필(nurse1=간호사·admin1=원무과, 빈 값일 때만) + 상수/헬퍼(`VALID_ROLES`·`JOB_TITLES`·`normalize_role`=5.1 deferred 이행·`staff_public`=해시 미노출·`assert_not_last_admin`=self-lockout 방지) + `StaffCreateIn`/`StaffUpdateIn` + **`/api/admin/staff` GET·POST·PATCH·DELETE**(전부 `get_current_admin` 보호)
- 🖥️ 프론트: `StaffManagement.tsx`(NEW: 목록+권한/직군 배지·등록/수정 폼(권한·직군 select, 비번 "비워두면 변경 안 함")·삭제 confirm·인라인 오류는 **백엔드 detail 그대로 표시**·busyRef 이중제출 방지·401/403→로그아웃) + `admin/staff/page.tsx`(NEW: `<AdminGuard><AppShell>`, RSC 프리렌더 금지) + `AdminOverview.tsx`(UPDATE: 직원관리 카드를 활성 링크 `/admin/staff`로, 나머지 3개 준비 중 유지)
- ★ 핵심 판단: **권한(admin/staff)·직군(의사/간호사/원무과/기타) 분리**(role에 직군 섞으면 게이트 붕괴) / **멱등 DDL로 기존 테이블 변경**(Alembic은 계속 deferred=데모 규모) / **마지막 관리자 보호 3종**(강등·삭제·비활성화 시 활성 admin ≤1이면 409) + **자기 삭제 금지**(서버 강제, 프론트 보조) / **role 정규화**(`strip().lower()`, 메뉴·게이트 일치) / **비번 빈값이면 유지**(빈 해시 덮어쓰기 방지) / **삭제 FK IntegrityError→409 친절 안내**(비활성화 경로) / **해시 절대 미노출**(`staff_public` 단일 직렬화)
- ★ 막힌 점: 작업 디렉터리 헷갈림→절대경로 / lint `set-state-in-effect`→effect를 async 콜백 래핑(2.4/4.3 패턴) / 콘솔 한글 깨짐→UTF-8 urllib 스크립트로 JSON 값 확인
- 검증: 백엔드 **25시나리오 전부 PASS**(보호403/401·등록·정규화·중복409·입력422·수정·비번정책·마지막관리자 409 3종·자기삭제409·FK보호409·기록없는삭제·회귀) + 8002 재시작 멱등(오류 0·직원 2명) + build(/admin/staff 정적)·lint(오류 0) **PASS**. 시드 admin1/admin1234·nurse1/test1234
- **다음 할 일:** 🔍 `bmad-code-review`(권장, 권한/계정 민감) → 통과 시 Story 5.3(권한 설정, FR12)

### 2026-06-21 — 📝 Story 5.2 작성 완료 (ready-for-dev) — 직원 계정 관리 👥 (FR11)
- `bmad-create-story`로 **Story 5.2 (직원 계정 관리, FR11)** 작성 ✅
- 결과 파일: `_bmad-output/implementation-artifacts/5-2-직원-계정-관리.md`
- 범위: `/admin` 위에 **직원 CRUD** — ①백엔드 — `Staff.job_title` 컬럼 추가(**멱등 `ADD COLUMN IF NOT EXISTS`** = 첫 "기존 테이블 변경", create_all ALTER 한계 우회) + 상수/헬퍼(`VALID_ROLES`·`JOB_TITLES`·`normalize_role`·`staff_public`(해시 미노출)·`assert_not_last_admin`) + `StaffCreateIn`/`StaffUpdateIn` + `/api/admin/staff` **GET·POST·PATCH·DELETE**(전부 `get_current_admin` 보호) ②프론트 — `/admin/staff` 라우트 + `StaffManagement.tsx`(NEW: 목록·등록·수정·삭제·확인창·인라인오류) + `AdminOverview` 첫 카드를 활성 링크로
- ★ 핵심 판단: **권한(role: admin/staff)과 직군(job_title: 의사/간호사/원무과/기타) 분리**(5.1 인계 핵심 — role에 직군 섞으면 게이트 붕괴) / **마지막 관리자 보호**(강등·삭제·비활성화 시 활성 admin ≤1이면 409 = self-lockout 방지) + **자기 삭제 금지** / **role 정규화**(`strip().lower()`+admin/staff만 = 5.1 deferred 이행, 메뉴·게이트 일치) / **비번 빈값이면 유지**(빈 해시 덮어쓰기 금지) / **삭제는 하드+FK IntegrityError→409 친절 안내**(비활성화 경로, `is_active`가 토큰 거부=soft delete) / 해시 절대 미노출(`staff_public` 단일 직렬화)
- ★ 첫 기존 테이블 스키마 변경 — 그동안(3.2~4.4) 새 테이블 우회와 갈라짐(직군은 Staff 1:1 속성). **Alembic은 계속 deferred**(데모 규모, 멱등 DDL 1줄로 처리)
- ★ 범위 밖: 정보 접근 범위 권한=5.3(FR12, 직군은 분류만·화면 제한 X) / 현황 대시보드=5.4 / 기준값=5.5 / 접근 감사로그·비번정책·셀프수정
- **다음 할 일:** 🛠️ `bmad-dev-story`로 Story 5.2 개발

### 2026-06-21 — 🔍 Story 5.1 코드 리뷰 완료 → done! 🔑 (관리자 역할 & 전용 진입)
- ★ 상황: 이전 리뷰 세션이 **findings 기록 후 패치 적용·상태 갱신 전에 중단**(스토리에 patch 2건 `[ ]` 미적용 + sprint-status 여전히 review)된 것을 발견 → **처음부터 독립 재검증** 후 마무리
- 검사관 3종 병렬(Blind Hunter·Edge Case Hunter·Acceptance Auditor) ✅ — **AC 1·2·3·5·6·7 PASS, 범위 침범 0건, 보안 자물쇠(백엔드 get_current_admin 403) 견고**. **셋 다 같은 단일 버그(AC4) 지목**
- **patch 2건 즉시 적용**(둘 다 `AppShell.tsx`): ①**AC4 결함** — 폰 하단 탭바가 `NAV.map`(상수)을 써서 **모바일에서 관리자 메뉴 안 보임**(사이드 메뉴 `nav.map`은 정상) → `nav.map`으로 수정(line 118). 휴대폰이 주요 대상이라 합격기준 위반이었음 ②**role fetch에 AbortController+타임아웃 누락**(AuthGuard/AdminGuard는 보유) → `ME_TIMEOUT_MS=8000`+AbortController+finally clearTimeout 추가(패턴 일치)
- 재검증: `npm run build`(타입체크·`/admin` 정적 생성)·`npm run lint`(오류 0, 폰트 경고 3건 기존) **PASS**
- defer 4건 → `deferred-work.md`: ①**하드코딩 관리자 비번 `admin1234`**(배포 전 dev플래그 차단 필요, 관리자라 영향 범위↑) ②**role 자유문자열 정확매칭**(5.2 역할편집 때 normalize/enum) ③**admin1 시드 멀티워커 IntegrityError**(기존 seed race 계열) ④**(재검토 신규) `/api/admin/overview`가 전체 행 메모리 적재**(`len(select().all())` → `func.count()`로 정리, 데모 무해)
- dismiss 7건 기각: 세션 중 권한변경 시에도 백엔드 403 차단 / AdminGuard 일시오류 시 /login(AuthGuard 동일 의도) / 중복 /me 호출(무해) / response_model 없음(dict 리터럴 반환=노출 없음) / status 미리셋(router 안정) 등
- 상태: **5-1 = done**
- ▶▶ **다음: Story 5.2 (직원 계정 관리, FR11)** → `bmad-create-story`
  - 인계: `/admin` 아래 직원 CRUD(등록/수정/삭제+직군) + `get_current_admin` 보호 `/api/admin/staff` 엔드포인트군. **권한(role: admin/staff)과 직군(의사/간호사/원무과)을 섞지 말고 분리**(job_title 별도 컬럼) 결정 필요. 역할 편집 도입 시 위 defer②(role normalize)도 함께 처리. `hash_password` 재사용.

### 2026-06-21 — 🛠️ Story 5.1 개발 완료! (관리자 역할 & 전용 진입) → review 🔑
- 🗄️ 백엔드: `security.py`에 **`get_current_admin`**(get_current_user 의존, `role != "admin"`이면 **403** — 진짜 자물쇠) + `main.py`에 **멱등 admin1 시드**(username 존재 확인 후 없으면 생성, role=admin·admin1234 — 기존 "비었을 때만 nurse1" 분기와 별개 블록) + **`GET /api/admin/overview`**(get_current_admin 보호, 직원·환자 수 요약) + import. `Staff.role` 기존 재사용(모델 변경 0, 마이그레이션 0)
- 🖥️ 프론트: `AdminGuard.tsx`(NEW: AuthGuard 본떠 토큰+/me 검증 + role==admin, 일반직원→`/` 차단, 무효토큰→clearToken+/login, 확인중 본문숨김) + `AdminOverview.tsx`(NEW: /api/admin/overview 호출→직원·환자수 카드 + 준비중 카드 4개=5.2~5.5 비활성) + `admin/page.tsx`(NEW: AdminGuard+AppShell, 서버컴포넌트는 껍데기=RSC 프리렌더 금지 1.4) + `AppShell.tsx`(UPDATE: /me로 role 읽어 admin이면 NAV에 "관리자" 메뉴 추가, 상수 NAV 보존, 실패시 숨김)
- ★ 핵심 판단: **백엔드 게이트가 진짜 보안(403)**, 프론트 메뉴/가드는 UX 보조(3.1 철학) / **Staff.role 재사용**(admin/staff 2단계) / **멱등 시드**(재시작 staff_count=2 유지) / **role은 서버 /me에서**(localStorage 저장 X=스푸핑/스테일 회피) / AuthGuard 미수정(회귀 방지)
- ★ 막힌 점: `python` Store 껍데기 → `.venv` 파이썬
- 검증: 백엔드 RBAC 5시나리오(admin /admin/overview 200·nurse 403·미인증 401·회귀 nurse /patients 200·멱등 재시작 staff_count=2) + build·lint(오류 0) **전부 PASS**. 시드 admin1/admin1234
- **다음 할 일:** 🔍 `bmad-code-review`(권장, 권한/보안 민감) → 통과 시 Story 5.2(직원 계정 관리)

### 2026-06-21 — 📝 Story 5.1 작성 완료 (ready-for-dev) — 관리자 역할 & 전용 진입 🔑 (Epic 5 진입)
- `bmad-create-story`로 **Story 5.1 (관리자 역할 & 전용 진입, NFR2)** 작성 ✅ → epic-5 = in-progress
- 결과 파일: `_bmad-output/implementation-artifacts/5-1-관리자-역할-전용-진입.md`
- 범위: **첫 RBAC(역할 기반 접근제어) 도입 — 관리자 영역 "껍데기"만** ①백엔드 — `get_current_admin`(security.py, role!=admin이면 403) + `admin1` 멱등 시드(role=admin) + `GET /api/admin/overview`(관리자 보호, 직원·환자 수 요약) ②프론트 — `AdminGuard.tsx`(NEW: AuthGuard 본떠 role==admin 체크, 일반직원→홈 차단) + `/admin` 라우트·랜딩(준비중 자리표시 카드 5.2~5.5) + `AppShell` 관리자 메뉴 조건부(admin만)
- ★ 핵심 판단: **진짜 자물쇠는 백엔드 `get_current_admin`(403)** — 프론트 메뉴 숨김·AdminGuard는 UX 보조(3.1 철학) / **`Staff.role` 기존 사용**(모델 변경 0, admin/staff 2단계만) / **관리자 시드는 username 멱등 블록**(테이블 비었을 때만 분기 안 탐 — 이미 nurse1 존재) / **role은 `/api/auth/me`에서 읽음**(이미 반환, localStorage 저장 안 함=스푸핑/스테일 회피) / RSC 프리렌더 금지(1.4)
- ★ 범위 밖: 직원 CRUD·직군(5.2) / 정보범위 권한 세분화(5.3) / 현황 대시보드 통계(5.4) / 기준값 설정(5.5) / 접근 감사로그 / 일반 직원 화면 제한(지금은 전 직원 모든 환자기능 유지)
- ★ 5.2 인계: 직군(의사/간호사/원무과)을 `role`에 섞으면 권한(admin/staff)과 혼란 → 5.2에서 권한 role과 직군 job_title 분리 결정 필요
- **다음 할 일:** 🛠️ `bmad-dev-story`로 Story 5.1 개발

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
