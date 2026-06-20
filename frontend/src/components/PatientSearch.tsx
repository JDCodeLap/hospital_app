"use client";

// 환자 검색 부품: 검색창에 이름/등록번호를 입력하면 일치하는 환자 카드를 실시간으로 보여준다.
// - 타이핑할 때마다 250ms 기다렸다가(디바운스) 백엔드에 검색 요청 → 매 글자마다 요청 폭주 방지
// - 빠르게 타이핑하면 이전 요청은 취소(AbortController) → 늦게 온 옛 결과가 최신 결과를 덮어쓰는 일 방지
// - 환자 데이터는 로그인 통과 후 여기(클라이언트)에서 토큰을 달아 호출한다(미인증 노출 방지, 1.4 가이드)
// 통합 화면(/patients/{id} 상세)은 Story 2.3에서 만든다 — 여기선 그쪽으로 가는 링크만.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { API_BASE } from "@/lib/api";
import { authHeader, clearToken } from "@/lib/auth";
import { Icon } from "@/components/Icon";

// 목록 응답 한 건의 모양(백엔드 list_patients 요약 + allergies)
export type PatientSummary = {
  id: number;
  registration_number: string;
  name: string;
  age: number;
  gender: string;
  current_stage: string;
  allergies: string;
};

// 검색어가 바뀐 뒤 실제 요청까지 기다리는 시간(ms)
const DEBOUNCE_MS = 250;

export function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 늦게 도착한 응답이 최신 결과를 덮어쓰지 못하도록 두 가지를 함께 쓴다:
    //  - cancelled 표식: 더 새로운 검색이 시작되면 이 응답의 결과 반영을 모두 건너뜀
    //  - AbortController: 진행 중인 네트워크 요청 자체를 취소
    let cancelled = false;
    const controller = new AbortController();
    const term = query.trim(); // 앞뒤 공백 제거(공백만 입력은 전체 목록으로 취급)

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const url =
          `${API_BASE}/api/patients` +
          (term ? `?q=${encodeURIComponent(term)}` : "");
        const res = await fetch(url, {
          headers: { ...authHeader() },
          signal: controller.signal,
        });
        if (cancelled) return; // 더 새로운 검색이 시작됨 → 이 응답은 버린다
        if (res.status === 401 || res.status === 403) {
          // 검색 중 세션 만료/무효 → 토큰 비우고 로그인 화면으로(AuthGuard와 동일 정책)
          clearToken();
          router.replace("/login");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: PatientSummary[] = await res.json();
        if (cancelled) return; // 파싱 사이에 새 검색이 시작됐으면 반영하지 않음
        setResults(data);
        setError(null);
      } catch (err: unknown) {
        if (cancelled) return;
        // 일부러 취소한 요청(빠른 타이핑/화면 떠남)은 오류로 취급하지 않는다.
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(
          "백엔드에 연결할 수 없습니다. 백엔드 서버(http://localhost:8000)가 켜져 있는지 확인하세요.",
        );
        setResults(null);
      } finally {
        // 취소된 요청이면 로딩 상태를 건드리지 않는다(다음 요청이 이어받음).
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, router]);

  return (
    <div className="w-full">
      {/* 검색창 — 접근성: 높이 44px(h-11). 돋보기 아이콘 + 입력 */}
      <div className="flex h-11 items-center gap-2 rounded-lg border border-border-subtle bg-bg-surface px-3 focus-within:border-accent-primary">
        <Icon name="search" className="text-xl text-text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름 또는 등록번호 검색"
          aria-label="환자 검색"
          className="h-full w-full bg-transparent text-base text-text-primary outline-none placeholder:text-text-muted"
        />
      </div>

      {/* 상태별 안내: 로딩 / 오류 / 빈 결과 / 결과 목록 */}
      <div className="mt-4">
        {loading && (
          <p className="text-sm text-text-secondary" role="status">
            불러오는 중…
          </p>
        )}

        {!loading && error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && results && results.length === 0 && (
          <p className="text-sm text-text-secondary">검색 결과 없음</p>
        )}

        {!loading && !error && results && results.length > 0 && (
          <ul className="flex flex-col gap-3">
            {results.map((p) => (
              <li key={p.id}>
                <PatientCard patient={p} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// 환자 카드 한 장. 누르면 통합 화면(/patients/{id}, Story 2.3에서 생성)으로 이동.
function PatientCard({ patient }: { patient: PatientSummary }) {
  // 알레르기는 콤마로 구분된 문자열 → 비어 있지 않으면 위험 배지를 보여준다.
  // (백엔드가 혹시 null을 주더라도 안전하게 빈 문자열로 처리)
  const allergies = patient.allergies ?? "";
  const hasAllergy = allergies.trim().length > 0;

  return (
    <Link
      href={`/patients/${patient.id}`}
      // 대상 페이지(2.3)가 아직 없으므로 자동 미리불러오기(prefetch) 끔 → 불필요한 404 요청 방지
      prefetch={false}
      className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-surface p-4 transition-all hover:border-accent-primary hover:shadow-sm focus-visible:border-accent-primary focus-visible:outline-none"
    >
      {/* 아바타(이름 첫 글자) */}
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-primary/10 font-bold text-accent-primary">
        {patient.name.slice(0, 1)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-text-primary">{patient.name}</span>
          {/* 색만으로 정보 전달 금지(UX-DR8): 아이콘 + 글자 함께 */}
          {hasAllergy && (
            <span className="inline-flex items-center gap-1 rounded-full bg-danger/15 px-2 py-0.5 text-caption font-medium text-danger">
              <Icon name="warning" className="text-sm" />
              <span>알레르기</span>
            </span>
          )}
        </div>
        <p className="mt-1 font-mono text-sm text-text-secondary">
          {patient.age}세 · {patient.registration_number}
          {hasAllergy && (
            // 화면 낭독기(스크린리더)용: 어떤 알레르기인지 텍스트로도 제공
            <span className="sr-only"> · 알레르기: {allergies}</span>
          )}
        </p>
      </div>

      {/* 현재 단계 배지 + 화살표 */}
      <span className="shrink-0 rounded-full bg-bg-elevated px-3 py-1 text-caption text-text-secondary">
        {patient.current_stage}
      </span>
      <Icon name="chevron_right" className="shrink-0 text-text-muted" />
    </Link>
  );
}
