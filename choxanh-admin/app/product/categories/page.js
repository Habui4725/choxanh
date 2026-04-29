'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/products/categories');
        const data = await res.json();

        if (Array.isArray(data)) {
          setCategories(data.filter(Boolean).map(String));
        } else {
          setError('Không thể lấy danh sách danh mục.');
        }
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
        setError('Không thể kết nối tới server.');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const formatName = (cat) => {
    const map = {
      'trai-cay': 'Trái cây',
      'rau-cu': 'Rau củ',
      'thit-ca': 'Thịt / Cá / Trứng / Hải sản',
      'gia-vi': 'Gia vị',
      'do-kho': 'Đồ khô',
      'dong-lanh': 'Đồ chế biến sẵn',
    };

    return map[cat] || cat.replace(/-/g, ' ');
  };

  return (
    <div className="min-h-screen bg-green-50 p-10">
      <div className="mb-6">
        <Link
          href="/main"
          className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
        >
          ← Quay về trang chính
        </Link>
      </div>

      <h1 className="text-4xl font-bold text-green-700 mb-6">
        Danh mục sản phẩm
      </h1>

      {loading && <p>Đang tải danh mục...</p>}

      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && categories.length === 0 && (
        <p>Chưa có danh mục nào.</p>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/product/list?category=${encodeURIComponent(cat)}`}
              className="block bg-white border border-green-200 rounded-xl p-6 shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-green-800">
                {formatName(cat)}
              </h2>
              <p className="text-gray-600 mt-2">
                Xem sản phẩm trong danh mục này.
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}