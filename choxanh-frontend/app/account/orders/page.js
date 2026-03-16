"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getOrdersByUser } from "@/lib/api/orders.api";

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getOrdersByUser(user.id);
        setOrders(data);
      } catch (err) {
        setError(err?.message || "Không thể lấy đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto mt-32 px-4">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Đơn hàng của tôi</h1>

      {loading ? (
        <div className="text-center py-10">Đang tải đơn hàng...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-600">{error}</div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg font-semibold mb-4">Bạn chưa có đơn hàng nào.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow p-6 border"
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">Mã đơn hàng</p>
                  <p className="font-semibold">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày đặt</p>
                  <p className="font-semibold">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tổng tiền</p>
                  <p className="font-semibold">{(order.total_price || 0).toLocaleString()} đ</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <p className="font-semibold capitalize">{order.status || "pending"}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Sản phẩm:</p>
                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div
                      key={item.product_id || item.id || item.name}
                      className="flex justify-between items-center"
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-600">
                        {item.quantity} × {Number(item.price || 0).toLocaleString()} đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
