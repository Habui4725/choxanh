"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminUserTable from "./AdminUserTable";

export default function AdminUserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter();

  const limit = 7;

  useEffect(() => {
    const adminUser = localStorage.getItem("adminUser");

    if (!adminUser) {
      setError("Bạn chưa đăng nhập admin.");
      setLoading(false);
      router.push("/admin/login");
      return;
    }

    let parsedAdmin;
    try {
      parsedAdmin = JSON.parse(adminUser);
    } catch {
      setError("Dữ liệu admin bị lỗi.");
      setLoading(false);
      router.push("/admin/login");
      return;
    }

    const adminId = parsedAdmin?.id || parsedAdmin?._id;

    if (!adminId) {
      setError("Không tìm thấy ID admin.");
      setLoading(false);
      router.push("/admin/login");
      return;
    }

    async function loadUsers() {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/admin/users?user_id=${adminId}`
        );

        const data = await res.json();
        console.log("Danh sách users:", data);

        if (!res.ok) {
          setError(data.detail || "Không thể tải danh sách người dùng.");
          return;
        }

        setUsers(Array.isArray(data) ? data : data.users || []);
      } catch {
        setError("Không thể kết nối tới server.");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [router]);

  async function handleAction(userId, action) {
    const adminUser = localStorage.getItem("adminUser");
    if (!adminUser) return;

    let parsedAdmin;
    try {
      parsedAdmin = JSON.parse(adminUser);
    } catch {
      return;
    }

    const adminId = parsedAdmin?.id || parsedAdmin?._id;
    if (!adminId) return;

    let url = "";
    let method = "PUT";

    if (action === "block") {
      url = `http://127.0.0.1:8000/admin/users/${userId}/block?user_id=${adminId}`;
    } else if (action === "unblock") {
      url = `http://127.0.0.1:8000/admin/users/${userId}/unblock?user_id=${adminId}`;
    } else if (action === "delete") {
      url = `http://127.0.0.1:8000/admin/users/${userId}?user_id=${adminId}`;
      method = "DELETE";
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Thao tác thất bại");
        return;
      }

      if (action === "delete") {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else if (action === "block") {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, is_blocked: true } : u
          )
        );
      } else if (action === "unblock") {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, is_blocked: false } : u
          )
        );
      }
    } catch {
      alert("Không thể kết nối tới server");
    }
  }

  const filteredUsers = users.filter((user) =>
    searchEmail.trim() === ""
      ? true
      : user.email.toLowerCase().includes(searchEmail.toLowerCase())
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
            router.push("/main");
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          Thoát
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

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <>
            <AdminUserTable users={paginatedUsers} onAction={handleAction} />

            {totalPages > 1 && (
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
            )}
          </>
        )}
      </div>
    </div>
  );
}