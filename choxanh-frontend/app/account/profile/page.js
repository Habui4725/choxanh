"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto mt-32 text-center">
        <h1 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h1>
        <p className="mb-6">Vui lòng đăng nhập để xem thông tin tài khoản.</p>
        <button
          onClick={() => router.push("/auth/login")}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-32 px-4">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Thông tin cá nhân</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Họ và tên</p>
            <p className="text-lg font-semibold">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-semibold">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Vai trò</p>
            <p className="text-lg font-semibold">{user.role || "user"}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500">Lưu ý:</p>
          <p className="text-sm text-gray-600">
            Hiện tại bạn không thể thay đổi thông tin tại đây. Nếu cần sửa, vui lòng liên hệ
            bộ phận hỗ trợ.
          </p>
        </div>
      </div>
    </div>
  );
}
