---
stepsCompleted: [1]
inputDocuments:
  - "_bmad-output/planning-artifacts/prds/prd-hospital-app-2026-06-20/prd.md"
  - "_bmad-output/planning-artifacts/ux-designs/ux-hospital-app-2026-06-20/DESIGN.md"
  - "_bmad-output/planning-artifacts/ux-designs/ux-hospital-app-2026-06-20/EXPERIENCE.md"
workflowType: 'architecture'
project_name: 'hospital-app'
user_name: 'YC'
date: '2026-06-20'
---

# 기술 구조 설계 문서 (Architecture)

_병원 내부 직원용 통합 안전 관리 앱 — 어떤 기술로 만들지 정리하는 문서._

> 📌 2026-06-20 업데이트: 조교님 피드백을 반영해 백엔드를 FastAPI로 분리하고, 모바일은 Flutter WebView 방식으로 추가함.

## 1. 한눈에 보기

이 앱을 만들 때 쓸 "도구 한 세트"를 정리한 문서입니다. 비개발자도 이해할 수 있게 각 도구가 무슨 역할인지 풀어서 적었습니다.

| 역할 | 선택한 도구 | 쉽게 말하면 |
| --- | --- | --- |
| 🖥️ 화면 (프론트엔드) | **Next.js** + Tailwind CSS + shadcn/ui | 웹 화면을 만드는 도구 + 디자인 + 부품 |
| ⚙️ 뒷단 처리 (백엔드) | **FastAPI** (파이썬) | 데이터 처리·로그인·규칙을 담당하는 서버 |
| 🗄️ 데이터 저장 | **PostgreSQL** | 환자 정보 등을 담는 데이터 창고 |
| 📱 모바일 앱 | **Flutter (WebView 방식)** | 웹 화면을 감싸 휴대폰 앱으로 만드는 도구 |

## 2. 각 선택의 이유

### 🖥️ Next.js + Tailwind + shadcn/ui (프론트엔드 = 화면)
- **왜:** 사용자가 보는 웹 화면을 만드는 부분. Tailwind로 다크 모드를 빠르게 입히고, shadcn/ui로 버튼·카드 부품을 가져다 씀.
- UX 목업의 다크 모드·카드형 디자인을 그대로 구현.

### ⚙️ FastAPI (백엔드 = 뒷단 처리)
- **왜:** 화면 뒤에서 데이터를 저장·조회하고, 로그인을 확인하고, 안전 규칙(알레르기 충돌 검사 등)을 처리하는 서버. 파이썬 기반이라 배우기 쉽고 빠름.
- 화면(Next.js)과 **분리**되어 있어 역할이 명확함. (프론트와 백엔드를 나눠서 개발)
- 실시간 동기화(FR3·FR8)는 FastAPI의 WebSocket 기능으로 처리.
- 로그인/인증(NFR3)은 FastAPI에서 처리 (토큰 방식).

### 🗄️ PostgreSQL (데이터 저장)
- **왜:** 환자 정보·직원 계정·진료 기록 등을 담는 데이터 창고. FastAPI와 가장 흔하게 짝지어 쓰는 대표 데이터베이스.

### 📱 Flutter WebView (모바일 앱)
- **왜:** 우리가 만든 웹 화면(Next.js)을 Flutter라는 "앱 껍데기"에 담아 휴대폰 앱으로 포장하는 방식.
- **장점:** 화면을 두 번 만들 필요 없이, 웹 화면 하나로 앱스토어/플레이스토어에 올라가는 모바일 앱까지 확보.
- PRD 요구사항 "휴대폰 + 웹 둘 다(NFR1)"를 충족.

## 3. 큰 그림 (데이터 흐름)

```
[웹] 직원의 컴퓨터 브라우저  ─┐
                            │   (화면: Next.js + Tailwind + shadcn/ui)
[모바일] 휴대폰 앱 (Flutter ─┤
         WebView가 웹화면을  │
         감싼 것)           │
                            ▼
                   [FastAPI 백엔드 서버]  ← 로그인 확인 · 안전 규칙 · 데이터 처리
                            │
                            ▼
                   [PostgreSQL 데이터 창고]  ← 환자 정보 저장
                            │
                            └─ 실시간 전달(WebSocket): 한 부서 입력 → 다른 부서 화면 즉시 반영
```

## 4. 확정 사항 & 메모

- [확정] 프론트엔드(화면): Next.js + Tailwind CSS + shadcn/ui
- [확정] 백엔드(뒷단 처리): FastAPI (파이썬) — 화면과 분리
- [확정] 데이터 저장: PostgreSQL
- [확정] 모바일 앱: Flutter (WebView 방식으로 웹 화면을 감쌈)
- [확정] 실시간 동기화: FastAPI WebSocket으로 구현 (FR3, FR8)
- [확정] 로그인/인증: FastAPI에서 처리 (NFR3)
- [추후] 배포 방법은 개발 단계에서 결정 (프론트=Vercel, 백엔드=서버 호스팅 등 후보)
- [범위] 실제 의료기기·외부 병원 시스템 연동은 1차 범위 밖 (PRD와 동일)
- [변경 이력] 2026-06-20: 조교 피드백으로 Supabase → FastAPI + PostgreSQL 백엔드 분리, Flutter WebView 모바일 추가
