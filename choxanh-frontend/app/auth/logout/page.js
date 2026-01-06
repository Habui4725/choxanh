"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    logout();           // xóa user + token
    router.replace("/auth/login"); // điều hướng về login
  }, [logout, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg text-gray-600">
        Đang đăng xuất...
      </p>
    </div>
  );
}
