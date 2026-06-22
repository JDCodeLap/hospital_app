# Deferred Work (나중에 처리할 항목)

## Deferred from: code review of story 1-1-프로젝트-기본-세팅 (2026-06-20)

- 색 정의 이중화: DESIGN 토큰(`--color-bg-base`, `--color-accent-primary` 등)과 shadcn 의미색(`--primary`, `--ring`, `--destructive` 등)이 같은 hex 값을 각각 따로 들고 있어, 팔레트 변경 시 여러 곳을 고쳐야 하고 값이 어긋날 위험이 있음. 단일 출처(예: shadcn 변수를 `--color-*` 토큰으로 매핑)로 리팩터 권장. 현재 동작에는 문제 없음. (frontend/src/app/globals.css)

## Deferred from: code review of story 1-2-fastapi-백엔드-postgresql-연결 (2026-06-20)

- 시드(seed) 멀티워커 중복: `lifespan`의 "비어있으면 시드" 로직은 `uvicorn --workers N`/gunicorn 멀티프로세스 동시 시작 시 각 워커가 동시에 비어있다고 판단해 최대 3×N행 중복 삽입 가능. `TestItem.name`에 유니크 제약 없음. 단일워커 개발에선 무해. 멀티워커 배포 전 유니크 제약 또는 `INSERT ... ON CONFLICT DO NOTHING`, 또는 시드를 별도 1회성 스크립트로 분리. (backend/app/main.py, models.py)
- 프론트 API 주소 폴백: `NEXT_PUBLIC_API_BASE_URL`는 빌드 시점에 박히는데 미설정 시 `http://localhost:8000`로 조용히 폴백 → 운영 배포에서 사용자에게 항상 연결 실패로 보일 수 있음. 비로컬 배포 시 이 값 필수화(폴백 제거 또는 경고). (frontend/src/components/BackendStatus.tsx)
- DB 마이그레이션: 현재 `SQLModel.metadata.create_all`은 없는 테이블만 생성하고 기존 테이블 변경(ALTER)은 못 함. 스키마가 커지기 시작하는 Story 2.1(환자 스키마) 전후로 Alembic 도입 검토. (backend/app/database.py)

## Deferred from: code review of story 1-3-직원-로그인 (2026-06-20)

- 시드 멀티워커 동시성: `lifespan`에서 Staff 시드 시 멀티워커 동시 시작이면 `username` unique 충돌로 IntegrityError(부팅 크래시 가능), TestItem은 중복 삽입. 단일워커 개발에선 무해. `try/except IntegrityError: rollback` 또는 `ON CONFLICT DO NOTHING`/advisory lock. (backend/app/main.py)
- 토큰 보관 방식: 현재 access token을 localStorage에 저장 → XSS 시 8시간(TTL) 동안 탈취 가능. 운영 단계에서 httpOnly+Secure+SameSite 쿠키 전환(이 경우 CORS allow_credentials=True + 출처 화이트리스트) 또는 TTL 단축 + 강한 CSP. (frontend/src/lib/auth.ts, backend)
- 시드 기본 계정: `nurse1/test1234`는 로컬 개발 편의용. 비로컬(스테이징/운영) 배포 시 공개된 약한 자격증명이 되므로 dev 전용 플래그로 시드 차단 또는 최초 시드 시 랜덤 비번/강제 변경. (backend/app/main.py)
- 로그인 타이밍 사용자 열거: 존재하지 않는 username은 `verify_password`를 건너뛰어 응답이 더 빠름 → 계정 존재 여부가 시간으로 노출. 없는 계정에도 더미 bcrypt 검증을 돌려 시간 평준화. (backend/app/main.py)
- JWT 비밀키 강도 검증: `jwt_secret_key`가 너무 짧으면 HS256 토큰이 오프라인 무차별 대입에 취약. 시작 시 최소 길이(≥32바이트) 검증 추가. (현재 키는 token_hex(32)=64자로 충분, 향후 안전장치) (backend/app/config.py)

## Deferred from: code review of story 1-4-로그인-보호-로그아웃 (2026-06-20)

