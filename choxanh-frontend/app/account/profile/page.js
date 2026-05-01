"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");

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

  const handleUpdate = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name,
          password,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert("❌ Cập nhật thất bại: " + JSON.stringify(err));
        return;
      }

      const data = await res.json();
      alert("✅ Cập nhật thành công!");
      setUser({ ...user, name: data.name });
      setPassword("");
    } catch (e) {
      console.error(e);
      alert("❌ Không thể kết nối tới server");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-32 px-4">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Thông tin cá nhân</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label className="block mb-2 text-sm text-gray-500">Họ và tên</label>
          <input
            className="w-full border p-2 rounded mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="block mb-2 text-sm text-gray-500">Mật khẩu mới</label>
          <input
            type="password"
            className="w-full border p-2 rounded mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleUpdate}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
