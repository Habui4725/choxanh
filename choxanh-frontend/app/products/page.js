"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

/* Card sản phẩm */
function ProductCard({ product, onAddToCart, onCheckout, onToggleFavorite, isFavorite }) {
  const productId = product.id || product._id; // ✅ lấy id sản phẩm

  return (
    <div className="bg-white rounded-xl border shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 relative">
      <button
        onClick={() => onToggleFavorite(product)}
        aria-label={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
        className="absolute top-3 right-3 text-xl"
      >
        {isFavorite ? "❤️" : "🤍"}
      </button>

      {/* ✅ Bọc ảnh + phần thông tin bằng Link để chuyển sang trang chi tiết */}
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
            
          </div>
        </div>
      </Link>

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

/*  Controls (lọc/sắp xếp/yêu thích)*/
function Controls({ sort, price, onUpdateParam, showFavorites, onToggleShowFavorites }) {
  return (
    <div className="flex flex-wrap gap-4 justify-center mb-10">
      <select
        value={price}
        onChange={(e) => onUpdateParam("price", e.target.value)}
        className="px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500"
      >
        <option value="">💰 Lọc giá</option>
        <option value="under50">Dưới 50k</option>
<option value="50to100">50k - 100k</option>
        <option value="over100">Trên 100k</option>
      </select>

      <select
        value={sort}
        onChange={(e) => onUpdateParam("sort", e.target.value)}
        className="px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500"
      >
        <option value="">📊 Sắp xếp</option>
        <option value="asc">Giá ↑</option>
        <option value="desc">Giá ↓</option>
        <option value="name">Tên A-Z</option>
        <option value="newest">Mới nhập</option>
        <option value="expiry">Cận date</option>
      </select>

      <button
        onClick={onToggleShowFavorites}
        className={`px-4 py-2 text-sm rounded-lg border transition ${
          showFavorites
            ? "bg-red-500 text-white border-red-500"
            : "bg-white text-red-500 border-red-300 hover:bg-red-50"
        }`}
      >
        ❤️ Yêu thích
      </button>
    </div>
  );
}

/* Modal thanh toán */
function CheckoutModal({ product, onClose, onConfirm }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("COD");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Thanh toán</h2>
        <p className="mb-2">Sản phẩm: {product.name}</p>
        <p className="mb-4 text-green-600 font-bold">
          Giá: {Number(product.price).toLocaleString()} đ
        </p>

        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Họ và tên"
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Số điện thoại"
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Địa chỉ giao hàng"
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />

        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        >
          <option value="COD">Thanh toán khi nhận hàng (COD)</option>
          <option value="VNPay">VNPay</option>
          <option value="Momo">Momo</option>
        </select>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">
            Hủy
          </button>
          <button
            onClick={() => {
if (!fullName.trim() || !phone.trim() || !address.trim()) {
                alert("Vui lòng nhập đầy đủ thông tin: Họ tên, SĐT, Địa chỉ.");
                return;
              }
              const order = { product, fullName, phone, address, method, createdAt: new Date().toISOString() };
              onConfirm(order);
            }}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

/* Modal chi tiết đơn hàng */
function OrderDetailModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Chi tiết đơn hàng</h2>
        <p><b>Tên:</b> {order.fullName}</p>
        <p><b>SĐT:</b> {order.phone}</p>
        <p><b>Địa chỉ:</b> {order.address}</p>
        <p><b>Sản phẩm:</b> {order.product.name}</p>
        <p><b>Giá:</b> {Number(order.product.price).toLocaleString()} đ</p>
        <p><b>Phương thức:</b> {order.method}</p>
        <p><b>Thời gian:</b> {new Date(order.createdAt).toLocaleString()}</p>

        <button onClick={onClose} className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg">
          Đóng
        </button>
      </div>
    </div>
  );
}

/* Danh sách đánh giá  */
function ReviewList({ reviews }) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Đánh giá trải nghiệm mua hàng</h3>
      {reviews.length === 0 ? (
        <p className="text-gray-500">Chưa có đánh giá nào.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r, i) => (
            <li key={i} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center gap-2 mb-1">
                {"⭐".repeat(r.rating)} <span className="text-gray-500">({r.rating}/5)</span>
              </div>
              <p className="text-gray-700">{r.comment}</p>
              {r.author && <p className="text-xs text-gray-500 mt-1">— {r.author}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReviewListWithDelete({ reviews, onDelete }) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold mb-3">Đánh giá trải nghiệm mua hàng</h3>
      </div>
      {reviews.length === 0 ? (
        <p className="text-gray-500">Chưa có đánh giá nào.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r, i) => (
            <li key={i} className="border rounded-lg p-3 bg-gray-50 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">{"⭐".repeat(r.rating)} <span className="text-gray-500">({r.rating}/5)</span></div>
                <p className="text-gray-700">{r.comment}</p>
                {r.author && <p className="text-xs text-gray-500 mt-1">— {r.author}</p>}
                {r.createdAt && <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleString()}</p>}
              </div>
              <div className="ml-4">
                <button
                  onClick={() => {
                    if (confirm("Bạn có chắc muốn xóa đánh giá này?")) onDelete(i);
                  }}
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
  );
}

/* Form đánh giá */
function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [author, setAuthor] = useState("");

  return (
    <div className="mt-10 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Đánh giá trải nghiệm mua hàng</h3>
      <input
        type="text"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Tên của bạn (tuỳ chọn)"
        className="w-full border rounded-lg px-3 py-2 mb-3"
      />
      <div className="flex gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            aria-label={`${star} sao`}
            aria-pressed={star <= rating}
            className={`text-xl ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
          >
            {star <= rating ? "★" : "☆"}
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating} / 5</span>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Nhập nhận xét của bạn..."
        className="w-full border rounded-lg px-3 py-2 mb-3"
      />
      <button
        onClick={() => {
          if (!comment.trim()) {
            alert("Vui lòng nhập nội dung đánh giá.");
            return;
          }
          onSubmit({ rating, comment, author: author.trim() || "Người mua ẩn danh" });
          setComment("");
          setAuthor("");
          setRating(5);
        }}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        Gửi đánh giá
      </button>
    </div>
  );
}

/* Trang sản phẩm */
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Checkout + Order detail
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);

  // Favorites
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // Reviews per product (map: productId -> array)
  const [reviewsByProduct, setReviewsByProduct] = useState({});

  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = parseInt(searchParams.get("page") ?? "1");
  const sort = searchParams.get("sort") ?? "";
  const priceFilter = searchParams.get("price") ?? "";
  const keyword = (searchParams.get("search") ?? "").toLowerCase();
  const pageSize = 10;

  /* Fetch + lọc theo query */
  useEffect(() => {
    const url = "http://127.0.0.1:8000/api/products";
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        let filtered = Array.isArray(data) ? [...data] : [];

        if (priceFilter === "under50") filtered = filtered.filter((p) => p.price < 50000);
        if (priceFilter === "50to100")
          filtered = filtered.filter((p) => p.price >= 50000 && p.price <= 100000);
        if (priceFilter === "over100") filtered = filtered.filter((p) => p.price > 100000);

        if (keyword) filtered = filtered.filter((p) => (p.name ?? "").toLowerCase().includes(keyword));

        if (sort === "asc") filtered.sort((a, b) => a.price - b.price);
        if (sort === "desc") filtered.sort((a, b) => b.price - a.price);
        if (sort === "name") filtered.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
        if (sort === "newest") filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (sort === "expiry") filtered.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
setProducts(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sort, priceFilter, keyword]);

  /* Yêu thích: load + persist localStorage */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("favorites");
      if (saved) setFavorites(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  /* Reviews: load/persist localStorage */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("reviewsByProduct");
      if (saved) setReviewsByProduct(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("reviewsByProduct", JSON.stringify(reviewsByProduct));
    } catch {}
  }, [reviewsByProduct]);

  /* Helpers: product id-safe */
  const productId = (p) => (typeof p._id === "object" ? p._id.$oid : p._id ?? String(p.id ?? p.name));

  /* Toggle yêu thích */
  const toggleFavorite = (product) => {
    setFavorites((prev) => {
      const id = productId(product);
      const exists = prev.some((f) => productId(f) === id);
      return exists ? prev.filter((f) => productId(f) !== id) : [...prev, product];
    });
  };

  /* Cập nhật query params */
  const updateParam = (param, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(param, value);
    else params.delete(param);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  /* Danh sách hiển thị: tất cả hoặc yêu thích */
  const allOrFavoriteProducts = useMemo(
    () => (showFavorites ? favorites : products),
    [showFavorites, favorites, products]
  );

  /* Phân trang */
  const totalPages = Math.max(1, Math.ceil(allOrFavoriteProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = allOrFavoriteProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /* Thêm review cho sản phẩm */
  const addReview = (prod, review) => {
    const id = productId(prod);
    setReviewsByProduct((prev) => {
      const list = prev[id] ?? [];
      return { ...prev, [id]: [...list, { ...review, createdAt: new Date().toISOString() }] };
    });
  };

  /* Xóa review */
  const deleteReview = (prod, index) => {
    const id = productId(prod);
    setReviewsByProduct((prev) => {
      const list = [...(prev[id] ?? [])];
      if (index < 0 || index >= list.length) return prev;
      list.splice(index, 1);
      return { ...prev, [id]: list };
    });
  };

  /* Đồng bộ / migrate reviews vào khóa `productId(product)` để tránh mất đánh giá */
  const syncReviews = () => {
    try {
      const old = { ...reviewsByProduct };
      const migrated = {};

      // For each known product, collect any reviews stored under possible legacy keys
      products.forEach((p) => {
        const id = productId(p);
        const possibleKeys = new Set();
        possibleKeys.add(id);
        if (p.id) possibleKeys.add(String(p.id));
        if (p._id) {
          if (typeof p._id === "object" && p._id.$oid) possibleKeys.add(String(p._id.$oid));
          else possibleKeys.add(String(p._id));
        }
        if (p.name) possibleKeys.add(p.name);

        // merge all reviews from possible keys into canonical id
        const merged = [];
        possibleKeys.forEach((k) => {
          if (old[k]) {
            merged.push(...old[k]);
            delete old[k];
          }
        });
        if (merged.length) migrated[id] = merged;
      });

      // Preserve any remaining entries that don't match current products
      Object.keys(old).forEach((k) => {
        migrated[k] = old[k];
      });

      setReviewsByProduct(migrated);
      try {
        localStorage.setItem("reviewsByProduct", JSON.stringify(migrated));
      } catch {}
      alert("✅ Đã đồng bộ đánh giá.");
    } catch (e) {
      console.error(e);
      alert("Đồng bộ thất bại");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-lg text-gray-600">
        ⏳ Đang tải sản phẩm...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-extrabold text-green-700 text-center mb-8">
        🥗 Sản phẩm tươi sạch
      </h1>

      <Controls
        sort={sort}
        price={priceFilter}
        onUpdateParam={updateParam}
        showFavorites={showFavorites}
        onToggleShowFavorites={() => setShowFavorites((v) => !v)}
      />

      {/* Grid sản phẩm */}
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {paginated.map((p, index) => {
          const id = productId(p) || `product-${currentPage}-${index}`;
          const isFav = favorites.some((f) => productId(f) === id);
          return (
            <ProductCard
              key={id}
              product={p}
              onAddToCart={(prod) => addToCart({ ...prod, quantity: 1 })}
              onCheckout={(prod) => {
                addToCart({ ...prod, quantity: 1 });
                router.push("/checkout");
              }}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFav}
            />
          );
        })}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          {Array.from({ length: totalPages }, (_, i) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", String(i + 1));
            const href = `/products?${params.toString()}`;
            const active = currentPage === i + 1;
            return (
              <Link
                key={`page-${i + 1}`}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal thanh toán */}
      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
          onConfirm={(order) => {
            setLastOrder(order);
            setCheckoutProduct(null);
            alert("✅ Đã tạo đơn hàng!");
          }}
        />
      )}

      {/* Modal chi tiết đơn hàng */}
      {lastOrder && (
        <OrderDetailModal
          order={lastOrder}
          onClose={() => setLastOrder(null)}
        />
      )}

      {/* Reviews: hiển thị cho sản phẩm đầu tiên trong trang (demo) */}
      {paginated[0] && (
        <>
          <div className="flex items-center justify-between">
            <div />
            <div className="flex gap-2">
              <button
                onClick={() => syncReviews()}
                className="text-sm px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                Đồng bộ đánh giá
              </button>
            </div>
          </div>

          <ReviewListWithDelete
            reviews={reviewsByProduct[productId(paginated[0])] ?? []}
            onDelete={(i) => deleteReview(paginated[0], i)}
          />

          <ReviewForm
            onSubmit={(review) => {
              addReview(paginated[0], review);
              alert("Cảm ơn bạn đã đánh giá!");
            }}
          />
        </>
      )}
    </div>
  );
}