- ⚠️ **(Epic 2 진입 전 필독) RSC payload에 보호 본문이 직렬화됨**: 현재 `AuthGuard`(클라이언트 컴포넌트)가 Server Component로 받은 children을 감싸므로, 보호 화면의 정적 뼈대(UI 텍스트)가 페이지 소스의 React 서버 렌더 payload에 같이 실린다. 화면에는 "확인 중…"만 보여 **시각적 누출은 없고**, 1.4 홈은 민감 데이터가 없어 무해. 그러나 **Epic 2 환자 화면에서 환자 데이터를 Server Component로 미리 렌더하면 미인증 사용자에게 PHI가 페이지 소스로 노출될 수 있음.** 규칙: 환자 데이터는 통과(authed) 후 클라이언트에서 토큰 달아 호출(BackendStatus 패턴)하고 Server Component 프리렌더 금지. (런타임 검증에서 발견) (frontend/src/components/AuthGuard.tsx, app/page.tsx)
- 크로스탭 로그아웃 미동기화: 앱을 두 탭에 열어두고 한 탭에서 로그아웃해도 다른 탭은 보호 화면을 계속 표시(마운트 시 1회만 검증). 공유 병원 단말에서 PHI가 남을 수 있음. `window.addEventListener("storage", ...)`로 `hospital_token` 삭제 감지 시 다른 탭도 /login으로 보내기 검토. (frontend/src/components/AuthGuard.tsx, LogoutButton.tsx)
- 세션 중 토큰 만료 재검증 없음: `AuthGuard`는 마운트 시 한 번만 `/api/auth/me`를 확인. 장시간 열어둔 화면에서 토큰이 만료돼도 그 화면 자체는 재검증/리다이렉트하지 않음(이후 API 호출은 401). 주기적 재검증 또는 전역 401 인터셉터 검토. (frontend/src/components/AuthGuard.tsx)
- 서버측 로그아웃/토큰 무효화 없음(soft logout): 로그아웃은 localStorage 토큰만 삭제. stateless JWT라 탈취된 토큰은 만료까지 유효. 필요 시 서버 revocation(블랙리스트) 또는 짧은 TTL + refresh. (frontend/src/components/LogoutButton.tsx, backend)
- API_BASE HTTPS 미강제: `lib/api.ts`가 미설정 시 `http://localhost:8000`로 폴백하고 https 강제가 없음. 비로컬 배포에서 `http://`면 Bearer 토큰이 평문 전송될 수 있음. 기존 1-2 deferred "프론트 API 주소 필수화"와 함께 비로컬 배포 시 https 강제/필수화. (frontend/src/lib/api.ts)
- 클라이언트 전용 가드의 한계: `AuthGuard`는 화면 노출을 막는 보조 수단일 뿐, JS 우회 시 보호되지 않음. 현재 실제 자물쇠는 백엔드 `get_current_user`(검증됨)이며, 정식 보호 경계는 1.3 deferred(localStorage→httpOnly 쿠키)와 함께 미들웨어 기반으로 업그레이드 시 확보. (frontend/src/components/AuthGuard.tsx, backend/app/security.py)

## Deferred from: code review of story 2-1-환자-데이터-구조-샘플-데이터 (2026-06-20)

- 멀티워커 시드 경합: `seed_patients`/Staff/TestItem 시드 모두 "비어있으면 삽입" 패턴이라 `uvicorn --workers N` 동시 시작 시 등록번호/username unique 충돌(IntegrityError) 가능. lifespan은 `OperationalError`만 잡아 **부팅 크래시**로 이어질 수 있음. 단일워커 개발에선 무해. 멀티워커 배포 전 `try/except IntegrityError: rollback` 또는 `pg_advisory_xact_lock`/`ON CONFLICT DO NOTHING`, 또는 시드를 별도 1회성 스크립트로 분리. (backend/app/main.py) — 1-2/1-3 동일 항목과 함께 일괄 처리 권장
- 직군별 권한 분기 + PHI 접근 감사로그: 현재 `/api/patients`·`/{id}`는 로그인만 확인(인증)하고 권한(인가) 분기가 없어 **로그인한 직원이면 모든 환자 열람**. 이는 1차 설계(NFR2: 단순 접근). 역할(의사/간호사/관리자)별 접근 범위·환자 접근 감사로그(누가 어떤 환자를 봤는지)는 **Epic 5(권한 설정)**에서 구현. 그 전까지 순차 id 열거(IDOR)는 권한 경계가 없어 추가 위험은 아님. (backend/app/main.py)
- `GET /api/patients` 페이지네이션 없음: 전체 환자를 한 번에 반환. 환자 수가 커지면 응답 비대·전체 명단 노출. 2.2(검색) 도입 시 `q`/`limit`/`offset` 추가로 함께 정리. (backend/app/main.py)
- 코드값 표준화: `gender`(기본 "기타" vs 시드 "M"/"F")·`flag`·`status`·`current_stage`가 자유 문자열이고 어휘가 섞임. 화면 표시 일관성을 위해 enum/표준 코드값 정리 검토. (backend/app/models.py)
- `LabResult.value` 자유문자열(미검증): 결과값이 문자열이라 수치 비교 불가. Epic 3 안전경고(FR4)나 이상치 판정이 `value`를 수치 파싱하려면 flag/value 정합성·단위 표준이 필요. (backend/app/models.py)

