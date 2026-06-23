"use client";

// 기준값 설정 (Story 5.5, FR14) — 관리자 전용.
// - GET /api/admin/settings 로 현재 "대기 초과 기준 시간(분)"과 허용 범위를 불러온다.
// - 숫자를 바꿔 저장(PUT)하면 4.4 대기 초과 알림·환자 흐름판·5.4 대시보드에 자동 반영된다
//   (백엔드가 읽을 때 계산하므로 별도 새로고침 없이 다음 조회부터 적용).
// - 진짜 자물쇠는 백엔드(get_current_admin 403 + 1~1440 범위 422). 화면 제한은 UX 보조.
// - RSC 프리렌더 금지(1.4): AdminGuard 통과 후 여기(클라이언트)에서 토큰 달아 호출.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { API_BASE } from "@/lib/api";
import { authHeader, clearToken } from "@/lib/auth";
import { Icon } from "@/components/Icon";

type Settings = { stage_overdue_minutes: number; min: number; max: number };

export function AdminSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [value, setValue] = useState(""); // 입력칸(문자열로 다뤄 빈 값·중간 입력 허용)
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  // 이중 제출 방지 락(빠른 더블클릭/느린 네트워크에도 한 번만, 5.2 패턴)
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

  useEffect(() => {
    const controller = new AbortController();
    // effect 본문에서 setState를 직접 호출하지 않도록 async 콜백으로 감싼다(5.2 교훈)
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/admin/settings`, {
          headers: { ...authHeader() },
          signal: controller.signal,
        });
        if (res.status === 401 || res.status === 403) {
          handleAuthFail();
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Settings = await res.json();
        setSettings(data);
        setValue(String(data.stage_overdue_minutes));
        setLoadError(null);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLoadError(
          "설정을 불러올 수 없습니다. 백엔드 서버가 켜져 있는지 확인하세요.",
        );
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    if (busyRef.current || settings === null) return;
    setSaved(false);
    setFormError(null);
    // 클라 측 범위 검증(이중 방어) — 진짜 자물쇠는 백엔드(422)
    const n = Number(value);
    if (value.trim() === "" || !Number.isInteger(n) || n < settings.min || n > settings.max) {
      setFormError(
        `${settings.min}~${settings.max} 사이의 정수(분)를 입력하세요.`,
      );
      return;
    }
    busyRef.current = true;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ stage_overdue_minutes: n }),
      });
      if (res.status === 401 || res.status === 403) {
        handleAuthFail();
        return;
      }
      if (!res.ok) {
        // 범위 밖(422) 등 백엔드 안내를 그대로 보여준다
        setFormError(await readDetail(res, "저장에 실패했습니다. 값을 확인하세요."));
        return;
      }
      const data: Settings = await res.json();
      setSettings(data);
      setValue(String(data.stage_overdue_minutes));
      setSaved(true);
    } catch {
      setFormError("연결에 실패했습니다. 백엔드 서버가 켜져 있는지 확인하세요.");
    } finally {
      busyRef.current = false;
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-text-muted">불러오는 중…</p>;
  }
  if (loadError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {loadError}
      </p>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
        <label htmlFor="overdue-minutes" className="font-semibold text-text-primary">
          대기 초과 기준 시간 (분)
        </label>
        <p className="mt-1 text-sm text-text-secondary">
          이 시간(분)을 넘겨 한 단계에 머물면 ‘대기 초과’로 표시·알림됩니다.
          {settings && ` (${settings.min}~${settings.max}분)`}
        </p>
        <p className="mt-1 text-sm text-text-muted">
          적용 대상: 대기 초과 알림 · 환자 흐름판 · 전체 현황 대시보드
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            id="overdue-minutes"
            type="number"
            inputMode="numeric"
            min={settings?.min}
            max={settings?.max}
            step={1}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setSaved(false);
            }}
            className="h-11 w-28 rounded-lg border border-border-subtle bg-bg-elevated px-3 text-sm text-text-primary outline-none focus-visible:border-accent"
          />
          <span className="text-sm text-text-secondary">분</span>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="ml-auto flex h-11 items-center gap-2 rounded-lg bg-accent-primary px-5 text-base font-semibold text-accent-on transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="save" className="text-xl" />
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>

        {formError && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {formError}
          </p>
        )}
        {saved && !formError && (
          <p role="status" className="mt-3 flex items-center gap-1 text-sm text-accent-primary">
            <Icon name="check_circle" className="text-base" />
            저장되었습니다.
          </p>
        )}
      </div>
    </div>
  );
}
