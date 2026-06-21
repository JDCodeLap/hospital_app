import Link from "next/link";

import { AuthGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/AppShell";
import { BackendStatus } from "@/components/BackendStatus";
import { Icon } from "@/components/Icon";

// 홈 대시보드 — 앱 시작점(MedCore 참고 카드 레이아웃).
// 보호된 화면 → AuthGuard로 감싼다(Story 1.4). 공통 틀은 AppShell.
export default function Home() {
  return (
    <AuthGuard>
      <AppShell>
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">대시보드</h1>
          <p className="mt-1 text-sm text-text-secondary">
            환자 정보를 한 화면에 모으고, 위험한 순간엔 먼저 알려드려요.
          </p>
        </div>

        {/* 빠른 진입 카드 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <QuickCard
            href="/patients"
            icon="person_search"
            title="환자 검색"
            desc="이름·등록번호로 환자를 찾고 통합 정보를 봅니다."
          />
          <QuickCard
            href="/board"
            icon="view_kanban"
            title="환자 흐름판"
            desc="모든 환자가 지금 어느 단계인지 한눈에 봅니다."
          />
          <QuickCard
            href="/alerts"
            icon="notifications"
            title="투약 시간 알림"
            desc="지금 받을 시간이 된 투약을 모아 보고 완료 처리합니다."
          />
        </div>

        {/* 안전 안내 카드 */}
        <section className="mt-4 rounded-xl border border-border-subtle bg-bg-surface p-5">
          <div className="flex items-center gap-2 text-text-primary">
            <Icon name="shield" className="text-xl text-accent-primary" />
            <h2 className="font-semibold">환자 안전 기능</h2>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li className="flex items-center gap-2">
              <Icon name="warning" className="text-base text-danger" />
              알레르기·금기 약물 처방 시 경고
            </li>
            <li className="flex items-center gap-2">
              <Icon name="flag" className="text-base text-danger" />
              위험 정보 배너는 확인 전까지 유지
            </li>
            <li className="flex items-center gap-2">
              <Icon name="schedule" className="text-base text-warning" />
              정해진 투약 시간 알림
            </li>
          </ul>
        </section>

        {/* 백엔드 연결 상태(개발 확인용) */}
        <div className="mt-4">
          <BackendStatus />
        </div>
      </AppShell>
    </AuthGuard>
  );
}

// 빠른 진입 카드 한 장
function QuickCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-xl border border-border-subtle bg-bg-surface p-5 transition-all hover:border-accent-primary hover:shadow-sm"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-primary/10 text-accent-primary">
        <Icon name={icon} className="text-2xl" />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-1 font-semibold text-text-primary">
          {title}
          <Icon
            name="arrow_forward"
            className="text-base text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent-primary"
          />
        </div>
        <p className="mt-1 text-sm text-text-secondary">{desc}</p>
      </div>
    </Link>
  );
}