## Deferred from: code review of story 2-2-환자-검색 (2026-06-20)

- 페이지네이션/전체목록 PHI량: `GET /api/patients`는 q가 없으면 전체 환자를 무제한 반환(allergies 포함). allergies를 요약에 넣은 것은 카드 알레르기 배지용 스펙 결정이라 의도된 것. 페이지네이션(`limit`/`offset`)은 2-1 deferred에도 동일 항목이 있으며, 환자 수가 커지면 함께 정리. (backend/app/main.py)
- 검색어 길이 상한 없음: 검색 input에 `maxLength`가 없어 초장문 입력 시 URL 길이 초과(414/400) → 일반 "연결 실패" 메시지로 오안내될 수 있음. 영향 매우 낮음(현실적 입력 아님). 필요 시 `<input maxLength={…}>` + 백엔드 길이 검증. (frontend/src/components/PatientSearch.tsx)

## Deferred from: code review of story 2-3-환자-통합-화면 (2026-06-20)

- 403→강제 로그아웃 재검토(RBAC): PatientDetail(및 2.2 PatientSearch·AuthGuard)은 401/403을 동일 처리(토큰 삭제+로그인). 403은 "인증됐으나 권한 없음"이라, **Epic 5에서 역할별 권한(인가)을 도입하면** 정당한 권한거부(예: 다른 부서 환자 접근 차단)가 강제 재로그인으로 오인될 수 있음. 현재는 RBAC가 없어 403이 발생하지 않으므로 무해. Epic 5에서 401(재로그인)과 403(권한 안내)을 분리. (frontend/src/components/PatientDetail.tsx, PatientSearch.tsx, AuthGuard.tsx)
- 오류 문구의 인프라 주소 노출: PatientDetail·PatientSearch의 연결 실패 안내가 `http://localhost:8000`을 그대로 표기. PHI는 아니나 배포 시 백엔드 호스트가 사용자에게 노출됨. 1-2/1-4 deferred(API base 필수화·HTTPS 강제)와 함께 비로컬 배포 전 일반 메시지로 정리. (frontend/src/components/PatientDetail.tsx, PatientSearch.tsx)
- 거대 id int4 오버플로 500: `/patients/<20자리 숫자>` 직접 접속 시 Postgres int4 범위 초과로 백엔드 500(프론트는 error 상태로 표시). 현실적 입력 아님(낮음). 필요 시 백엔드 id 범위 검증 또는 프론트 자릿수 제한. (backend/app/main.py get_patient)

## Deferred from: code review of story 2-4-입력-즉시-반영 (2026-06-20)

- WS 토큰 쿼리 노출(로그 유출): WebSocket 인증 토큰(JWT)을 `ws://.../ws/patients/{id}?token=...` 쿼리로 전달 → Uvicorn/프록시 액세스 로그·브라우저 히스토리에 평문으로 남아 만료 전까지 재사용 가능. 브라우저 WebSocket이 Authorization 헤더를 못 붙이는 한계 때문. 운영 단계에서 **단명(수십 초) WS 전용 티켓** 발급 후 교환, 또는 서브프로토콜 기반 인증 검토. (backend/app/main.py patient_ws, frontend/src/components/PatientDetail.tsx)
- async 엔드포인트의 동기 DB(이벤트 루프 블로킹): `add_visit`(async)와 WS 연결 시 토큰검증이 동기 SQLModel Session을 이벤트 루프에서 직접 호출 → 부하 시 모든 WebSocket 송수신이 정체될 수 있음. `def`+threadpool로 돌리거나 async DB 드라이버 도입. 단일 사용자/소규모 데모에선 무해. (backend/app/main.py)
- WS Origin 미검증(CSWSH 방어심층): HTTP는 CORS로 출처를 제한하지만 WebSocket 엔드포인트는 Origin 검증이 없음. 현재 쿠키 기반이 아니라 토큰을 쿼리로 받으므로 교차 사이트 페이지가 토큰 없이는 악용 불가(실제 위험 낮음). 운영 시 WS에도 Origin 화이트리스트 추가로 일관성 확보. (backend/app/main.py patient_ws)
- broadcast half-open 소켓 지연: `ConnectionManager.broadcast`가 구독자에게 순차 `await send_json` → 응답 없는(half-open, 노트북 절전 등) 소켓 하나가 OS TCP 타임아웃까지 전체 방송을 지연시킬 수 있음. send 타임아웃 또는 `asyncio.gather`로 병렬 팬아웃 검토. (backend/app/realtime.py)

