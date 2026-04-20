"use client";

import { useEffect, useState } from "react";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("created_at");

  // ✅ THÊM
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/orders/");
      const data = await res.json();

      const list = Array.isArray(data) ? data : [];
      const q = query.toLowerCase();

      let result = list.filter((o) => {
        const id = o.id?.toLowerCase() || "";
        const name = o.customer?.full_name?.toLowerCase() || "";
        const phone = o.customer?.phone?.toLowerCase() || "";

        return id.includes(q) || name.includes(q) || phone.includes(q);
      });

      if (status) {
        result = result.filter((o) => o.status === status);
      }

      // ✅ LỌC THEO NGÀY
      if (fromDate) {
        result = result.filter(
          (o) => new Date(o.created_at) >= new Date(fromDate)
        );
      }

      if (toDate) {
        result = result.filter(
          (o) =>
            new Date(o.created_at) <=
            new Date(toDate + "T23:59:59")
        );
      }

      result.sort((a, b) => {
        if (sort === "created_at") {
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
        }

        if (sort === "total") {
          return (b.total_price || 0) - (a.total_price || 0);
        }

        if (sort === "status") {
          return (a.status || "").localeCompare(b.status || "");
        }

        return 0;
      });

      setOrders(result);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ THÊM dependency
  useEffect(() => {
    fetchOrders();
  }, [query, status, sort, fromDate, toDate]);

  const getStatusText = (statusValue) => {
    switch (statusValue) {
      case "pending":
        return "Chờ xử lý";
      case "shipping":
        return "Đang giao";
      case "completed":
        return "Hoàn thành";
      case "canceled":
        return "Đã hủy";
      default:
        return statusValue || "—";
    }
  };

  const getStatusBadge = (statusValue) => {
    switch (statusValue) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "shipping":
        return "bg-sky-100 text-sky-700";
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "canceled":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);

      const res = await fetch(
        `http://localhost:8000/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Cập nhật trạng thái thất bại");
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: data.order?.status || newStatus }
            : order
        )
      );

      alert("Cập nhật trạng thái thành công");
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert("Không thể kết nối tới server");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f3ec] p-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-green-800 text-lg">Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f3ec] p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl border border-green-100 bg-white/80 p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-green-900">Quản lý đơn hàng</h1>
          <p className="mt-2 text-sm text-gray-600">
            Theo dõi, tìm kiếm và cập nhật trạng thái đơn hàng trong hệ thống.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, mã đơn..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-green-200 bg-[#fcfbf7] px-4 py-3 text-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-200"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-green-200 bg-[#fcfbf7] px-4 py-3 text-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-200"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="shipping">Đang giao</option>
              <option value="completed">Hoàn thành</option>
              <option value="canceled">Đã hủy</option>
            </select>

            {/* ✅ THÊM */}
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-xl border border-green-200 bg-[#fcfbf7] px-4 py-3 text-sm outline-none"
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-xl border border-green-200 bg-[#fcfbf7] px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-green-100/70 text-green-900">
                  <th className="px-5 py-4 text-left font-semibold">Mã đơn</th>
                  <th className="px-5 py-4 text-left font-semibold">Khách hàng</th>
                  <th className="px-5 py-4 text-left font-semibold">SĐT</th>
                  <th className="px-5 py-4 text-center font-semibold">Tổng tiền</th>
                  <th className="px-5 py-4 text-center font-semibold">Trạng thái</th>
                  <th className="px-5 py-4 text-center font-semibold">Ngày tạo</th>
                  <th className="px-5 py-4 text-center font-semibold">Cập nhật</th>
                </tr>
              </thead>

              <tbody>
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <tr
                      key={order.id}
                      className={`border-t border-green-50 transition hover:bg-[#f9f8f2] ${
                        index % 2 === 0 ? "bg-white" : "bg-[#fffdf9]"
                      }`}
                    >
                      <td className="px-5 py-4 font-medium text-gray-800">
                        {order.id}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {order.customer?.full_name || "—"}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {order.customer?.phone || "—"}
                      </td>

                      <td className="px-5 py-4 text-center font-semibold text-green-700">
                        {(order.total_price || 0).toLocaleString("vi-VN")} đ
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex min-w-[110px] justify-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center text-gray-600">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString("vi-VN")
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <select
                          value={order.status || "pending"}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          disabled={updatingId === order.id}
                          className="rounded-xl border border-green-200 bg-[#fcfbf7] px-3 py-2 text-sm outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="pending">Pending</option>
                          <option value="shipping">Shipping</option>
                          <option value="completed">Completed</option>
                          <option value="canceled">Canceled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-5 py-10 text-center text-gray-500">
                      Không có đơn hàng nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}