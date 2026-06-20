"use client";

// 화면 문지기: 보호된 화면에 들어올 때 신분증(토큰)을 확인한다.
// - 토큰이 없으면 → 로그인 화면으로 보냄
// - 토큰이 있으면 → 백엔드(/api/auth/me)에 진짜 유효한지 물어보고, 통과해야만 본문을 보여줌
// - 만료/위조 토큰(401)·백엔드 연결 실패 → 토큰 삭제 후 로그인 화면으로
// ※ 진짜 보안 자물쇠는 백엔드(get_current_user)이고, 이 문지기는 화면 노출을 막는 보조 수단이다.

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { API_BASE } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";

// /api/auth/me 응답을 기다리는 최대 시간(ms). 이 시간을 넘기면 요청을 포기한다.
const ME_TIMEOUT_MS = 8000;

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  // checking: 확인 중(본문 숨김) / authed: 통과(본문 표시)
  const [status, setStatus] = useState<"checking" | "authed">("checking");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      // 신분증이 아예 없으면 바로 로그인 화면으로
      router.replace("/login");
      return;
    }

    // 컴포넌트가 사라진 뒤 늦게 도착한 응답을 무시하기 위한 표식
    let cancelled = false;
    // 응답이 너무 늦거나(타임아웃) 화면을 떠나면 요청 자체를 취소한다.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ME_TIMEOUT_MS);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (cancelled) return;

        if (res.ok) {
          setStatus("authed"); // 유효한 토큰 → 통과
        } else if (res.status === 401 || res.status === 403) {
          // 토큰이 실제로 무효(만료/위조) → 신분증 버리고 로그인 화면으로
          clearToken();
          router.replace("/login");
        } else {
          // 5xx 등 일시적 서버 오류: 유효한 토큰은 지우지 않고 안전하게 로그인 화면으로
          // (백엔드가 회복되면 그 토큰으로 다시 입장 가능)
          router.replace("/login");
        }
      } catch {
        // 네트워크 실패/타임아웃: 토큰은 유지한 채 안전하게 차단(로그인 화면으로)
        if (!cancelled) router.replace("/login");
      } finally {
        clearTimeout(timeout);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [router]);

  // 확인이 끝나기 전에는 본문(환자 정보 등)을 한 순간도 보여주지 않는다.
  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-base p-8">
        <p className="text-text-secondary" role="status">
          확인 중…
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
