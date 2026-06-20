"use client";

// 안전 경고 배너 (Story 3.2, FR7)
// - 환자에게 위험 정보(알레르기)가 있으면 화면 최상단에 배너를 띄운다.
// - 미확인: 빨간 경고 + "확인" 버튼 → 누르면 POST /api/patients/{id}/safety-ack (백엔드 기록)
//   → 성공 시 onSaved(조용한 reload). 다른 직원/재진입에도 미확인이면 계속 빨갛게 보인다.
// - 확인됨: 차분한 배너(빨강 톤 낮춤, 버튼 없음) + "확인: {이름} · {시각}". 알레르기는 영구 위험이라 계속 표시.
// ※ 확인 상태는 백엔드(SafetyAck)에 저장되어 모든 직원에게 공유된다(프론트 로컬 저장 아님).

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { API_BASE } from "@/lib/api";
import { authHeader, clearToken } from "@/lib/auth";
import { Icon } from "@/components/Icon";

// 확인 기록(없으면 null = 미확인)
type SafetyAck = {
  acknowledged_by: number;
  acknowledged_by_name: string;
  acknowledged_at: string;
} | null;

// ISO 일시 → 한국어 표기(잘못된 값이면 원본 그대로)
function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export function SafetyBanner({
  patientId,
  allergies,
  safetyAck,
  onSaved,
}: {
  patientId: number;
  allergies: string;
  safetyAck: SafetyAck;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 낙관적 확인 표식: POST 성공 직후 화면 갱신(reload)이 늦거나 조용히 실패해도
  // 빨간 배너가 그대로 남지 않도록 즉시 '확인됨'으로 전환(reload되면 정식 데이터로 대체).
  const [justAcked, setJustAcked] = useState(false);
  // 재진입 방지 락: 빠른 더블클릭에도 요청이 한 번만 나가게(3.1 교훈)
  const submittingRef = useRef(false);

  const risk = (allergies ?? "").trim();
  if (!risk) return null; // 위험 정보 없으면 배너 자체를 그리지 않음(기존 동작 유지)

  async function confirm() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/patients/${patientId}/safety-ack`, {
        method: "POST",
        headers: { ...authHeader() },
      });
      if (res.status === 401 || res.status === 403) {
        // 세션 만료/무효 → 토큰 비우고 로그인 화면으로(기존 정책 일관)
        clearToken();
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        setError("확인 처리에 실패했습니다. 잠시 후 다시 시도하세요.");
        return;
      }
      // 성공: 즉시 '확인됨'으로 전환(낙관적) + 조용한 reload로 정식 확인자/시각 채움(WS가 타 화면도 갱신)
      setJustAcked(true);
      onSaved?.();
    } catch {
      setError("연결에 실패했습니다. 백엔드 서버가 켜져 있는지 확인하세요.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  // 확인됨: 차분한 배너(버튼 없음). 알레르기는 계속 보여주되 톤을 낮춘다.
  // safetyAck(서버 데이터) 또는 justAcked(방금 눌러 낙관적 전환) 중 하나면 확인 상태로 본다.
  if (safetyAck || justAcked) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
        <Icon name="warning" className="text-base" />
        <span className="font-semibold">{risk}</span>
        <span className="ml-auto text-caption text-text-secondary">
          {safetyAck
            ? `확인: ${safetyAck.acknowledged_by_name || "직원"} · ${fmtDateTime(safetyAck.acknowledged_at)}`
            : "방금 확인됨"}
        </span>
      </div>
    );
  }

  // 미확인: 빨간 경고 + "확인" 버튼(확인 전까지 유지)
  return (
    <div
      role="alert"
      className="flex flex-col gap-2 rounded-lg border border-danger/40 bg-danger/15 p-3"
    >
      <div className="flex items-center gap-2 text-sm font-bold text-danger">
        <Icon name="warning" fill className="text-base" />
        <span>{risk} — 처방 시 주의</span>
      </div>
      {error && (
        <p className="text-caption text-danger">{error}</p>
      )}
      <button
        type="button"
        disabled={submitting}
        onClick={() => void confirm()}
        className="h-11 self-start rounded-lg bg-danger px-4 text-sm font-semibold text-accent-on hover:bg-danger/90 disabled:opacity-50"
      >
        {submitting ? "처리 중…" : "확인"}
      </button>
    </div>
  );
}
