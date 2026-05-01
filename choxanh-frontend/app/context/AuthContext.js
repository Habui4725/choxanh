"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (e) {
        console.error("Lỗi parse user từ localStorage:", e);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Chuẩn hóa dữ liệu user để chắc chắn có id đúng dạng ObjectId string
    const normalizedUser = {
      id: userData.id,        // chính là str(user["_id"]) từ backend
      name: userData.name,
      email: userData.email,
      role: userData.role || "user",
    };

    setUser(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
