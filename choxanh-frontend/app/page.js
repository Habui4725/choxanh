"use client";

import { useAuth } from "@/app/context/AuthContext";
import ProductsPage from "./products/page"; // trang danh sách sản phẩm
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const { user } = useAuth(); // lấy thông tin user từ context

  // Nếu đã đăng nhập thì hiển thị danh sách sản phẩm
  if (user) {
    return <ProductsPage />;
  }

  // Nếu chưa đăng nhập thì hiển thị trang giới thiệu
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-emerald-50">
      {/* HERO */}
      <section className="w-full h-screen bg-[url('/Home-bg.jpg')] bg-cover bg-center flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md p-10 md:p-14 rounded-2xl text-center shadow-xl max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-green-700 mb-4 leading-tight">
            Chợ Xanh Thông Minh
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-6">
            Nơi cung cấp thực phẩm sạch – tươi mới mỗi ngày
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-transform transform hover:scale-105"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 py-20 px-6">
        {[
          { src: "/icon-fresh.png", title: "Tươi mới 100%" },
          { src: "/icon-fast.png", title: "Giao nhanh trong ngày" },
          { src: "/icon-safe.png", title: "An toàn – rõ nguồn gốc" },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-white flex flex-col items-center shadow-lg hover:shadow-xl transition-shadow p-6 rounded-2xl text-center group"
          >
            <div className="w-[160px] h-[160px] flex items-center justify-center overflow-hidden mb-4">
              <Image
                src={item.src}
                width={160}
                height={160}
                alt={item.title}
                className="object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="font-bold text-lg text-green-700">{item.title}</h3>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="py-16 bg-green-600 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">
          Thực phẩm sạch – mang sức khỏe tới gia đình bạn - Chọn Chợ Xanh Thông Minh!
        </h2>
        <Link
          href="/auth/register"
          className="inline-block bg-white text-green-700 px-8 py-3 rounded-full font-bold text-lg transition-transform transform hover:scale-105"
        >
          Đăng ký tài khoản
        </Link>
      </section>
    </div>
  );
}