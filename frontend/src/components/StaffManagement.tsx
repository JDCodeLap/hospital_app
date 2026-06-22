"use client";

// 직원 계정 관리 (Story 5.2, FR11) — 관리자 전용.
// - GET /api/admin/staff 로 직원 목록을 불러오고, 등록(POST)·수정(PATCH)·삭제(DELETE) 한다.
//   모든 API는 백엔드 get_current_admin(5.1)으로 보호 → 일반 직원 403, 미인증 401.
// - 권한(role: 관리자/일반직원)과 직군(job_title: 의사/간호사/원무과/기타)은 별개로 다룬다.
// - 진짜 자물쇠·안전가드(마지막 관리자 보호·아이디 중복·비번 필수 등)는 백엔드가 강제하고,
//   여기서는 그 안내(detail 메시지)를 사용자에게 그대로 보여준다.
// - RSC 프리렌더 금지(1.4): AdminGuard 통과 후 여기(클라이언트)에서 토큰 달아 호출.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { API_BASE } from "@/lib/api";
import { authHeader, clearToken } from "@/lib/auth";
import { Icon } from "@/components/Icon";

type StaffRow = {
  id: number;
  username: string;
  full_name: string;
  role: string;
  job_title: string;
  access_scope: string; // 5.3: "all" 또는 영역 키 콤마 목록
  is_active: boolean;
};

// 권한 select: 화면 라벨 ↔ 저장 값
const ROLE_OPTIONS = [
  { value: "staff", label: "일반직원" },
  { value: "admin", label: "관리자" },
];
const ROLE_LABEL: Record<string, string> = { admin: "관리자", staff: "일반직원" };
// 직군 select(분류·표시용). 빈 값은 "미지정".
const JOB_TITLES = ["의사", "간호사", "원무과", "기타"];

// 정보 영역 접근 범위(5.3, FR12) — 백엔드 ACCESS_SECTIONS와 키·라벨 일치.
const SECTIONS = [
  { key: "visits", label: "방문" },
  { key: "diagnoses", label: "진단" },
  { key: "medications", label: "투약" },
  { key: "labs", label: "검사" },
  { key: "billing", label: "수납" },
];
const SECTION_LABEL: Record<string, string> = Object.fromEntries(
  SECTIONS.map((s) => [s.key, s.label]),
);

// 저장된 access_scope 문자열 → 화면 표시용 요약("전체" 또는 "방문·진단…")
function scopeSummary(scope: string): string {
  const s = (scope || "all").trim().toLowerCase();
  if (s === "" || s === "all") return "전체";
  return s
    .split(",")
    .map((k) => SECTION_LABEL[k.trim()] ?? k.trim())
    .filter(Boolean)
    .join("·");
}

