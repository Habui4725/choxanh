"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const [open, setOpen] = useState(false);

  // (Removed unused checkout state variables)

  // Tìm kiếm
  const [keyword, setKeyword] = useState("");

  const dropdownRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Removed unused totalAmount calculation

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-green-500 text-white shadow-lg">
      {/* TOP BAR */}
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-6">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <Image
            src="/logo.png"
            width={50}
            height={50}
            alt="Chợ xanh thông minh"
            className="rounded-full bg-white p-1 shadow-md"
          />
          <span className="hidden md:block text-2xl font-bold tracking-wide">
            Chợ Xanh Thông Minh
          </span>
        </Link>

        {/* SEARCH */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = keyword.trim();
            if (q) router.push(`/products?search=${encodeURIComponent(q)}`);
          }}
          className="hidden md:flex items-center bg-white rounded-md overflow-hidden w-[300px] shadow-sm"
        >
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            aria-label="Tìm kiếm sản phẩm"
            className="px-3 py-2 text-gray-700 w-full outline-none"
          />
          <button type="submit" className="bg-green-600 px-4 py-2">
            🔍
          </button>
        </form>

        {/* USER + CART */}
        <div className="flex items-center gap-4">
          {/* PHONE */}
          <span className="hidden md:block bg-white text-green-700 font-bold px-3 py-1 rounded-lg">
            📞 0233 172 0380
          </span>

          {/* CART → ĐI TRANG /cart */}
          <button
            onClick={() => router.push("/cart")}
            aria-label="Xem giỏ hàng"
            className="flex items-center gap-2 bg-white text-green-700 font-semibold px-3 py-1 rounded-lg hover:bg-green-100"
          >
            🛒 <span className="hidden md:inline">Giỏ hàng</span>
            {cart.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-2 rounded-full">
                {cart.length}
              </span>
            )}
          </button>

          {/* USER */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="flex items-center gap-2 bg-white text-green-700 font-semibold px-3 py-1 rounded-lg hover:bg-green-100"
            >
              👤 <span className="hidden md:inline">{user?.name ?? "Tài khoản"}</span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-green-700 rounded-lg shadow-lg py-2">
                <Link href="/account/profile" className="block px-4 py-2 hover:bg-green-100">
                  Thông tin cá nhân
                </Link>
                <Link href="/account/orders" className="block px-4 py-2 hover:bg-green-100">
                  Đơn hàng của tôi
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CATEGORY */}
      {!pathname?.startsWith("/products") && (
        <nav className="bg-green-700 h-12 flex items-center justify-center gap-8 font-semibold">
          <Link href="/categories/trai-cay">Trái cây</Link>
          <Link href="/categories/rau-cu">Rau củ</Link>
          <Link href="/categories/thit-ca">Thịt / Cá / Trứng / Hải sản</Link>
          <Link href="/categories/gia-vi">Gia vị</Link>
          <Link href="/categories/do-kho">Đồ khô</Link>
          <Link href="/categories/dong-lanh">Đồ chế biến sẵn</Link>
        </nav>
      )}
    </header>
  );
}
