'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaBoxOpen, FaUsers, FaShoppingCart } from 'react-icons/fa';

export default function MainDashboard() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Số lượng khách hàng
  const [userCount, setUserCount] = useState(0);

  // Số lượng sản phẩm
  const [productCount, setProductCount] = useState(0);

  // Số lượng danh mục sản phẩm
  const [categoryCount, setCategoryCount] = useState(0);

  // Số lượng liên hệ
  const [contactCount, setContactCount] = useState(0);

  // Số lượng đơn hàng
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [completedOrderCount, setCompletedOrderCount] = useState(0);

  useEffect(() => {
    const userId = localStorage.getItem('adminUserId');
    const role = localStorage.getItem('adminRole');
    if (!userId || role !== 'admin') router.push('/admin/login');
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUserId');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminName');
    router.push('/admin/login');
  };

  // Fetch số lượng khách hàng
  useEffect(() => {
    async function fetchUsers() {
      try {
        const userId = localStorage.getItem('adminUserId');
        if (!userId) return;

        const res = await fetch(
          `http://127.0.0.1:8000/admin/users?user_id=${encodeURIComponent(
            userId
          )}`
        );

        const data = await res.json();
        setUserCount(data.total ?? data.users?.length ?? 0);
      } catch (err) {
        console.log('Lỗi tải danh sách user:', err);
      }
    }
    fetchUsers();
  }, []);

  // Fetch số lượng danh mục sản phẩm
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/products/categories');
        const data = await res.json();
        setCategoryCount(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        console.log('Lỗi tải danh mục:', err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch số lượng liên hệ
  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/contacts');
        const data = await res.json();
        setContactCount(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        console.log('Lỗi tải liên hệ:', err);
      }
    }
    fetchContacts();
  }, []);

  // Fetch số lượng đơn hàng
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/orders');
        const data = await res.json();
        if (!Array.isArray(data)) return;

        setPendingOrderCount(data.filter((o) => o.status === 'pending').length);
        setCompletedOrderCount(data.filter((o) => o.status === 'completed').length);
      } catch (err) {
        console.log('Lỗi tải đơn hàng:', err);
      }
    }
    fetchOrders();
  }, []);

  // Fetch số lượng sản phẩm (API đúng)
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/products/');
        const data = await res.json();
        setProductCount(data.length);
      } catch (err) {
        console.log('Lỗi tải sản phẩm:', err);
      }
    }
    fetchProducts();
  }, []);

  // Dùng số thật
  const dashboardItems = [
    { label: 'Sản phẩm', value: productCount, link: '/product' },
    { label: 'Danh mục sản phẩm', value: categoryCount, link: '/product/categories' },
    { label: 'Liên hệ', value: contactCount, link: '/contact' },
    { label: 'Khách hàng', value: userCount, link: '/customer' },
    { label: 'Đơn hàng chưa xử lý', value: pendingOrderCount, link: '/orders/list?status=pending' },
    { label: 'Đơn hàng đã xử lý', value: completedOrderCount, link: '/orders/list?status=completed' },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://thietkeshop.vn/wp-content/uploads/2024/05/decor-cua-hang-rau-sach.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[0px]"></div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="w-64 bg-green-100/90 shadow-xl p-6 border-r border-green-200">
          <h2 className="text-2xl font-bold text-green-800 mb-8">Quản trị</h2>
          <ul className="space-y-3 text-green-900 font-medium">
            <li>
              <Link href="/main" className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-200 transition">
                <FaHome /> Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/product" className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-200 transition">
                <FaBoxOpen /> Sản phẩm
              </Link>
            </li>
            <li>
              <Link href="/orders" className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-200 transition">
                <FaShoppingCart /> Đơn hàng
              </Link>
            </li>
            <li>
              <Link href="/customer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-200 transition">
                <FaUsers /> Khách hàng
              </Link>
            </li>
          </ul>
        </aside>

        <main className="flex-1 p-10">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">Tổng quan hệ thống</h1>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full bg-white shadow hover:bg-green-100">🌙</button>
              <button className="p-2 rounded-full bg-white shadow hover:bg-green-100">🔔</button>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpenMenu(!openMenu)}
                  className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow hover:bg-green-50 transition"
                >
                  <img
                    src="https://cellphones.com.vn/sforum/wp-content/uploads/2024/02/avatar-anh-meo-cute-4.jpg"
                    className="w-9 h-9 rounded-full"
                    alt="avatar"
                  />
                  <span className="font-medium text-green-900">Admin</span>
                </button>

                {openMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-green-200 rounded-xl shadow-lg overflow-hidden z-20">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-red-100 text-red-600"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {dashboardItems.map((item, index) => (
              <div
                key={index}
                className="bg-white/90 p-6 rounded-2xl shadow-md hover:shadow-xl transition border border-green-100 backdrop-blur"
              >
                <h2 className="text-3xl font-bold text-green-800">{item.value}</h2>
                <p className="text-green-700 mt-1">{item.label}</p>
                <Link
                  href={item.link}
                  className="text-green-800 text-sm mt-3 inline-block hover:underline font-medium"
                >
                  Chi tiết →
                </Link>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}