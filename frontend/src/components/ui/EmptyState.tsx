// 빈 화면 안내: 목록이 비었을 때 "텅 빈 화면"이 고장처럼 보이지 않게,
// 아이콘 + 설명 + (선택)다음 행동 버튼으로 친절하게 안내한다.

import type { ReactNode } from "react";
import Link from "next/link";

import { Icon } from "@/components/Icon";

export function EmptyState({
  icon = "inbox",
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-elevated text-text-muted">
        <Icon name={icon} className="text-2xl" />
      </span>
      <p className="font-bold text-text-primary">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex h-11 items-center gap-1.5 rounded-lg bg-accent-primary px-4 text-sm font-semibold text-accent-on transition-colors hover:bg-accent-hover"
        >
          <Icon name="add" className="text-lg" />
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
