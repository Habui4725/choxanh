"use client";

import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const { user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("COD");

  const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  const totalAmount = cart.reduce(
    (sum, item) => sum + toNumber(item.price) * toNumber(item.quantity),
    0
  );

  const handleSubmit = async () => {
    if (!fullName || !phone || !address) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (cart.length === 0) {
      alert("Giỏ hàng trống");
      return;
    }

    const userId = user?.id || localStorage.getItem("user_id") || "guest";

    // Thanh toán VNPAY
    if (method === "VNPAY") {
      try {
        const res = await fetch("http://127.0.0.1:8000/payment/create_payment_url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            full_name: fullName,
            phone,
            address,
            amount: totalAmount,
            bankCode: "",
            language: "vn",
          }),
        });

        const data = await res.json();

        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          alert(data.error || "Không tạo được link thanh toán VNPAY");
        }
      } catch (error) {
        console.error(error);
        alert("Không thể kết nối VNPAY");
      }

      return;
    }

    // Thanh toán COD
    const payload = {
      user_id: userId,
      full_name: fullName,
      phone,
      address,
      payment_method: "COD",
      items: cart.map((it) => ({
        product_id: it._id || it.id || String(it.product_id || it.productId || ""),
        name: it.name,
        price: Number(it.price || 0),
        quantity: Number(it.quantity || 1),
      })),
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        alert("❌ Đặt hàng thất bại: " + err);
        return;
      }

      const data = await res.json();
      alert("✅ Đặt hàng COD thành công! Mã đơn: " + (data.order_id || "(không có)"));
      clearCart();
      router.push("/");
    } catch (e) {
      console.error(e);
      alert("❌ Không thể kết nối tới server");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-32 px-4">
      <h1 className="text-3xl font-bold mb-6 text-green-700">
        🧾 Thanh toán
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        <input
          placeholder="Họ và tên"
          className="w-full border p-2 rounded mb-3"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          placeholder="Số điện thoại"
          className="w-full border p-2 rounded mb-3"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          placeholder="Địa chỉ giao hàng"
          className="w-full border p-2 rounded mb-3"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="COD">Thanh toán khi nhận hàng</option>
          <option value="VNPAY">Thanh toán VNPAY</option>
        </select>

        <p className="font-bold text-right mb-4">
          Tổng tiền: {totalAmount.toLocaleString()} đ
        </p>

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
        >
          Xác nhận đặt hàng
        </button>
      </div>
    </div>
  );
}