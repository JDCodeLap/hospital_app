"use client";

// 전체 현황 대시보드 본문 (Story 5.4, FR13) — 관리자 전용.
// - GET /api/admin/dashboard(관리자 보호)를 호출해 요약 숫자 + 단계별 혼잡도를 보여준다.
// - '혼잡도'는 진행 단계(접수/진료/검사/수납) 기준. 그래프는 CSS 막대(차트 라이브러리 0).
// - 읽기 전용(기준값 수정=5.5). RSC 프리렌더 금지(1.4): AdminGuard 통과 후 클라이언트 fetch.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { API_BASE } from "@/lib/api";
import { authHeader, clearToken } from "@/lib/auth";
import { Icon } from "@/components/Icon";

type StageCount = { stage: string; count: number };
type Dashboard = {
  patient_count: number;
  staff_count: number;
  today_patient_count: number;
  stage_distribution: StageCount[];
  avg_wait_minutes: number;
  overdue_count: number;
  overdue_threshold_minutes: number;
};

export function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 새로고침 이중 클릭 방지(3.1/5.2 패턴)
  const busyRef = useRef(false);

  async function load(signal?: AbortSignal) {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
        headers: { ...authHeader() },
        signal,
      });
      if (res.status === 401 || res.status === 403) {
        // AdminGuard가 이미 막지만 방어적으로(세션 만료 등) → 로그아웃
        clearToken();
        router.replace("/login");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: Dashboard = await res.json();
      setData(json);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("현황을 불러올 수 없습니다. 백엔드 서버가 켜져 있는지 확인하세요.");
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    // effect 본문에서 setState 직접 호출 회피(2.4/4.3 교훈) — async 콜백으로 감쌈
    void (async () => {
      await load(controller.signal);
    })();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 막대 최대값(0 나눗셈 방지로 최소 1)
  const maxCount = Math.max(
    1,
    ...(data?.stage_distribution.map((s) => s.count) ?? [0]),
  );

  return (
    <div>
      {/* 상단: 새로고침 */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          {loading ? "불러오는 중…" : "현재 기준 집계"}
        </p>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="flex h-11 items-center gap-2 rounded-lg border border-border-subtle px-4 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated disabled:opacity-50"
        >
          <Icon name="refresh" className="text-lg" />
          새로고침
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-3 text-sm text-danger">
          {error}
        </p>
      )}

      {/* 요약 숫자 카드 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon="today"
          label="오늘 방문 환자"
          value={loading || error ? "—" : `${data?.today_patient_count ?? 0}명`}
        />
        <StatCard
          icon="groups"
          label="전체 환자"
          value={loading || error ? "—" : `${data?.patient_count ?? 0}명`}
        />
        <StatCard
          icon="schedule"
          label="평균 대기시간"
          value={loading || error ? "—" : `${data?.avg_wait_minutes ?? 0}분`}
        />
        <StatCard
          icon="warning"
          label={`대기 초과 (${data?.overdue_threshold_minutes ?? 30}분↑)`}
          value={loading || error ? "—" : `${data?.overdue_count ?? 0}명`}
          danger={!!data && data.overdue_count > 0}
        />
      </div>

      {/* 단계별 혼잡도 (CSS 막대) */}
      <h2 className="mt-8 mb-3 text-sm font-semibold text-text-secondary">
        단계별 혼잡도
      </h2>
      <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
        {loading ? (
          <p className="text-sm text-text-muted">불러오는 중…</p>
        ) : error ? (
          <p className="text-sm text-text-muted">표시할 수 없습니다.</p>
        ) : (data?.stage_distribution.length ?? 0) === 0 ? (
          <p className="text-sm text-text-muted">표시할 단계가 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {data!.stage_distribution.map((s) => (
              <div key={s.stage} className="flex items-center gap-3">
                <span className="w-12 shrink-0 text-sm text-text-secondary">
                  {s.stage}
                </span>
                <div className="h-5 flex-1 overflow-hidden rounded bg-bg-elevated">
                  <div
                    className="h-5 rounded bg-accent-primary"
                    style={{ width: `${(s.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-sm font-semibold text-text-primary">
                  {s.count}명
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 요약 숫자 카드 한 장(2.3/5.1 톤). danger=true면 강조색.
function StatCard({
  icon,
  label,
  value,
  danger,
}: {
  icon: string;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-surface p-5">
      <span
        className={
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg " +
          (danger
            ? "bg-danger/10 text-danger"
            : "bg-accent-primary/10 text-accent-primary")
        }
      >
        <Icon name={icon} className="text-2xl" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-text-secondary">{label}</p>
        <p
          className={
            "text-xl font-bold " + (danger ? "text-danger" : "text-text-primary")
          }
        >
          {value}
        </p>
      </div>
    </div>
  );
}
