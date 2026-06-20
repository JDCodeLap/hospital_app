"use client";

import { useEffect, useState } from "react";

// 백엔드가 돌려주는 테스트 데이터 한 건의 모양
type TestItem = { id: number; name: string; note: string };

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

/**
 * 백엔드(FastAPI)에서 테스트 데이터를 불러와 화면에 보여주는 부품.
 * 화면 ↔ 백엔드 ↔ DB 연결이 살아있는지 눈으로 확인하는 용도(Story 1.2).
 */
export function BackendStatus() {
  const [items, setItems] = useState<TestItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 화면을 떠나면 진행 중인 요청을 실제로 취소(불필요한 네트워크/경고 방지)
    const controller = new AbortController();
    fetch(`${API_BASE}/api/test-data`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: TestItem[]) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(
          "백엔드에 연결할 수 없습니다. 백엔드 서버(http://localhost:8000)가 켜져 있는지 확인하세요.",
        );
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <section className="w-full max-w-md rounded-lg border border-border-subtle bg-bg-surface p-4 text-left">
      <h2 className="mb-3 text-sm font-bold text-text-primary">
        백엔드 연결 상태
      </h2>

      {loading && <p className="text-sm text-text-secondary">불러오는 중…</p>}

      {error && <p className="text-sm text-danger">{error}</p>}

      {items && items.length === 0 && (
        <p className="text-sm text-text-secondary">
          연결은 정상이지만 표시할 데이터가 없습니다.
        </p>
      )}

      {items && items.length > 0 && (
        <>
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-md bg-bg-elevated px-3 py-2"
              >
                <span className="text-sm font-medium text-text-primary">
                  {item.name}
                </span>
                <span className="block text-caption text-text-muted">
                  {item.note}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-caption text-success">
            ✓ 화면 ↔ 백엔드 ↔ DB 연결 정상
          </p>
        </>
      )}
    </section>
  );
}
