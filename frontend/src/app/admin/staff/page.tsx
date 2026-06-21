import Link from "next/link";

import { AdminGuard } from "@/components/AdminGuard";
import { AppShell } from "@/components/AppShell";
import { StaffManagement } from "@/components/StaffManagement";

// 직원 계정 관리(/admin/staff) — Story 5.2, FR11.
// AdminGuard로 '로그인한 관리자'만 통과(일반 직원은 홈으로 차단). 공통 틀은 AppShell.
// ★ 직원 데이터는 이 서버 컴포넌트에서 프리렌더하지 않는다 — AdminGuard 통과 후
//   StaffManagement(클라이언트)가 토큰을 달아 호출(미인증 노출 방지, 1.4 가이드).
export default function AdminStaffPage() {
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
          <h1 className="mt-1 text-2xl font-bold text-text-primary">
            직원 계정 관리
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            직원을 등록·수정·삭제하고 직군을 지정합니다. (관리자 전용)
          </p>
        </div>
        <StaffManagement />
      </AppShell>
    </AdminGuard>
  );
}
