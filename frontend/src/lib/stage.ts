// 환자 진행 단계(접수 → 진료 → 검사 → 수납)별 색상·라벨을 한 곳에서 관리한다.
// 화면 여러 곳(단계 타임라인·환자 목록·흐름판)이 같은 색을 쓰도록 공통 소스로 둔다.
// 색은 디자인 토큰 유틸리티(text-info, bg-warning/15 등)를 쓴다 → 테마(다크) 자동 반영.
//   접수=회색(시작) · 진료=파랑 · 검사=주황 · 수납=초록(완료 단계)

export type StageStyle = {
  text: string; // 글자색 클래스
  bg: string; // 옅은 배경 클래스(배지)
  dot: string; // 점/아이콘 배경색 클래스
  border: string; // 테두리색 클래스
};

const STAGE_STYLES: Record<string, StageStyle> = {
  접수: {
    text: "text-text-secondary",
    bg: "bg-bg-elevated",
    dot: "bg-text-muted",
    border: "border-border-subtle",
  },
  진료: {
    text: "text-info",
    bg: "bg-info/15",
    dot: "bg-info",
    border: "border-info/40",
  },
  검사: {
    text: "text-warning",
    bg: "bg-warning/15",
    dot: "bg-warning",
    border: "border-warning/40",
  },
  수납: {
    text: "text-success",
    bg: "bg-success/15",
    dot: "bg-success",
    border: "border-success/40",
  },
};

const FALLBACK: StageStyle = {
  text: "text-text-secondary",
  bg: "bg-bg-elevated",
  dot: "bg-text-muted",
  border: "border-border-subtle",
};

// 단계 이름 → 색상 스타일. 알 수 없는 단계는 회색 폴백.
export function stageStyle(stage: string): StageStyle {
  return STAGE_STYLES[stage] ?? FALLBACK;
}
