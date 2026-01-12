"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api/auth.api";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate rõ ràng
    if (!name.trim()) {
      setError("Vui lòng nhập họ và tên");
      return;
    }

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    try {
      // GỌI API 1 LẦN DUY NHẤT
      await registerUser({
        name,
        email,
        password,
      });

      // Đăng ký thành công → chuyển sang đăng nhập
      router.push("/auth/login");

    } catch (err) {
      // Lấy lỗi từ backend nếu có
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Đăng ký thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/vegetable-bg.jpg')] bg-cover bg-center flex items-center justify-center pt-20 px-3">
      <div className="w-[900px] max-w-[95%] bg-white rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden">

        {/* FORM */}
        <form onSubmit={handleSubmit} className="w-full md:w-1/2 px-10 py-14">
          <h1 className="text-3xl font-extrabold text-green-700 mb-8">
            Đăng ký
          </h1>

          {error && (
            <p className="text-red-500 mb-4 text-sm">{error}</p>
          )}

          <input
            placeholder="Họ và tên"
            className="w-full border p-3 mb-4 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 mb-4 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full border p-3 rounded mb-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded font-semibold disabled:opacity-60"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>

          <Link
            href="/auth/login"
            className="block text-center text-sm text-green-700 mt-5"
          >
            Đã có tài khoản? Đăng nhập →
          </Link>
        </form>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 bg-green-600 flex flex-col justify-center items-center text-white px-8 py-14">
          <h2 className="text-4xl font-extrabold mb-3">
            Chào mừng!
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Tạo tài khoản để bắt đầu mua sắm xanh.
          </p>
        </div>
      </div>
    </div>
  );
}
