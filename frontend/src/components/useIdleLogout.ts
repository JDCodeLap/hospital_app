"use client";

// 모바일 앱(WebView) 전용 "미사용(idle) 자동 로그아웃" 감시 훅 (Epic 6 보안 정책).
//
// 역할: 모바일에서 마지막 사용 후 일정 시간(auth.ts의 IDLE_LIMIT_MS, 기본 30분)이
//       지나면 토큰을 비우고 로그인 화면으로 보낸다.
// - 웹(PC 브라우저)에서는 isNativeApp()이 false라 아무것도 하지 않는다(기존 동작 그대로).
// - 모든 보호 화면이 공통으로 감싸는 AppShell에서 1회 호출한다 → 앱 전체에 적용.
//
// 검사 시점(셋 다):
//   1) 마운트 직후 — 콜드 스타트 직후나 화면 진입 시 이미 만료됐는지 확인.
//   2) 주기 검사(30초마다) — 앱을 켜둔 채 손대지 않아도 만료되면 내보낸다.
//   3) 다시 보일 때(visibilitychange) — 백그라운드에 오래 있다 돌아온 경우 즉시 확인.
// 사용자가 화면을 만지면(pointerdown/keydown) "방금 활동"으로 기록해 타이머를 늦춘다.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { clearToken, isIdleExpired, isNativeApp, touchActivity } from "@/lib/auth";

// 주기 검사 간격(ms). 너무 잦으면 낭비, 너무 뜸하면 만료 반응이 늦다.
const CHECK_INTERVAL_MS = 30 * 1000;
// 활동 기록을 너무 자주 쓰지 않도록 하는 최소 간격(ms).
const TOUCH_THROTTLE_MS = 10 * 1000;

export function useIdleLogout(): void {
  const router = useRouter();

  useEffect(() => {
    // 모바일 앱이 아니면 idle 정책을 적용하지 않는다(웹은 기존대로 로그인 유지).
    if (!isNativeApp()) return;

    // 만료됐으면 토큰을 비우고 로그인 화면으로. (이미 처리됐으면 중복 이동 방지)
    const enforce = (): boolean => {
      if (isIdleExpired()) {
        clearToken();
        router.replace("/login");
        return true;
      }
      return false;
    };

    // 마운트 직후 한 번 검사.
    if (enforce()) return;

    // 활동 기록(쓰로틀): 사용자가 만지면 마지막 활동 시각을 갱신.
    let lastTouch = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastTouch < TOUCH_THROTTLE_MS) return;
      lastTouch = now;
      touchActivity(now);
    };

    // 화면이 다시 보일 때: 먼저 만료 검사, 통과하면 활동으로 기록.
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (enforce()) return;
      touchActivity();
    };

    const timer = setInterval(() => void enforce(), CHECK_INTERVAL_MS);
    window.addEventListener("pointerdown", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(timer);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);
}
