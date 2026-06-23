"use client";

// 부서 간 인계 메모 (Story 4.2, FR8)
// - 이전 부서가 남긴 인계 메모를 최신순으로 보여주고, 내 부서의 메모도 남길 수 있다.
//   전화·메모지 없이도 다음 부서 직원이 환자 화면에서 바로 확인(자동 전달).
// - 저장 = POST /api/patients/{id}/handover-note → 백엔드가 broadcast → 같은 환자 화면을
//   보는 모든 클라이언트가 새 메모를 즉시 본다(2.4 실시간). 확실히 하려고 onSaved도 호출.
// - from_stage(작성 시점 단계)는 서버가 자동 기록 → 여기선 표시만 한다.
// ★ 낙관적 업데이트: 작성/수정/삭제를 누르는 즉시 화면에 반영하고 저장은 뒤에서 처리한다
//   (서버 왕복 + 전체 재조회를 기다리지 않음). 실패하면 그 변경만 되돌리고 오류를 보여준다.
//   서버 재조회(onSaved)가 오면 오버레이를 비워 정식 데이터로 교체한다.

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { API_BASE } from "@/lib/api";
import { authHeader, clearToken } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";
import { Icon } from "@/components/Icon";

// GET 묶음의 handover_notes 한 건의 모양
export type HandoverNote = {
  id: number;
  from_stage: string;
  note: string;
  author_name: string;
  created_at: string;
};