## Deferred from: code review of story 3-1-알레르기-금기-경고 (2026-06-20)

- 위험 처방 오버라이드 감사로그 없음: 직원이 알레르기 경고(409)를 보고도 `acknowledged=true`로 처방하면, 누가/언제/어떤 충돌을 무시했는지 기록이 전혀 남지 않음(`Medication`에 acknowledged/처방자/타임스탬프 필드 없음). 환자 안전상 가치 있으나 권한·감사는 Epic 5 범위. `Medication`에 override 표시 컬럼 + 감사 테이블/로그 검토. (backend/app/main.py add_medication, models.py Medication)
- 금기 판정 커버리지 한계: `check_contraindications`는 한국어 알레르기명 직접 부분일치 + 작은 계열 매핑(`CONTRAINDICATION_MAP`)까지만. 영문/상품명 약(Amoxicillin·Augmentin), NSAID·세팔로스포린 교차반응, 조영제 상품명(옴니파크·이오헥솔), 맵에 없는 알레르기 표기(예: 페니실린계·요오드)는 못 잡음 → 위험 처방이 경고 없이 통과 가능. 실제 약품 DB/DDI(약물상호작용) 엔진 도입이 필요하며 스토리에서 명시적으로 범위 밖으로 둔 사안. 운영 도입 시 표준 약품 코드(예: ATC) + 외부 상호작용 DB 연동 검토. (backend/app/safety.py)
- async 엔드포인트의 동기 DB(이벤트 루프 블로킹): `add_medication`(및 2.4 `add_visit`/WS 인증)이 `async def`에서 동기 `Session` 사용 → 부하 시 이벤트 루프(모든 WS 포함) 정체. 2.4 코드리뷰의 동일 defer와 함께 처리. `def`+threadpool 또는 async 드라이버. (backend/app/main.py)
- 쓰기 엔드포인트 멱등성 없음: 동시/중복 요청(프론트 더블클릭 패치 후에도 두 클라이언트면) 시 동일 처방이 두 번 저장 가능. visits 포함 쓰기 전반 사안. 멱등성 키 또는 중복 방지 제약 검토. (backend/app/main.py)

## Deferred from: code review of story 3-2-안전-경고-배너-유지 (2026-06-20)

- 확인(SafetyAck)이 알레르기 '내용'에 안 묶임 — ack가 `patient_id` 단위(환자당 1건)라, 환자의 `allergies`가 나중에 변경되면(새 알레르기 추가 등) 기존 ack가 그대로 유효해서 새 위험이 빨간 경고(행동 요구)가 아닌 차분한 '확인됨' 배너로 다운그레이드된다 → 아무도 검토 안 한 새 위험을 '확인됨'으로 표시하는 안전 갭. 현재 앱에 알레르기 편집 기능이 없어 트리거되지 않으며, 스토리에서 '확인 해제/만료/재확인'을 범위 밖으로 둔 사안. 알레르기 편집 기능(환자 정보 수정) 도입 시 SafetyAck에 알레르기 내용 스냅샷/해시(버전)를 함께 저장하고, 내용이 바뀌면 ack를 무효화(재무장)하도록 설계. (backend/app/models.py SafetyAck, main.py acknowledge_safety/get_patient)
- `datetime.now()` 타임존 naive — `acknowledge_safety`의 `acknowledged_at = datetime.now()`(및 `add_visit`/`add_medication`의 `visited_at`/시각)가 타임존 없는 로컬 시간이라 `.isoformat()`에 offset이 없음 → 프론트 `new Date(iso)`가 브라우저 로컬로 해석해, 서버와 클라이언트 타임존이 다르면 표시 시각이 어긋남. `security.py`는 이미 `datetime.now(timezone.utc)` 사용. 단일 로컬 데모에선 무해. 배포 전 앱 전반의 시각 저장을 UTC(aware)로 통일하고 프론트에서 로컬 변환. (backend/app/main.py 전반)

## Deferred from: code review of story 3-3-투약-시간-알림 (2026-06-20)

