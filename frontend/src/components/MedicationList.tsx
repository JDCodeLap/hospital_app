"use client";

// 투약(처방) 목록 + 수정/삭제 버튼 (잘못 입력 정정용)
// - 약 항목마다 수정/삭제 버튼을 둔다. 수정은 아래 PrescribeForm을 '수정 모드'로 전환(onEdit),
//   삭제는 여기서 직접 DELETE /api/patients/{id}/medications/{medId} 호출.
// - 이미 투약 완료 기록이 있는 약은 백엔드가 409로 보호 → 그 안내(detail)를 그대로 보여준다.
// - 저장/삭제 성공 시 백엔드 broadcast로 화면 자동 갱신(2.4). 확실히 하려고 onSaved도 호출.

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { API_BASE } from "@/lib/api";
import { authHeader, clearToken } from "@/lib/auth";
import { Icon } from "@/components/Icon";

export type MedicationItem = {
  id: number;
  drug_name: string;
  dose: string;
  schedule: string;
  status: string;
};

export function MedicationList({
  patientId,
  medications,
  onEdit,
  onSaved,
}: {
  patientId: number;
  medications: MedicationItem[];
  onEdit: (med: MedicationItem) => void;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);

  async function remove(med: MedicationItem) {
    if (busyRef.current) return;
    if (!window.confirm(`'${med.drug_name}' 처방을 삭제할까요?`)) return;
    busyRef.current = true;
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/patients/${patientId}/medications/${med.id}`,
        { method: "DELETE", headers: { ...authHeader() } },
      );
      if (res.status === 401 || res.status === 403) {
        clearToken();
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        // 투약 완료 기록 보호(409) 등 백엔드 안내를 그대로 표시
        let msg = "삭제에 실패했습니다.";
        try {
          const body = await res.json();
          if (body && typeof body.detail === "string") msg = body.detail;
        } catch {
          /* 본문 없음 무시 */
        }
        setError(msg);
        return;
      }
      onSaved?.();
    } catch {
      setError("연결에 실패했습니다. 백엔드 서버가 켜져 있는지 확인하세요.");
    } finally {
      busyRef.current = false;
    }
  }

  if (medications.length === 0) {
    return <p className="py-1 text-sm text-text-muted">기록 없음</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {medications.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between gap-2 py-1.5 text-sm"
        >
          <span className="min-w-0 flex-1 text-text-secondary">
            <span className="font-semibold text-text-primary">
              {m.drug_name}
              {m.dose ? ` ${m.dose}` : ""}
            </span>
            {m.schedule ? ` · ${m.schedule}` : ""}
          </span>
          <span className="flex shrink-0 gap-0.5">
            <button
              type="button"
              onClick={() => onEdit(m)}
              aria-label={`${m.drug_name} 처방 수정`}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            >
              <Icon name="edit" className="text-lg" />
            </button>
            <button
              type="button"
              onClick={() => void remove(m)}
              aria-label={`${m.drug_name} 처방 삭제`}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-danger/10 hover:text-danger"
            >
              <Icon name="delete" className="text-lg" />
            </button>
          </span>
        </div>
      ))}

      {error && (
        <p role="alert" className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
