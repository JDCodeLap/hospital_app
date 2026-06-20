// 백엔드(FastAPI) 호출의 기본 주소를 한 곳에서 관리한다.
// 환경변수(NEXT_PUBLIC_API_BASE_URL)가 있으면 그걸 쓰고, 없으면 로컬 개발 주소로 폴백.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

// WebSocket(실시간) 주소 — API_BASE의 http→ws / https→wss 로 바꾼 것.
// 예: http://localhost:8000 → ws://localhost:8000 (Story 2.4 실시간 구독에 사용)
export const WS_BASE = API_BASE.replace(/^http/, "ws");
