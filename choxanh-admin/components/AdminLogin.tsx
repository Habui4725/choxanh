"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@nextadmin.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const detail = data?.detail;
        const message =
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
            ? detail.map((d) => (typeof d === "string" ? d : d?.msg || JSON.stringify(d))).join(", ")
            : typeof detail === "object" && detail
            ? detail?.message || JSON.stringify(detail)
            : "Đăng nhập thất bại";

        setError(message);
        return;
      }

      const user = data.user;
      if (!user || user.role !== "admin") {
        setError("Tài khoản không có quyền quản trị");
        return;
      }

      localStorage.setItem("adminUserId", user.id);
      localStorage.setItem("adminRole", user.role);
      localStorage.setItem("adminName", user.name);

      router.push("/main");
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Không thể kết nối tới server. Vui lòng kiểm tra backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[url('/bg-food.jpg')] bg-cover bg-center flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-[900px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <form
          onSubmit={handleSubmit}
          className="w-full md:w-1/2 px-10 py-12"
        >
          <h1 className="text-3xl font-extrabold text-green-700 mb-8">
            Đăng nhập Admin
          </h1>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 mb-4 rounded"
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded mb-6"
          />

          {error && (
            <p className="text-red-500 mb-4 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded font-semibold disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p className="text-sm text-gray-500 mt-5">
            Đăng nhập bằng tài khoản admin để quản lý hệ thống.
          </p>
        </form>

        <div className="w-full md:w-1/2 bg-green-600 flex flex-col justify-center items-center text-white px-8 py-14">
          <h2 className="text-4xl font-extrabold mb-3">Xin chào Admin!</h2>
          <p className="text-lg mb-6 opacity-90">
            Chào mừng bạn đến với bảng điều khiển quản trị Chợ Xanh.
          </p>
          <p className="text-sm opacity-80 text-center">
            Đăng nhập để quản lý sản phẩm, đơn hàng và người dùng.
          </p>
        </div>
      </div>
    </div>
  );
}