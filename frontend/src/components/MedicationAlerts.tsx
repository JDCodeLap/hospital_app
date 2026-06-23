"use client";

// 투약 시간 알림 모아보기 (Story 3.3, FR5)
// - GET /api/medication-alerts: 지금 시간이 된(미완료) 투약 목록을 서버가 계산해 내려줌
// - "완료" 버튼 → POST /api/medications/{id}/administer {scheduled_time} → 그 슬롯이 정리되어 목록에서 사라짐
// - 시간이 흐르면 새 알림이 생기므로 60초마다 자동 갱신 + 수동 새로고침(시간 기반이라 정당)
// - 환자 데이터는 로그인 통과 후 여기(클라이언트)에서 토큰 달아 호출(1.4 가이드)

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { API_BASE } from "@/lib/api";
import { authHeader, clearToken } from "@/lib/auth";
import { Icon } from "@/components/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

// GET /api/medication-alerts 응답 한 건
type Alert = {
  medication_id: number;
  patient_id: number;
  patient_name: string;
  drug_name: string;
  dose: string;
  scheduled_time: string;
};

// 60초마다 자동 갱신(시간이 지나면 새 알림이 생기므로)
const REFRESH_MS = 60_000;

export function MedicationAlerts() {
  const router = useRouter();
  const toast = useToast();
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 완료 처리 중인 항목들(약id+시각) — 항목별 재진입 가드(다른 항목은 안 막힘)
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const busyRef = useRef<Set<string>>(new Set());
  // 로드 순번 — 자동갱신/완료 reload가 겹칠 때 '가장 최근' 응답만 화면에 반영(완료한 슬롯 부활 방지)
  const loadSeqRef = useRef(0);

  const slotKey = (a: Alert) => `${a.medication_id}@${a.scheduled_time}`;

  // 알림 목록 불러오기. silent=true면 로딩 스켈레톤 없이 조용히 갱신(자동 새로고침).
  const load = useCallback(
    async (signal: AbortSignal | undefined, silent: boolean) => {
      const seq = ++loadSeqRef.current; // 이 호출의 순번(나중 호출이 더 큼)
      if (!silent) setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/medication-alerts`, {
          headers: { ...authHeader() },
          signal,
        });
        if (signal?.aborted) return;
        if (res.status === 401 || res.status === 403) {
          clearToken();
          router.replace("/login");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Alert[] = await res.json();
        if (signal?.aborted) return;
        if (seq !== loadSeqRef.current) return; // 더 최근 로드가 시작됨 → 이 결과는 버림(stale 방지)
        setAlerts(data ?? []);
        setError(null);
      } catch (err: unknown) {
        if (signal?.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!silent) setError("알림을 불러올 수 없습니다. 백엔드 서버가 켜져 있는지 확인하세요.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [router],
  );

  // 첫 로딩 + 60초 자동 갱신(시간 기반). cleanup에서 타이머/요청 정리.
  useEffect(() => {
    const controller = new AbortController();
    // 초기 로딩을 async 래퍼로 감싼다 — effect에서 setState 직접 호출로 잡히지 않게(lint 회피, 2.4 교훈)
    void (async () => {
      await load(controller.signal, false);
    })();
    const timer = setInterval(() => {
      void load(undefined, true); // 자동 갱신은 조용히
    }, REFRESH_MS);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [load]);

  // "완료" — 해당 슬롯을 투약 완료로 기록 → 목록 갱신
  async function administer(a: Alert) {
    const key = slotKey(a);
    if (busyRef.current.has(key)) return; // 항목별 재진입 방지(더블클릭)
    busyRef.current.add(key);
    setBusy(new Set(busyRef.current));
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/medications/${a.medication_id}/administer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify({ scheduled_time: a.scheduled_time }),
        },
      );
      if (res.status === 401 || res.status === 403) {
        clearToken();
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        setError("투약 완료 처리에 실패했습니다. 잠시 후 다시 시도하세요.");
        return;
      }
      // 성공: 즉시 목록에서 제거(낙관적) + 서버 기준으로 다시 동기화 + 토스트로 확인
      setAlerts((prev) => (prev ? prev.filter((x) => slotKey(x) !== key) : prev));
      toast.success(`${a.drug_name} 투약을 완료 처리했어요.`);
      void load(undefined, true);
    } catch {
      setError("연결에 실패했습니다. 백엔드 서버가 켜져 있는지 확인하세요.");
    } finally {
      busyRef.current.delete(key);
      setBusy(new Set(busyRef.current));
    }
  }

  return (
    <>
      {/* 페이지 헤더 + 새로고침 */}
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">투약 시간 알림</h1>
          <p className="mt-1 text-sm text-text-secondary">
            지금 받을 시간이 된 투약을 확인하고 완료 처리하세요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load(undefined, false)}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-surface px-3 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
        >
          <Icon name="refresh" className="text-lg" />
          새로고침
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {loading && <AlertsSkeleton />}

        {!loading && error && (
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-6 text-center">
            <p className="font-bold text-danger">{error}</p>
          </div>
        )}

        {!loading && !error && alerts && alerts.length === 0 && (
          <EmptyState
            icon="medication"
            title="표시할 항목이 없습니다"
            description="지금 받을 시간이 된 투약이 없어요."
          />
        )}

        {!loading && !error && alerts && alerts.length > 0 && (
          <>
            {error && <p className="text-sm text-danger">{error}</p>}
            {alerts.map((a) => {
              const key = slotKey(a);
              const isBusy = busy.has(key);
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/15 p-4"
                >
                  <Icon name="schedule" className="text-2xl text-warning" />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-text-primary">
                      {a.drug_name}
                      {a.dose ? ` ${a.dose}` : ""}
                    </div>
                    <div className="mt-0.5 text-sm text-text-secondary">
                      <Link
                        href={`/patients/${a.patient_id}`}
                        className="text-accent-primary hover:underline"
                      >
                        {a.patient_name || "환자"}
                      </Link>{" "}
                      · 예정 {a.scheduled_time}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void administer(a)}
                    className="h-11 shrink-0 rounded-lg bg-success px-4 text-sm font-semibold text-accent-on hover:bg-success/90 disabled:opacity-50"
                  >
                    {isBusy ? "처리 중…" : "완료"}
                  </button>
                </div>
              );
            })}
          </>
        )}
      </div>
    </>
  );
}

// 불러오는 중 자리표시
function AlertsSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">불러오는 중…</span>
      <div className="h-20 animate-pulse rounded-lg bg-bg-elevated" />
      <div className="h-20 animate-pulse rounded-lg bg-bg-elevated" />
      <div className="h-20 animate-pulse rounded-lg bg-bg-elevated" />
    </div>
  );
}
