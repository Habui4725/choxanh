"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

// Các control lọc/sắp xếp/search ở trên cùng
function Controls({ sort, price, keyword, onUpdateParam, showFavorites, onToggleShowFavorites }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 mb-10 flex flex-wrap gap-4 justify-center">
      <input
        type="text"
        value={keyword}
        onChange={(e) => onUpdateParam("search", e.target.value)}
        placeholder="🔍 Tìm kiếm sản phẩm..."
        className="px-4 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-green-500 w-60"
      />

      <select
        value={price}
        onChange={(e) => onUpdateParam("price", e.target.value)}
        className="px-4 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-green-500"
      >
        <option value="">💰 Lọc giá</option>
        <option value="under50">Dưới 50k</option>
        <option value="50to100">50k - 100k</option>
        <option value="over100">Trên 100k</option>
      </select>

      <select
        value={sort}
        onChange={(e) => onUpdateParam("sort", e.target.value)}
        className="px-4 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-green-500"
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
        className={`px-4 py-2 text-sm rounded-xl border transition ${
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
// Trang danh mục chính, hiển thị list sản phẩm theo slug category, có lọc/sắp xếp/search/favorite/pagination
export default function CategoryPage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const page = parseInt(searchParams.get("page") ?? "1");
  const sort = searchParams.get("sort") ?? "";
  const priceFilter = searchParams.get("price") ?? "";
  const keyword = (searchParams.get("search") ?? "").toLowerCase();
  const pageSize = 12;

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/products/category/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setRawProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const getId = (p) => p?.id;

  const toggleFavorite = (product) => {
    setFavorites((prev) => {
      const id = getId(product);
      const exists = prev.some((f) => getId(f) === id);
      return exists ? prev.filter((f) => getId(f) !== id) : [...prev, product];
    });
  };

  const updateParam = (param, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(param, value);
    else params.delete(param);
    params.delete("page");
    router.push(`/categories/${slug}?${params.toString()}`);
  };

  const filteredProducts = useMemo(() => {
    let items = [...rawProducts];

    if (priceFilter === "under50") items = items.filter((p) => p.price < 50000);
    if (priceFilter === "50to100") items = items.filter((p) => p.price >= 50000 && p.price <= 100000);
    if (priceFilter === "over100") items = items.filter((p) => p.price > 100000);
    if (keyword) items = items.filter((p) => p.name.toLowerCase().includes(keyword));

    if (sort === "asc") items.sort((a, b) => a.price - b.price);
    if (sort === "desc") items.sort((a, b) => b.price - a.price);
    if (sort === "name") items.sort((a, b) => a.name.localeCompare(b.name));

    return items;
  }, [rawProducts, priceFilter, keyword, sort]);

  const displayProducts = showFavorites ? favorites : filteredProducts;
  const totalPages = Math.ceil(displayProducts.length / pageSize);
  const paginated = displayProducts.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return <div className="pt-40 text-center text-lg text-gray-500">⏳ Đang tải sản phẩm...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 pt-36">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold text-green-700 mb-8 capitalize text-center">
          🍏 {slug.replace(/-/g, " ")}
        </h1>

        <Controls
          sort={sort}
          price={priceFilter}
          keyword={keyword}
          onUpdateParam={updateParam}
          showFavorites={showFavorites}
          onToggleShowFavorites={() => setShowFavorites((v) => !v)}
        />

        {paginated.length === 0 ? (
          <p className="text-center text-gray-500">Không có sản phẩm phù hợp.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
            {paginated.map((p) => {
              const id = getId(p);
              const isFav = favorites.some((f) => getId(f) === id);

              return (
                <div
                  key={id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden relative flex flex-col"
                >
                  <button
                    onClick={() => toggleFavorite(p)}
                    className="absolute top-3 right-3 text-xl z-10"
                  >
                    {isFav ? "❤️" : "🤍"}
                  </button>

                  <Link href={`/products/${id}`}>
                    <img
                      src={p.image}
                      alt={p.name}
                      onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
                      className="h-44 w-full object-cover"
                    />
                  </Link>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-800 line-clamp-2">
                      {p.name}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      {p.origin || "Việt Nam"} • {p.packaging || "500g"}
                    </p>

                    <p className="text-green-600 font-bold text-lg mt-2">
                      {Number(p.price).toLocaleString()} đ
                    </p>

                    <div className="text-yellow-500 text-sm mt-1">
                      {"⭐".repeat(Math.round(p.rating ?? 4))}
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                      {p.description || "Sản phẩm tươi sạch, đảm bảo an toàn thực phẩm."}
                    </p>

                    <div className="mt-auto flex gap-2 pt-4">
                      <button
                        onClick={() => addToCart({ ...p, quantity: 1 })}
                        className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700"
                      >
                        🛒 Giỏ hàng
                      </button>
                      <Link
                        href={`/products/${id}`}
                        className="flex-1 bg-orange-500 text-white text-sm py-2 rounded-lg text-center hover:bg-orange-600"
                      >
                        Mua ngay
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12 pb-16">
            {Array.from({ length: totalPages }, (_, i) => (
              <Link
                key={i}
                href={`/categories/${slug}?page=${i + 1}`}
                className={`px-4 py-2 rounded-lg ${
                  page === i + 1
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
