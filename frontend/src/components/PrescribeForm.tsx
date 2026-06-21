"use client";

// 처방 입력 폼 + 알레르기 경고 팝업 (Story 3.1, FR4)
// - 약 이름/용량/시간을 입력하고 "처방 추가"를 누르면 POST /api/patients/{id}/medications 호출
// - 백엔드가 알레르기/금기 충돌을 발견하면 409 + 충돌 정보를 돌려줌 → 빨간 경고 팝업 표시
//   → 직원이 "계속 처방"을 누르면 acknowledged=true로 다시 요청(위험을 확인하고 진행)
// - 저장 성공 시 백엔드가 broadcast → 통합 화면이 자동 갱신(2.4). 확실히 하려고 onSaved도 호출.
// ※ 안전장치의 진짜 강제는 백엔드(확인 없이는 저장 거부) — 이 팝업은 사용자 경험용 경고.

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { API_BASE } from "@/lib/api";
import { authHeader, clearToken } from "@/lib/auth";
import { Icon } from "@/components/Icon";
import type { MedicationItem } from "@/components/MedicationList";

// 409 응답(detail) 안에 담겨 오는 충돌 정보
type ConflictInfo = {
  conflicts: string[];
  drug_name: string;
  message: string;
};

// 서버로 보내는 처방 본문(acknowledged 제외) — 경고를 띄운 '그 약'을 고정 보관하는 데 사용
type Payload = { drug_name: string; dose: string; schedule: string };

