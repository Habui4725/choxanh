"use client";

import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const router = useRouter();

  const toNumber = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;

  const totalAmount = cart.reduce(
    (sum, item) => sum + toNumber(item.price) * toNumber(item.quantity),
    0
  );

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-32 text-center">
        <h1 className="text-2xl font-bold mb-4">🛒 Giỏ hàng trống</h1>
        <button
          onClick={() => router.push("/")}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Quay lại mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-32 px-4">
      <h1 className="text-3xl font-bold mb-6 text-green-700">🛒 Giỏ hàng</h1>

      <div className="bg-white rounded-xl shadow p-4">
        {cart.map((item) => {
          const id = item._id ?? item.id;
          return (
            <div
              key={id}
              className="flex justify-between items-center border-b py-4"
            >
              {/* Hình ảnh sản phẩm */}
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded mr-4"
                />
              )}

              <div className="flex-1">
                <h2 className="font-semibold text-lg">{item.name}</h2>
                <p className="text-gray-600">
                  {toNumber(item.price).toLocaleString()} đ
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    toNumber(item.quantity) > 1
                      ? updateQuantity(id, toNumber(item.quantity) - 1)
                      : removeFromCart(id)
                  }
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  ➖
                </button>

                <span className="w-6 text-center">
                  {toNumber(item.quantity)}
                </span>

                <button
                  onClick={() =>
                    updateQuantity(id, toNumber(item.quantity) + 1)
                  }
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  ➕
                </button>

                <button
                  onClick={() => removeFromCart(id)}
                  className="ml-3 text-red-500"
                >
                  ❌
                </button>
              </div>
            </div>
          );
        })}

        <div className="flex justify-between items-center mt-6">
          <p className="text-xl font-bold">
            Tổng cộng: {totalAmount.toLocaleString()} đ
          </p>

          <div className="flex gap-3">
            <button
              onClick={clearCart}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Xóa giỏ hàng
            </button>

            <button
              onClick={() => router.push("/checkout")}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
