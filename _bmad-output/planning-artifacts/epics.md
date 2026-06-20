---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - "_bmad-output/planning-artifacts/prds/prd-hospital-app-2026-06-20/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-designs/ux-hospital-app-2026-06-20/DESIGN.md"
  - "_bmad-output/planning-artifacts/ux-designs/ux-hospital-app-2026-06-20/EXPERIENCE.md"
---

# hospital-app - Epic Breakdown (할 일 쪼개기)

## Overview

병원 통합 안전 관리 앱의 요구사항(PRD + UX + 기술 구조)을 실제로 만들 수 있는 작은 단위로 쪼갠 문서입니다.

## Requirements Inventory (만들어야 할 것 목록)

### Functional Requirements (기능 — 앱이 해야 할 일)

FR1: 환자 한 명 선택 시 기본정보·방문기록·진단·투약·검사결과·수납을 한 화면에서 본다
FR2: 환자를 이름/등록번호로 검색한다
FR3: 새 정보 입력 시 해당 환자 화면에 즉시 반영된다
FR4: 알레르기/금기 약물과 충돌하는 처방 입력 시 경고를 띄운다
FR5: 정해진 투약 시간에 담당자에게 알림을 보낸다
FR6: 주요 절차에 필수 체크리스트를 제공하고, 다 체크해야 다음 단계로 넘어간다
FR7: 안전 알림은 확인·조치 전까지 사라지지 않는다
FR8: 한 부서가 입력·완료한 내용이 다음 부서 화면에 자동 전달된다
FR9: 환자가 지금 어느 단계(접수→진료→검사→수납)인지 실시간 표시한다
FR10: 한 단계에서 대기가 너무 길면 담당자에게 알림을 보낸다

#### 관리자용 기능 (추가됨)
FR11: 관리자가 직원 계정을 등록/수정/삭제하고 직군(의사/간호사/원무과 등)을 지정한다
FR12: 관리자가 직원별 접근 권한(볼 수 있는 정보 범위)을 설정한다
FR13: 관리자가 전체 현황(오늘 환자 수, 과별 혼잡도, 평균 대기시간 등)을 한눈에 본다
FR14: 관리자가 기준값(예: 대기 초과 알림 기준 시간)을 직접 설정한다

### NonFunctional Requirements (공통 조건)

NFR1: 휴대폰 + 웹 둘 다 잘 보이고 동작한다
NFR2: 사용자 역할을 구분한다 — 일반 직원 / 관리자. 관리자만 관리자 페이지에 접근 가능. 세부 권한은 관리자가 설정(FR12)
NFR3: 로그인한 직원만 접근 가능 (정보 보호)
NFR4: 한 부서 입력이 다른 부서 화면에 거의 즉시(몇 초 내) 반영된다
NFR5: 화면이 직관적이고 클릭 수가 적다

### Additional Requirements (기술 구조에서 온 것)

- 초기 프로젝트 세팅: Next.js + Tailwind CSS + shadcn/ui 설치 및 구성 (→ Epic 1 첫 작업)
- 백엔드: FastAPI(파이썬) 서버 구성 (→ Epic 1)
- 데이터 저장소: PostgreSQL 연결 (FastAPI에서 사용)
- 로그인/인증: FastAPI에서 처리 (토큰 방식)
- 실시간 동기화: FastAPI WebSocket으로 FR3·FR8 구현
- 모바일: Flutter WebView로 웹 화면을 감싸 휴대폰 앱 패키징 (→ 별도 작업)

### UX Design Requirements (화면 디자인에서 온 것)

