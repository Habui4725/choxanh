"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import ReviewForm from "@/components/ReviewForm";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id;
  const { addToCart } = useCart();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!id) return;

    fetch(`http://127.0.0.1:8000/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`http://127.0.0.1:8000/api/reviews/${id}`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch(() => setReviews([]));
  }, [id]);

  const handleAddReview = (review) => {
    fetch(`http://127.0.0.1:8000/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...review, product_id: id }),
    })
      .then((res) => res.json())
      .then((newReview) => {
        setReviews((prev) => [...prev, newReview]);
        alert("✅ Cảm ơn bạn đã đánh giá!");
      })
      .catch(() => alert("❌ Không gửi được đánh giá"));
  };

  const handleDeleteReview = (index) => {
    const r = reviews[index];
    if (!r) return;
    if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    const revId = r.id || (r._id && (typeof r._id === "object" ? r._id.$oid : r._id));
    if (revId) {
      fetch(`http://127.0.0.1:8000/api/reviews/${revId}`, { method: "DELETE" })
        .then((res) => {
          if (!res.ok) throw new Error();
          setReviews((prev) => prev.filter((_, i) => i !== index));
        })
        .catch(() => alert("❌ Xóa thất bại"));
    } else {
      // fallback: remove locally
      setReviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">
        ⏳ Đang tải sản phẩm...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg">
        ❌ Không tìm thấy sản phẩm.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* ===== Thông tin sản phẩm ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Ảnh */}
          <div className="relative">
            <img
              src={product.image || "/fallback.jpg"}
              alt={product.name}
              onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
              className="w-full h-[420px] object-cover rounded-2xl shadow-lg"
            />
            <span className="absolute top-4 left-4 bg-green-600 text-white text-sm px-3 py-1 rounded-full shadow">
              Tươi sạch
            </span>
          </div>

          {/* Thông tin */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
            <h1 className="text-4xl font-extrabold text-green-700">
              {product.name}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>🌱 Xuất xứ: <b>{product.origin || "Việt Nam"}</b></span>
              <span>📦 Quy cách: <b>{product.packaging || "500g"}</b></span>
            </div>

            <p className="text-3xl font-bold text-green-600">
              {Number(product.price).toLocaleString()} đ
            </p>

            <div className="flex items-center text-yellow-500">
              {"⭐".repeat(Math.max(1, Math.round(product.rating ?? 4)))}
              <span className="ml-2 text-gray-500">
                ({reviews.length} đánh giá)
              </span>
            </div>

            <p className="text-gray-700 leading-relaxed">
              {product.description || "Sản phẩm tươi ngon, đảm bảo chất lượng và an toàn sức khoẻ."}
            </p>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => addToCart({ ...product, quantity: 1 })}
                className="flex-1 bg-green-600 text-white text-lg py-3 rounded-xl hover:bg-green-700 transition shadow"
              >
                🛒 Thêm vào giỏ hàng
              </button>
              <button
                onClick={() => {
                  addToCart({ ...product, quantity: 1 });
                  router.push("/checkout");
                }}
                className="flex-1 bg-orange-500 text-white text-lg py-3 rounded-xl hover:bg-orange-600 transition shadow"
              >
                💳 Mua ngay
              </button>
            </div>
          </div>
        </div>

        {/* ===== Đánh giá ===== */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Danh sách đánh giá */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-green-700 mb-6">
              💬 Đánh giá từ khách hàng
            </h2>

            {reviews.length === 0 ? (
              <p className="text-gray-500">Chưa có đánh giá nào.</p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r, i) => (
                    <li key={i} className="border rounded-xl p-4 bg-gray-50 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1 text-yellow-500">
                          {"⭐".repeat(r.rating)}
                          <span className="text-gray-500 text-sm">({r.rating}/5)</span>
                        </div>
                        <p className="text-gray-700">{r.comment}</p>
                        {r.author && (
                          <p className="text-xs text-gray-500 mt-1">— {r.author}</p>
                        )}
                        {r.createdAt && (
                          <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleString()}</p>
                        )}
                      </div>

                      <div className="ml-4">
                        <button
                          onClick={() => handleDeleteReview(i)}
                          className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100"
                        >
                          Xóa
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* Form đánh giá */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-green-700 mb-4">
              ✍️ Viết đánh giá
            </h2>
            <ReviewForm onSubmit={handleAddReview} />
          </div>
        </div>
      </div>
    </div>
  );
}
