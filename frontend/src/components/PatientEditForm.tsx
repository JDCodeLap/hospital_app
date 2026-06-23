"use client";

// 환자 수정 화면의 연결 부품. 주소(/patients/{id}/edit)에서 id를 읽어 PatientForm에 넘긴다.
// ★ 상세 화면(PatientDetail)과 같은 방식 — 서버 컴포넌트에서 미리 다루지 않고 여기(클라이언트)에서
//   useParams로 id를 읽는다(미인증 사용자에게 환자정보가 새지 않게, 1.4 가이드와 일관).
import { useParams } from "next/navigation";

import { PatientForm } from "@/components/PatientForm";

export function PatientEditForm() {
  const { id } = useParams<{ id: string }>();
  const pid = Array.isArray(id) ? id[0] : id;
  // 숫자 id가 아니면(예: /patients/abc/edit) 안내만 — PatientForm 호출 안 함
  if (!pid || !/^\d+$/.test(pid)) {
    return <p className="text-sm text-danger">잘못된 주소입니다.</p>;
  }
  return <PatientForm patientId={Number(pid)} />;
}
