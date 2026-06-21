import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { PatientFlowBoard } from "@/components/PatientFlowBoard";

// 환자 흐름판 화면(/board) — Story 4.3, FR9.
// 보호된 화면 → AuthGuard로 감싸 미로그인/무효토큰을 막는다(Story 1.4). 공통 틀은 AppShell.
// ★ 환자 데이터는 이 서버 컴포넌트에서 미리 불러오지 않는다. AuthGuard 통과 후
//   PatientFlowBoard(클라이언트)가 토큰을 달아 호출 → 미인증 사용자에게 데이터가 새지 않게.
export default function BoardPage() {
  return (
    <AuthGuard>
      <AppShell>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">환자 흐름판</h1>
          <p className="mt-1 text-sm text-text-secondary">
            모든 환자가 지금 어느 단계(접수→진료→검사→수납)에 있는지 한눈에 봅니다.
          </p>
        </div>
        <PatientFlowBoard />
      </AppShell>
    </AuthGuard>
  );
}
