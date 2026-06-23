"use client";

// 환자 통합 화면 본문: 환자 한 명의 모든 정보(기본정보·방문·진단·투약·검사·수납)를
// 한 화면에 카드형으로 모아 보여준다(읽기 전용). UX 목업(patient-screen.html)의 다크 레이아웃을 따른다.
// - 데이터는 기존 GET /api/patients/{id}(2.1, 보호됨)를 그대로 사용 → 백엔드 변경 없음
// - AuthGuard 통과 후 여기(클라이언트)에서 토큰 달아 호출(미인증 노출 방지, 1.4 가이드)
// - 알레르기 배너는 '정적 표시'만(확인-유지/닫기는 Story 3.2 범위)
// ※ 단계 타임라인 그래픽=4.1, 체크리스트=3.4, 투약알림=3.3, 약물충돌=3.1, 실시간 갱신=2.4 (범위 밖)

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { API_BASE, WS_BASE } from "@/lib/api";
import { authHeader, clearToken, getToken } from "@/lib/auth";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { stageStyle } from "@/lib/stage";
import { PrescribeForm } from "@/components/PrescribeForm";
import {
  MedicationList,
  type MedicationItem,
} from "@/components/MedicationList";
import { SafetyBanner } from "@/components/SafetyBanner";
import { ProcedureChecklist, type Checklist } from "@/components/ProcedureChecklist";
import { StageTimeline } from "@/components/StageTimeline";
import {
  HandoverNoteSection,
  type HandoverNote,
} from "@/components/HandoverNoteSection";
import { Icon } from "@/components/Icon";

// GET /api/patients/{id} 응답 묶음의 모양(필요한 필드만)
type PatientBundle = {
  patient: {
    id: number;
    registration_number: string;
    name: string;
    age: number;
    birth_date: string;
    gender: string;
    phone: string;
    resident_id: string; // 마스킹된 주민번호(예: 901020-1******)
    allergies: string;
    current_stage: string;
  };
  // 정보 영역 접근 범위(5.3, FR12): 범위 밖이면 그 키가 응답에서 빠지므로 옵셔널.
  visits?: { visited_at: string; department: string; reason: string }[];
  diagnoses?: { name: string; diagnosed_at: string; status: string }[];
  medications?: MedicationItem[];
  lab_results?: {
    test_name: string;
    value: string;
    unit: string;
    flag: string;
    measured_at: string;
  }[];
  billings?: { item: string; amount: number; status: string }[];
  // 허용된 영역 키 목록(5.3). 없으면(구버전 응답) 전체 허용으로 간주(하위호환).
  visible_sections?: string[];
  // 안전 경고 확인 상태(3.2): 미확인이면 null
  safety_ack: {
    acknowledged_by: number;
    acknowledged_by_name: string;
    acknowledged_at: string;
  } | null;
  // 필수 절차 체크리스트(3.4): 항목·전체체크여부·다음단계
  checklist?: Checklist;
  // 부서 간 인계 메모(4.2): 최신 5건
  handover_notes?: HandoverNote[];
};

// 화면 상태: 불러오는 중 / 정상 / 없는 환자(404) / 오류
type Phase = "loading" | "ok" | "notfound" | "error";

// 성별 코드 → 한국어 표시
function genderLabel(g: string): string {
  if (g === "M") return "남";
  if (g === "F") return "여";
  return g || "기타";
}

// 날짜/일시 표기는 공통 헬퍼(@/lib/format)로 분리 — HandoverNoteSection 등과 동일 방식 공유

