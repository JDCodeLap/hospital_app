import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { PatientEditForm } from "@/components/PatientEditForm";

// 환자 정보 수정 화면(/patients/[id]/edit).
// 보호된 화면 → AuthGuard로 감싸 미로그인/무효토큰을 막는다(Story 1.4).
// ★ 상세 화면과 동일하게, 라우트 id는 서버에서 미리 다루지 않고 PatientEditForm(클라이언트)이
//   useParams로 읽어 토큰 달아 호출한다(미인증 노출 방지).
export default function EditPatientPage() {
  return (
    <AuthGuard>
      <AppShell>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">환자 정보 수정</h1>
          <p className="mt-1 text-sm text-text-secondary">
            기본 정보를 고친 뒤 저장하세요. <span className="text-danger">*</span> 표시는 필수입니다.
          </p>
        </div>
        <PatientEditForm />
      </AppShell>
    </AuthGuard>
  );
}
