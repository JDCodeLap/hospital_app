"use client";

// 환자 흐름판 (Story 4.3, FR9)
// 모든 환자를 현재 단계(접수→진료→검사→수납)별로 묶어 한 화면에 보여준다(전체 현황).
// - 데이터는 기존 GET /api/patients(2.2, 보호됨)를 그대로 사용 → 백엔드 변경 0.
//   (목록 응답에 이미 current_stage 포함. 그룹화는 여기 클라이언트에서.)
// - AuthGuard 통과 후 여기(클라이언트)에서 토큰 달아 호출(미인증 노출 방지, 1.4 RSC 가이드).
// - 읽기 전용: 단계 변경은 3.4 advance-stage(통합 화면)만이 유일 경로. 흐름판은 보고 → 클릭만.
// ※ 대기 초과 앰버 강조+알림(FR10)=4.4 / 흐름판 전역 실시간 WS=후속 (범위 밖)

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { API_BASE } from "@/lib/api";
import { authHeader, clearToken } from "@/lib/auth";
import { stageStyle } from "@/lib/stage";
import { Icon } from "@/components/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { PatientCard, type PatientSummary } from "@/components/PatientSearch";

// 단계 순서 — 백엔드 STAGE_ORDER / StageTimeline과 동일하게 유지
const STAGE_ORDER = ["접수", "진료", "검사", "수납"] as const;
// 표준 단계가 아닌 값(알 수 없는 단계)을 모으는 그룹 이름(방어)
const OTHER_GROUP = "기타";

export function PatientFlowBoard() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 마운트 로딩·새로고침·연타가 겹쳐도 "늦게 온 응답이 최신을 못 덮게" 하는 안전장치
  // (PatientSearch/PatientDetail의 cancelled 패턴을 새로고침까지 포함해 일반화):
  //  - abortRef: 직전 요청을 abort(네트워크 자체 취소)
  //  - reqIdRef: 매 호출 고유 번호 → 내 번호가 더 이상 최신이 아니면 결과 반영 스킵
  const abortRef = useRef<AbortController | null>(null);
  const reqIdRef = useRef(0);

  // 전체 환자 목록을 불러온다(검색어 없이 = 전체). 초기 로딩과 새로고침 버튼에서 재사용.
  const load = useCallback(async () => {
    // 직전 요청 취소 + 이 요청에 번호 부여
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const myId = ++reqIdRef.current;
    // 취소됐거나 더 새로운 요청이 시작됐으면 이 응답은 버린다
    const isStale = () => controller.signal.aborted || myId !== reqIdRef.current;

    setLoading(true);
    setError(null); // 재시도 시작 시 이전 오류 잔상 제거
    try {
      const res = await fetch(`${API_BASE}/api/patients`, {
        headers: { ...authHeader() },
        signal: controller.signal,
      });
      if (isStale()) return;
      if (res.status === 401 || res.status === 403) {
        // 세션 만료/무효 → 토큰 비우고 로그인 화면으로(AuthGuard와 동일 정책)
        clearToken();
        router.replace("/login");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PatientSummary[] = await res.json();
      if (isStale()) return;
      setPatients(data);
      setError(null);
    } catch (err: unknown) {
      if (isStale()) return;
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(
        "환자 목록을 불러올 수 없습니다. 백엔드 서버(http://localhost:8000)가 켜져 있는지 확인하세요.",
      );
      setPatients(null);
    } finally {
      if (!isStale()) setLoading(false);
    }
  }, [router]);

  // 초기 로딩 (effect 본문에서 setState를 직접 호출하지 않도록 async 콜백으로 감쌈, lint 가드)
  // 언마운트 시 진행 중 요청 abort → 늦은 응답의 setState 방지
  useEffect(() => {
    void (async () => {
      await load();
    })();
    return () => abortRef.current?.abort();
  }, [load]);

  // 단계별 그룹 구성: STAGE_ORDER 4개 + (있으면) "기타". 각 그룹에 해당 환자 배열.
  const groups: { stage: string; patients: PatientSummary[] }[] = STAGE_ORDER.map(
    (stage) => ({
      stage,
      patients: (patients ?? []).filter((p) => p.current_stage === stage),
    }),
  );
  const known = new Set<string>(STAGE_ORDER);
  const others = (patients ?? []).filter((p) => !known.has(p.current_stage));
  if (others.length > 0) {
    groups.push({ stage: OTHER_GROUP, patients: others });
  }

  const total = patients?.length ?? 0;

  return (
    <div className="w-full">
      {/* 헤더: 전체 인원 + 새로고침 버튼 */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-secondary" role="status">
          {loading ? "불러오는 중…" : `전체 ${total}명`}
        </p>
        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-surface px-3 text-sm text-text-secondary transition-colors hover:border-accent-primary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="refresh" className="text-lg" />
          새로고침
        </button>
      </div>

      {/* 오류 안내 */}
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {/* 전체 환자 없음 */}
      {!error && !loading && total === 0 && (
        <EmptyState
          icon="view_kanban"
          title="진행 중인 환자가 없어요"
          description="새 환자를 등록하면 여기 흐름판에 단계별로 표시돼요."
          actionLabel="신규 환자 등록"
          actionHref="/patients/new"
        />
      )}

      {/* 단계별 보드: PC(md↑) 4열 그리드, 폰 세로 스택 */}
      {!error && total > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {groups.map((g) => (
            <section
              key={g.stage}
              aria-label={`${g.stage} 단계 환자`}
              className={`flex flex-col gap-3 rounded-xl border bg-bg-base p-3 ${stageStyle(g.stage).border}`}
            >
              {/* 그룹 헤더: 단계명(단계색 점) + 인원수 (+ 대기 초과 수 앰버 배지) */}
              <div className="flex items-center justify-between px-1">
                <h2
                  className={`flex items-center gap-1.5 text-sm font-semibold ${stageStyle(g.stage).text}`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${stageStyle(g.stage).dot}`}
                  />
                  {g.stage}
                </h2>
                <div className="flex items-center gap-1.5">
                  {g.patients.filter((p) => p.is_overdue).length > 0 && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-warning/20 px-2 py-0.5 text-caption font-semibold text-warning">
                      <Icon name="schedule" className="text-sm" />
                      {g.patients.filter((p) => p.is_overdue).length}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-caption font-semibold ${stageStyle(g.stage).bg} ${stageStyle(g.stage).text}`}
                  >
                    {g.patients.length}명
                  </span>
                </div>
              </div>

              {/* 그룹 내 환자 카드(단계 배지는 그룹과 중복이라 숨김, 대기 초과는 앰버 강조) */}
              {g.patients.length === 0 ? (
                <p className="px-1 py-2 text-caption text-text-muted">없음</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {g.patients.map((p) => (
                    <li key={p.id}>
                      <PatientCard
                        patient={p}
                        hideStage
                        overdue={p.is_overdue ?? false}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
