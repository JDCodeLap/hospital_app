"use client";

// 환자 단계 타임라인 (Story 4.1, FR9, UX-DR4)
// 접수→진료→검사→수납의 진행 상태를 점+선 그래픽으로 표시.
// 완료=초록/체크, 현재=파랑/글로우, 예정=회색 (색+아이콘+글자 3중 표현, UX-DR8)

import { Icon } from "@/components/Icon";

// 단계 순서 — 백엔드 STAGE_ORDER와 동일하게 유지해야 함
const STAGE_ORDER = ["접수", "진료", "검사", "수납"] as const;
type StageName = (typeof STAGE_ORDER)[number];
type StageStatus = "done" | "now" | "upcoming";

// currentStage 값을 받아 각 단계가 완료/현재/예정 중 어디인지 계산
function getStatuses(currentStage: string): StageStatus[] {
  const idx = STAGE_ORDER.indexOf(currentStage as StageName);
  return STAGE_ORDER.map((_, i) => {
    if (idx === -1) return i === 0 ? "now" : "upcoming"; // 알 수 없는 단계는 접수=현재로 방어
    if (i < idx) return "done";
    if (i === idx) return "now";
    return "upcoming";
  });
}

export function StageTimeline({ currentStage }: { currentStage: string }) {
  const statuses = getStatuses(currentStage);

  return (
    <section
      aria-label="환자 단계 진행 현황"
      className="rounded-xl border border-border-subtle bg-bg-surface px-4 py-4"
    >
      <div className="flex items-start">
        {STAGE_ORDER.map((stage, i) => {
          const st = statuses[i];
          const isFirst = i === 0;
          const isLast = i === STAGE_ORDER.length - 1;

          // 왼쪽 연결선: 완료 또는 현재 단계면 초록 (이 단계까지 도달했다는 의미)
          const leftGreen = st === "done" || st === "now";
          // 오른쪽 연결선: 완료 단계만 초록 (현재 이후는 아직 미도달)
          const rightGreen = st === "done";

          return (
            <div
              key={stage}
              className="relative flex flex-1 flex-col items-center"
              aria-current={st === "now" ? "step" : undefined}
            >
              {/* 왼쪽 연결선 (첫 번째 단계에는 없음) */}
              {!isFirst && (
                <div
                  className={`absolute top-[10px] right-1/2 h-[3px] w-1/2 ${leftGreen ? "bg-success" : "bg-bg-elevated"}`}
                />
              )}
              {/* 오른쪽 연결선 (마지막 단계에는 없음) */}
              {!isLast && (
                <div
                  className={`absolute top-[10px] left-1/2 h-[3px] w-1/2 ${rightGreen ? "bg-success" : "bg-bg-elevated"}`}
                />
              )}

              {/* 단계 점(dot) */}
              <div
                className={`relative z-10 mb-1.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 border-[#f7f9fb] ${
                  st === "done"
                    ? "bg-success text-[#06281c]"
                    : st === "now"
                      ? "bg-accent-primary text-accent-on shadow-[0_0_0_4px_rgba(0,80,203,0.2)]"
                      : "bg-bg-elevated text-text-muted"
                }`}
              >
                {st === "done" && (
                  <Icon name="check" fill className="text-[10px]" />
                )}
                {st === "now" && (
                  <Icon name="fiber_manual_record" fill className="text-[10px]" />
                )}
              </div>

              {/* 단계 이름 */}
              <span
                className={`text-[11px] ${
                  st === "now"
                    ? "font-bold text-accent-primary"
                    : st === "done"
                      ? "font-medium text-success"
                      : "text-text-muted"
                }`}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
