import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { MedicationAlerts } from "@/components/MedicationAlerts";

// 투약 시간 알림 모아보기 화면(/alerts). Story 3.3.
// 보호된 화면 → AuthGuard로 감싸 미로그인/무효토큰을 막는다(Story 1.4). 공통 틀은 AppShell.
// ★ 알림/환자 데이터는 서버 컴포넌트에서 프리렌더하지 않는다 — AuthGuard 통과 후
//   MedicationAlerts(클라이언트)가 토큰을 달아 호출(미인증 노출 방지, 1.4 가이드).
export default function AlertsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <MedicationAlerts />
      </AppShell>
    </AuthGuard>
  );
}
