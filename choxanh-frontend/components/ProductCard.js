"use client";

import Link from "next/link";

export default function ProductCard({ product, onAddToCart, onCheckout, onToggleFavorite, isFavorite }) {
  const productId = product.id || product._id;

  return (
    <div className="bg-white rounded-xl border shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 relative">
      {/* Nút yêu thích */}
      <button
        onClick={() => onToggleFavorite(product)}
        aria-label={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
        className="absolute top-3 right-3 text-xl"
      >
        {isFavorite ? "❤️" : "🤍"}
      </button>

      {/* Bọc ảnh + tên bằng Link để click sang trang chi tiết */}
      <Link href={`/products/${productId}`} className="block">
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="p-4 space-y-2">
          <h3 className="text-base font-semibold text-gray-800 line-clamp-2 hover:underline">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500">
            {product.origin || "Việt Nam"} • {product.packaging || "500g"}
          </p>
          <p className="text-lg font-bold text-green-600">
            {Number(product.price).toLocaleString()} đ
          </p>
          <div className="flex items-center text-yellow-500 text-sm">
            {"⭐".repeat(Math.max(1, Math.round(product.rating ?? 4)))}
            <span className="ml-2 text-gray-500">({product.reviews ?? 12} đánh giá)</span>
          </div>
        </div>
      </Link>

      {/* Nút thao tác */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => onAddToCart(product)}
          className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700 transition"
        >
          🛒 Giỏ hàng
        </button>
        <button
          onClick={() => onCheckout(product)}
          className="flex-1 bg-orange-500 text-white text-sm py-2 rounded-lg hover:bg-orange-600 transition"
        >
          💳 Mua ngay
        </button>
      </div>
    </div>
  );
}