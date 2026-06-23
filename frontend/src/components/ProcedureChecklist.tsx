"use client";

// 필수 절차 체크리스트 (Story 3.4, FR6)
// - 시술/검사 전 필수 항목(본인확인·금식·동의서)을 체크리스트로 보여준다.
// - 항목을 탭하면 체크/해제가 토글되고 백엔드에 저장(POST .../checklist/{key}) → 모든 직원에게 공유.
// - 모든 항목이 체크돼야 "다음 단계로" 버튼이 활성화(초록)된다. 하나라도 미체크면 회색 비활성.
// - "다음 단계로"를 누르면 current_stage가 다음 단계로 진행(POST .../advance-stage)되고 체크가 초기화된다.
//   (서버도 미완료면 409로 거부 — 진짜 자물쇠는 백엔드, 버튼 비활성은 UX)
// ※ 체크 상태/항목 목록은 GET /api/patients/{id} 묶음의 checklist 블록에서 받는다(프론트 로컬 저장 아님).

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { API_BASE } from "@/lib/api";
import { authHeader, clearToken } from "@/lib/auth";
import { Icon } from "@/components/Icon";

// get_patient 묶음의 checklist 블록 모양
export type Checklist = {
  items: { key: string; label: string; checked: boolean }[];
  effectiveAllChecked: boolean;
  next_stage: string | null;
};

