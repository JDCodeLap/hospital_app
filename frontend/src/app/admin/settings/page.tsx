import Link from "next/link";

import { AdminGuard } from "@/components/AdminGuard";
import { AppShell } from "@/components/AppShell";
import { AdminSettings } from "@/components/AdminSettings";

// 기준값 설정 화면(/admin/settings) — Story 5.5, FR14. 관리자 전용.
// 서버 컴포넌트는 껍데기(데이터 프리렌더 금지, 1.4) — AdminGuard 통과 후 AdminSettings가 클라이언트에서 fetch.
export default function AdminSettingsPage() {
  return (
    <AdminGuard>
      <AppShell>
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            ← 관리자 페이지
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-text-primary">기준값 설정</h1>
          <p className="mt-1 text-sm text-text-secondary">
            병원 상황에 맞게 대기 초과 기준 시간을 조정합니다.
          </p>
        </div>
        <AdminSettings />
      </AppShell>
    </AdminGuard>
  );
}