UX-DR1: 다크 모드 디자인 토큰 적용 (DESIGN.md 색·글꼴·여백·둥근모서리)
UX-DR2: 재사용 부품 - 환자 카드 (이름·나이·현재단계·경고배지)
UX-DR3: 재사용 부품 - 안전 경고 배너 (빨강, 화면 최상단)
UX-DR4: 재사용 부품 - 진행 단계 타임라인 (점+선, 완료/현재/예정 구분)
UX-DR5: 재사용 부품 - 상태 배지/알약 (완료=초록, 주의=앰버, 위험=빨강)
UX-DR6: 재사용 부품 - 필수 절차 체크리스트 (전부 체크 시 버튼 활성화)
UX-DR7: 아웃라인(라인) 아이콘 세트 통일 적용
UX-DR8: 접근성 - 터치영역 44px 이상, 색만으로 정보전달 금지(색+아이콘+글자)
UX-DR9: 반응형 - 휴대폰(세로 카드+하단 탭바) / 웹(좌측 메뉴+우측 콘텐츠)
UX-DR10: 관리자 전용 화면 - 직원 계정 목록·권한 설정·전체 현황 대시보드·기준값 설정 (일반 직원 화면과 분리, 주로 웹 화면 기준)

### FR Coverage Map

- FR1: 에픽 2 - 환자 통합 화면에 정보 모아보기
- FR2: 에픽 2 - 환자 검색
- FR3: 에픽 2 - 입력 즉시 반영
- FR4: 에픽 3 - 알레르기/금기 경고
- FR5: 에픽 3 - 투약 시간 알림
- FR6: 에픽 3 - 필수 절차 체크리스트
- FR7: 에픽 3 - 안전 알림 유지
- FR8: 에픽 4 - 부서 간 자동 전달
- FR9: 에픽 4 - 단계 실시간 표시
- FR10: 에픽 4 - 대기 초과 알림
- FR11: 에픽 5 - 직원 계정 관리
- FR12: 에픽 5 - 권한 설정
- FR13: 에픽 5 - 전체 현황 대시보드
- FR14: 에픽 5 - 기준값 설정

## Epic List

### Epic 1: 앱 토대 + 로그인
직원이 앱에 로그인해서 들어올 수 있다. 프로젝트 기본 세팅(Next.js+Tailwind+shadcn/ui), FastAPI + PostgreSQL 연결, 로그인/인증, 다크 모드 적용까지. 이후 모든 에픽의 바탕.
**FRs covered:** (기술 준비 전부), NFR1, NFR2, NFR3, UX-DR1, UX-DR7

### Epic 2: 환자 정보 한눈에 보기
직원이 환자 한 명의 모든 정보를 한 화면에서 본다.
**FRs covered:** FR1, FR2, FR3

### Epic 3: 환자 안전 지키기
위험한 순간을 앱이 미리 막아준다.
**FRs covered:** FR4, FR5, FR6, FR7

### Epic 4: 부서 협업 + 환자 흐름 추적
부서 간 정보가 자동으로 흐르고, 환자가 어느 단계인지 보인다.
**FRs covered:** FR8, FR9, FR10

### Epic 5: 관리자 페이지
관리자가 직원·권한·현황·기준값을 관리한다.
**FRs covered:** FR11, FR12, FR13, FR14

### Epic 6: 모바일 앱 패키징
완성된 웹 화면을 Flutter WebView로 감싸 휴대폰 앱으로 만든다. (조교 피드백 반영)
**FRs covered:** NFR1 (모바일 지원)

---

## Epic 1: 앱 토대 + 로그인

직원이 앱에 로그인해서 들어올 수 있다. 이후 모든 기능의 바탕이 되는 토대를 만든다.

### Story 1.1: 프로젝트 기본 세팅
As a 개발자(YC),
I want Next.js + Tailwind CSS + shadcn/ui가 설치된 빈 프로젝트와 다크 모드 기본 화면을,
So that 앞으로의 모든 화면을 이 위에 만들 수 있다.

**Acceptance Criteria:**
**Given** 새 프로젝트 폴더에서
**When** 기본 세팅을 마치고 앱을 실행하면
**Then** 다크 모드(어두운 배경)가 적용된 빈 화면이 브라우저에 뜬다
**And** DESIGN.md의 색·글꼴 기본값이 적용되어 있다

