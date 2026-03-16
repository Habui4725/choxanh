'use client';

import Link from 'next/link';

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-green-50 p-10">
      {/* Nút quay về trang chính */}
      <div className="mb-6">
        <Link
          href="/main"
          className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          ← Quay về trang chính
        </Link>
      </div>

      {/* Tiêu đề */}
      <h1 className="text-4xl font-bold text-green-700 mb-10 text-center">
        Quản lý sản phẩm
      </h1>

      {/* Card chức năng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Danh sách sản phẩm */}
        <Link
          href="/product/list"
          className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition border border-green-200 group"
        >
          <h2 className="text-xl font-semibold text-green-800 group-hover:text-green-900">
            Danh sách sản phẩm
          </h2>
          <p className="text-gray-600 mt-2">Xem toàn bộ sản phẩm hiện có.</p>
        </Link>

        {/* Thêm sản phẩm mới */}
        <Link
          href="/product/add"
          className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition border border-green-200 group"
        >
          <h2 className="text-xl font-semibold text-green-800 group-hover:text-green-900">
            Thêm sản phẩm mới
          </h2>
          <p className="text-gray-600 mt-2">Tạo sản phẩm mới vào hệ thống.</p>
        </Link>
      </div>
    </div>
  );
}