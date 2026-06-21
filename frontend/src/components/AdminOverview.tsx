"use client";

// 관리자 페이지 랜딩 본문 (Story 5.1) — 최소 요약 + 앞으로 추가될 기능 안내(준비 중).
// - GET /api/admin/overview(관리자 보호)를 호출해 전체 직원 수·환자 수를 보여준다.
//   (게이트 증명 + 최소 콘텐츠. 본격 현황 대시보드=5.4)
// - 준비 중 카드 4개: 직원 관리(5.2)·권한 설정(5.3)·전체 현황(5.4)·기준값 설정(5.5) = 비활성.
// - 데이터는 AdminGuard 통과 후 여기(클라이언트)에서 토큰 달아 호출(RSC 프리렌더 금지, 1.4).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { API_BASE } from "@/lib/api";
import { authHeader, clearToken } from "@/lib/auth";
import { Icon } from "@/components/Icon";

type Overview = { staff_count: number; patient_count: number };

// 사용 가능한 관리 기능(활성 — 클릭하면 해당 화면으로)
const ADMIN_FEATURES = [
  {
    icon: "group",
    title: "직원 계정 관리",
    desc: "직원 등록·수정·삭제와 직군 지정",
    href: "/admin/staff", // Story 5.2 완료 — 활성
  },
];

// 앞으로 추가될 관리 기능(준비 중 자리표시)
const COMING_SOON = [
  { icon: "lock", title: "권한 설정", desc: "직원별 볼 수 있는 정보 범위 설정 (5.3)" },
  { icon: "monitoring", title: "전체 현황", desc: "오늘 환자 수·과별 혼잡도·평균 대기시간 (5.4)" },
  { icon: "tune", title: "기준값 설정", desc: "대기 초과 알림 기준 시간 등 (5.5)" },
];

export function AdminOverview() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/admin/overview`, {
          headers: { ...authHeader() },
          signal: controller.signal,
        });
        if (cancelled) return;
        if (res.status === 401 || res.status === 403) {
          // AdminGuard가 이미 막지만 방어적으로 처리(세션 만료 등)
          clearToken();
          router.replace("/login");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Overview = await res.json();
        if (cancelled) return;
        setOverview(data);
        setError(null);
      } catch (err: unknown) {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("요약 정보를 불러올 수 없습니다. 백엔드 서버가 켜져 있는지 확인하세요.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [router]);

  return (
    <>
      {/* 요약 숫자 (직원·환자 수) */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon="badge"
          label="전체 직원"
          value={loading ? "…" : error ? "—" : `${overview?.staff_count ?? 0}명`}
        />
        <StatCard
          icon="groups"
          label="전체 환자"
          value={loading ? "…" : error ? "—" : `${overview?.patient_count ?? 0}명`}
        />
      </div>

      {error && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {/* 사용 가능한 관리 기능(활성 — 클릭 가능) */}
      <h2 className="mt-8 mb-3 text-sm font-semibold text-text-secondary">
        관리 기능
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ADMIN_FEATURES.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="flex items-start gap-4 rounded-xl border border-border-subtle bg-bg-surface p-5 transition-colors hover:border-accent-primary hover:bg-bg-elevated"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-primary/10 text-accent-primary">
              <Icon name={c.icon} className="text-2xl" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-semibold text-text-primary">
                {c.title}
                <Icon name="chevron_right" className="text-lg text-text-muted" />
              </div>
              <p className="mt-1 text-sm text-text-secondary">{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* 준비 중 기능 카드 */}
      <h2 className="mt-8 mb-3 text-sm font-semibold text-text-secondary">
        준비 중
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {COMING_SOON.map((c) => (
          <div
            key={c.title}
            aria-disabled="true"
            className="flex items-start gap-4 rounded-xl border border-border-subtle bg-bg-surface p-5 opacity-60"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-bg-elevated text-text-muted">
              <Icon name={c.icon} className="text-2xl" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-semibold text-text-primary">
                {c.title}
                <span className="rounded-full bg-bg-elevated px-2 py-0.5 text-caption font-medium text-text-muted">
                  곧 추가
                </span>
              </div>
              <p className="mt-1 text-sm text-text-secondary">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// 요약 숫자 카드 한 장
function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-surface p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-primary/10 text-accent-primary">
        <Icon name={icon} className="text-2xl" />
      </span>
      <div>
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="text-xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
}
