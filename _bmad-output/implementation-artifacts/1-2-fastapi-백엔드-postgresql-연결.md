---
baseline_commit: NO_VCS
---

# Story 1.2: FastAPI 백엔드 + PostgreSQL 연결

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## ⛔ 개발 전 준비물 (이 스토리만의 선행 조건 — 반드시 먼저!)

이 스토리는 **파이썬 서버**와 **PostgreSQL 데이터 창고**가 필요합니다. 현재 개발 PC에 **둘 다 설치되어 있지 않습니다.** (점검 결과: `python`은 Microsoft Store 껍데기만 있고 실제 실행 불가, `pip`·`py`·`psql` 없음.) 개발 시작 전 아래를 설치해야 `dev-story`가 진행됩니다.

1. **Python 3.12+ 설치** — [python.org](https://www.python.org/downloads/) 공식 설치파일 권장. 설치 시 "Add python.exe to PATH" 체크. 설치 후 새 터미널에서 `python --version`이 버전을 출력해야 함.
   - (참고) Windows 설정 → 앱 → "앱 실행 별칭"에서 Microsoft Store의 python.exe/python3.exe 별칭을 끄면 껍데기 충돌이 사라짐.
2. **PostgreSQL 설치 + 실행** — [postgresql.org/download/windows](https://www.postgresql.org/download/windows/) 설치(EDB 설치본). 설치 중 정한 슈퍼유저(postgres) 비밀번호를 기억할 것. 설치 후 `hospital` 데이터베이스 1개 생성.
   - 대안(더 쉬움): Docker가 있으면 `docker run --name hospital-pg -e POSTGRES_PASSWORD=비번 -e POSTGRES_DB=hospital -p 5432:5432 -d postgres:17`
3. 설치 확인: `python --version`, `pip --version`, `psql --version`이 모두 정상 출력되면 준비 완료.

> 💡 비개발자 안내: 이건 "공사 자재(파이썬)와 창고(PostgreSQL)를 현장에 들여놓는" 단계예요. 자재가 와야 집을 지을 수 있어요. 설치가 막히면 알려주세요 — 단계별로 같이 진행해요.

## Story

As a 개발자(YC),
I want FastAPI 백엔드 서버가 PostgreSQL 창고와 연결되고, 화면(Next.js)이 백엔드와 통신하기를,
so that 환자 정보·로그인 정보를 저장하고 불러올 수 있다.

## Acceptance Criteria

epics.md 원문 + architecture.md에서 도출한 검증 가능한 항목입니다.

1. **(원문)** FastAPI 서버와 PostgreSQL이 준비된 상태에서 백엔드를 실행하면 → **화면 ↔ 백엔드 ↔ 데이터 창고가 정상 연결**된다.
2. **(원문)** 간단한 **테스트 데이터를 백엔드를 통해 읽어와 화면(Next.js)에 표시**할 수 있다.
3. `backend/` 폴더에 FastAPI 앱이 있고, `uvicorn`으로 실행 시 `http://localhost:8000`에서 동작한다. `GET /api/health` → `200 {"status":"ok"}`.
4. PostgreSQL 연결 정보는 **`.env` 파일**(코드에 비밀번호 하드코딩 금지)로 관리되고, 서버 시작 시 DB 연결에 성공한다. `GET /api/db-check` → DB 연결 확인 응답.
5. 테스트용 테이블이 생성·시드되고, `GET /api/test-data` → 샘플 데이터(JSON 배열)를 반환한다.
6. **CORS** 설정으로 프론트엔드(`http://localhost:3000`)에서 백엔드 호출이 허용된다.
7. 프론트엔드 화면에서 `GET /api/test-data`를 호출해 받은 데이터가 **화면에 표시**된다(연결 증명).
8. 비밀정보(`.env`)는 버전관리에 올라가지 않도록 `.gitignore`에 포함되고, `.env.example`(빈 양식)이 제공된다.

## Tasks / Subtasks

- [x] **Task 1: backend 폴더 + 파이썬 가상환경 구성** (AC: #3)
  - [x] 프로젝트 루트에 `backend/` 폴더 생성 (frontend와 형제 폴더 — 화면/뒷단 분리)
  - [x] `python -m venv .venv` 생성(machine Python 3.12.10 사용)
  - [x] `requirements.txt` 작성·설치: fastapi 0.138.0 / uvicorn[standard] 0.49.0 / sqlmodel 0.0.38 / psycopg[binary] 3.3.4 / pydantic-settings 2.14.2 (top-level 버전 고정)
- [x] **Task 2: 설정(.env) + 비밀정보 관리** (AC: #4, #8)
  - [x] `app/config.py`: `pydantic-settings`의 `BaseSettings`로 `DATABASE_URL`·`CORS_ORIGINS` 읽기
  - [x] `.env` 작성(`postgresql+psycopg://postgres:postgres@localhost:5432/hospital`)
  - [x] `.env.example` 작성, `.gitignore`에 `.venv/`·`.env`·`__pycache__/` 추가
- [x] **Task 3: DB 연결 + 테스트 모델** (AC: #1, #4, #5)
  - [x] `app/database.py`: `create_engine` + `get_session` 의존성 + `init_db()`
  - [x] `app/models.py`: `TestItem`(id, name, note) 정의
  - [x] 앱 시작(lifespan) 시 `create_all` + 비어 있으면 샘플 3행 시드
- [x] **Task 4: FastAPI 앱 + 엔드포인트 + CORS** (AC: #3, #4, #5, #6)
  - [x] `app/main.py`: FastAPI + `CORSMiddleware`(허용 출처 `http://localhost:3000`)
  - [x] `GET /api/health` → `{"status":"ok"}`
  - [x] `GET /api/db-check` → `SELECT 1` 실행 후 `{"db":"connected"}`
  - [x] `GET /api/test-data` → `TestItem` 전체 JSON 배열
- [x] **Task 5: 백엔드 실행 검증** (AC: #1, #3, #4, #5)
  - [x] `uvicorn app.main:app --port 8000` 실행(startup 성공 = DB 연결 정상)
  - [x] `/api/health`·`/api/db-check`·`/api/test-data` 모두 정상 응답 확인
  - [x] 자동 문서 `/docs` 200 확인
- [x] **Task 6: 프론트엔드 ↔ 백엔드 연결** (AC: #2, #7)
  - [x] `frontend/.env.local`에 `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` 추가
  - [x] 클라이언트 컴포넌트 `BackendStatus.tsx` 추가 — `/api/test-data` fetch해 홈 화면에 목록 표시(디자인 토큰 사용)
  - [x] 로딩("불러오는 중…")·에러("백엔드에 연결할 수 없습니다") 상태 처리
- [x] **Task 7: 전체 연결 검증(화면↔백엔드↔DB)** (AC: 전체)
  - [x] 백엔드(8000) + 프론트(3000) 동시 실행 → 홈에 `BackendStatus` 렌더, 백엔드 CORS 헤더(`Access-Control-Allow-Origin: http://localhost:3000`) 확인
  - [x] `npm run build`·`npm run lint`(프론트) 통과, 백엔드 `import app.main` OK

### Review Findings (코드 리뷰 2026-06-20)

검사관 3종(Blind / Edge Case / Acceptance) 병렬 리뷰. 합격 기준(AC 1~8) 전부 PASS, 범위·스택 준수. 아래는 보안/견고성 개선 항목.

- [x] [Review][Patch] 설정이 실행 위치(CWD)에 따라 `.env`를 못 찾고 하드코딩 기본값으로 조용히 폴백 → `env_file` 절대경로 + `database_url` 필수화(기본값 제거) [backend/app/config.py] — ✅ 수정됨
- [x] [Review][Patch] CORS `allow_credentials=True` 불필요(인증 미사용) + 와일드카드 결합 시 위험 → `allow_credentials=False` [backend/app/main.py] — ✅ 수정됨
- [x] [Review][Patch] PostgreSQL 꺼져 있을 때 시작 시 난해한 스택트레이스 → 친절한 한국어 안내로 감싸 재발생 [backend/app/main.py lifespan] — ✅ 수정됨
- [x] [Review][Patch] DB 엔진 유휴 연결 끊김 대비 `pool_pre_ping=True` [backend/app/database.py] — ✅ 수정됨
- [x] [Review][Patch] 프론트 fetch가 실제로 취소되지 않음(active 플래그만) → `AbortController` 사용 [frontend/src/components/BackendStatus.tsx] — ✅ 수정됨
- [x] [Review][Patch] 빈 목록인데 "연결 정상"만 표시 → 데이터 0건 안내 분기 추가 [frontend/src/components/BackendStatus.tsx] — ✅ 수정됨
- [x] [Review][Defer] 시드 로직이 멀티워커 동시 시작 시 중복 삽입 가능(`name` 유니크 없음) — 단일워커 개발에선 무해, 멀티워커 배포 전 유니크 제약/ON CONFLICT 적용 — deferred
- [x] [Review][Defer] `NEXT_PUBLIC_API_BASE_URL` 빌드시 localhost 폴백이 운영 오설정 가림 — 배포 시 필수화 — deferred
- [x] [Review][Defer] `create_all`은 마이그레이션 아님 — 스키마 커지면 Alembic 도입 — deferred

## Dev Notes

### 이 스토리의 핵심 (한 줄)
**"빈 집(frontend)"에 이제 "뒷단 사무실(FastAPI)"과 "창고(PostgreSQL)"를 연결**하는 작업입니다. 화면이 뒷단에 요청 → 뒷단이 창고에서 꺼내 → 화면에 보여주는 **한 줄(end-to-end) 연결**을 처음으로 완성합니다. 로그인·실시간동기화 같은 본격 기능은 다음 스토리(1.3~)이며 **여기 범위 아님**.

### 확정 기술 스택 (architecture.md 기준 — 반드시 준수)
- 백엔드: **FastAPI (파이썬)** — 화면(Next.js)과 **분리**된 별도 서버 ← 이 스토리 범위
- 데이터 저장: **PostgreSQL**
- 로그인/인증(토큰): FastAPI에서 — *Story 1.3~1.4*
- 실시간 동기화(WebSocket): FR3·FR8 — *Epic 2/4*
- [Source: architecture.md#1-한눈에-보기, #2-각-선택의-이유, #4-확정-사항]

### 권장 라이브러리 (2026-06 기준 — 최신 안정판 설치 후 freeze)
- **FastAPI** + **Uvicorn[standard]** — API 서버 + 실행기(ASGI). `[standard]`는 uvloop 등 고성능 의존성 포함.
- **SQLModel** — FastAPI 제작자가 만든 ORM. SQLAlchemy + Pydantic을 합쳐 모델을 한 번만 정의(초보 친화적, 보일러플레이트 적음).
- **psycopg (v3)** — 최신 PostgreSQL 드라이버(동기/비동기 모두 지원). 연결 URL은 `postgresql+psycopg://...` 형식.
  - ⚠️ 드라이버 접두사 주의: psycopg **v3**는 `postgresql+psycopg://`, 옛 psycopg2는 `postgresql+psycopg2://`. 이 스토리는 v3 사용.
- **pydantic-settings** — `.env`의 환경변수를 타입 검증하며 읽기(`BaseSettings`). 비밀번호 하드코딩 금지 원칙 충족.
- 이 스토리는 **동기(sync)** 방식으로 단순하게 구성(초보 친화). 비동기(asyncpg)는 성능이 필요한 이후 단계에서 검토.
- [Source: 웹 리서치 2026-06 — FastAPI+SQLModel+psycopg3 권장 구성]

### 파일/폴더 구조 (이 스토리에서 만들어지는 것)
```
hospital-app/
├─ frontend/                  ← 기존(Story 1.1). .env.local + 백엔드 호출 컴포넌트만 추가(UPDATE)
│  └─ src/app/...             ← 홈 또는 /test 페이지에 백엔드 데이터 표시
└─ backend/                   ← 이 스토리에서 새로 생성(NEW)
   ├─ app/
   │  ├─ __init__.py
   │  ├─ main.py              # FastAPI 앱, CORS, 라우트
   │  ├─ config.py            # Settings(BaseSettings, .env 읽기)
   │  ├─ database.py          # engine, get_session, init/seed
   │  └─ models.py            # SQLModel TestItem
   ├─ requirements.txt
   ├─ .env                    # 실제 비밀값 (gitignore)
   ├─ .env.example            # 값 빈 양식 (커밋용)
   └─ .gitignore              # .venv/, .env, __pycache__/
```

### 핵심 코드 가이드 (개발 시 참고)
- **연결 URL 예시(.env):** `DATABASE_URL=postgresql+psycopg://postgres:<비번>@localhost:5432/hospital`
- **CORS:** `from fastapi.middleware.cors import CORSMiddleware` → `allow_origins=["http://localhost:3000"]`, `allow_methods=["*"]`, `allow_headers=["*"]`. (배포 주소는 이후 추가)
- **시작 시 테이블 생성/시드:** FastAPI `lifespan` 이벤트에서 `SQLModel.metadata.create_all(engine)` 후 `TestItem`이 비어 있으면 샘플 삽입.
- **엔드포인트 경로 접두사:** 모두 `/api/...`로 통일(이후 프론트/배포 라우팅 단순화).
- **프론트 호출:** 클라이언트 컴포넌트(`"use client"`)에서 `fetch`. 서버 컴포넌트로 fetch할 경우 빌드 시 백엔드가 안 떠 있으면 실패할 수 있으니, **클라이언트 컴포넌트 + 로딩/에러 처리** 권장.

### 테스트 표준 (이 스토리)
- 취미/연습 규모 — 무거운 테스트 프레임워크 도입은 아직 보류. **수동 검증** 위주:
  - 백엔드: `/api/health`·`/api/db-check`·`/api/test-data` 응답 확인 + `/docs` 표시
  - 프론트: 화면에 백엔드 데이터가 보이고, 백엔드 끄면 에러 안내가 뜨는지
- (선택) FastAPI `TestClient`로 health 엔드포인트 1개 정도 가벼운 테스트 추가 가능.

### 이전 스토리(1.1)에서 이어받는 사실 — 반드시 인지
- ✅ `frontend/`는 이미 존재: **Next.js 16.2.9 + React 19 + Tailwind v4 + shadcn/ui(Base UI 기반)**. 이번엔 프론트를 새로 만들지 말고 **호출 코드만 추가**.
- ✅ 디자인 토큰 단일 소스: `frontend/src/app/globals.css`의 `@theme`. 새 UI는 기존 토큰(`text-text-primary`, `bg-bg-surface` 등) 사용.
- ⚠️ `frontend/AGENTS.md` 경고: "Next 16은 예전과 다름 — `node_modules/next/dist/docs/` 먼저 확인". 프론트 수정 시 참고.
- ⚠️ **이 PC는 현재 git 미사용(NO_VCS)** 이고 **Python·PostgreSQL 미설치**(위 "개발 전 준비물" 참고). 설치 전에는 dev 불가.
- [Source: 1-1-프로젝트-기본-세팅.md Dev Agent Record]

### 흔한 실수 방지 (이것만은 피하기)
- ❌ 비밀번호를 코드(main.py 등)에 직접 적기 → `.env`로만. `.env`는 gitignore.
- ❌ psycopg 버전 접두사 혼동 → v3는 `postgresql+psycopg://`.
- ❌ CORS 빼먹기 → 프론트(3000)에서 백엔드(8000) 호출이 브라우저에서 막힘.
- ❌ 프론트를 새로 스캐폴드하기 → 이미 있음. 호출 코드만 추가.
- ❌ 로그인/인증·실시간 WebSocket·환자 실제 스키마 만들기 → **범위 밖**(Story 1.3+, Epic 2+). 지금은 "연결 증명용 테스트 데이터"만.
- ❌ 서버 컴포넌트에서 빌드시점 fetch로 백엔드 의존 → 빌드 깨질 수 있음. 클라이언트 fetch 사용.

### References
- [Source: epics.md#story-12-fastapi-백엔드--postgresql-연결] — 원문 스토리/AC
- [Source: epics.md#additional-requirements] — "백엔드: FastAPI 구성 / 데이터: PostgreSQL 연결"
- [Source: architecture.md#2-각-선택의-이유, #3-큰-그림-데이터-흐름] — 화면↔FastAPI↔PostgreSQL 흐름
- [Source: 1-1-프로젝트-기본-세팅.md] — frontend 현황·제약
- [Source: 웹 리서치 2026-06] — FastAPI+SQLModel+psycopg3+pydantic-settings 권장 구성:
  - [FastAPI+SQLModel+PostgreSQL best practices (fastapi discussion #9936)](https://github.com/fastapi/fastapi/discussions/9936)
  - [FastAPI, Pydantic, Psycopg3 (spwoodcock.dev)](https://spwoodcock.dev/blog/2024-10-fastapi-pydantic-psycopg/)

## Project Context Reference

- 프로젝트 진행 일지·설명 규칙: `CLAUDE.md`
- 전체 기획 산출물: `_bmad-output/planning-artifacts/`
- 이전 스토리: `_bmad-output/implementation-artifacts/1-1-프로젝트-기본-세팅.md` (done)

## Dev Agent Record

### Agent Model Used

claude-opus-4-8[1m] (Claude Opus 4.8 1M)

### Debug Log References

- 선행조건 해소: winget으로 Python 3.12.10 + PostgreSQL 17.10 설치, `hospital` DB 생성, 슈퍼유저 `postgres`/`postgres`.
- venv + 의존성 설치 성공(`pip install -r requirements.txt`).
- uvicorn startup "Application startup complete" → lifespan의 `init_db`+시드가 에러 없이 실행 = DB 연결 정상.
- 엔드포인트 응답: `/api/health`→`{"status":"ok"}`, `/api/db-check`→`{"db":"connected"}`, `/api/test-data`→샘플 3행, `/docs`→200.
- CORS 검증: Origin `http://localhost:3000`로 요청 시 응답 헤더 `Access-Control-Allow-Origin: http://localhost:3000` 확인.
- 프론트: `npm run build`·`npm run lint` 통과, 홈에 `BackendStatus` 렌더 확인. 백엔드 `import app.main` OK.

### Completion Notes List

- ✅ `backend/` FastAPI 앱 구축(화면 `frontend/`와 분리). 스택: FastAPI 0.138 + Uvicorn + SQLModel 0.0.38 + psycopg v3 + pydantic-settings.
- ✅ PostgreSQL `hospital` DB 연결. `.env`로 비밀정보 관리, `.gitignore`로 `.env`·`.venv` 제외.
- ✅ 엔드포인트 3종(`/api/health`, `/api/db-check`, `/api/test-data`) + 시작 시 테이블 생성·샘플 시드.
- ✅ CORS로 프론트(3000) 호출 허용. 프론트 `BackendStatus` 클라이언트 컴포넌트가 `/api/test-data`를 불러와 홈에 표시 → **화면↔백엔드↔DB 한 줄 연결 완성**.
- ✅ 전 AC(1~8) 충족, 빌드/린트/런타임 검증 완료.
- ⚠️ 인수인계(다음 스토리):
  - 백엔드 실행: `cd backend; .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000` (개발 시 `--reload` 권장).
  - 프론트는 `NEXT_PUBLIC_API_BASE_URL`(.env.local)로 백엔드 주소를 받음. 배포 시 이 값과 백엔드 CORS 허용 출처를 실제 주소로 변경 필요.
  - 현재 시드 모델 `TestItem`은 연결 증명용. Story 2.1에서 실제 환자 스키마로 대체.
  - DB 마이그레이션 도구(Alembic)는 미도입(현재 `create_all`). 스키마가 커지면 Alembic 도입 검토.
  - 로컬 DB 비밀번호 `postgres`는 개발용. 메모리 [[dev-environment-state]]에 기록됨.

### File List

생성/수정 파일 (저장소 루트 기준):

- `backend/requirements.txt` — (생성) 의존성 목록(버전 고정)
- `backend/.gitignore` — (생성) `.venv/`·`.env`·`__pycache__/` 제외
- `backend/.env` — (생성) 실제 DB 연결/ CORS 값 (gitignore)
- `backend/.env.example` — (생성) 값 빈 양식(커밋용)
- `backend/app/__init__.py` — (생성) 패키지 표시
- `backend/app/config.py` — (생성) pydantic-settings 설정
- `backend/app/database.py` — (생성) engine·get_session·init_db
- `backend/app/models.py` — (생성) SQLModel `TestItem`
- `backend/app/main.py` — (생성) FastAPI 앱·CORS·엔드포인트·시드
- `frontend/.env.local` — (생성) `NEXT_PUBLIC_API_BASE_URL`
- `frontend/src/components/BackendStatus.tsx` — (생성) 백엔드 데이터 호출·표시 클라이언트 컴포넌트
- `frontend/src/app/page.tsx` — (수정) `BackendStatus` 추가

## Change Log

| 날짜 | 변경 내용 |
| --- | --- |
| 2026-06-20 | Story 1.2 스토리 컨텍스트 작성(ready-for-dev). ⚠️ 선행조건: Python·PostgreSQL 설치 필요(당시 미설치). |
| 2026-06-20 | 선행조건 해소(Python 3.12 + PostgreSQL 17 설치, hospital DB 생성) 후 구현 완료: backend FastAPI+SQLModel+psycopg, 엔드포인트 3종, 프론트 연동(BackendStatus). 화면↔백엔드↔DB 연결 검증 통과. Status → review |
| 2026-06-20 | 코드 리뷰(3종) 후 patch 6건 적용: config 절대경로+필수화, CORS allow_credentials=False, DB다운 친절 안내, pool_pre_ping, 프론트 AbortController, 빈목록 처리. 재빌드/린트/런타임(엔드포인트·CORS) 재검증 통과. defer 3건은 deferred-work.md. Status → done |
