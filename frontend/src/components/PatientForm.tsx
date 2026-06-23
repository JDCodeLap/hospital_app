"use client";

// 환자 정보 입력 폼(신규 등록 + 기존 수정 공용 부품).
// - patientId가 없으면 '등록 모드': POST /api/patients 로 새 환자를 만든다.
// - patientId가 있으면 '수정 모드': 먼저 GET 으로 기존 값을 불러와 채운 뒤 PATCH 로 저장한다.
// 저장에 성공하면 그 환자의 통합 화면(/patients/{id})으로 이동한다.
//
// ※ 주민등록번호(민감정보)는 조회 시 마스킹된 값만 내려오므로(예: 901020-1******),
//   수정 모드에서는 칸을 비워 두고 "새로 입력할 때만 바뀜"으로 처리한다 — 마스킹된 값으로
//   원본을 덮어쓰는 사고를 막기 위함(백엔드도 같은 규칙으로 한 번 더 막는다).

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { API_BASE } from "@/lib/api";
import { authHeader, clearToken } from "@/lib/auth";
import { Icon } from "@/components/Icon";

// 수정 모드에서 기존 값을 채우기 위해 받는 GET 응답의 patient 부분(필요한 필드만)
type PatientBasics = {
  registration_number: string;
  name: string;
  birth_date: string; // "YYYY-MM-DD"
  gender: string; // "M" | "F" | "기타"
  phone: string;
  allergies: string;
};

// 등록번호가 겹쳤을 때 서버가 알려주는 '그 번호를 이미 쓰는 환자' 요약
type ConflictPatient = {
  id: number;
  name: string;
  registration_number: string;
  age: number;
  gender: string;
};

// 수정 모드 데이터 적재 상태
type LoadPhase = "loading" | "ready" | "notfound" | "error";

// 성별 코드 → 한국어(상세 화면과 동일 규칙)
function genderLabel(g: string): string {
  if (g === "M") return "남";
  if (g === "F") return "여";
  return g || "기타";
}

