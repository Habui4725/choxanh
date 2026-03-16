"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminUserTable from "./AdminUserTable";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_blocked?: boolean;
}

export default function AdminUserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter();

  const limit = 7;

  useEffect(() => {
    const userId = localStorage.getItem("adminUserId");
    const role = localStorage.getItem("adminRole");

    if (!userId || role !== "admin") {
      router.push("/admin/login");
      return;
    }

    async function loadUsers() {
      const res = await fetch(
        `http://127.0.0.1:8000/admin/users?user_id=${encodeURIComponent(
          userId!
        )}`
      );

      if (!res.ok) {
        router.push("/admin/login");
        return;
      }

      const data = await res.json();
      setUsers(data.users || []);
      setLoading(false);
    }

    loadUsers();
  }, [router]);

  async function handleAction(
    userId: string,
    action: "block" | "unblock" | "delete"
  ) {
    const adminId = localStorage.getItem("adminUserId");
    if (!adminId) return;

    let url = `http://127.0.0.1:8000/admin/users/${userId}`;
    let method = "PUT";

    if (action === "block") url += "/block";
    if (action === "unblock") url += "/unblock";
    if (action === "delete") method = "DELETE";

    url += `?user_id=${encodeURIComponent(adminId!)}`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      if (action === "delete") {
        // ❗ Chỉ xóa khi action là delete
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        // ⭐ Cập nhật trạng thái block / unblock
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, is_blocked: action === "block" } : u
          )
        );
      }
    } else {
      alert("Thao tác thất bại");
    }
  }

  // ⭐ TÌM KIẾM CHÍNH XÁC EMAIL
  const filteredUsers = users.filter((user) =>
    searchEmail.trim() === ""
      ? true
      : user.email.toLowerCase() === searchEmail.toLowerCase()
  );

  const totalPages = Math.ceil(filteredUsers.length / limit);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * limit,
    page * limit
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-green-800 shadow-md rounded-lg p-4 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Quản lý người dùng</h1>

        <button
          onClick={() => {
            localStorage.removeItem("adminUserId");
            localStorage.removeItem("adminRole");
            localStorage.removeItem("adminName");
            router.push("/admin/login");
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          Đăng xuất
        </button>
      </div>

      <div className="mb-4 flex gap-4 items-center">
        <input
          type="text"
          placeholder="Tìm theo email..."
          value={searchEmail}
          onChange={(e) => {
            setPage(1);
            setSearchEmail(e.target.value);
          }}
          className="p-2 border rounded-lg w-64 focus:ring-2 focus:ring-green-700"
        />
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-green-800">
          Danh sách người dùng
        </h2>

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <>
            <AdminUserTable users={paginatedUsers} onAction={handleAction} />

            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    page === i + 1
                      ? "bg-green-800 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-green-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}