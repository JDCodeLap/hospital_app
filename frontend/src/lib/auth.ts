// 로그인 토큰을 브라우저(localStorage)에 보관/조회/삭제하는 헬퍼.
// Story 1.4(로그인 보호·로그아웃)에서도 재사용한다.

import { API_BASE } from "@/lib/api";

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
  clearMeCache(); // 토큰을 버리면 기억해둔 신분증 확인 결과도 함께 비운다.
}

// 보호된 백엔드 요청에 붙일 인증 헤더를 만든다.
// 토큰이 있으면 { Authorization: "Bearer <token>" }, 없으면 빈 객체.
export function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─────────────────────────────────────────────────────────────
// "신분증 확인(/api/auth/me)" 결과를 잠깐 기억해두는 캐시.
//
// 왜? 화면을 넘길 때마다 문지기(AuthGuard)·메뉴바(AppShell)가 각각
// /api/auth/me 를 다시 물어보면, 그 답이 올 때까지 화면이 "확인 중…"으로
// 멈춰 화면 이동이 느리게 느껴진다. 그래서 한 번 확인한 결과를 메모리에
// 잠깐 보관해두고, 다음 이동부터는 그걸 바로 재사용한다(=출입증 도장).
//
// - 캐시는 "토큰별"로 구분한다(다른 사람으로 로그인하면 새로 확인).
// - 잠깐(TTL) 동안만 유효 → 만료되면 다음 호출 때 백엔드에 다시 확인.
// - 진짜 보안은 백엔드가 매 요청 토큰을 검사하므로, 이 캐시는 화면 표시용 보조 수단일 뿐.
// ─────────────────────────────────────────────────────────────

// 로그인한 직원 정보(필요한 만큼만). role이 "admin"이면 관리자 메뉴를 보인다.
export type Me = { role?: string };

// 캐시를 신뢰하는 시간(ms). 이 시간이 지나면 다음 호출 때 백엔드에 다시 확인한다.
const ME_CACHE_TTL_MS = 60_000; // 1분
// /api/auth/me 응답을 기다리는 최대 시간(ms). 넘기면 요청을 포기한다.
const ME_TIMEOUT_MS = 8000;

// 메모리 캐시: 어떤 토큰으로, 언제 확인했고, 결과가 무엇이었는지.
let meCache: { token: string; at: number; me: Me } | null = null;
// 동시에 여러 곳(문지기·메뉴바)이 호출해도 네트워크 요청은 1번만 나가도록 공유하는 진행 중 약속.
let mePending: { token: string; promise: Promise<Me> } | null = null;

// 캐시가 지금 토큰 기준으로 아직 유효하면 즉시 그 결과를 돌려준다(네트워크 안 탐). 아니면 null.
export function getCachedMe(now: number = Date.now()): Me | null {
  const token = getToken();
  if (!token || !meCache) return null;
  if (meCache.token !== token) return null; // 다른 사람으로 바뀌었으면 무효
  if (now - meCache.at > ME_CACHE_TTL_MS) return null; // 너무 오래됐으면 무효
  return meCache.me;
}

// 신분증을 확인한다. 유효한 캐시가 있으면 그걸 쓰고(=즉시),
// 없으면 백엔드(/api/auth/me)에 1번만 물어보고 결과를 캐시에 저장한다.
// - 성공: Me 반환 + 캐시 갱신
// - 토큰 무효(401/403): 토큰·캐시를 비우고 예외를 던진다(호출부가 로그인 화면으로 보냄)
// - 그 외 오류/타임아웃: 예외를 던진다(캐시·토큰은 유지)
export async function fetchMe(opts?: { force?: boolean }): Promise<Me> {
  const token = getToken();
  if (!token) throw new Error("no-token");

  // 1) 유효한 캐시가 있으면 즉시 반환(강제 갱신이 아니면).
  if (!opts?.force) {
    const cached = getCachedMe();
    if (cached) return cached;
    // 2) 이미 같은 토큰으로 요청이 날아가는 중이면 그 약속을 같이 기다린다(중복 호출 방지).
    if (mePending && mePending.token === token) return mePending.promise;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ME_TIMEOUT_MS);

  const promise = (async (): Promise<Me> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      if (res.ok) {
        const me: Me = await res.json();
        meCache = { token, at: Date.now(), me }; // 성공 → 결과 기억
        return me;
      }
      if (res.status === 401 || res.status === 403) {
        // 토큰이 진짜로 무효 → 신분증·기억 모두 폐기(호출부가 로그인 화면으로 보냄)
        clearToken();
        meCache = null;
        throw new Error("unauthorized");
      }
      // 5xx 등 일시적 서버 오류: 토큰은 유지(서버 회복 시 재입장 가능)
      throw new Error(`me-failed-${res.status}`);
    } finally {
      clearTimeout(timeout);
      if (mePending?.token === token) mePending = null;
    }
  })();

  mePending = { token, promise };
  return promise;
}

// 로그아웃·토큰 변경 시 기억을 비운다(다음 사람이 이전 사람 결과를 쓰지 않도록).
export function clearMeCache(): void {
  meCache = null;
  mePending = null;
}