export function PatientForm({ patientId }: { patientId?: number }) {
  const router = useRouter();
  const isEditing = patientId != null;

  // 입력 칸 상태
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("기타");
  const [phone, setPhone] = useState("");
  const [residentId, setResidentId] = useState("");
  const [allergies, setAllergies] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");

  // 수정 모드: 기존 값 적재 상태(등록 모드는 곧장 ready)
  const [loadPhase, setLoadPhase] = useState<LoadPhase>(
    isEditing ? "loading" : "ready",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 등록번호 중복 시: 그 번호를 쓰는 환자 정보를 보여주는 안내(null이면 안 보임)
  const [conflict, setConflict] = useState<ConflictPatient | null>(null);
  const submittingRef = useRef(false); // 더블클릭 중복 전송 방지

  // 수정 모드면 기존 환자 기본정보를 불러와 칸을 채운다(주민번호는 비워 둠).
  useEffect(() => {
    if (!isEditing) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/patients/${patientId}`, {
          headers: { ...authHeader() },
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        if (res.status === 401 || res.status === 403) {
          clearToken();
          router.replace("/login");
          return;
        }
        if (res.status === 404 || res.status === 422) {
          setLoadPhase("notfound");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const p: PatientBasics = data.patient;
        setName(p.name ?? "");
        setBirthDate(p.birth_date ?? "");
        setGender(p.gender || "기타");
        setPhone(p.phone ?? "");
        setAllergies(p.allergies ?? "");
        setRegistrationNumber(p.registration_number ?? "");
        setLoadPhase("ready");
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLoadPhase("error");
      }
    })();
    return () => controller.abort();
  }, [isEditing, patientId, router]);

  const canSubmit =
    name.trim().length > 0 && birthDate.trim().length > 0 && !submitting;

  async function submit() {
    if (!canSubmit) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    setConflict(null); // 이전 중복 안내는 지우고 새로 시도
    try {
      // 등록=POST(전체), 수정=PATCH(보낸 필드만). 주민번호는 입력했을 때만 싣는다.
      const url = isEditing
        ? `${API_BASE}/api/patients/${patientId}`
        : `${API_BASE}/api/patients`;
      const body: Record<string, string> = {
        name: name.trim(),
        birth_date: birthDate,
        gender,
        phone: phone.trim(),
        allergies: allergies.trim(),
        registration_number: registrationNumber.trim(),
      };
      if (residentId.trim()) body.resident_id = residentId.trim();

      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(body),
      });

      if (res.status === 401 || res.status === 403) {
        clearToken();
        router.replace("/login");
        return;
      }
      if (res.status === 409) {
        // 등록번호 중복 — 서버가 그 번호를 쓰는 환자 정보(conflict_patient)를 함께 보냄.
        // 환자 정보가 있으면 그 카드를 보여주고, 없으면(폴백) 문구만 표시한다.
        const body = await res.json().catch(() => null);
        const detail = body?.detail;
        const other = detail?.conflict_patient as ConflictPatient | undefined;
        if (other) {
          setConflict(other);
        } else {
          setError(
            (typeof detail === "string" ? detail : detail?.message) ??
              "이미 사용 중인 등록번호입니다.",
          );
        }
        return;
      }
      if (res.status === 422) {
        const detail = await readDetail(res);
        setError(detail ?? "입력값을 확인하세요.");
        return;
      }
      if (!res.ok) {
        setError("저장에 실패했습니다. 잠시 후 다시 시도하세요.");
        return;
      }

      // 성공 → 그 환자의 통합 화면으로 이동(등록은 응답의 새 id, 수정은 기존 id)
      const saved = await res.json();
      const targetId = isEditing ? patientId : saved.id;
      router.push(`/patients/${targetId}`);
    } catch {
      setError("연결에 실패했습니다. 백엔드 서버가 켜져 있는지 확인하세요.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  // 적재 실패/없는 환자 상태(수정 모드)
  if (loadPhase === "loading") {
    return (
      <p className="text-sm text-text-secondary" role="status">
        불러오는 중…
      </p>
    );
  }
  if (loadPhase === "notfound") {
    return (
      <FormMessage
        title="환자를 찾을 수 없습니다"
        desc="존재하지 않거나 삭제된 환자입니다."
      />
    );
  }
  if (loadPhase === "error") {
    return (
      <FormMessage
        title="정보를 불러올 수 없습니다"
        desc="백엔드 서버(http://localhost:8000)가 켜져 있는지 확인하세요."
        danger
      />
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="flex flex-col gap-4"
    >
      {/* 이름(필수) */}
      <Field label="이름" required>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          aria-label="이름"
          className={inputClass}
        />
      </Field>

      {/* 생년월일(필수) + 성별 */}
      <div className="flex gap-3">
        <Field label="생년월일" required className="flex-1">
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            aria-label="생년월일"
            className={inputClass}
          />
        </Field>
        <Field label="성별" className="w-32">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            aria-label="성별"
            className={inputClass}
          >
            <option value="M">남</option>
            <option value="F">여</option>
            <option value="기타">기타</option>
          </select>
        </Field>
      </div>

      {/* 전화번호 */}
      <Field label="전화번호">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="010-1234-5678"
          aria-label="전화번호"
          className={inputClass}
        />
      </Field>

      {/* 주민등록번호 — 수정 모드는 안내 문구와 함께 '입력 시에만 변경' */}
      <Field
        label="주민등록번호"
        hint={
          isEditing
            ? "보안상 기존 값은 표시되지 않습니다. 바꿀 때만 새로 입력하세요(비우면 그대로 유지)."
            : "예: 901020-1234567 (선택)"
        }
      >
        <input
          value={residentId}
          onChange={(e) => setResidentId(e.target.value)}
          placeholder={isEditing ? "변경할 때만 입력" : "901020-1234567"}
          aria-label="주민등록번호"
          className={inputClass}
        />
      </Field>

      {/* 알레르기 — 콤마 구분(안전 경고에 쓰임) */}
      <Field label="알레르기" hint="여러 개면 쉼표(,)로 구분 — 예: 페니실린, 아스피린">
        <input
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          placeholder="없으면 비워 두세요"
          aria-label="알레르기"
          className={inputClass}
        />
      </Field>

      {/* 등록번호 — 등록 모드는 비우면 자동 부여 */}
      <Field
        label="등록번호"
        hint={
          isEditing
            ? "환자 고유 번호입니다. 꼭 필요할 때만 바꾸세요."
            : "비우면 자동으로 부여됩니다(P0009 …)."
        }
      >
        <input
          value={registrationNumber}
          onChange={(e) => {
            setRegistrationNumber(e.target.value);
            setConflict(null); // 번호를 고치는 순간 이전 중복 안내는 사라지게
          }}
          placeholder={isEditing ? "" : "자동 부여"}
          aria-label="등록번호"
          className={`${inputClass} font-mono`}
        />
      </Field>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {/* 등록번호 중복 안내 — 그 번호를 이미 쓰는 환자를 보여주고 '변경 불가'를 알린다 */}
      {conflict && (
        <div
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 p-4"
        >
          <p className="flex items-center gap-1.5 text-sm font-semibold text-danger">
            <Icon name="error" className="text-base" />
            이 등록번호는 다른 환자가 사용 중이라 변경할 수 없습니다.
          </p>
          {/* 그 번호의 주인 환자 카드 */}
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-surface p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-primary/10 font-bold text-accent-primary">
              {conflict.name.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-text-primary">{conflict.name}</p>
              <p className="font-mono text-sm text-text-secondary">
                {conflict.registration_number} · {conflict.age}세 ·{" "}
                {genderLabel(conflict.gender)}
              </p>
            </div>
            <Link
              href={`/patients/${conflict.id}`}
              className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-border-subtle px-3 text-caption font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
            >
              <Icon name="open_in_new" className="text-sm" />
              환자 보기
            </Link>
          </div>
          <p className="mt-2 text-caption text-text-muted">
            다른 등록번호를 입력한 뒤 다시 저장하세요.
          </p>
        </div>
      )}

      <div className="mt-1 flex gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="h-11 flex-1 rounded-lg bg-accent-primary px-4 text-base font-semibold text-accent-on transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "저장 중…"
            : isEditing
              ? "수정 저장"
              : "환자 등록"}
        </button>
        <Link
          href={isEditing ? `/patients/${patientId}` : "/patients"}
          className="flex h-11 items-center rounded-lg border border-border-subtle px-5 text-base font-medium text-text-secondary transition-colors hover:bg-bg-elevated"
        >
          취소
        </Link>
      </div>
    </form>
  );
}

// 공통 입력칸 스타일(PrescribeForm과 동일 톤)
const inputClass =
  "h-11 w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 text-base text-text-primary outline-none placeholder:text-text-muted focus-visible:border-accent";

// 라벨 + 입력칸 + 보조설명을 묶는 작은 부품
function Field({
  label,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ""}`}>
      <span className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </span>
      {children}
      {hint && <span className="text-caption text-text-muted">{hint}</span>}
    </label>
  );
}

// 적재 실패/없는 환자 안내 카드
function FormMessage({
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

// 백엔드 오류 응답의 detail(문자열)을 안전하게 읽는다(없으면 null)
async function readDetail(res: Response): Promise<string | null> {
  try {
    const body = await res.json();
    return typeof body?.detail === "string" ? body.detail : null;
  } catch {
    return null;
  }
}