export function ProcedureChecklist({
  patientId,
  checklist,
  onSaved,
}: {
  patientId: number;
  checklist?: Checklist;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  // 항목별 처리중 표시(한 항목 처리 중에도 다른 항목은 누를 수 있게 항목별로 가드)
  const [busyKeys, setBusyKeys] = useState<Set<string>>(new Set());
  // 재진입 방지 락: 같은 항목/버튼 더블클릭에도 요청이 한 번만 나가게(3.1~3.3 교훈)
  const busyRef = useRef<Set<string>>(new Set());
  const advancingRef = useRef(false);
  // 낙관적 업데이트: 탭한 즉시 화면에 반영하고 저장은 뒤에서 처리(서버 왕복을 기다리지 않음).
  // key별로 사용자가 방금 만든 체크 상태를 서버 상태 위에 덮어쓴다.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  // 서버에서 받은 체크 상태가 바뀌면(부모 재조회 완료) 오버라이드를 비운다 — 서버가 최종 진실.
  // checklist prop의 참조가 매 렌더 달라져도, 실제 checked 값이 바뀔 때만 리셋되도록 시그니처로 비교.
  // React 권장 패턴: effect 대신 렌더 중 '이전 값과 비교'해 즉시 리셋(추가 렌더·지연 없음).
  const checkedSignature = (checklist?.items ?? [])
    .map((i) => `${i.key}:${i.checked}`)
    .join(",");
  const [prevSignature, setPrevSignature] = useState(checkedSignature);
  if (checkedSignature !== prevSignature) {
    setPrevSignature(checkedSignature);
    setOverrides({});
  }

  // 묶음에 checklist가 없으면(하위호환) 아무것도 그리지 않음
  if (!checklist) return null;
  const { next_stage } = checklist;
  // 낙관적 반영: 사용자가 방금 만든 상태(overrides)를 서버 상태 위에 덮어 표시한다.
  const items = checklist.items.map((it) => ({
    ...it,
    checked: overrides[it.key] ?? it.checked,
  }));
  // 다음 단계 버튼 활성화도 낙관적 상태로 즉시 판정(서버 all_checked prop 대신).
  const effectiveAllChecked = items.every((it) => it.checked);

  // 401/403 공통 처리(세션 만료/무효 → 로그아웃)
  function handleAuthFail() {
    clearToken();
    router.replace("/login");
  }

  // 항목 하나 토글(체크 ↔ 해제)
  async function toggle(key: string, checked: boolean) {
    if (busyRef.current.has(key)) return; // 이미 처리 중인 항목이면 무시
    busyRef.current.add(key);
    setBusyKeys(new Set(busyRef.current));
    setError(null);
    setOverrides((prev) => ({ ...prev, [key]: checked })); // 낙관적: 즉시 화면 반영
    // 저장 실패 시 이 항목의 낙관적 표시를 되돌린다
    const rollback = () =>
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    try {
      const res = await fetch(
        `${API_BASE}/api/patients/${patientId}/checklist/${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify({ checked }),
        },
      );
      if (res.status === 401 || res.status === 403) {
        handleAuthFail();
        return;
      }
      if (!res.ok) {
        rollback();
        setError("체크 저장에 실패했습니다. 잠시 후 다시 시도하세요.");
        return;
      }
      onSaved?.(); // 백그라운드 동기화(WS가 타 화면도 갱신). 재조회가 오면 오버라이드 자동 정리.
    } catch {
      rollback();
      setError("연결에 실패했습니다. 백엔드 서버가 켜져 있는지 확인하세요.");
    } finally {
      busyRef.current.delete(key);
      setBusyKeys(new Set(busyRef.current));
    }
  }

  // 다음 단계로 진행(모든 항목 체크 시에만 버튼 활성)
  async function advance() {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setAdvancing(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/patients/${patientId}/advance-stage`,
        { method: "POST", headers: { ...authHeader() } },
      );
      if (res.status === 401 || res.status === 403) {
        handleAuthFail();
        return;
      }
      if (res.status === 409) {
        // 서버가 미완료로 거부(프론트와 상태가 어긋난 경우) → 최신 상태 다시 불러옴
        setError("필수 절차가 모두 완료되지 않았습니다.");
        onSaved?.();
        return;
      }
      if (!res.ok) {
        setError("단계 진행에 실패했습니다. 잠시 후 다시 시도하세요.");
        return;
      }
      onSaved?.(); // 단계 갱신 + 체크 초기화 반영
    } catch {
      setError("연결에 실패했습니다. 백엔드 서버가 켜져 있는지 확인하세요.");
    } finally {
      advancingRef.current = false;
      setAdvancing(false);
    }
  }

  return (
    <section className="rounded-xl border border-border-subtle bg-bg-surface p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Icon name="checklist" className="text-lg text-accent-primary" />
        필수 절차 체크리스트
      </h2>

      <ul className="flex flex-col gap-1">
        {items.map((it) => {
          const busy = busyKeys.has(it.key);
          return (
            <li key={it.key}>
              <button
                type="button"
                disabled={busy}
                aria-pressed={it.checked}
                onClick={() => void toggle(it.key, !it.checked)}
                className="flex h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm hover:bg-bg-elevated disabled:opacity-50"
              >
                <Icon
                  name={it.checked ? "check_circle" : "radio_button_unchecked"}
                  fill={it.checked}
                  className={`text-xl ${it.checked ? "text-success" : "text-text-muted"}`}
                />
                <span
                  className={
                    it.checked
                      ? "font-medium text-text-primary"
                      : "text-text-secondary"
                  }
                >
                  {it.label}
                </span>
                {it.checked && (
                  <span className="ml-auto text-caption font-medium text-success">
                    완료
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {error && (
        <p role="alert" className="mt-2 text-caption text-danger">
          {error}
        </p>
      )}

      <div className="mt-4">
        {next_stage === null ? (
          // 마지막 단계(수납) — 진행할 다음 단계가 없음
          <p className="flex items-center gap-2 text-sm text-text-secondary">
            <Icon name="flag" className="text-base text-success" />
            최종 단계입니다
          </p>
        ) : (
          <button
            type="button"
            disabled={!effectiveAllChecked || advancing}
            onClick={() => void advance()}
            className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-base font-semibold transition-colors ${
              effectiveAllChecked
                ? "bg-success text-accent-on hover:bg-success/90"
                : "cursor-not-allowed bg-bg-elevated text-text-muted"
            } disabled:cursor-not-allowed`}
          >
            <Icon name="arrow_forward" className="text-base" />
            {advancing
              ? "처리 중…"
              : effectiveAllChecked
                ? `다음 단계로 (${next_stage})`
                : "다음 단계로"}
          </button>
        )}
        {!effectiveAllChecked && next_stage !== null && (
          <p className="mt-2 text-caption text-text-muted">
            모든 항목을 체크하면 다음 단계로 진행할 수 있습니다.
          </p>
        )}
      </div>
    </section>
  );
}
