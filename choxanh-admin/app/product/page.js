'use client';

import Link from 'next/link';

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-[#f6f3ec] p-10">
      {/* Nút quay về */}
      <div className="mb-8">
        <Link
          href="/main"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          ← Trang chính
        </Link>
      </div>

      {/* Tiêu đề */}
      <h1 className="text-4xl font-bold text-green-800 mb-12 text-center">
        Quản lý sản phẩm
      </h1>

      {/* Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-5xl mx-auto">
        
        {/* Danh sách sản phẩm */}
        <Link
          href="/product/list"
          className="group bg-white p-8 rounded-2xl border border-green-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <h2 className="text-xl font-semibold text-green-800 group-hover:text-green-900">
            Danh sách sản phẩm
          </h2>

          <p className="text-gray-600 mt-3">
            Xem toàn bộ sản phẩm hiện có trong hệ thống.
          </p>

          <div className="mt-4 text-green-600 font-medium group-hover:underline">
            Xem ngay →
          </div>
        </Link>

        {/* Thêm sản phẩm */}
        <Link
          href="/product/add"
          className="group bg-white p-8 rounded-2xl border border-green-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <h2 className="text-xl font-semibold text-green-800 group-hover:text-green-900">
            Thêm sản phẩm mới
          </h2>

          <p className="text-gray-600 mt-3">
            Tạo sản phẩm mới vào hệ thống quản lý.
          </p>

          <div className="mt-4 text-green-600 font-medium group-hover:underline">
            Thêm ngay →
          </div>
        </Link>
      </div>
    </div>
  );
}