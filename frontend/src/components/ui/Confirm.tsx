"use client";

// 확인 대화상자: "정말 삭제할까요?"처럼 되돌리기 힘든 행동 전에 한 번 더 묻는 창.
// 사용법: const confirm = useConfirm(); if (await confirm({ title: "삭제할까요?", danger: true })) { ...삭제... }
// 왜? 바쁜 병원에서 실수 클릭 한 번이 사고로 이어지지 않게 한 박자 멈춤을 준다(안전장치).

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { Icon } from "@/components/Icon";

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean; // true면 확인 버튼을 빨강(위험 행동)으로
};

type PendingState = {
  opts: ConfirmOptions;
  resolve: (ok: boolean) => void;
};

const ConfirmContext = createContext<((opts: ConfirmOptions) => Promise<boolean>) | null>(
  null,
);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingState | null>(null);

  // confirm(...)을 부르면 창을 띄우고, 사용자가 누를 때까지 기다리는 약속(Promise)을 돌려준다.
  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setPending({ opts, resolve })),
    [],
  );

  const close = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* 어두운 배경 — 누르면 취소 */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => close(false)}
          />
          {/* 카드 */}
          <div className="page-fade-in relative w-full max-w-sm rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <span
                className={
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full " +
                  (pending.opts.danger
                    ? "bg-danger/15 text-danger"
                    : "bg-accent-primary/10 text-accent-primary")
                }
              >
                <Icon name={pending.opts.danger ? "warning" : "help"} className="text-xl" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-text-primary">
                  {pending.opts.title}
                </h2>
                {pending.opts.message && (
                  <p className="mt-1 text-sm text-text-secondary">
                    {pending.opts.message}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => close(false)}
                className="h-11 flex-1 rounded-lg border border-border-subtle px-4 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
              >
                {pending.opts.cancelText ?? "취소"}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => close(true)}
                className={
                  "h-11 flex-1 rounded-lg px-4 text-sm font-semibold text-accent-on transition-colors " +
                  (pending.opts.danger
                    ? "bg-danger hover:bg-danger/90"
                    : "bg-accent-primary hover:bg-accent-hover")
                }
              >
                {pending.opts.confirmText ?? "확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

// 어디서든 확인창을 띄우는 훅. true(확인)/false(취소)를 await로 받는다.
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm은 <ConfirmProvider> 안에서만 사용할 수 있습니다.");
  return ctx;
}
