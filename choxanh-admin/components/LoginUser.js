"use client";

import { useState } from "react";

export default function LoginUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      alert("Đăng nhập thành công");
    } else {
      alert("Sai tài khoản hoặc mật khẩu");
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Mật khẩu"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Đăng nhập</button>
    </form>
  );
}