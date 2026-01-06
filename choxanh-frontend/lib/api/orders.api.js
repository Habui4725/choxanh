// 👉 GỬI ĐƠN HÀNG (user checkout)
export async function createOrder(orderData) {
  const res = await fetch("http://127.0.0.1:8000/orders", {
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

// 👉 ADMIN LẤY DANH SÁCH ĐƠN HÀNG
export async function getOrders() {
  const res = await fetch("http://127.0.0.1:8000/orders", {
    cache: "no-store", // ⚠️ bắt buộc cho admin
  });

  if (!res.ok) {
    throw new Error("Không thể lấy danh sách đơn hàng");
  }

  return res.json();
}
