import { AdminGuard } from "@/components/AdminGuard";
import { AppShell } from "@/components/AppShell";
import { AdminOverview } from "@/components/AdminOverview";

// 관리자 페이지(/admin) — Story 5.1, NFR2.
// AdminGuard로 '로그인한 관리자'만 통과(일반 직원은 홈으로 차단). 공통 틀은 AppShell.
// ★ 관리 데이터는 이 서버 컴포넌트에서 프리렌더하지 않는다 — AdminGuard 통과 후
//   AdminOverview(클라이언트)가 토큰을 달아 호출(미인증 노출 방지, 1.4 가이드).
export default function AdminPage() {
  return (
    <AdminGuard>
      <AppShell>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">관리자 페이지</h1>
          <p className="mt-1 text-sm text-text-secondary">
            직원·권한·현황·기준값을 관리합니다. (관리자 전용)
          </p>
        </div>
        <AdminOverview />
      </AppShell>
    </AdminGuard>
  );
}
