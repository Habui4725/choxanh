"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaHome, FaBoxOpen, FaUsers, FaShoppingCart } from "react-icons/fa";

export default function MainDashboard() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [contactCount, setContactCount] = useState(0);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [completedOrderCount, setCompletedOrderCount] = useState(0);
  const [totalOrderCount, setTotalOrderCount] = useState(0);

  useEffect(() => {
    const adminUser = localStorage.getItem("adminUser");

    if (!adminUser) {
      router.push("/admin/login");
      return;
    }

    try {
      const user = JSON.parse(adminUser);

      if (user.role !== "admin") {
        router.push("/admin/login");
      }
    } catch {
      router.push("/admin/login");
    }
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  useEffect(() => {
    async function fetchUsers() {
      try {
        const adminUser = localStorage.getItem("adminUser");
        if (!adminUser) return;

        const parsed = JSON.parse(adminUser);
        const adminId = parsed?.id || parsed?._id;

        if (!adminId) return;

        const res = await fetch(
          `http://127.0.0.1:8000/admin/users?user_id=${adminId}`
        );

        const data = await res.json();

        if (!res.ok) {
          console.log("Lỗi:", data.detail);
          return;
        }

        setUserCount(data.total || 0);
      } catch (err) {
        console.log("Lỗi tải user:", err);
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/products/categories");
        const data = await res.json();
        setCategoryCount(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        console.log("Lỗi danh mục:", err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/contacts");
        const data = await res.json();
        setContactCount(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        console.log("Lỗi liên hệ:", err);
      }
    }
    fetchContacts();
  }, []);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/orders");
        const data = await res.json();

        if (!Array.isArray(data)) return;

        setTotalOrderCount(data.length);
        setPendingOrderCount(data.filter((o) => o.status === "pending").length);
        setCompletedOrderCount(data.filter((o) => o.status === "completed").length);
      } catch (err) {
        console.log("Lỗi đơn hàng:", err);
      }
    }
    fetchOrders();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/products/");
        const data = await res.json();
        setProductCount(data.length);
      } catch (err) {
        console.log("Lỗi sản phẩm:", err);
      }
    }
    fetchProducts();
  }, []);

  const dashboardItems = [
    { label: "Sản phẩm", value: productCount, link: "/product" },
    { label: "Danh mục sản phẩm", value: categoryCount, link: "/product/categories" },
    { label: "Khách hàng", value: userCount, link: "/customer" },
    { label: "Đơn hàng", value: totalOrderCount, link: "/orders" },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://thietkeshop.vn/wp-content/uploads/2024/05/decor-cua-hang-rau-sach.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-[#f8f5ed]/70"></div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="w-72 bg-[#dfeee0]/95 backdrop-blur-sm border-r border-green-200 shadow-lg p-7">
          <h2 className="text-3xl font-bold text-green-950 mb-8">Quản trị</h2>

          <ul className="space-y-3 text-[22px]">
            <li>
              <Link
                href="/main"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-green-950 hover:bg-white/70 transition"
              >
                <FaHome className="text-lg" /> Trang chủ
              </Link>
            </li>
            <li>
              <Link
                href="/product"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-green-950 hover:bg-white/70 transition"
              >
                <FaBoxOpen className="text-lg" /> Sản phẩm
              </Link>
            </li>
            <li>
              <Link
                href="/orders"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-green-950 hover:bg-white/70 transition"
              >
                <FaShoppingCart className="text-lg" /> Đơn hàng
              </Link>
            </li>
            <li>
              <Link
                href="/customer"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-green-950 hover:bg-white/70 transition"
              >
                <FaUsers className="text-lg" /> Khách hàng
              </Link>
            </li>
          </ul>
        </aside>

        <main className="flex-1 p-8 md:p-10">
          <div className="flex items-start justify-between mb-10">
            <div>
              <h1 className="text-6xl font-bold text-black">Dashboard</h1>
              <p className="mt-2 text-gray-700 text-lg">
                Hệ thống quản trị chợ xanh thông minh 
              </p>
            </div>

            <div ref={menuRef} className="relative">
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="flex items-center gap-2 rounded-xl bg-white/85 px-4 py-2 text-2xl shadow hover:bg-white transition"
              >
                👤 <span>Admin</span>
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl border bg-white shadow-lg overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-red-500 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {dashboardItems.map((item, i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-white/92 backdrop-blur-sm shadow-lg border border-white/60 p-8 min-h-[190px] flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition"
                >
                  <div>
                    <h2 className="text-5xl font-bold text-green-950 mb-4">
                      {item.value}
                    </h2>
                    <p className="text-3xl text-gray-900">{item.label}</p>
                  </div>

                  <Link
                    href={item.link}
                    className="mt-6 inline-flex w-fit items-center text-2xl text-green-800 hover:text-green-950 hover:underline"
                  >
                    Xem →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}