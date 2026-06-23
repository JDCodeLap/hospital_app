// 빙글빙글 도는 로딩 표시(스피너). 화면 전환·데이터 대기 중 "기다리는 중"을 시각적으로 보여줌.
// label을 주면 스피너 아래에 안내 문구도 함께 표시한다.
export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      {/* 원형 테두리 중 일부만 색을 줘서, 회전(animate-spin)하면 빙글빙글 도는 것처럼 보임 */}
      <span
        className="h-8 w-8 animate-spin rounded-full border-[3px] border-border border-t-primary"
        aria-hidden="true"
      />
      {label && <span className="text-sm text-text-secondary">{label}</span>}
    </div>
  );
}
