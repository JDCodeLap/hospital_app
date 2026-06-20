// 로그인 토큰을 브라우저(localStorage)에 보관/조회/삭제하는 헬퍼.
// Story 1.4(로그인 보호·로그아웃)에서도 재사용한다.

const TOKEN_KEY = "hospital_token";

export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

// 보호된 백엔드 요청에 붙일 인증 헤더를 만든다.
// 토큰이 있으면 { Authorization: "Bearer <token>" }, 없으면 빈 객체.
export function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
