"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Order = {
  id: string;
  customer?: { name?: string; phone?: string };
  total?: number;
  status?: string;
  created_at?: string;
};

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc & tìm kiếm
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("created_at");

  useEffect(() => {
    const statusParam = searchParams?.get("status") || "";
    if (statusParam && statusParam !== status) {
      setStatus(statusParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/orders");
        const data = await res.json();

        // Đảm bảo luôn là mảng
        const list: Order[] = Array.isArray(data) ? data : [];

        // Xử lý lọc + tìm kiếm + sắp xếp ngay tại đây
        const q = query.toLowerCase();

        let result = list.filter((o) => {
          const id = o.id?.toLowerCase() || "";
          const name = o.customer?.name?.toLowerCase() || "";
          const phone = o.customer?.phone?.toLowerCase() || "";

          return (
            id.includes(q) ||
            name.includes(q) ||
            phone.includes(q)
          );
        });

        if (status) {
          result = result.filter((o) => o.status === status);
        }

        result.sort((a, b) => {
          if (sort === "created_at") {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
          }
          if (sort === "total") {
            return (b.total || 0) - (a.total || 0);
          }
          if (sort === "status") {
            return (a.status || "").localeCompare(b.status || "");
          }
          return 0;
        });

        setOrders(result);
      } catch (error: unknown) {
        console.error("Lỗi tải đơn hàng:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [query, status, sort]);

  if (loading) return <p>Đang tải danh sách đơn hàng...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Danh sách đơn hàng</h1>

      {/* Bộ lọc + tìm kiếm */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên, SĐT, mã đơn..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="shipping">Đang giao</option>
          <option value="completed">Hoàn thành</option>
          <option value="canceled">Đã hủy</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="created_at">Ngày tạo</option>
          <option value="status">Trạng thái</option>
          <option value="total">Tổng tiền</option>
        </select>
      </div>

      {/* Bảng đơn hàng */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Mã đơn</th>
            <th className="border p-2">Khách hàng</th>
            <th className="border p-2">SĐT</th>
            <th className="border p-2">Tổng tiền</th>
            <th className="border p-2">Trạng thái</th>
            <th className="border p-2">Ngày tạo</th>
            <th className="border p-2">Chi tiết</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="text-center">
              <td className="border p-2">{order.id}</td>
              <td className="border p-2">{order.customer?.name}</td>
              <td className="border p-2">{order.customer?.phone}</td>
              <td className="border p-2">
                {(order.total || 0).toLocaleString()} đ
              </td>
              <td className="border p-2">{order.status}</td>
              <td className="border p-2">
                {order.created_at
                  ? new Date(order.created_at).toLocaleString("vi-VN")
                  : "—"}
              </td>
              <td className="border p-2">
                <a
                  href={`/admin/orders/${order.id}`}
                  className="text-blue-600 underline"
                >
                  Xem
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}