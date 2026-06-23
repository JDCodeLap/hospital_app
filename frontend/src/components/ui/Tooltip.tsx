// 툴팁: 아이콘 버튼에 마우스를 올리면(PC) 작은 설명이 뜨게 한다.
// 휴대폰은 '올려두기(hover)'가 없어 안 뜨지만, 방해도 없으므로 그대로 둬도 안전하다.
// CSS group-hover 방식이라 가볍다(자바스크립트 동작 없음).

import type { ReactNode } from "react";

export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode; // 감쌀 대상(보통 아이콘 버튼)
}) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-border-subtle bg-bg-elevated px-2 py-1 text-xs font-medium text-text-primary opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
