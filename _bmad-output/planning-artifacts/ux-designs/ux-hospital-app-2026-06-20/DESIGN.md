---
title: "병원 통합 안전 관리 앱 — DESIGN.md (시각 정체성)"
status: final
created: 2026-06-20
updated: 2026-06-20
colors:
  # 배경 (어두운 남색 계열)
  bg.base: "#0f172a"        # 가장 어두운 바탕
  bg.surface: "#1e293b"     # 카드/패널 배경
  bg.elevated: "#334155"    # 떠 있는 요소(모달 등)
  border.subtle: "#334155"  # 옅은 경계선
  # 글자
  text.primary: "#f1f5f9"   # 주요 글자(밝은 흰빛)
  text.secondary: "#94a3b8" # 보조 글자(흐린 회색)
  text.muted: "#64748b"     # 더 흐린 글자
  # 포인트 (하늘색)
  accent.primary: "#38bdf8"   # 주요 강조/버튼
  accent.hover: "#0ea5e9"     # 버튼 눌릴 때
  accent.on: "#0f172a"        # 포인트색 위 글자
  # 상태색
  danger: "#f87171"     # 위험/경고(빨강)
  danger.bg: "#422006"  # 경고 배경
  warning: "#fbbf24"    # 주의(앰버)
  success: "#34d399"    # 완료/정상(초록)
  info: "#38bdf8"       # 정보(하늘)
typography:
  font.base: "'Pretendard', 'Malgun Gothic', -apple-system, sans-serif"
  size.display: "28px"   # 큰 제목
  size.title: "20px"     # 화면 제목
  size.body: "15px"      # 본문
  size.small: "13px"     # 보조 정보
  size.caption: "12px"   # 라벨/캡션
  weight.regular: 400
  weight.medium: 600
  weight.bold: 700
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"   # 동그란 버튼/아바타
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button.primary: { bg: "accent.primary", text: "accent.on", rounded: "md", pad: "12px 20px" }
  card: { bg: "bg.surface", border: "border.subtle", rounded: "lg", pad: "16px" }
  alert.danger: { bg: "danger.bg", text: "danger", rounded: "md", pad: "12px 14px" }
---

# 병원 통합 안전 관리 앱 — DESIGN.md

## Brand & Style (브랜드 & 분위기)

**한마디로:** 차분하고 신뢰감 있는 **다크 모드**. 야간 근무가 잦은 의료진의 눈을 보호하고, 급한 정보(위험 경고)는 색으로 확 튀게 한다.

- **톤:** 조용하고 집중되는. 화려함보다 명료함. 의료 현장의 긴장을 키우지 않는 차분함.
- **핵심 원칙:** "중요한 건 눈에 띄게, 나머지는 조용히." 위험 경고만 강한 색을 쓰고, 평소 화면은 차분한 회청색으로 유지한다.

## Colors (색)

- **배경:** 어두운 남색 3단계 (`bg.base` → `bg.surface` → `bg.elevated`). 깊이를 색의 밝기로 표현.
- **포인트:** 하늘색 `accent.primary` — 버튼, 선택된 항목, 링크에만 사용.
- **상태색 (중요):**
  - 🔴 `danger` 빨강 → 알레르기·금기 약물 등 **위험 경고**
  - 🟡 `warning` 앰버 → 투약 시간·대기 초과 등 **주의 알림**
  - 🟢 `success` 초록 → 완료·정상 상태
- **규칙:** 상태색은 "알림"에만. 장식으로 쓰지 않는다 (그래야 진짜 경고가 묻히지 않음).

## Typography (글꼴)

- 본문 기본 `font.base` (Pretendard 우선 — 한글 가독성 좋음).
- 위계: 큰 제목(`display`) → 화면 제목(`title`) → 본문(`body`) → 보조(`small`/`caption`).
- 환자 이름·경고 문구는 굵게(`weight.bold`). 의료 현장에서 빠르게 읽혀야 함.

## Layout & Spacing (배치 & 여백)

- 기본 간격 단위 `spacing` (4의 배수). 답답하지 않게 `md`(16px) 여백을 기본으로.
- 모바일: 한 화면에 카드 세로 쌓기. 웹: 좌측 메뉴 + 우측 콘텐츠 2단 구성.

## Elevation & Depth (깊이)

- 어두운 배경에서는 **그림자보다 배경 밝기 차이**로 깊이를 표현.
- 떠 있는 요소(모달·알림)는 `bg.elevated` + 옅은 테두리.

## Shapes (모양)

- 모서리는 둥글게(`rounded.md`~`lg`). 버튼·아바타는 더 둥글거나 원형(`full`).
- 날카로운 직각은 피한다 → 부드럽고 덜 위압적인 인상.

## Components (구성 요소)

- **버튼(주요):** 하늘색 바탕 + 어두운 글자. 둥근 모서리.
- **카드:** 한 환자/한 항목을 담는 기본 그릇. `bg.surface` 바탕 + 옅은 테두리.
- **경고 박스:** 어두운 빨강 배경 + 빨간 글자 + ⚠️ 아이콘. 화면에서 가장 먼저 눈에 들어와야 함.

## Do's and Don'ts (해야 할 것 / 하지 말 것)

✅ **Do**
- 위험 정보는 색·아이콘·위치로 3중 강조
- 화면당 핵심 행동 1개를 분명히
- 큰 글자·큰 터치 영역 (바쁜 손, 장갑 낀 손 고려)

❌ **Don't**
- 상태색을 장식으로 남발하지 않기
- 한 화면에 정보 욱여넣지 않기
- 중요 경고를 작은 글씨로 숨기지 않기
