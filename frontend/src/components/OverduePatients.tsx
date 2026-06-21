"use client";

// 대기 초과 환자 섹션 (Story 4.4, FR10) — /alerts 화면 상단에 표시
// - GET /api/patients(전체, 보호됨)를 호출해 is_overdue=true인 환자만 추려 보여준다(새 엔드포인트 없음).
//   대기 시간 계산·기준 판정은 서버가 함(4.4). 여기선 필터·표시만.
// - 시간이 흐르면 더 많은 환자가 초과되므로 60초 자동 갱신 + 수동 새로고침(시간 기반이라 정당, 3.3 패턴).
// - fetch 경쟁 가드는 4.3 PatientFlowBoard와 동일(abortRef + reqId). 401→clearToken+/login.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { API_BASE } from "@/lib/api";
import { authHeader, clearToken } from "@/lib/auth";
import { Icon } from "@/components/Icon";
import type { PatientSummary } from "@/components/PatientSearch";

// 60초마다 자동 갱신(시간이 지나면 새 초과가 생기므로)
const REFRESH_MS = 60_000;

export function OverduePatients() {
  const router = useRouter();
  const [overdue, setOverdue] = useState<PatientSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 마운트 로딩·자동갱신·새로고침이 겹쳐도 늦은 응답이 최신을 못 덮게(4.3 패턴)
  const abortRef = useRef<AbortController | null>(null);
  const reqIdRef = useRef(0);

  // silent=true면 로딩 스켈레톤 없이 조용히 갱신(자동 새로고침)
  const load = useCallback(
    async (silent: boolean) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const myId = ++reqIdRef.current;
      const isStale = () =>
        controller.signal.aborted || myId !== reqIdRef.current;

      if (!silent) setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/patients`, {
          headers: { ...authHeader() },
          signal: controller.signal,
        });
        if (isStale()) return;
        if (res.status === 401 || res.status === 403) {
          clearToken();
          router.replace("/login");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: PatientSummary[] = await res.json();
        if (isStale()) return;
        setOverdue((data ?? []).filter((p) => p.is_overdue));
        setError(null);
      } catch (err: unknown) {
        if (isStale()) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!silent)
          setError(
            "대기 초과 환자를 불러올 수 없습니다. 백엔드 서버가 켜져 있는지 확인하세요.",
          );
      } finally {
        if (!isStale() && !silent) setLoading(false);
      }
    },
    [router],
  );

  // 첫 로딩 + 60초 자동 갱신(시간 기반). cleanup에서 타이머/요청 정리.
  useEffect(() => {
    void (async () => {
      await load(false);
    })();
    const timer = setInterval(() => {
      void load(true); // 자동 갱신은 조용히
    }, REFRESH_MS);
    return () => {
      abortRef.current?.abort();
      clearInterval(timer);
    };
  }, [load]);

  // 로딩 중에는 자리를 차지하지 않음(투약 알림이 주 콘텐츠) — 빈 섹션도 숨김
  if (loading || error) {
    // 오류는 조용히 숨김(투약 알림이 메인). 로딩도 깜빡임 방지로 숨김.
    return null;
  }
  if (!overdue || overdue.length === 0) {
    return null; // 대기 초과 없으면 섹션 자체를 숨김(투약 알림만 보이게)
  }

  return (
    <section className="mb-6">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-warning">
        <Icon name="schedule" className="text-lg" />
        대기 초과 환자 ({overdue.length})
      </h2>
      <div className="flex flex-col gap-2">
        {overdue.map((p) => (
          <Link
            key={p.id}
            href={`/patients/${p.id}`}
            prefetch={false}
            className="flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/15 p-4 transition-colors hover:border-warning"
          >
            <Icon name="schedule" className="text-2xl text-warning" />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-text-primary">{p.name}</div>
              <div className="mt-0.5 text-sm text-text-secondary">
                {p.current_stage} 단계 ·{" "}
                {typeof p.waiting_minutes === "number"
                  ? `${p.waiting_minutes}분 대기`
                  : "대기 초과"}
              </div>
            </div>
            <Icon name="chevron_right" className="shrink-0 text-text-muted" />
          </Link>
        ))}
      </div>
    </section>
  );
}
