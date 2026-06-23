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

import { fetchMe, getCachedMe, getToken } from "@/lib/auth";
import { Spinner } from "@/components/Spinner";

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  // checking: 확인 중(본문 숨김) / authed: 관리자 통과(본문 표시)
  // ★ 직전에 확인해둔 결과(캐시)가 관리자면 스피너를 건너뛰고 바로 통과 상태로 시작한다.
  const [status, setStatus] = useState<"checking" | "authed">(() =>
    getCachedMe()?.role === "admin" ? "authed" : "checking",
  );

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    // 신분증 확인(공유 캐시 사용) — 문지기·메뉴바와 같은 결과를 쓰며 요청은 1번만 나간다.
    void (async () => {
      try {
        const me = await fetchMe();
        if (cancelled) return;
        if (me?.role !== "admin") {
          // 로그인은 됐지만 관리자가 아님 → 일반 직원: 홈으로 차단(권한 없음)
          router.replace("/");
          return;
        }
        setStatus("authed"); // 관리자 확인 → 통과
      } catch {
        // 토큰 무효(401/403)·네트워크 실패·타임아웃 → 안전하게 로그인 화면으로
        // (401/403이면 fetchMe 내부에서 토큰·캐시를 이미 비웠다)
        if (!cancelled) router.replace("/login");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // 확인 전에는 본문(관리자 화면)을 한 순간도 노출하지 않는다.
  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-base p-8">
        <Spinner label="확인 중…" />
      </main>
    );
  }

  return <>{children}</>;
}
