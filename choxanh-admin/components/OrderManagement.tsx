"use client";

import Link from "next/link";

export default function OrderManagement() {
  return (
    <div className="bg-green-50 min-h-screen p-6">
      {/* Nút quay về */}
      <Link
        href="/"
        className="inline-block mb-6 text-green-700 hover:underline font-medium"
      >
        ← Quay về trang chính
      </Link>

      {/* Tiêu đề */}
      <h1 className="text-3xl font-bold text-green-700 text-center mb-10">
        Quản lý đơn hàng
      </h1>

      {/* Các lựa chọn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Card: Danh sách đơn hàng */}
        <Link
          href="/orders/List"
          className="bg-white border border-green-300 rounded-xl p-6 shadow hover:shadow-lg hover:bg-green-100 transition duration-200"
        >
          <h2 className="text-xl font-semibold text-green-700 mb-2">
            Danh sách đơn hàng
          </h2>
          <p className="text-gray-600">Xem toàn bộ đơn hàng đã tạo.</p>
        </Link>

        {/* Card: Tạo đơn hàng mới */}
        <Link
          href="/orders/create"
          className="bg-white border border-green-300 rounded-xl p-6 shadow hover:shadow-lg hover:bg-green-100 transition duration-200"
        >
          <h2 className="text-xl font-semibold text-green-700 mb-2">
            Tạo đơn hàng mới
          </h2>
          <p className="text-gray-600">Thêm đơn hàng mới vào hệ thống.</p>
        </Link>
      </div>
    </div>
  );
}