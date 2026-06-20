import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { PatientDetail } from "@/components/PatientDetail";

// 환자 통합 화면(/patients/[id]).
// 보호된 화면 → AuthGuard로 감싸 미로그인/무효토큰을 막는다(Story 1.4).
// ★ 환자 데이터는 이 서버 컴포넌트에서 미리 불러오지 않는다(라우트 id만 다룸).
//   AuthGuard 통과 후 PatientDetail(클라이언트)이 useParams로 id를 읽고 토큰 달아 호출
//   → 미인증 사용자에게 환자정보(PHI)가 페이지 소스로 새지 않게 한다(1.4 가이드).
export default function PatientDetailPage() {
  return (
    <AuthGuard>
      <AppShell>
        <PatientDetail />
      </AppShell>
    </AuthGuard>
  );
}
