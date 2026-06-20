"use client";

// 로그아웃 버튼: 보관한 신분증(토큰)을 지우고 로그인 화면으로 보낸다.
// replace를 쓰는 이유: 뒤로가기로 로그아웃 전 화면에 되돌아가지 못하게.

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { clearToken } from "@/lib/auth";

export function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <Button variant="outline" className="h-11" onClick={handleLogout}>
      로그아웃
    </Button>
  );
}