- 자정 넘어가면 놓친(미투약) 약이 알림에서 사라짐 — `medication_alerts`가 "오늘 분"(`t <= current_hm` + `administered_date == today`)만 due로 계산하므로, 20:00 예정 약을 주지 않고 자정이 지나면 그 슬롯이 다음 날 20:00까지 알림 목록에서 빠진다(놓친 투약/연체 신호 없음 → 투약 누락 은폐 가능). 현재 스토리는 "HH:MM 일일 반복"으로 범위를 한정했고 진짜 연체 추적은 예정 시각을 datetime로 모델링해야 함. 후속: `Medication`에 예정 datetime/주기 모델 + "연체(overdue)" 상태 표시 + 미투약 슬롯 carryover 설계. (backend/app/main.py medication_alerts)
- `datetime.now()` 타임존 naive(3.3에서도) — 알림 due 계산(`now.strftime("%H:%M")`)과 `administered_date`/`administered_at`이 서버 로컬 naive 시간. 서버(UTC)와 병원(KST) 타임존이 다르면 due 판정과 완료 날짜가 어긋남. 앱 전반(add_visit/add_medication/safety-ack 포함)과 함께 배포 전 UTC(aware)로 통일. (backend/app/main.py 전반)
- 투약 schedule 편집 후 stale slot 완료 시 복구 경로 없음 — `administer_medication`이 `scheduled_time not in parse_schedule_times(med.schedule)`면 400을 던지는데, 화면에 이미 렌더된 옛 슬롯(스케줄이 바뀐 약)을 누르면 400이 나고 목록에서 정리되지 않는다. 현재 투약 수정 기능이 없어 트리거되지 않음. 투약 편집 기능 도입 시 알림 화면 reconcile(없는 슬롯 자동 제거) 처리. (backend/app/main.py administer_medication)

## Deferred from: code review of story 4-1-환자-단계-타임라인 (2026-06-21)

- **Error Boundary 없음**: `StageTimeline`(및 기존 컴포넌트들)에 Error Boundary가 없어 렌더 오류 시 단계 표시가 사라지고 React 오류가 상위로 전파됨. 시스템 전반 과제. 전역 Error Boundary 도입 시 함께 처리. (`frontend/src/components/StageTimeline.tsx`)
- **접근성 polish — aria-current 위치 + sr-only 텍스트**: `aria-current="step"`이 연결선(데코 요소)까지 포함한 wrapper `<div>`에 걸려 있어 스크린리더가 불필요한 요소까지 읽을 수 있음. 또한 "현재 단계임"을 명시하는 `<span className="sr-only">현재 단계</span>` 보조 텍스트가 없음. AC 8(색+아이콘+글자 3중)은 충족하므로 이는 추가 polish. WAI-ARIA 정밀 검수 단계에서 함께 처리. (`frontend/src/components/StageTimeline.tsx:48`)
- **WS + onSaved 이중 fetch 경합(2.4에서 내려온 패턴)**: `advance-stage` 성공 후 `onSaved()` → `loadBundle` 호출과 WS `patient_updated` 신호 → `loadBundle` 호출이 거의 동시에 발생, 늦게 도착한 응답이 이른 응답을 덮어써 순간 깜빡임 가능. 최종 상태는 올바르게 수렴함. 2.4 deferred(async DB)와 함께 WS 아키텍처 개선 시 처리. (`frontend/src/components/PatientDetail.tsx`)
- **advance-stage 후 낙관적 업데이트 없음**: "다음 단계로" 클릭 성공 후 `loadBundle` 응답 도착 전까지 수백ms 동안 타임라인이 이전 단계를 "현재"로 표시. `StageTimeline`은 수동 수신 컴포넌트라 공유 상태 도입 없이는 해결 어려움. 향후 전역 상태 관리(예: Zustand/Context) 도입 시 낙관적 업데이트 추가. (`frontend/src/components/StageTimeline.tsx`, `ProcedureChecklist.tsx`)
- **advancingRef 락이 onSaved() 완료 전 해제(Story 3.4 기존 이슈)**: `ProcedureChecklist`의 `advance()` 함수에서 `finally`가 `onSaved?.()` 비동기 완료 전에 `advancingRef.current = false`를 리셋하여, 느린 네트워크에서 reload 중 재클릭이 허용됨(두 번째 advance는 백엔드 409로 안전하게 거부). 데이터 파괴 없음. Story 3.4 scope 이슈. `onSaved` await 완료 후 락 해제, 또는 `advancingRef`를 `loadBundle` Promise chain에 연결. (`frontend/src/components/ProcedureChecklist.tsx:114`)

