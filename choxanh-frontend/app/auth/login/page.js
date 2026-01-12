"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api/auth.api";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser({ email, password });

      
      login(data.user);

      if (data.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/vegetable-bg.jpg')] bg-cover bg-center flex items-center justify-center pt-20 px-3">
      <div className="w-[900px] max-w-[95%] bg-white rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden">

        <form onSubmit={handleSubmit} className="w-full md:w-1/2 px-10 py-14">
          <h1 className="text-3xl font-extrabold text-green-700 mb-8">
            Đăng nhập
          </h1>

          {error && (
            <p className="text-red-500 mb-4 text-sm">{error}</p>
          )}

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
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded font-semibold disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <Link
            href="/auth/register"
            className="block text-center text-sm text-green-700 mt-5"
          >
            Chưa có tài khoản? Đăng ký →
          </Link>
        </form>

        <div className="w-full md:w-1/2 bg-green-600 flex flex-col justify-center items-center text-white px-8 py-14">
          <h2 className="text-4xl font-extrabold mb-3">
            Xin chào!
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Chào mừng bạn trở lại Chợ Xanh!
          </p>
        </div>
      </div>
    </div>
  );
}
