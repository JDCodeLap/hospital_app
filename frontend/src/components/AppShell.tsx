"use client";

// 앱 공통 틀(MedCore 참고): 모든 로그인 화면을 감싸는 뼈대.
// - 상단바: 로고 + 알림 아이콘 + 로그아웃 (항상 위에 고정)
// - PC(md 이상): 왼쪽 사이드 메뉴(대시보드/환자/알림)
// - 폰: 화면 하단 탭바(대시보드/환자/알림)
// 사용: 페이지에서 <AuthGuard><AppShell>...내용...</AppShell></AuthGuard>

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { API_BASE } from "@/lib/api";
import { authHeader } from "@/lib/auth";
import { Icon } from "@/components/Icon";
import { LogoutButton } from "@/components/LogoutButton";

// 메뉴 항목 한 곳에서 관리(상단/사이드/하단 탭이 같은 목록을 씀)
const NAV = [
  { href: "/", label: "대시보드", icon: "dashboard" },
  { href: "/patients", label: "환자", icon: "person_search" },
  { href: "/board", label: "흐름판", icon: "view_kanban" },
  { href: "/alerts", label: "알림", icon: "notifications" },
];

// 관리자에게만 추가로 보이는 메뉴(Story 5.1)
const ADMIN_NAV = {
  href: "/admin",
  label: "관리자",
  icon: "admin_panel_settings",
};

// /api/auth/me 응답을 기다리는 최대 시간(ms). 넘기면 요청 포기(AuthGuard/AdminGuard와 동일).
const ME_TIMEOUT_MS = 8000;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // 현재 직원의 역할(/api/auth/me) — admin이면 관리자 메뉴를 추가로 보인다.
  // 실패/미확정 시 null → 메뉴 숨김(안전 기본값). 진짜 차단은 백엔드 get_current_admin.
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ME_TIMEOUT_MS);
    void (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { ...authHeader() },
          signal: controller.signal,
        });
        if (!cancelled && res.ok) {
          const data: { role?: string } = await res.json();
          setRole(data?.role ?? null);
        }
      } catch {
        // 실패/타임아웃 시 관리자 메뉴 숨김(기본값 유지)
      } finally {
        clearTimeout(timeout);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  // 관리자면 NAV 끝에 관리자 메뉴를 더한 목록을 쓴다(상수 NAV는 보존)
  const nav = role === "admin" ? [...NAV, ADMIN_NAV] : NAV;

  // 현재 화면이 그 메뉴인지(홈은 정확히 "/", 나머지는 시작 일치)
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      {/* ── 상단바 ───────────────────────────── */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border-subtle bg-bg-surface px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Icon name="health_and_safety" fill className="text-2xl text-accent-primary" />
          <span className="text-lg font-bold tracking-tight text-accent-primary">
            병원 안전관리
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/alerts"
            aria-label="투약 알림"
            className="flex h-11 w-11 items-center justify-center rounded-full text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            <Icon name="notifications" className="text-xl" />
          </Link>
          <LogoutButton />
        </div>
      </header>

      <div className="flex">
        {/* ── PC 사이드 메뉴 ─────────────────── */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col gap-1 border-r border-border-subtle bg-bg-surface p-3 md:flex">
          {nav.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors " +
                  (active
                    ? "bg-accent-primary/10 font-semibold text-accent-primary"
                    : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary")
                }
              >
                <Icon name={n.icon} fill={active} className="text-xl" />
                {n.label}
              </Link>
            );
          })}
        </aside>

        {/* ── 본문 ───────────────────────────── */}
        <main className="mx-auto w-full max-w-5xl flex-1 p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </main>
      </div>

      {/* ── 폰 하단 탭바 ───────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border-subtle bg-bg-surface md:hidden">
        {nav.map((n) => {
          const active = isActive(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={
                "flex flex-1 flex-col items-center gap-0.5 " +
                (active ? "font-semibold text-accent-primary" : "text-text-secondary")
              }
            >
              <Icon name={n.icon} fill={active} className="text-2xl" />
              <span className="text-[11px]">{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
