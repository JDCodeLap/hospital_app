"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/Icon";
import { saveToken } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // 백엔드(OAuth2PasswordRequestForm)는 폼 형식을 받는다 → form-urlencoded
      const body = new URLSearchParams({ username, password });
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      if (res.status === 401) {
        setError("로그인 실패: 아이디 또는 비밀번호를 확인하세요.");
        return;
      }
      if (!res.ok) {
        setError("로그인 중 문제가 발생했습니다. 잠시 후 다시 시도하세요.");
        return;
      }

      const data: { access_token?: string } = await res.json();
      if (!data.access_token) {
        setError("로그인 중 문제가 발생했습니다. 잠시 후 다시 시도하세요.");
        return;
      }
      saveToken(data.access_token);
      router.push("/");
    } catch {
      setError(
        "백엔드에 연결할 수 없습니다. 백엔드 서버(http://localhost:8000)가 켜져 있는지 확인하세요.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-base p-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-border-subtle bg-bg-surface p-7 shadow-sm"
      >
        {/* 로고 */}
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-primary/10 text-accent-primary">
            <Icon name="health_and_safety" fill className="text-3xl" />
          </span>
          <h1 className="text-xl font-bold text-text-primary">병원 안전관리</h1>
          <p className="mt-1 text-sm text-text-secondary">
            직원 계정으로 로그인하세요
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username" className="text-text-secondary">
              아이디
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="h-11"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-text-secondary">
              비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="h-11"
            />
          </div>

          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="h-11 w-full">
            {loading ? "로그인 중…" : "로그인"}
          </Button>
        </div>
      </form>
    </main>
  );
}