### Story 1.2: FastAPI 백엔드 + PostgreSQL 연결
As a 개발자(YC),
I want FastAPI 백엔드 서버가 PostgreSQL 창고와 연결되고, 화면(Next.js)이 백엔드와 통신하기를,
So that 환자 정보·로그인 정보를 저장하고 불러올 수 있다.

**Acceptance Criteria:**
**Given** FastAPI 서버와 PostgreSQL이 준비된 상태에서
**When** 백엔드를 실행하고 화면에서 백엔드에 요청하면
**Then** 화면 ↔ 백엔드 ↔ 데이터 창고가 정상 연결된다
**And** 간단한 테스트 데이터를 백엔드를 통해 읽어와 화면에 표시할 수 있다

### Story 1.3: 직원 로그인
As a 병원 직원,
I want 아이디·비밀번호로 로그인하기를,
So that 내 계정으로 앱에 들어갈 수 있다.

**Acceptance Criteria:**
**Given** 등록된 직원 계정이 있을 때
**When** 로그인 화면에서 올바른 정보를 입력하면
**Then** 홈 대시보드로 이동한다
**And** 잘못된 정보면 "로그인 실패" 안내가 뜬다

### Story 1.4: 로그인 보호 & 로그아웃
As a 병원 직원,
I want 로그인하지 않으면 환자 정보에 못 들어가고, 로그아웃도 할 수 있기를,
So that 환자 정보가 아무에게나 노출되지 않는다. (NFR3)

**Acceptance Criteria:**
**Given** 로그인하지 않은 상태에서
**When** 환자 화면 주소로 접근하면
**Then** 로그인 화면으로 돌려보낸다
**And** 로그인 상태에서 로그아웃하면 다시 로그인 화면으로 간다

---

## Epic 2: 환자 정보 한눈에 보기

직원이 환자 한 명의 모든 정보를 한 화면에서 본다.

### Story 2.1: 환자 데이터 구조 + 샘플 데이터
As a 개발자(YC),
I want 환자 정보를 담는 구조와 연습용 샘플 환자 몇 명을,
So that 검색·통합 화면을 실제 데이터로 만들 수 있다.

**Acceptance Criteria:**
**Given** PostgreSQL 창고에
**When** 환자 정보 구조(이름·나이·등록번호·진단·투약·검사·수납 등)를 만들고 샘플을 넣으면
**Then** 샘플 환자 3~5명이 저장되어 조회된다

### Story 2.2: 환자 검색 (FR2)
As a 병원 직원,
I want 이름이나 등록번호로 환자를 검색하기를,
So that 원하는 환자를 빠르게 찾는다.

**Acceptance Criteria:**
**Given** 환자들이 저장된 상태에서
**When** 검색창에 이름 또는 등록번호를 입력하면
**Then** 일치하는 환자 목록이 실시간으로 보인다
**And** 없으면 "검색 결과 없음"이 표시된다

### Story 2.3: 환자 통합 화면 (FR1)
As a 병원 직원,
I want 환자 한 명을 선택하면 그 사람의 모든 정보를 한 화면에서 보기를,
So that 여러 프로그램을 열지 않아도 된다.

**Acceptance Criteria:**
**Given** 검색 결과에서
**When** 환자 한 명을 선택하면
**Then** 기본정보·방문기록·진단·투약·검사결과·수납이 한 화면(카드형)에 표시된다
**And** UX 목업과 같은 다크 모드 레이아웃을 따른다

### Story 2.4: 입력 즉시 반영 (FR3)
As a 병원 직원,
I want 새 정보를 입력하면 환자 화면에 바로 보이기를,
So that 항상 최신 정보를 본다.

