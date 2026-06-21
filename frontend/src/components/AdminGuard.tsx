"use client";

// 관리자 화면 문지기 (Story 5.1, NFR2) — AuthGuard를 본떠 'admin 역할'까지 확인한다.
// - 토큰 없음 → /login
// - /api/auth/me 401/403(무효 토큰) → 토큰 삭제 후 /login
// - 5xx/네트워크 실패 → 토큰 유지한 채 안전하게 /login(백엔드 회복 시 재입장)
// - 200인데 role !== "admin"(일반 직원) → 홈(/)으로 돌려보냄(접근 차단)
// - 200 + admin → 통과
// ※ 진짜 자물쇠는 백엔드(get_current_admin, /api/admin/* 403). 이 문지기는 화면 노출 차단 보조.
//   AuthGuard는 그대로 두고(회귀 방지) 관리자 화면 전용으로 별도 신설.

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { API_BASE } from "@/lib/api";
import { authHeader, clearToken, getToken } from "@/lib/auth";

// /api/auth/me 응답을 기다리는 최대 시간(ms). 넘기면 요청 포기(AuthGuard와 동일).
const ME_TIMEOUT_MS = 8000;

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  // checking: 확인 중(본문 숨김) / authed: 관리자 통과(본문 표시)
  const [status, setStatus] = useState<"checking" | "authed">("checking");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ME_TIMEOUT_MS);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { ...authHeader() },
          signal: controller.signal,
        });
        if (cancelled) return;

        if (res.status === 401 || res.status === 403) {
          // 무효 토큰 → 신분증 버리고 로그인 화면으로
          clearToken();
          router.replace("/login");
          return;
        }
        if (!res.ok) {
          // 5xx 등 일시 오류: 토큰은 유지, 안전하게 로그인 화면으로
          router.replace("/login");
          return;
        }
        const data: { role?: string } = await res.json();
        if (cancelled) return;
        if (data?.role !== "admin") {
          // 로그인은 됐지만 관리자가 아님 → 일반 직원: 홈으로 차단(권한 없음)
          router.replace("/");
          return;
        }
        setStatus("authed"); // 관리자 확인 → 통과
      } catch {
        // 네트워크 실패/타임아웃: 토큰 유지한 채 안전하게 차단
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

  // 확인 전에는 본문(관리자 화면)을 한 순간도 노출하지 않는다.
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
