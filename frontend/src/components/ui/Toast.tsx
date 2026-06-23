"use client";

// 토스트 알림: 화면 아래에 잠깐 떴다 사라지는 "저장됐어요 ✓" 같은 피드백 메시지.
// 사용법: 최상단을 <ToastProvider>로 감싸고, 컴포넌트에서 const toast = useToast(); toast.success("저장됐어요");
// 왜? 버튼을 눌렀을 때 "처리됐다"는 확실한 신호를 줘서 중복 클릭·불안을 줄인다(병원 업무에서 중요).

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Icon } from "@/components/Icon";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; message: string };

type ToastApi = {
  show: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

// 종류별 색/아이콘 — 디자인 토큰(success/danger/info)을 그대로 사용해 테마 자동 반영
const KIND_STYLE: Record<ToastKind, { cls: string; icon: string }> = {
  success: { cls: "border-success/40 bg-success/15 text-success", icon: "check_circle" },
  error: { cls: "border-danger/40 bg-danger/15 text-danger", icon: "error" },
  info: { cls: "border-info/40 bg-info/15 text-info", icon: "info" },
};

const VISIBLE_MS = 3000; // 3초 후 자동으로 사라짐

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const show = useCallback((message: string, kind: ToastKind = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, kind, message }]);
    // 잠시 후 자동 제거(브라우저 타이머)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, VISIBLE_MS);
  }, []);

  const api: ToastApi = {
    show,
    success: (m) => show(m, "success"),
    error: (m) => show(m, "error"),
    info: (m) => show(m, "info"),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* 화면 아래 가운데에 쌓이는 토스트들 — 클릭은 통과시켜 본문 조작 방해 안 함 */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => {
          const s = KIND_STYLE[t.kind];
          return (
            <div
              key={t.id}
              role="status"
              aria-live="polite"
              className={
                "page-fade-in pointer-events-auto flex max-w-md items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur " +
                s.cls
              }
            >
              <Icon name={s.icon} className="text-lg" />
              <span className="text-text-primary">{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// 어디서든 토스트를 띄우는 훅. Provider 밖에서 쓰면 에러로 알려준다(연결 누락 방지).
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast는 <ToastProvider> 안에서만 사용할 수 있습니다.");
  return ctx;
}
