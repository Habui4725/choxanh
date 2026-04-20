export default function AdminUserTable({ users, onAction }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-green-800 text-white">
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Tên</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Trạng thái</th>
            <th className="p-3 text-left">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-3">{user.id}</td>
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">
                  {user.is_blocked ? "Đã chặn" : "Hoạt động"}
                </td>
                <td className="p-3 flex gap-2">
                  {user.is_blocked ? (
                    <button
                      onClick={() => onAction(user.id, "unblock")}
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      Bỏ chặn
                    </button>
                  ) : (
                    <button
                      onClick={() => onAction(user.id, "block")}
                      className="px-3 py-1 bg-yellow-500 text-white rounded"
                    >
                      Chặn
                    </button>
                  )}

                  <button
                    onClick={() => onAction(user.id, "delete")}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="p-4 text-center text-gray-500">
                Không có người dùng nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}