**Acceptance Criteria:**
**Given** 환자 통합 화면을 보고 있을 때
**When** 누군가 그 환자의 정보를 추가/수정하면
**Then** 화면이 새로고침 없이 몇 초 내 자동 갱신된다 (FastAPI WebSocket 실시간) (NFR4)

---

## Epic 3: 환자 안전 지키기

위험한 순간을 앱이 미리 막아준다.

### Story 3.1: 알레르기/금기 경고 (FR4)
As a 병원 직원,
I want 위험한 약을 처방하려 할 때 경고를 받기를,
So that 알레르기 사고를 막는다.

**Acceptance Criteria:**
**Given** 환자에게 알레르기/금기 정보가 등록된 상태에서
**When** 충돌하는 약을 처방 입력하면
**Then** 빨간 경고 팝업이 떠서 "이 환자는 OO 알레르기입니다"라고 알린다
**And** 계속할지 한 번 더 확인을 요구한다

### Story 3.2: 안전 경고 배너 유지 (FR7)
As a 병원 직원,
I want 환자에게 위험 정보가 있으면 화면 맨 위에 계속 보이기를,
So that 누구도 놓치지 않는다.

**Acceptance Criteria:**
**Given** 환자에게 위험 정보가 있을 때
**When** 환자 통합 화면을 열면
**Then** 빨간 경고 배너가 화면 최상단에 표시된다
**And** 담당자가 "확인" 하기 전까지 사라지지 않는다

### Story 3.3: 투약 시간 알림 (FR5)
As a 병원 직원,
I want 정해진 투약 시간이 되면 알림을 받기를,
So that 제때 약을 준다.

**Acceptance Criteria:**
**Given** 환자에게 투약 시간이 설정된 상태에서
**When** 그 시간이 되면
**Then** 담당 직원에게 알림이 표시된다
**And** 투약 완료를 체크하면 알림이 정리된다

### Story 3.4: 필수 절차 체크리스트 (FR6)
As a 병원 직원,
I want 주요 절차 전에 필수 항목을 체크하기를,
So that 빠뜨리는 절차가 없다.

**Acceptance Criteria:**
**Given** 시술/검사 전 단계에서
**When** 필수 절차 체크리스트(본인확인·금식·동의서 등)를 보면
**Then** 모든 항목을 체크해야 "다음 단계로" 버튼이 활성화된다
**And** 하나라도 안 되어 있으면 버튼이 비활성(회색) 상태다

---

## Epic 4: 부서 협업 + 환자 흐름 추적

부서 간 정보가 자동으로 흐르고, 환자가 어느 단계인지 보인다.

### Story 4.1: 환자 단계 타임라인 (FR9)
As a 병원 직원,
I want 환자가 지금 어느 단계(접수→진료→검사→수납)인지 타임라인으로 보기를,
So that 진행 상황을 한눈에 안다.

**Acceptance Criteria:**
**Given** 환자에게 현재 단계 정보가 있을 때
**When** 환자 통합 화면을 열면
**Then** 점+선 타임라인으로 완료/현재/예정 단계가 구분되어 보인다 (UX 목업과 동일)

### Story 4.2: 부서 간 자동 전달 (FR8)
As a 병원 직원,
I want 한 부서가 입력·완료한 내용이 다음 부서 화면에 자동으로 나타나기를,
So that 전화·메모로 전달하지 않아도 된다.

**Acceptance Criteria:**
**Given** 한 부서(예: 간호)가 어떤 처리를 완료하면
**When** 다음 부서(예: 진료/약국) 직원이 그 환자를 보면
**Then** 다시 입력하지 않아도 전달된 내용이 자동으로 표시된다

### Story 4.3: 환자 흐름판 (전체 현황)
As a 병원 직원,
I want 모든 환자가 지금 어느 단계인지 한 화면에서 보기를,
So that 현장 전체 상황을 파악한다.

**Acceptance Criteria:**
**Given** 진행 중인 환자들이 있을 때
**When** 흐름판 화면을 열면
**Then** 환자별 현재 단계가 목록/보드 형태로 표시된다

