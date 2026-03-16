'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type ContactMessage = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  created_at?: string;
};

export default function ContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/contacts');
        const data = await res.json();
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setError('Không thể lấy dữ liệu liên hệ.');
        }
      } catch (err) {
        console.error('Lỗi tải liên hệ:', err);
        setError('Không thể kết nối tới server.');
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, []);

  return (
    <div className="min-h-screen bg-green-50 p-10">
      <div className="mb-6">
        <Link
          href="/main"
          className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          ← Quay về trang chính
        </Link>
      </div>

      <h1 className="text-4xl font-bold text-green-700 mb-6">Liên hệ</h1>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : messages.length === 0 ? (
        <p>Chưa có thông điệp liên hệ nào.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id ?? msg.email ?? Math.random()} className="bg-white border border-green-200 rounded-xl p-6 shadow">
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tên</p>
                  <p className="font-semibold">{msg.name || 'Khách vãng lai'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold">{msg.email || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">SĐT</p>
                  <p className="font-semibold">{msg.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày</p>
                  <p className="font-semibold">
                    {msg.created_at ? new Date(msg.created_at).toLocaleString('vi-VN') : '—'}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Nội dung</p>
                <p className="mt-1 text-gray-800 whitespace-pre-wrap">{msg.message || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
