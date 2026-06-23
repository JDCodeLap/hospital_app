"use client";

// 앱 공통 틀(MedCore 참고): 모든 로그인 화면을 감싸는 뼈대.
// - 상단바: (폰)더보기 ☰ + 로고 + 알림 + 로그아웃 / (PC)로고 + 알림 + 로그아웃
// - PC(md 이상): 왼쪽 사이드 메뉴에 전체 메뉴를 펼쳐 둔다(공간 넉넉).
// - 폰: 하단 탭바 없이, 상단 ☰(더보기)를 눌러 여는 '서랍(drawer)'에 전체 메뉴를 모은다.
// 사용: 페이지에서 <AuthGuard><AppShell>...내용...</AppShell></AuthGuard>

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { API_BASE } from "@/lib/api";
import { authHeader } from "@/lib/auth";
import { Icon } from "@/components/Icon";
import { LogoutButton } from "@/components/LogoutButton";

// 메뉴 항목 한 곳에서 관리(PC 사이드 메뉴와 폰 ☰ 서랍이 같은 목록을 씀)
const NAV = [
  { href: "/", label: "대시보드", icon: "dashboard" },
  { href: "/patients", label: "환자", icon: "person_search" },
  { href: "/board", label: "흐름판", icon: "view_kanban" },
  { href: "/alerts", label: "알림", icon: "notifications" },
  { href: "/schema", label: "스키마", icon: "schema" },
];

// 관리자에게만 추가로 보이는 메뉴(Story 5.1)
const ADMIN_NAV = {
  href: "/admin",
  label: "관리자",
  icon: "admin_panel_settings",
};

// /api/auth/me 응답을 기다리는 최대 시간(ms). 넘기면 요청 포기(AuthGuard/AdminGuard와 동일).
const ME_TIMEOUT_MS = 8000;

export function AppShell({
  children,
  wide = false, // true면 본문을 넓게(스키마 ERD처럼 가로 공간이 필요한 화면)
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  const pathname = usePathname();
  // 폰 더보기 서랍 열림 여부
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  // 전체 메뉴(관리자면 끝에 관리자 메뉴 추가) — PC 사이드 메뉴와 폰 ☰ 서랍이 함께 쓴다.
  const nav = role === "admin" ? [...NAV, ADMIN_NAV] : NAV;

  // 현재 화면이 그 메뉴인지(홈은 정확히 "/", 나머지는 시작 일치)
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // 화면(주소)이 바뀌면 서랍은 닫는다 — 메뉴를 골라 이동했는데 서랍이 남아 있지 않게.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // 서랍이 열려 있는 동안 Esc로 닫기 + 뒤 배경 스크롤 잠금(서랍에 집중)
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      {/* ── 상단바 ───────────────────────────── */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border-subtle bg-bg-surface px-4 md:px-6">
        <div className="flex items-center gap-1">
          {/* 더보기 ☰ (폰 전용) — 전체 메뉴가 든 서랍을 연다. PC는 사이드 메뉴가 있어 숨김. */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="메뉴 열기"
            aria-expanded={drawerOpen}
            className="flex h-11 w-11 items-center justify-center rounded-full text-text-secondary hover:bg-bg-elevated hover:text-text-primary md:hidden"
          >
            <Icon name="menu" className="text-xl" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Icon name="health_and_safety" fill className="text-2xl text-accent-primary" />
            <span className="text-lg font-bold tracking-tight text-accent-primary">
              병원 안전관리
            </span>
          </Link>
        </div>
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
        {/* ── PC 사이드 메뉴 ─────────────────── (전체 메뉴 펼침) */}
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

        {/* ── 본문 ───────────────────────────── (하단 바가 없으므로 아래 여백 일반값) */}
        <main
          key={pathname} // 화면(주소)이 바뀔 때마다 본문을 다시 그려 fade-in을 재생
          className={
            "page-fade-in mx-auto w-full flex-1 p-4 md:p-6 " +
            (wide ? "max-w-none" : "max-w-5xl")
          }
        >
          {children}
        </main>
      </div>

      {/* ── 폰 더보기 서랍(전체 메뉴) ───────── 열렸을 때만 그림 */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="메뉴"
        >
          {/* 어두운 배경 — 누르면 닫힘 */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          {/* 왼쪽에서 슬라이드되는 패널 */}
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col gap-1 border-r border-border-subtle bg-bg-surface p-3 shadow-xl">
            <div className="mb-1 flex items-center justify-between px-1 py-1">
              <span className="text-sm font-semibold text-text-secondary">메뉴</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="메뉴 닫기"
                className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
              >
                <Icon name="close" className="text-xl" />
              </button>
            </div>
            {nav.map((n) => {
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setDrawerOpen(false)} // 메뉴 고르면 서랍 닫힘
                  className={
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors " +
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
          </div>
        </div>
      )}
    </div>
  );
}
