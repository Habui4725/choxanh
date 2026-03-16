"use client";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_blocked?: boolean;
}

export default function AdminUserTable({
  users,
  onAction,
}: {
  users: User[];
  onAction: (id: string, action: "block" | "unblock" | "delete") => void;
}) {
  return (
    <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
      <thead>
        <tr className="bg-green-800 text-white text-left">
          <th className="p-3">ID</th>
          <th className="p-3">Tên</th>
          <th className="p-3">Email</th>
          <th className="p-3">Role</th>
          <th className="p-3">Trạng thái</th>
          <th className="p-3">Hành động</th>
        </tr>
      </thead>

      <tbody>
        {users.map((user, index) => (
          <tr
            key={user.id}
            className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
          >
            <td className="p-3">{user.id}</td>
            <td className="p-3">{user.name}</td>
            <td className="p-3">{user.email}</td>
            <td className="p-3">{user.role}</td>

            <td className="p-3">
              {user.is_blocked ? (
                <span className="text-red-600 font-semibold">Đã chặn</span>
              ) : (
                <span className="text-green-700 font-semibold">Hoạt động</span>
              )}
            </td>

            <td className="p-3 space-x-2">
              {user.is_blocked ? (
                <button
                  onClick={() => onAction(user.id, "unblock")}
                  className="px-3 py-1 bg-green-700 hover:bg-green-800 text-white rounded"
                >
                  Mở chặn
                </button>
              ) : (
                <button
                  onClick={() => onAction(user.id, "block")}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  Chặn
                </button>
              )}

              <button
                onClick={() => onAction(user.id, "delete")}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Xóa
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}