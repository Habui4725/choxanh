"use client";

import Link from "next/link";

const categories = [
  { slug: "trai-cay", name: "🍎 Trái cây" },
  { slug: "rau-cu", name: "🥬 Rau củ" },
  { slug: "thit-ca", name: "🥩 Thịt cá" },
  { slug: "gia-vi", name: "🧂 Gia vị" },
  { slug: "do-kho", name: "🍜 Đồ khô" },
  { slug: "dong-lanh", name: "❄️ Đông lạnh" },
];

export default function CategoryMenu() {
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="font-bold text-lg mb-3">Danh mục</h2>

      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/category/${c.slug}`}
              className="block px-3 py-2 rounded hover:bg-green-100 text-gray-700"
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