## Deferred from: code review of story 3-4-필수-절차-체크리스트 (2026-06-20)

- advance-stage 동시성 가드 없음(행 잠금/원자 전이 X): 동시 advance 또는 advance↔uncheck 경합 시 최악 idempotent 재커밋 또는 500 가능. **안전 게이트 우회는 아님**(첫 advance가 체크를 삭제 → 두 번째는 409). 단일워커 데모에선 미발생. 멀티워커 배포 시 `SELECT ... FOR UPDATE` 또는 조건부 `UPDATE patient SET current_stage=:nxt WHERE id=:id AND current_stage=:cur`(rowcount 확인)로 전이를 원자화. toggle uncheck도 동시 삭제 시 StaleDataError 가능 → try/except로 멱등화. (backend/app/main.py advance_stage, toggle_checklist)
- 단계 진행 시 체크 기록 하드 삭제(감사 추적 소실): advance 시 그 환자의 ChecklistCheck(누가·언제 체크했는지 포함)를 전부 delete. 안전 게이트가 충족됐다는 "증거"가 사라져 사후 책임추적 불가. 스펙상 "다음 절차 위해 체크 초기화"는 의도된 동작이나, 환자안전 강제 기능이므로 Epic 5 감사 리포트에서 archive(soft-complete: completed_stage 컬럼 등으로 보존) 설계 검토. (backend/app/main.py advance_stage)
- 비표준 current_stage·항목세트 변경 대비 부족: ①current_stage가 STAGE_ORDER 밖(빈 값/오타/미래 단계 "퇴원" 등)이면 next_stage가 None을 반환해 advance가 "마지막 단계입니다"(400)로 오인 표시되고 프론트도 "최종 단계입니다"로 표기 — 둘은 구분돼야 함. 현재는 current_stage가 항상 표준값(시드)이고 단계 편집 기능이 없어 미발생(latent). ②CHECKLIST_ITEMS에 항목을 추가하면 진행 중이던 환자의 all_checked가 조용히 false로 바뀜(체크리스트 세트 버전닝 없음). 단계 편집/항목 편집(Epic 5) 도입 시 함께 처리. (backend/app/main.py next_stage·advance_stage, frontend/src/components/ProcedureChecklist.tsx)

## Deferred from: code review of story 4-2-부서-간-자동-전달 (2026-06-21)

- created_at 타임존 naive: `HandoverNote.created_at = datetime.now()`(naive)이며 `.isoformat()`에 오프셋이 없어 프론트 `new Date(iso)`가 브라우저 로컬 시각으로 해석. 4.2는 이 값을 "최신 5건" **정렬 키**로도 사용하므로(표시뿐 아니라 순서) 서버 시계 역행/타임존 차이 시 영향이 표시 이상으로 커짐. 앱 전반 naive datetime 이슈(acknowledged_at·administered_at 동일)와 함께 UTC aware로 통일 권장. (backend/app/main.py, models.py)
- async 핸들러 내 동기 DB 세션: `async def add_handover_note`가 동기 `session.commit()/get()/refresh()`를 호출 → 이벤트 루프 블로킹. 부하 시 요청 직렬화. 2.4부터 이어진 앱 전반 패턴이라 일괄 비동기 드라이버 전환 또는 `run_in_threadpool` 검토. (backend/app/main.py)
- 저장 시 이중 fetch: 메모 저장 성공의 `onSaved()`(즉시 reload)와 백엔드 broadcast가 WS로 되돌아와 트리거하는 reload가 겹쳐 같은 환자 묶음을 두 번 GET(깜빡임). 2.4/4.1에서 내려온 시스템 패턴. 낙관적 업데이트 또는 WS echo 억제로 해소 가능. (frontend/src/components/PatientDetail.tsx)

## Deferred from: code review of story 4-3-환자-흐름판-전체-현황 (2026-06-21)

- 오류 문구 localhost 하드코딩: `PatientFlowBoard`의 fetch 실패 안내가 `http://localhost:8000`을 문자열로 노출(`PatientSearch`·`PatientDetail`과 동일 패턴). 운영 배포 시 사용자에게 로컬 주소가 보임. 2.3 리뷰에서 이미 deferred된 동일 사안의 새 인스턴스 — 배포 단계에서 환경변수 기반 문구로 일괄 정리. (frontend/src/components/PatientFlowBoard.tsx)

## Deferred from: code review of story 4-4-대기-초과-알림 (2026-06-21)