### Story 4.4: 대기 초과 알림 (FR10)
As a 병원 직원,
I want 한 환자가 한 단계에서 너무 오래 멈춰 있으면 알림을 받기를,
So that 방치되는 환자가 없다.

**Acceptance Criteria:**
**Given** 환자가 한 단계에 머문 시간이
**When** 기준 시간(예: 30분)을 넘으면
**Then** 해당 환자가 흐름판에서 앰버색으로 강조되고 담당자에게 알림이 간다

---

## Epic 5: 관리자 페이지

관리자가 직원·권한·현황·기준값을 관리한다.

### Story 5.1: 관리자 역할 & 전용 진입
As a 병원 관리자,
I want 관리자만 들어갈 수 있는 별도 영역을,
So that 일반 직원은 관리 기능을 못 건드린다. (NFR2)

**Acceptance Criteria:**
**Given** 계정에 "관리자" 역할이 지정된 상태에서
**When** 관리자가 로그인하면
**Then** 관리자 페이지 메뉴가 보인다
**And** 일반 직원에게는 그 메뉴가 보이지 않고 접근도 차단된다

### Story 5.2: 직원 계정 관리 (FR11)
As a 병원 관리자,
I want 직원 계정을 등록·수정·삭제하고 직군을 지정하기를,
So that 누가 앱을 쓰는지 관리한다.

**Acceptance Criteria:**
**Given** 관리자 페이지에서
**When** 직원을 추가/수정/삭제하면
**Then** 변경된 직원 목록이 저장·반영된다
**And** 각 직원에 직군(의사/간호사/원무과 등)을 지정할 수 있다

### Story 5.3: 권한 설정 (FR12)
As a 병원 관리자,
I want 직원별로 볼 수 있는 정보 범위를 설정하기를,
So that 필요한 만큼만 접근하게 한다.

**Acceptance Criteria:**
**Given** 직원 목록에서
**When** 한 직원의 권한(접근 범위)을 설정하면
**Then** 그 직원이 로그인했을 때 설정된 범위만 보인다

### Story 5.4: 전체 현황 대시보드 (FR13)
As a 병원 관리자,
I want 오늘 환자 수·과별 혼잡도·평균 대기시간을 한눈에 보기를,
So that 병원 운영 상황을 파악한다.

**Acceptance Criteria:**
**Given** 환자·단계 데이터가 쌓인 상태에서
**When** 관리자가 현황 대시보드를 열면
**Then** 오늘 환자 수, 과별 혼잡도, 평균 대기시간이 숫자/그래프로 표시된다

### Story 5.5: 기준값 설정 (FR14)
As a 병원 관리자,
I want "대기 초과 알림 기준 시간" 같은 값을 직접 정하기를,
So that 우리 병원 상황에 맞게 조정한다.

**Acceptance Criteria:**
**Given** 관리자 설정 화면에서
**When** 기준값(예: 대기 초과 30분)을 변경·저장하면
**Then** 그 값이 실제 알림 동작(FR10)에 적용된다

---

## Epic 6: 모바일 앱 패키징

완성된 웹 화면을 Flutter WebView로 감싸 휴대폰 앱으로 만든다.

### Story 6.1: Flutter WebView로 모바일 앱 만들기 (NFR1)
As a 병원 직원,
I want 휴대폰에서 앱 형태로 이 서비스를 쓰기를,
So that 브라우저를 열지 않고 앱 아이콘으로 바로 들어간다.

**Acceptance Criteria:**
**Given** 웹 화면(Next.js)이 배포되어 주소가 있을 때
**When** Flutter WebView 앱으로 그 주소를 감싸 빌드하면
**Then** 휴대폰에서 앱으로 실행되어 웹 화면이 앱처럼 표시된다
**And** 로그인·환자 조회 등 핵심 기능이 모바일 앱 안에서 정상 동작한다
