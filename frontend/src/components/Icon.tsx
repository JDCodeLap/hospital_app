// Material Symbols(아이콘 글꼴) 한 글자를 그리는 작은 도우미.
// 사용: <Icon name="dashboard" /> → 대시보드 아이콘. 이름은 Google Material Symbols 키워드.
// className으로 크기·색 조절(예: "text-xl text-accent-primary"), fill로 꽉 찬 아이콘.

export function Icon({
  name,
  className = "",
  fill = false,
}: {
  name: string;
  className?: string;
  fill?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined${fill ? " fill" : ""} ${className}`}
    >
      {name}
    </span>
  );
}