- 백필 멀티워커 IntegrityError: `backfill_stage_entries`가 매 부팅 실행되며 check-then-insert 패턴. `uvicorn --workers N` 동시 부팅 시 두 워커가 같은 환자에 StageEntry를 삽입 → `patient_id` unique 충돌로 IntegrityError가 lifespan 밖으로 전파되어 워커 부팅 크래시 가능. 기존 seed 멀티워커 레이스(1-2/1-3 deferred)와 동일 계열. 단일워커 개발에선 무해. 하드닝 방법: `try/except IntegrityError: session.rollback()`(MedicationAdministration/SafetyAck 멱등 패턴) 또는 시드/백필을 별도 1회성 스크립트로 분리. (backend/app/main.py)
- advance-stage StageEntry upsert 동시성: `advance_stage`의 진입시각 upsert가 `select().first()` 후 insert/update하는 check-then-act. 같은 환자 advance를 동시에 호출하면 둘 다 entry=None을 보고 StageEntry를 add → 2번째 commit이 unique 충돌 IntegrityError(현재 미캐치 → 500). 단 advance는 체크리스트 삭제로 2번째 호출이 409로 막히는 기존 가드가 있어 실제 창은 매우 좁음. 3.4 리뷰의 "advance 동시성 가드 없음(행 잠금 X)" deferred와 동일 계열. 멀티워커 배포 시 SELECT FOR UPDATE 또는 try/except IntegrityError로 원자화. (backend/app/main.py)
- naive datetime이 대기초과 '판정'에 사용됨: `stage_wait_info`/`list_patients`가 `datetime.now()`(타임존 naive)로 대기시간 계산 및 임계(30분) 비교. 앱 전반 naive datetime은 이미 deferred(acknowledged_at·administered_at 등)이나, 4.4는 표시뿐 아니라 overdue '판정'에 load-bearing이라 영향이 표시 이상. 서버 시계가 안정적이면 내부 일관성은 유지됨. 앱 전반 UTC aware 통일 시 함께 정리. (backend/app/main.py, models.py)

## Deferred from: 사용자 요청 보완 — 처방·인계메모 수정/삭제 (2026-06-21)

- **인계메모 append-only 설계가 수정/삭제 허용으로 바뀜(감사 추적 약화)**: Story 4.2는 `HandoverNote`를 의도적으로 append-only(수정·삭제 없음, 감사 추적)로 만들었으나, 사용자 요청으로 `PATCH/DELETE /api/patients/{id}/handover-note/{noteId}`를 추가해 **누가 메모를 고치거나 지웠는지 이력이 남지 않게** 됨. 실제 병원에서는 의료기록 정정 시 원본 보존 + "정정 기록(누가·언제·왜)"을 남기는 방식이 표준. 운영 도입 시 ①소프트 삭제/버전 이력 또는 ②정정-메모 방식 + 변경 감사 로그(Epic 5 권한/감사와 함께)로 재설계 권고. (backend/app/main.py update/delete_handover_note, models.py HandoverNote)
- **처방 수정/삭제 감사 로그 없음**: `PATCH/DELETE /api/patients/{id}/medications/{medId}` 추가로 처방을 고치거나 지울 수 있게 됐으나 누가·언제·무엇을 바꿨는지 기록이 없음(3.1의 "위험 처방 오버라이드 감사로그 없음" deferred와 동일 계열). 처방 수정 시 약 이름 변경은 알레르기 재검사를 거치고(409), 삭제는 투약완료 기록이 있으면 FK로 보호되지만, 변경 자체의 감사 추적은 없음. Epic 5 감사 기능에서 함께 처리 권고. (backend/app/main.py update/delete_medication)

## Deferred from: code review of story 5-1-관리자-역할-전용-진입 (2026-06-21)