export function StaffManagement() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // 현재 로그인한 관리자 본인 id — 자기 계정 비활성화 토글을 잠그는 UX 보조용
  // (진짜 자물쇠는 백엔드 update_staff의 409. 여기서는 미리 못 끄게 막아 혼란 방지)
  const [meId, setMeId] = useState<number | null>(null);

  // 폼 상태: editingId=null 이면 신규 등록, 숫자면 그 직원 수정
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fUsername, setFUsername] = useState("");
  const [fPassword, setFPassword] = useState("");
  const [fFullName, setFFullName] = useState("");
  const [fRole, setFRole] = useState("staff");
  const [fJobTitle, setFJobTitle] = useState("");
  // 접근 범위(5.3): 전체 접근 토글 + 개별 영역 선택. 전체면 fSections 무시.
  const [fScopeAll, setFScopeAll] = useState(true);
  const [fSections, setFSections] = useState<string[]>([]);
  const [fActive, setFActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // 목록 위에 띄우는 동작 오류(삭제 실패 등)
  const [actionError, setActionError] = useState<string | null>(null);
  // 이중 제출 방지 락(빠른 더블클릭/느린 네트워크에도 한 번만, 3.1/4.2 패턴)
  const busyRef = useRef(false);

  // 세션 만료/무효(401·403) 공통 처리 → 토큰 비우고 로그인 화면으로
  function handleAuthFail() {
    clearToken();
    router.replace("/login");
  }

  // 백엔드 4xx 응답에서 detail 메시지를 꺼낸다(없으면 기본 문구)
  async function readDetail(res: Response, fallback: string): Promise<string> {
    try {
      const data = await res.json();
      if (data && typeof data.detail === "string") return data.detail;
    } catch {
      /* 본문 없음/파싱 실패는 무시 */
    }
    return fallback;
  }

  async function load(signal?: AbortSignal) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/staff`, {
        headers: { ...authHeader() },
        signal,
      });
      if (res.status === 401 || res.status === 403) {
        handleAuthFail();
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: StaffRow[] = await res.json();
      setStaff(data);
      setLoadError(null);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setLoadError(
        "직원 목록을 불러올 수 없습니다. 백엔드 서버가 켜져 있는지 확인하세요.",
      );
    } finally {
      setLoading(false);
    }
  }

  // 본인 id 조회(/api/auth/me) — 자기 행 활성 토글 잠금에만 사용. 실패해도 화면은 정상(보조 정보).
  async function loadMe(signal?: AbortSignal) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { ...authHeader() },
        signal,
      });
      if (!res.ok) return; // 인증 실패는 load()가 401/403로 처리. 여기선 조용히 무시.
      const data = await res.json();
      if (typeof data?.id === "number") setMeId(data.id);
    } catch {
      /* 본인 id를 못 얻어도 백엔드 409가 최종 방어선 */
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    // effect 본문에서 setState를 직접 호출하지 않도록 async 콜백으로 감싼다(2.4/4.3 교훈).
    void (async () => {
      await load(controller.signal);
      await loadMe(controller.signal);
    })();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditingId(null);
    setFUsername("");
    setFPassword("");
    setFFullName("");
    setFRole("staff");
    setFJobTitle("");
    setFScopeAll(true); // 기본 전체 접근
    setFSections([]);
    setFActive(true);
    setFormError(null);
    setActionError(null);
    setFormOpen(true);
  }

  function openEdit(s: StaffRow) {
    setEditingId(s.id);
    setFUsername(s.username);
    setFPassword(""); // 비워두면 비밀번호 변경 안 함
    setFFullName(s.full_name);
    setFRole(s.role === "admin" ? "admin" : "staff");
    setFJobTitle(s.job_title);
    // 접근 범위 파싱: 'all'/빈 값이면 전체, 아니면 개별 영역 선택
    const sc = (s.access_scope || "all").trim().toLowerCase();
    if (sc === "" || sc === "all") {
      setFScopeAll(true);
      setFSections([]);
    } else {
      setFScopeAll(false);
      setFSections(sc.split(",").map((x) => x.trim()).filter(Boolean));
    }
    setFActive(s.is_active);
    setFormError(null);
    setActionError(null);
    setFormOpen(true);
  }

  // 개별 영역 체크 토글
  function toggleSection(key: string) {
    setFSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
  }

  async function submitForm() {
    if (busyRef.current) return;
    // 신규 등록은 아이디·비번 필수(백엔드도 막지만 UX로 먼저 안내)
    if (editingId === null) {
      if (!fUsername.trim()) {
        setFormError("아이디를 입력하세요");
        return;
      }
      if (!fPassword.trim()) {
        setFormError("비밀번호를 입력하세요");
        return;
      }
    }
    // 접근 범위: 전체가 아니면 최소 1개 영역 선택해야 함(0개는 의미 없음·실수 방지)
    if (!fScopeAll && fSections.length === 0) {
      setFormError("접근 영역을 최소 1개 선택하거나 '전체 접근'을 켜세요");
      return;
    }
    const accessScope = fScopeAll ? "all" : fSections.join(",");
    busyRef.current = true;
    setSubmitting(true);
    setFormError(null);
    try {
      let res: Response;
      if (editingId === null) {
        // 등록
        res = await fetch(`${API_BASE}/api/admin/staff`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify({
            username: fUsername.trim(),
            password: fPassword,
            full_name: fFullName.trim(),
            role: fRole,
            job_title: fJobTitle.trim(),
            access_scope: accessScope,
          }),
        });
      } else {
        // 수정 — 비밀번호는 입력했을 때만 포함(빈 값이면 기존 유지)
        const body: Record<string, unknown> = {
          full_name: fFullName.trim(),
          role: fRole,
          job_title: fJobTitle.trim(),
          access_scope: accessScope,
          is_active: fActive,
        };
        if (fPassword.trim()) body.password = fPassword;
        res = await fetch(`${API_BASE}/api/admin/staff/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify(body),
        });
      }

      if (res.status === 401 || res.status === 403) {
        handleAuthFail();
        return;
      }
      if (!res.ok) {
        // 백엔드 안내(아이디 중복·마지막 관리자·권한값 오류 등)를 그대로 보여준다
        setFormError(
          await readDetail(res, "저장에 실패했습니다. 입력을 확인하세요."),
        );
        return;
      }
      // 성공: 폼 닫고 목록 새로고침
      closeForm();
      await load();
    } catch {
      setFormError("연결에 실패했습니다. 백엔드 서버가 켜져 있는지 확인하세요.");
    } finally {
      busyRef.current = false;
      setSubmitting(false);
    }
  }

  async function removeStaff(s: StaffRow) {
    if (busyRef.current) return;
    // 삭제 전 한 번 더 확인(AC4)
    if (
      !window.confirm(`'${s.full_name || s.username}' 직원을 삭제할까요?`)
    ) {
      return;
    }
    busyRef.current = true;
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/staff/${s.id}`, {
        method: "DELETE",
        headers: { ...authHeader() },
      });
      if (res.status === 401 || res.status === 403) {
        handleAuthFail();
        return;
      }
      if (!res.ok) {
        // 자기 삭제·마지막 관리자·활동 기록 보호 등 백엔드 안내를 그대로 표시
        setActionError(await readDetail(res, "삭제에 실패했습니다."));
        return;
      }
      await load();
    } catch {
      setActionError("연결에 실패했습니다. 백엔드 서버가 켜져 있는지 확인하세요.");
    } finally {
      busyRef.current = false;
    }
  }

  return (
    <div>
      {/* 상단: 직원 추가 버튼 */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          {loading ? "불러오는 중…" : `직원 ${staff.length}명`}
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="flex h-11 items-center gap-2 rounded-lg bg-accent-primary px-4 text-base font-semibold text-accent-on transition-colors hover:bg-accent-hover"
        >
          <Icon name="person_add" className="text-xl" />
          직원 추가
        </button>
      </div>

      {actionError && (
        <p role="alert" className="mb-3 text-sm text-danger">
          {actionError}
        </p>
      )}

      {/* 등록/수정 폼 */}
      {formOpen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitForm();
          }}
          className="mb-5 rounded-xl border border-border-subtle bg-bg-surface p-5"
        >
          <h2 className="mb-4 text-sm font-semibold text-text-primary">
            {editingId === null ? "새 직원 등록" : "직원 수정"}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* 아이디 — 등록 시에만 입력, 수정 시 읽기 전용 */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-text-secondary">아이디</span>
              {editingId === null ? (
                <input
                  value={fUsername}
                  onChange={(e) => setFUsername(e.target.value)}
                  autoComplete="off"
                  className="h-11 rounded-lg border border-border-subtle bg-bg-elevated px-3 text-sm text-text-primary outline-none focus-visible:border-accent"
                />
              ) : (
                <span className="flex h-11 items-center rounded-lg border border-border-subtle bg-bg-base px-3 text-sm text-text-muted">
                  {fUsername} (변경 불가)
                </span>
              )}
            </label>

            {/* 비밀번호 */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-text-secondary">
                비밀번호
                {editingId !== null && (
                  <span className="ml-1 text-text-muted">
                    (비워두면 변경 안 함)
                  </span>
                )}
              </span>
              <input
                type="password"
                value={fPassword}
                onChange={(e) => setFPassword(e.target.value)}
                autoComplete="new-password"
                placeholder={editingId === null ? "" : "••••••"}
                className="h-11 rounded-lg border border-border-subtle bg-bg-elevated px-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus-visible:border-accent"
              />
            </label>

            {/* 이름 */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-text-secondary">이름</span>
              <input
                value={fFullName}
                onChange={(e) => setFFullName(e.target.value)}
                className="h-11 rounded-lg border border-border-subtle bg-bg-elevated px-3 text-sm text-text-primary outline-none focus-visible:border-accent"
              />
            </label>

            {/* 권한 */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-text-secondary">권한</span>
              <select
                value={fRole}
                onChange={(e) => setFRole(e.target.value)}
                className="h-11 rounded-lg border border-border-subtle bg-bg-elevated px-3 text-sm text-text-primary outline-none focus-visible:border-accent"
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            {/* 직군 */}
            <label className="flex flex-col gap-1">
              <span className="text-sm text-text-secondary">직군</span>
              <select
                value={fJobTitle}
                onChange={(e) => setFJobTitle(e.target.value)}
                className="h-11 rounded-lg border border-border-subtle bg-bg-elevated px-3 text-sm text-text-primary outline-none focus-visible:border-accent"
              >
                <option value="">미지정</option>
                {JOB_TITLES.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </label>

            {/* 활성 여부 — 수정 시에만(신규는 항상 활성).
                자기 계정은 비활성화 불가(self-lockout 방지) → 토글 잠금 + 안내. */}
            {editingId !== null && (
              <label className="flex items-center gap-2 sm:mt-7">
                <input
                  type="checkbox"
                  checked={fActive}
                  disabled={editingId === meId}
                  onChange={(e) => setFActive(e.target.checked)}
                  className="h-5 w-5 accent-accent-primary disabled:opacity-50"
                />
                <span className="text-sm text-text-secondary">
                  {editingId === meId
                    ? "활성 계정 (자기 계정은 비활성화할 수 없습니다)"
                    : "활성 계정 (체크 해제 시 로그인 차단)"}
                </span>
              </label>
            )}
          </div>

          {/* 접근 범위(5.3, FR12) — 이 직원이 환자 화면에서 볼 수 있는 정보 영역 */}
          <div className="mt-4 rounded-lg border border-border-subtle bg-bg-elevated/40 p-3">
            <span className="text-sm font-medium text-text-secondary">
              접근 범위 (볼 수 있는 정보)
            </span>
            <label className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={fScopeAll}
                onChange={(e) => setFScopeAll(e.target.checked)}
                className="h-5 w-5 accent-accent-primary"
              />
              <span className="text-sm text-text-primary">
                전체 접근 (모든 정보 영역)
              </span>
            </label>
            {!fScopeAll && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 border-t border-border-subtle pt-2">
                {SECTIONS.map((s) => (
                  <label key={s.key} className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={fSections.includes(s.key)}
                      onChange={() => toggleSection(s.key)}
                      className="h-5 w-5 accent-accent-primary"
                    />
                    <span className="text-sm text-text-secondary">{s.label}</span>
                  </label>
                ))}
              </div>
            )}
            {fRole === "admin" && (
              <p className="mt-2 text-caption text-text-muted">
                관리자는 접근 범위와 무관하게 항상 모든 정보를 봅니다.
              </p>
            )}
          </div>

          {formError && (
            <p role="alert" className="mt-3 text-sm text-danger">
              {formError}
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="h-11 rounded-lg bg-accent-primary px-5 text-base font-semibold text-accent-on transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "저장 중…" : "저장"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="h-11 rounded-lg border border-border-subtle px-5 text-base font-medium text-text-secondary transition-colors hover:bg-bg-elevated"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {/* 목록 */}
      {loadError ? (
        <p role="alert" className="text-sm text-danger">
          {loadError}
        </p>
      ) : loading ? (
        <p className="text-sm text-text-muted">불러오는 중…</p>
      ) : staff.length === 0 ? (
        <p className="text-sm text-text-muted">등록된 직원이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {staff.map((s) => (
            <li
              key={s.id}
              className={
                "flex flex-wrap items-center gap-3 rounded-xl border border-border-subtle bg-bg-surface p-4 " +
                (s.is_active ? "" : "opacity-60")
              }
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-text-primary">
                    {s.full_name || "—"}
                  </span>
                  <span className="text-sm text-text-muted">@{s.username}</span>
                  {/* 권한 배지 */}
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold " +
                      (s.role === "admin"
                        ? "bg-accent-primary/10 text-accent-primary"
                        : "bg-bg-elevated text-text-muted")
                    }
                  >
                    {ROLE_LABEL[s.role] ?? s.role}
                  </span>
                  {/* 직군 배지 */}
                  {s.job_title && (
                    <span className="rounded-full bg-bg-elevated px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                      {s.job_title}
                    </span>
                  )}
                  {/* 접근 범위 배지(5.3) — 관리자는 항상 전체라 일반직원에만 표시 */}
                  {s.role !== "admin" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                      <Icon name="visibility" className="text-xs" />
                      {scopeSummary(s.access_scope)}
                    </span>
                  )}
                  {!s.is_active && (
                    <span className="rounded-full bg-bg-elevated px-2 py-0.5 text-[11px] font-medium text-text-muted">
                      비활성
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(s)}
                  aria-label={`${s.full_name || s.username} 수정`}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                >
                  <Icon name="edit" className="text-xl" />
                </button>
                <button
                  type="button"
                  onClick={() => void removeStaff(s)}
                  aria-label={`${s.full_name || s.username} 삭제`}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-text-secondary hover:bg-danger/10 hover:text-danger"
                >
                  <Icon name="delete" className="text-xl" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