export function PrescribeForm({
  patientId,
  editing,
  onSaved,
  onCancelEdit,
}: {
  patientId: number;
  // editing이 있으면 '수정 모드'(그 약을 PATCH). 없으면 '추가 모드'(POST).
  // 부모가 editing 대상이 바뀔 때 key로 이 컴포넌트를 리마운트 → 초기값이 editing에서 채워진다.
  editing?: MedicationItem | null;
  onSaved?: () => void;
  onCancelEdit?: () => void;
}) {
  const router = useRouter();
  const isEditing = !!editing;
  const [drugName, setDrugName] = useState(editing?.drug_name ?? "");
  const [dose, setDose] = useState(editing?.dose ?? "");
  const [schedule, setSchedule] = useState(editing?.schedule ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 충돌 정보가 있으면 경고 팝업을 띄운다(null이면 팝업 닫힘)
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);
  // 경고를 띄운 '그 약'의 본문을 보관 → '계속 처방'은 입력칸 현재값이 아니라 이걸 그대로 재전송
  const [pending, setPending] = useState<Payload | null>(null);
  // 재진입 방지 락: 빠른 더블클릭에도 요청이 한 번만 나가게(렌더타임 disabled 보강)
  const submittingRef = useRef(false);

  const canSubmit = drugName.trim().length > 0 && !submitting;

  // 경고를 띄운 약과 저장되는 약이 항상 일치하도록 payload를 명시적으로 받는다.
  // acknowledged=false: 일반 제출 / true: 경고를 보고도 계속 진행
  async function submit(payload: Payload, acknowledged: boolean) {
    if (!payload.drug_name) return;
    if (submittingRef.current) return; // 이미 처리 중이면 무시(중복 처방 방지)
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      // 수정 모드면 그 약을 PATCH, 추가 모드면 새로 POST(둘 다 알레르기 409 흐름 동일)
      const url = isEditing
        ? `${API_BASE}/api/patients/${patientId}/medications/${editing!.id}`
        : `${API_BASE}/api/patients/${patientId}/medications`;
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ ...payload, acknowledged }),
      });

      if (res.status === 401 || res.status === 403) {
        // 세션 만료/무효 → 토큰 비우고 로그인 화면으로(기존 정책 일관)
        clearToken();
        router.replace("/login");
        return;
      }
      if (res.status === 409) {
        // 알레르기/금기 충돌 — 저장되지 않음. 경고 팝업을 띄우고, 그 약을 보관한다.
        const body = await res.json();
        const detail = body?.detail as ConflictInfo | undefined;
        if (detail?.conflicts?.length) {
          setConflict(detail);
          setPending(payload); // '계속 처방' 시 이 본문을 그대로 재전송(입력 변경 영향 없음)
        } else {
          setError("처방을 진행할 수 없습니다.");
        }
        return;
      }
      if (!res.ok) {
        setError("처방 저장에 실패했습니다. 잠시 후 다시 시도하세요.");
        return;
      }

      // 성공: 폼/팝업 정리. 통합 화면 갱신(WS가 처리하지만 확실히 하려고 직접도 호출).
      setConflict(null);
      setPending(null);
      setDrugName("");
      setDose("");
      setSchedule("");
      onSaved?.();
    } catch {
      // 네트워크 등 예외 → 인라인 오류만(화면 전체는 유지)
      setError("연결에 실패했습니다. 백엔드 서버가 켜져 있는지 확인하세요.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  // 경고 팝업 닫기(취소/배경 클릭) — 보관한 약 정보도 함께 비운다
  function closeConflict() {
    setConflict(null);
    setPending(null);
  }

  return (
    <section className="rounded-lg border border-border-subtle bg-bg-surface p-4">
      <h2 className="mb-3 text-caption font-semibold uppercase tracking-wide text-text-secondary">
        {isEditing ? "처방 수정" : "처방 입력"}
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit(
            {
              drug_name: drugName.trim(),
              dose: dose.trim(),
              schedule: schedule.trim(),
            },
            false,
          );
        }}
        className="flex flex-col gap-2"
      >
        <input
          value={drugName}
          onChange={(e) => setDrugName(e.target.value)}
          placeholder="약 이름 (필수)"
          aria-label="약 이름"
          className="h-11 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 text-base text-text-primary outline-none placeholder:text-text-muted focus-visible:border-accent"
        />
        <div className="flex gap-2">
          <input
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            placeholder="용량 (예: 5mg)"
            aria-label="용량"
            className="h-11 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 text-base text-text-primary outline-none placeholder:text-text-muted focus-visible:border-accent"
          />
          <input
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            placeholder="시간 (예: 08:00)"
            aria-label="투약 시간"
            className="h-11 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 text-base text-text-primary outline-none placeholder:text-text-muted focus-visible:border-accent"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="h-11 flex-1 rounded-lg bg-accent-primary px-4 text-base font-semibold text-accent-on transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "처리 중…" : isEditing ? "수정 저장" : "처방 추가"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => onCancelEdit?.()}
              className="h-11 rounded-lg border border-border-subtle px-5 text-base font-medium text-text-secondary transition-colors hover:bg-bg-elevated"
            >
              취소
            </button>
          )}
        </div>
      </form>

      {/* 알레르기/금기 경고 팝업 — 충돌이 있을 때만. 확인 전까지 진행 불가. */}
      {conflict && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeConflict} // 배경 클릭 = 취소
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="allergy-warning-title"
            onClick={(e) => e.stopPropagation()} // 팝업 내부 클릭은 닫지 않음
            className="w-full max-w-sm rounded-xl border border-danger/40 bg-bg-elevated p-5 shadow-xl"
          >
            <div className="flex items-center gap-2 text-danger">
              <Icon name="warning" fill className="text-2xl" />
              <h3 id="allergy-warning-title" className="text-lg font-bold">
                알레르기 경고
              </h3>
            </div>
            <p className="mt-3 text-sm font-semibold text-danger">
              {conflict.message}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">
                {conflict.drug_name}
              </span>{" "}
              처방은 이 환자에게 위험할 수 있습니다. 그래도 계속하시겠습니까?
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={closeConflict}
                className="h-11 flex-1 rounded-lg bg-bg-surface px-4 text-base font-medium text-text-primary hover:bg-border-subtle"
              >
                취소
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  // 경고를 띄운 그 약(pending)을 그대로 재전송 — 입력칸 변경에 영향받지 않음
                  if (pending) void submit(pending, true);
                }}
                className="h-11 flex-1 rounded-lg bg-danger px-4 text-base font-semibold text-accent-on hover:bg-danger/90 disabled:opacity-50"
              >
                {submitting ? "처리 중…" : "계속 처방"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