- 하드코딩 관리자 시드 비번(admin1234): `lifespan`이 매 부팅 `admin1`/`admin1234`(role=admin)를 멱등 시드. 소스에 박힌 기본 관리자 계정이라 비로컬 배포 시 앱을 아는 누구나 전체 관리 권한으로 로그인 가능. 1-3에서 deferred한 nurse1/test1234 기본계정 차단과 동일 계열이나 **관리자라 영향 범위가 큼**. 배포 시 dev 플래그(SEED_DEMO_USERS 등)로 시드 차단, 또는 첫 부팅 시 랜덤 비번/강제 변경. (backend/app/main.py)
- role 자유문자열 정확 매칭: `get_current_admin`은 `current.role != "admin"`, 프론트는 `=== "admin"`로 정확 비교. `Staff.role`은 자유 문자열(기본 "staff"). 현재는 role을 만드는 경로가 시드뿐이라 `" admin"`·`"Admin"`·null 같은 값이 안 나와 무해하고, fail-closed라 권한 상승도 없음. 단 **Story 5.2에서 관리자가 역할/직군을 편집**하게 되면 잘못된 표기가 조용히 권한 미부여(락아웃/불일치)를 유발 → 쓰기 시점에 normalize(`strip().lower()`)하거나 role을 enum/제약으로 강제. 프론트·백엔드가 같은 정규화 규칙을 써야 메뉴와 API가 일치. (backend/app/security.py, frontend AppShell.tsx/AdminGuard.tsx)
- admin1 시드 멀티워커 IntegrityError: `if admin1 not exists: add` check-then-insert가 `uvicorn --workers N` 동시 부팅 시 두 워커 모두 "없음" 판정 → 2번째 commit이 username unique 충돌(IntegrityError, lifespan은 OperationalError만 catch) → 워커 부팅 크래시 가능. 기존 nurse1/TestItem/seed_patients/StageEntry 백필과 동일 계열(이미 deferred). 단일워커 개발 무해. try/except IntegrityError 또는 마이그레이션-타임 시드로 하드닝. (backend/app/main.py)
- (재검토 2026-06-21 추가) `/api/admin/overview` 카운트가 전체 행을 메모리로 적재: `len(session.exec(select(Staff)).all())`·`len(...Patient...)`가 직원·환자 전 행(해시 비번·PHI 포함)을 앱 메모리로 끌어와 길이만 센다. 데모 규모(직원 2·환자 8)에선 무해하나 환자 수가 커지면 O(n) 메모리·전송 비용. `select(func.count())`(또는 `session.scalar`)로 DB에서 집계하도록 정리. 집계 숫자만 반환하므로 노출은 없음(반환 형태는 dict 리터럴). (backend/app/main.py) — 2-1/4.3의 N+1/스케일 defer 계열

## Deferred from: code review of story 5-2-직원-계정-관리 (2026-06-22)

- 마지막-관리자 가드 TOCTOU 경쟁: `assert_not_last_admin`이 `select(active admins).all()` 후 호출자가 강등/비활성화/삭제하는 check-then-act(원자성 없음). 활성 admin 2명일 때 두 요청이 각각 둘 중 하나를 동시에 강등/비활성화하면 둘 다 `len(active_admins) <= 1` 체크를 통과해 둘 다 커밋 → **활성 admin 0명(영구 self-lockout)**. 가드의 존재 목적 자체가 무력화됨. 단일워커 개발에선 발생 안 함. 기존 seed/advance-stage 동시성 deferred와 동일 계열. 멀티워커 배포 시 SELECT FOR UPDATE/조건부 UPDATE 또는 DB 제약으로 원자화. (backend/app/main.py assert_not_last_admin, update_staff, delete_staff)
- 직원 입력값 길이 상한 없음: `username`/`full_name`/`job_title`에 길이 상한이 없어(인계메모만 `HANDOVER_NOTE_MAX_LEN` 보유) 직접 API 호출 시 매우 긴 문자열 저장 가능. 관리자 전용·신뢰 입력이라 위험은 낮으나 일관성 위해 상한 권고. (backend/app/main.py create_staff/update_staff)
- 직원 비밀번호 bcrypt 72바이트 절단·raw/strip 불일치: `create_staff`/`update_staff`가 비밀번호 공백 여부는 `strip()`으로 보되 실제 해시는 raw 값을 넣는다(공백 포함 가능). 또 bcrypt 72바이트 초과 시 조용히 절단. 1.3 로그인에서 긴 비번 안전처리한 것과 동일 계열의 신규 인스턴스(관리자 계정 생성 경로). 권한 민감 표면이라 환기. (backend/app/main.py create_staff/update_staff)
- 인계메모 수정/삭제 권한·감사 추적 없음(중복 환기): `update/delete_handover_note`는 `get_current_user`만 요구하고 작성자 일치 체크가 없어 어느 직원이든 남의 메모를 고치거나 지울 수 있으며, 표시 작성자(author_id)·작성시각은 보존되어 "누가 내용을 바꿨는지" 흔적이 없다. 위 "사용자 요청 보완 — 처방·인계메모 수정/삭제" deferred와 동일 사안 — 운영 시 감사 로그/정정-기록 방식으로 재설계 권고. (backend/app/main.py update/delete_handover_note)
