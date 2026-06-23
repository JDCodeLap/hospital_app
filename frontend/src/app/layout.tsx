import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "병원 통합 안전 관리 앱",
  description: "흩어진 환자 정보를 한 화면에 모으고, 위험한 순간엔 먼저 알려주는 병원 내부 직원용 통합 안전 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 흰색 미니멀 라이트 테마 → "dark" 클래스를 두지 않는다(:root 라이트 값 적용).
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* Pretendard(한글 글꼴) — 동적 서브셋으로 필요한 글자만 받아 가벼움.
            preconnect로 CDN에 미리 연결해 첫 화면 글꼴 로딩을 앞당김 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* Inter(영문/숫자 보조) + JetBrains Mono(등록번호·금액 등 데이터) — MedCore 참고 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        {/* Material Symbols(아이콘) — <span class="material-symbols-outlined">dashboard</span> */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=block"
        />
      </head>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
