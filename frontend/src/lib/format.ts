// 날짜/일시 표기 공통 헬퍼.
// 여러 컴포넌트(PatientDetail, HandoverNoteSection 등)가 같은 방식으로 한국어 날짜를
// 표시하도록 한 곳에서 관리한다. 잘못된 값이 들어오면 원본 문자열을 그대로 안전 반환.

// ISO 날짜 → 한국어 날짜(예: 2026. 6. 21.)
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("ko-KR");
}

// ISO 일시 → 한국어 날짜+시각(예: 2026. 06. 21. 14:30)
export function fmtDateTime(iso: string): string {
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
