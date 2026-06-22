import Link from "next/link";

import { AdminGuard } from "@/components/AdminGuard";
import { AppShell } from "@/components/AppShell";
import { AdminDashboard } from "@/components/AdminDashboard";

// 전체 현황 대시보드 화면(/admin/dashboard) — Story 5.4, FR13. 관리자 전용.
// 서버 컴포넌트는 껍데기(데이터 프리렌더 금지, 1.4) — AdminGuard 통과 후 AdminDashboard가 클라이언트에서 fetch.
export default function AdminDashboardPage() {
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
          <h1 className="mt-1 text-2xl font-bold text-text-primary">전체 현황</h1>
          <p className="mt-1 text-sm text-text-secondary">
            오늘 방문·단계별 혼잡도·평균 대기시간을 한눈에 봅니다.
          </p>
        </div>
        <AdminDashboard />
      </AppShell>
    </AdminGuard>
  );
}