export function PatientDetail() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [phase, setPhase] = useState<Phase>("loading");
  const [bundle, setBundle] = useState<PatientBundle | null>(null);

  // 환자 묶음을 불러오는 함수. 초기 로딩과 실시간 갱신(WS) 양쪽에서 재사용.
  // silent=true(실시간 갱신)면 스켈레톤/오류 표시 없이 조용히 데이터만 교체
  // (갱신 실패 시 기존 화면 유지). 초기 로딩은 silent=false로 로딩/오류 상태를 보여줌.
  const loadBundle = useCallback(
    async (signal: AbortSignal | undefined, silent: boolean) => {
      const pid = Array.isArray(id) ? id[0] : id;
      if (!pid) return; // 첫 렌더 등 id 미확정 → 스킵
      if (!/^\d+$/.test(pid)) {
        setPhase("notfound"); // 숫자 아닌 id(예: /patients/abc)
        return;
      }
      if (!silent) setPhase("loading");
      try {
        const res = await fetch(`${API_BASE}/api/patients/${pid}`, {
          headers: { ...authHeader() },
          signal,
        });
        if (signal?.aborted) return;
        if (res.status === 401 || res.status === 403) {
          // 세션 만료/무효 → 토큰 비우고 로그인 화면으로(AuthGuard와 동일 정책).
          // 단, 백그라운드(silent) 갱신 중엔 타인 동작으로 갑자기 튕기지 않게 화면 유지
          // (다음 사용자 동작이나 AuthGuard 재검증이 처리).
          if (!silent) {
            clearToken();
            router.replace("/login");
          }
          return;
        }
        if (res.status === 404 || res.status === 422) {
          // 404=없는 환자, 422=잘못된 id 형식 → "환자를 찾을 수 없습니다"로.
          // silent 갱신 중엔 현재 화면 유지(타인 동작에 의해 갑자기 사라지지 않게).
          if (!silent) setPhase("notfound");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: PatientBundle = await res.json();
        if (signal?.aborted) return;
        setBundle(data);
        setPhase("ok");
      } catch (err: unknown) {
        if (signal?.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!silent) setPhase("error"); // 실시간 갱신 실패는 화면 유지(조용히)
      }
    },
    [id, router],
  );

  // 초기 로딩(및 id 변경 시 재로딩) — 2.3 동작 그대로
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      await loadBundle(controller.signal, false);
    })();
    return () => controller.abort();
  }, [loadBundle]);

  // 실시간 구독(WebSocket): 이 환자가 바뀌면 '다시 불러와' 신호를 받아 조용히 갱신.
  // WS는 보조 채널 — 실패/끊김은 콘솔만, 화면 오류로 표시하지 않음(초기 fetch로 이미 정상).
  useEffect(() => {
    const pid = Array.isArray(id) ? id[0] : id;
    if (!pid || !/^\d+$/.test(pid) || !getToken()) return;

    let closedByUs = false;
    let retry = 0;
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const open = () => {
      if (closedByUs) return; // 이미 화면을 떠났으면 새로 열지 않음
      const token = getToken(); // 재연결 때마다 최신 토큰을 다시 읽음(만료/재로그인 대응)
      if (!token) return;
      ws = new WebSocket(
        `${WS_BASE}/ws/patients/${pid}?token=${encodeURIComponent(token)}`,
      );
      ws.onopen = () => {
        retry = 0; // 연결 성공 시 재시도 횟수 초기화(오래 켠 화면도 계속 회복)
      };
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg?.type === "patient_updated") {
            // 신호만 받았으니 보호된 GET으로 최신 데이터를 조용히 다시 불러옴
            loadBundle(undefined, true);
          }
        } catch {
          // 형식이 이상한 메시지는 무시
        }
      };
      ws.onclose = () => {
        // 우리가 닫은 게 아니면 몇 초 후 최대 2회 재연결 시도
        if (!closedByUs && retry < 2) {
          retry += 1;
          reconnectTimer = setTimeout(open, 3000);
        }
      };
    };
    open();

    return () => {
      closedByUs = true;
      if (reconnectTimer) clearTimeout(reconnectTimer); // 예약된 재연결 취소(좀비 연결 방지)
      ws?.close();
    };
  }, [id, loadBundle]);

  return (
    <>
      {/* 뒤로가기(환자 검색) */}
      <Link
        href="/patients"
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
      >
        <Icon name="arrow_back" className="text-base" />
        환자 검색
      </Link>

      <div className="flex flex-col gap-4">
        {phase === "loading" && <DetailSkeleton />}

        {phase === "notfound" && (
          <EmptyState
            title="환자를 찾을 수 없습니다"
            desc="존재하지 않거나 삭제된 환자입니다."
          />
        )}

        {phase === "error" && (
          <EmptyState
            title="정보를 불러올 수 없습니다"
            desc="백엔드 서버(http://localhost:8000)가 켜져 있는지 확인하세요."
            danger
          />
        )}

        {phase === "ok" && bundle?.patient && (
          <DetailContent
            bundle={bundle}
            onSaved={() => loadBundle(undefined, true)}
          />
        )}
        {phase === "ok" && bundle && !bundle.patient && (
          <EmptyState
            title="정보를 표시할 수 없습니다"
            desc="환자 정보 형식이 올바르지 않습니다."
            danger
          />
        )}
      </div>
    </>
  );
}

