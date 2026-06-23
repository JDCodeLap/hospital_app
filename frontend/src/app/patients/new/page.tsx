import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { PatientForm } from "@/components/PatientForm";

// 신규 환자 등록 화면(/patients/new).
// 보호된 화면 → AuthGuard로 감싸 미로그인/무효토큰을 막는다(Story 1.4). 공통 틀은 AppShell.
export default function NewPatientPage() {
  return (
    <AuthGuard>
      <AppShell>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">신규 환자 등록</h1>
          <p className="mt-1 text-sm text-text-secondary">
            새 환자의 기본 정보를 입력하세요. <span className="text-danger">*</span> 표시는 필수입니다.
          </p>
        </div>
        <PatientForm />
      </AppShell>
    </AuthGuard>
  );
}