export function HandoverNoteSection({
  patientId,
  notes,
  onSaved,
}: {
  patientId: number;
  notes: HandoverNote[];
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 재진입 방지 락: 빠른 더블클릭/느린 네트워크에도 메모가 한 번만 저장되게(3.1 패턴)
  const submittingRef = useRef(false);

  // 메모 수정/삭제(잘못 입력 정정) 상태
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [rowError, setRowError] = useState<string | null>(null);
  const rowBusyRef = useRef(false);

  // 낙관적 오버레이: 작성(임시 추가)·수정(내용 덮어쓰기)·삭제(숨김)를 즉시 화면에 반영.
  const [pendingAdds, setPendingAdds] = useState<HandoverNote[]>([]);
  const [editedNotes, setEditedNotes] = useState<Record<number, string>>({});
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const tempIdRef = useRef(-1); // 임시 메모용 음수 id(서버 양수 id와 충돌 없음)

  // 서버 메모가 바뀌면(부모 재조회 완료) 오버레이를 비운다 — 서버가 최종 진실.
  // React 권장 패턴: effect 대신 렌더 중 '이전 값과 비교'해 즉시 리셋.
  const notesSignature = notes.map((n) => `${n.id}:${n.note}`).join("|");
  const [prevSignature, setPrevSignature] = useState(notesSignature);
  if (notesSignature !== prevSignature) {
    setPrevSignature(notesSignature);
    setPendingAdds([]);
    setEditedNotes({});
    setDeletedIds([]);
  }

  // 화면에 그릴 최종 목록: 임시 추가분(맨 위·최신) + (삭제 제외, 수정 반영)된 서버 메모
  const visibleNotes: (HandoverNote & { pending?: boolean })[] = [
    ...pendingAdds.map((n) => ({ ...n, pending: true })),
    ...notes
      .filter((n) => !deletedIds.includes(n.id))
      .map((n) =>
        editedNotes[n.id] != null ? { ...n, note: editedNotes[n.id] } : n,
      ),
  ];

  const canSubmit = text.trim().length > 0 && !submitting;

  // 세션 만료/무효(401·403) 공통 처리
  function handleAuthFail() {
    clearToken();
    router.replace("/login");
  }

  function startEdit(n: HandoverNote) {
    setEditingId(n.id);
    setEditText(n.note);
    setRowError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
    setRowError(null);
  }

  // 메모 내용 수정 저장(PATCH) — 낙관적: 즉시 화면 텍스트 덮어쓰고 창 닫음 → 실패 시 복원
  async function saveEdit(noteId: number) {
    const note = editText.trim();
    if (!note) {
      setRowError("메모 내용을 입력하세요");
      return;
    }
    if (rowBusyRef.current) return;
    rowBusyRef.current = true;
    setRowError(null);
    setEditedNotes((p) => ({ ...p, [noteId]: note })); // 낙관적 반영
    cancelEdit();
    try {
      const res = await fetch(
        `${API_BASE}/api/patients/${patientId}/handover-note/${noteId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify({ note }),
        },
      );
      if (res.status === 401 || res.status === 403) {
        handleAuthFail();
        return;
      }
      if (!res.ok) {
        // 롤백: 이 메모의 낙관적 수정 제거
        setEditedNotes((p) => {
          const next = { ...p };
          delete next[noteId];
          return next;
        });
        setRowError("메모 수정에 실패했습니다. 잠시 후 다시 시도하세요.");
        return;
      }
      onSaved?.();
    } catch {
      setEditedNotes((p) => {
        const next = { ...p };
        delete next[noteId];
        return next;
      });
      setRowError("연결에 실패했습니다. 백엔드 서버가 켜져 있는지 확인하세요.");
    } finally {
      rowBusyRef.current = false;
    }
  }

  // 메모 삭제(DELETE) — 확인 후. 낙관적: 즉시 목록에서 숨김 → 실패 시 복원
  async function removeNote(noteId: number) {
    if (rowBusyRef.current) return;
    if (!window.confirm("이 인계 메모를 삭제할까요?")) return;
    rowBusyRef.current = true;
    setRowError(null);
    if (editingId === noteId) cancelEdit();
    setDeletedIds((p) => [...p, noteId]); // 낙관적 숨김
    try {
      const res = await fetch(
        `${API_BASE}/api/patients/${patientId}/handover-note/${noteId}`,
        { method: "DELETE", headers: { ...authHeader() } },
      );
      if (res.status === 401 || res.status === 403) {
        handleAuthFail();
        return;
      }
      if (!res.ok) {
        setDeletedIds((p) => p.filter((id) => id !== noteId)); // 롤백: 다시 보이게
        setRowError("메모 삭제에 실패했습니다. 잠시 후 다시 시도하세요.");
        return;
      }
      onSaved?.();
    } catch {
      setDeletedIds((p) => p.filter((id) => id !== noteId));
      setRowError("연결에 실패했습니다. 백엔드 서버가 켜져 있는지 확인하세요.");
    } finally {
      rowBusyRef.current = false;
    }
  }

  // 메모 작성(POST) — 낙관적: 임시 메모를 즉시 목록 맨 위에 띄우고 입력칸 비움 → 실패 시 제거·복원
  async function submit() {
    const note = text.trim();
    if (!note) return;
    if (submittingRef.current) return; // 이미 처리 중이면 무시(중복 저장 방지)
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);

    const tempId = tempIdRef.current--;
    const optimistic: HandoverNote = {
      id: tempId,
      from_stage: "", // 서버가 작성 시점 단계로 채움 → 재조회로 교체
      note,
      author_name: "", // 서버가 작성자로 채움 → 재조회로 교체
      created_at: new Date().toISOString(),
    };
    setPendingAdds((p) => [optimistic, ...p]); // 즉시 표시
    setText(""); // 입력칸 비움

    try {
      const res = await fetch(
        `${API_BASE}/api/patients/${patientId}/handover-note`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify({ note }),
        },
      );

      if (res.status === 401 || res.status === 403) {
        // 세션 만료/무효 → 토큰 비우고 로그인 화면으로(기존 정책 일관)
        clearToken();
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        setPendingAdds((p) => p.filter((n) => n.id !== tempId)); // 롤백: 임시 메모 제거
        setText(note); // 입력 내용 복원(다시 시도 가능)
        setError("메모 저장에 실패했습니다. 잠시 후 다시 시도하세요.");
        return;
      }

      // 성공: 목록 갱신(WS가 처리하지만 확실히 하려고 직접도 호출) → 임시 메모가 정식 메모로 교체됨
      onSaved?.();
    } catch {
      // 네트워크 등 예외 → 롤백 + 인라인 오류만(화면 전체는 유지)
      setPendingAdds((p) => p.filter((n) => n.id !== tempId));
      setText(note);
      setError("연결에 실패했습니다. 백엔드 서버가 켜져 있는지 확인하세요.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-border-subtle bg-bg-surface p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Icon name="forum" className="text-lg text-accent-primary" />
        인계 메모
      </h2>

      {/* 메모 목록(최신순) */}
      {visibleNotes.length === 0 ? (
        <p className="py-1 text-sm text-text-muted">기록 없음</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visibleNotes.map((n) => (
            <li
              key={n.id}
              className={
                "rounded-lg border border-border-subtle bg-bg-elevated p-3" +
                (n.pending ? " opacity-60" : "")
              }
            >
              <div className="flex items-start justify-between gap-3">
                <span className="shrink-0 rounded-full bg-accent-primary/10 px-2 py-0.5 text-[11px] font-semibold text-accent-primary">
                  {n.pending ? "작성" : n.from_stage}
                </span>
                <span className="text-right text-caption text-text-muted">
                  {n.pending
                    ? "저장 중…"
                    : `${n.author_name || "—"} · ${fmtDateTime(n.created_at)}`}
                </span>
              </div>

              {editingId === n.id ? (
                // 수정 모드: 텍스트 편집 + 저장/취소
                <div className="mt-2 flex flex-col gap-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    aria-label="인계 메모 수정"
                    rows={2}
                    maxLength={2000}
                    className="w-full resize-none rounded-lg border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-primary outline-none focus-visible:border-accent"
                  />
                  {rowError && (
                    <p role="alert" className="text-sm text-danger">
                      {rowError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void saveEdit(n.id)}
                      className="h-9 rounded-lg bg-accent-primary px-4 text-sm font-semibold text-accent-on hover:bg-accent-hover"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="h-9 rounded-lg border border-border-subtle px-4 text-sm text-text-secondary hover:bg-bg-surface"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                // 보기 모드: 내용 + 수정/삭제 버튼(저장 중인 임시 메모는 버튼 숨김)
                <>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-text-primary">
                    {n.note}
                  </p>
                  {!n.pending && (
                    <div className="mt-2 flex justify-end gap-0.5">
                      <button
                        type="button"
                        onClick={() => startEdit(n)}
                        aria-label="인계 메모 수정"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                      >
                        <Icon name="edit" className="text-lg" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeNote(n.id)}
                        aria-label="인계 메모 삭제"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-danger/10 hover:text-danger"
                      >
                        <Icon name="delete" className="text-lg" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 수정/삭제 중 발생한 오류(편집 중이 아닐 때 — 예: 삭제 실패) */}
      {rowError && editingId === null && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {rowError}
        </p>
      )}

      {/* 메모 작성 폼 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="mt-3 flex flex-col gap-2"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="인계 내용을 입력하세요…"
          aria-label="인계 메모 내용"
          rows={2}
          maxLength={2000}
          className="w-full resize-none rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus-visible:border-accent"
        />

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="h-11 rounded-lg bg-accent-primary px-4 text-base font-semibold text-accent-on transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "저장 중…" : "인계 메모 저장"}
        </button>
      </form>
    </section>
  );
}
