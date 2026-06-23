import Link from "next/link";

import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { PatientSearch } from "@/components/PatientSearch";
import { Icon } from "@/components/Icon";

// 환자 검색 화면(/patients).
// 보호된 화면 → AuthGuard로 감싸 미로그인/무효토큰을 막는다(Story 1.4). 공통 틀은 AppShell.
// ★ 환자 데이터는 이 서버 컴포넌트에서 미리 불러오지 않는다. AuthGuard 통과 후
//   PatientSearch(클라이언트)가 토큰을 달아 호출 → 미인증 사용자에게 데이터가 새지 않게.
export default function PatientsPage() {
  return (
    <AuthGuard>
      <AppShell>
        {/* 제목 + 신규 등록 버튼(우측). 검색과 등록 진입을 한 줄에 둔다. */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">환자 검색</h1>
            <p className="mt-1 text-sm text-text-secondary">
              이름이나 등록번호로 환자를 찾아보세요.
            </p>
          </div>
          <Link
            href="/patients/new"
            className="inline-flex h-11 shrink-0 items-center gap-1 rounded-lg bg-accent-primary px-4 text-sm font-semibold text-accent-on transition-colors hover:bg-accent-hover"
          >
            <Icon name="add" className="text-lg" />
            신규 환자 등록
          </Link>
        </div>
        <PatientSearch />
      </AppShell>
    </AuthGuard>
  );
}
