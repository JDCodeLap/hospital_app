"use client";

// 앱 전역 공급자 묶음 — 토스트·확인창처럼 "어느 화면에서나 쓰는" 기능을 최상단에서 한 번 감싼다.
// layout.tsx(서버 컴포넌트)에서 <Providers>{children}</Providers>로 본문 전체를 감싸 사용.

import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui/Toast";
import { ConfirmProvider } from "@/components/ui/Confirm";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </ToastProvider>
  );
}