// ── 정상 본문 ───────────────────────────────────────────────
function DetailContent({
  bundle,
  onSaved,
}: {
  bundle: PatientBundle;
  onSaved: () => void;
}) {
  const p = bundle.patient;
  const allergies = (p.allergies ?? "").trim();
  // 목록 키가 누락/null이어도 render 중 크래시하지 않도록 빈 배열로 방어
  const visits = bundle.visits ?? [];
  const diagnoses = bundle.diagnoses ?? [];
  const medications = bundle.medications ?? [];
  const labResults = bundle.lab_results ?? [];
  const billings = bundle.billings ?? [];
  // 접근 범위(5.3): 허용 영역 목록. 미전송(구버전)이면 전체 허용으로 간주(하위호환).
  // scope key 기준(검사=labs, 수납=billing) — 응답 키(lab_results·billings)와 다른 점 주의.
  const vis = bundle.visible_sections ?? [
    "visits",
    "diagnoses",
    "medications",
    "labs",
    "billing",
  ];

  // 처방 수정 대상(잘못 입력 정정). null이면 PrescribeForm은 '추가 모드'.
  const [editingMed, setEditingMed] = useState<MedicationItem | null>(null);

  return (
    <>
      {/* 안전 경고 배너(Story 3.2): 미확인=빨간 경고+확인 버튼 / 확인됨=차분 배너.
          담당자가 "확인"하기 전까지 유지(백엔드 SafetyAck에 기록되어 전 직원 공유). */}
      <SafetyBanner
        patientId={p.id}
        allergies={allergies}
        safetyAck={bundle.safety_ack}
        onSaved={onSaved}
      />

      {/* 환자 헤더 카드 (아바타 + 기본정보 + 현재 단계) */}
      <div className="flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-surface p-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-primary/10 text-xl font-bold text-accent-primary">
          {p.name.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-text-primary">{p.name}</span>
            <span className="text-sm text-text-secondary">
              {p.age}세 · {genderLabel(p.gender)}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <Icon name="badge" className="text-base" />
              {p.registration_number}
            </span>
            {p.resident_id && (
              <span className="flex items-center gap-1">
                <Icon name="fingerprint" className="text-base" />
                {p.resident_id}
              </span>
            )}
            {p.phone && (
              <span className="flex items-center gap-1">
                <Icon name="call" className="text-base" />
                {p.phone}
              </span>
            )}
          </div>
        </div>
        {/* 현재 단계 배지(단계별 색) — 아래 타임라인과 함께 '지금 어디'를 한눈에 */}
        <span
          className={`shrink-0 self-start rounded-full px-3 py-1 text-caption font-semibold ${stageStyle(p.current_stage).bg} ${stageStyle(p.current_stage).text}`}
        >
          {p.current_stage}
        </span>
      </div>

      {/* 환자 단계 타임라인(Story 4.1) — 접수→진료→검사→수납 진행 현황 */}
      <StageTimeline currentStage={p.current_stage} />

      {/* 필수 절차 체크리스트(Story 3.4) — 전부 체크해야 "다음 단계로" 활성화 */}
      <ProcedureChecklist
        patientId={p.id}
        checklist={bundle.checklist}
        onSaved={onSaved}
      />

      {/* 방문기록 (5.3: 범위 밖이면 권한 없음 카드) */}
      {vis.includes("visits") ? (
        <InfoCard title="방문기록" icon="event">
          {visits.length === 0 ? (
            <EmptyRow />
          ) : (
            visits.map((v, i) => (
              <Row
                key={i}
                k={`${fmtDateTime(v.visited_at)} · ${v.department}`}
                v={v.reason || "—"}
              />
            ))
          )}
        </InfoCard>
      ) : (
        <NoAccessCard title="방문기록" icon="event" />
      )}

      {/* 진단 (5.3) */}
      {vis.includes("diagnoses") ? (
        <InfoCard title="진단" icon="clinical_notes">
          {diagnoses.length === 0 ? (
            <EmptyRow />
          ) : (
            diagnoses.map((d, i) => (
              <Row
                key={i}
                k={d.name}
                v={`${fmtDate(d.diagnosed_at)}${d.status === "resolved" ? " · 해결" : ""}`}
              />
            ))
          )}
        </InfoCard>
      ) : (
        <NoAccessCard title="진단" icon="clinical_notes" />
      )}

      {/* 투약 + 처방 입력/수정 (5.3: 투약 범위 밖이면 목록·입력폼 모두 숨기고 권한 없음 카드) */}
      {vis.includes("medications") ? (
        <>
          {/* 투약 — 각 약마다 수정/삭제 버튼(잘못 입력 정정) */}
          <InfoCard title="투약" icon="medication">
            <MedicationList
              patientId={p.id}
              medications={medications}
              onEdit={setEditingMed}
              onSaved={onSaved}
            />
          </InfoCard>

          {/* 처방 입력/수정 (Story 3.1) — 알레르기/금기 충돌 시 경고 팝업.
              editingMed가 바뀔 때 key로 폼을 리마운트해 입력칸을 그 약 값으로 채운다. */}
          <PrescribeForm
            key={editingMed ? `edit-${editingMed.id}` : "new"}
            patientId={p.id}
            editing={editingMed}
            onCancelEdit={() => setEditingMed(null)}
            onSaved={() => {
              setEditingMed(null); // 수정 저장 후 추가 모드로 복귀
              onSaved();
            }}
          />
        </>
      ) : (
        <NoAccessCard title="투약" icon="medication" />
      )}

      {/* 검사결과 (5.3: scope key는 labs) */}
      {vis.includes("labs") ? (
        <InfoCard title="검사결과" icon="science">
        {labResults.length === 0 ? (
          <EmptyRow />
        ) : (
          labResults.map((l, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 py-1.5 text-sm"
            >
              <span className="text-text-secondary">
                {fmtDate(l.measured_at)} · {l.test_name}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-semibold text-text-primary">
                  {l.value}
                  {l.unit ? ` ${l.unit}` : ""}
                </span>
                {l.flag === "abnormal" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-caption font-medium text-warning">
                    <Icon name="warning" className="text-sm" />
                    <span>이상</span>
                  </span>
                )}
              </span>
            </div>
          ))
        )}
        </InfoCard>
      ) : (
        <NoAccessCard title="검사결과" icon="science" />
      )}

      {/* 부서 간 인계 메모(Story 4.2) — 이전 부서가 남긴 메모 표시 + 내 메모 작성 */}
      <HandoverNoteSection
        patientId={p.id}
        notes={bundle.handover_notes ?? []}
        onSaved={onSaved}
      />

      {/* 수납 (5.3) */}
      {vis.includes("billing") ? (
        <InfoCard title="수납" icon="receipt_long">
        {billings.length === 0 ? (
          <EmptyRow />
        ) : (
          billings.map((b, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 py-1.5 text-sm"
            >
              <span className="text-text-secondary">{b.item}</span>
              <span className="flex items-center gap-2">
                <span className="font-mono font-semibold text-text-primary">
                  {(b.amount ?? 0).toLocaleString("ko-KR")}원
                </span>
                {b.status === "paid" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-caption font-medium text-success">
                    <Icon name="check_circle" className="text-sm" />
                    <span>완료</span>
                  </span>
                ) : (
                  <span className="rounded-full bg-bg-elevated px-2 py-0.5 text-caption font-medium text-text-secondary">
                    미납
                  </span>
                )}
              </span>
            </div>
          ))
        )}
        </InfoCard>
      ) : (
        <NoAccessCard title="수납" icon="receipt_long" />
      )}
    </>
  );
}

