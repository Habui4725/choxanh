const BASE_ORDERS_API = "http://127.0.0.1:8000/api/orders";

// 👉 GỬI ĐƠN HÀNG (user checkout)
export async function createOrder(orderData) {
  const res = await fetch(`${BASE_ORDERS_API}/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    throw new Error("Gửi đơn hàng thất bại");
  }

  return res.json();
}

// 👉 LẤY DANH SÁCH ĐƠN HÀNG (ADMIN)
export async function getOrders() {
  const res = await fetch(`${BASE_ORDERS_API}`, {
    cache: "no-store", // ⚠️ bắt buộc cho admin
  });

  if (!res.ok) {
    throw new Error("Không thể lấy danh sách đơn hàng");
  }

  return res.json();
}

// 👉 LẤY ĐƠN HÀNG CỦA NGƯỜI DÙNG
export async function getOrdersByUser(userId) {
  const res = await fetch(`${BASE_ORDERS_API}/user/${userId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Không thể lấy đơn hàng của bạn");
  }

  return res.json();
}
