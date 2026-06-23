// 상태 뱃지: 상태를 색깔 알약 모양으로 한눈에 보여준다(예: 대기/진행/완료, 위험).
// 글자를 읽기 전에 '색'만 봐도 상황 파악이 되도록 — 빠른 판단이 필요한 병원 화면에 유용.

import type { ReactNode } from "react";

import { Icon } from "@/components/Icon";

export type BadgeTone = "gray" | "green" | "blue" | "amber" | "red";

const TONE: Record<BadgeTone, string> = {
  gray: "border-border-subtle bg-bg-elevated text-text-secondary",
  green: "border-success/40 bg-success/15 text-success",
  blue: "border-info/40 bg-info/15 text-info",
  amber: "border-warning/40 bg-warning/15 text-warning",
  red: "border-danger/40 bg-danger/15 text-danger",
};

export function Badge({
  tone = "gray",
  icon,
  children,
}: {
  tone?: BadgeTone;
  icon?: string; // Material Symbols 아이콘 이름(선택)
  children: ReactNode;
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold " +
        TONE[tone]
      }
    >
      {icon && <Icon name={icon} className="text-sm" />}
      {children}
    </span>
  );
}
