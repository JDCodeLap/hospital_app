import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { SchemaErd } from "@/components/SchemaErd";

// 데이터베이스 스키마(ERD) 화면(/schema) — 까마귀발 표기법.
// 로그인 직원이 DB 구조를 한눈에 보는 내부 문서용 화면. PHI(환자 개인정보)는 없고
// '구조(테이블·컬럼·관계)'만 보여준다. 그래도 일관성 위해 AuthGuard로 보호하고 AppShell로 감싼다.
export default function SchemaPage() {
  return (
    <AuthGuard>
      <AppShell>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">
            데이터베이스 스키마 (ERD)
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            테이블과 관계를 까마귀발 표기법으로 봅니다. ❘❘ = 1개, ◦&lt; = 0개 이상(여러 개).
          </p>
        </div>
        <SchemaErd />
      </AppShell>
    </AuthGuard>
  );
}
