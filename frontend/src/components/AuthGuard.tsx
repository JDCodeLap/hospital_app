"use client";

// 화면 문지기: 보호된 화면에 들어올 때 신분증(토큰)을 확인한다.
// - 토큰이 없으면 → 로그인 화면으로 보냄
// - 토큰이 있으면 → 백엔드(/api/auth/me)에 진짜 유효한지 물어보고, 통과해야만 본문을 보여줌
// - 만료/위조 토큰(401)·백엔드 연결 실패 → 토큰 삭제 후 로그인 화면으로
// ※ 진짜 보안 자물쇠는 백엔드(get_current_user)이고, 이 문지기는 화면 노출을 막는 보조 수단이다.

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Spinner } from "@/components/Spinner";
import { fetchMe, getCachedMe, getToken } from "@/lib/auth";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  // checking: 확인 중(본문 숨김) / authed: 통과(본문 표시)
  // ★ 화면 이동 속도의 핵심: 직전에 확인해둔 결과(캐시)가 아직 살아 있으면
  //   "확인 중…" 스피너를 건너뛰고 처음부터 통과 상태로 시작한다(=출입증 도장).
  //   캐시가 없을 때만 스피너를 보이며 백엔드에 묻는다.
  const [status, setStatus] = useState<"checking" | "authed">(() =>
    getCachedMe() ? "authed" : "checking",
  );

  useEffect(() => {
    const token = getToken();
    if (!token) {
      // 신분증이 아예 없으면 바로 로그인 화면으로
      router.replace("/login");
      return;
    }

    // 컴포넌트가 사라진 뒤 늦게 도착한 응답을 무시하기 위한 표식
    let cancelled = false;

    // 신분증 확인(공유 캐시 사용) — 같은 토큰이면 네트워크 요청은 1번만 나간다.
    // 캐시가 살아 있으면 즉시 반환되므로, 화면 이동 시 거의 깜빡임이 없다.
    void (async () => {
      try {
        await fetchMe();
        if (!cancelled) setStatus("authed"); // 유효한 토큰 → 통과
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

  // 확인이 끝나기 전에는 본문(환자 정보 등)을 한 순간도 보여주지 않는다.
  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-base p-8">
        <Spinner label="확인 중…" />
      </main>
    );
  }

  return <>{children}</>;
}