// 접근 권한이 없는 정보 영역 카드(5.3) — '기록 없음'과 구분해 '권한 없음'을 명확히 표시.
function NoAccessCard({ title, icon }: { title: string; icon: string }) {
  return (
    <section className="rounded-xl border border-border-subtle bg-bg-surface p-5">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Icon name={icon} className="text-lg text-text-muted" />
        {title}
      </h2>
      <p className="flex items-center gap-1.5 text-sm text-text-muted">
        <Icon name="lock" className="text-base" />
        이 정보는 접근 권한이 없습니다.
      </p>
    </section>
  );
}

// ── 공통 작은 부품들 ─────────────────────────────────────────
function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border-subtle bg-bg-surface p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Icon name={icon} className="text-lg text-accent-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-text-secondary">{k}</span>
      <span className="text-right font-semibold text-text-primary">{v}</span>
    </div>
  );
}

function EmptyRow() {
  return <p className="py-1 text-sm text-text-muted">기록 없음</p>;
}

function EmptyState({
  title,
  desc,
  danger,
}: {
  title: string;
  desc: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-6 text-center">
      <p className={`font-bold ${danger ? "text-danger" : "text-text-primary"}`}>
        {title}
      </p>
      <p className="mt-1 text-sm text-text-secondary">{desc}</p>
      <Link
        href="/patients"
        className="mt-4 inline-flex h-11 items-center rounded-lg bg-bg-elevated px-4 text-sm text-text-primary hover:bg-border-subtle"
      >
        ← 환자 검색으로
      </Link>
    </div>
  );
}

// 불러오는 중 자리표시(스켈레톤) — 회색 박스 몇 개
function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">불러오는 중…</span>
      <div className="h-16 animate-pulse rounded-lg bg-bg-elevated" />
      <div className="h-24 animate-pulse rounded-lg bg-bg-elevated" />
      <div className="h-24 animate-pulse rounded-lg bg-bg-elevated" />
    </div>
  );
}
