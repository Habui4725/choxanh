"use client";

import { useShoppingList } from "@/app/context/ShoppingListContext";

export default function ShoppingListPage() {
  const { items, removeItem } = useShoppingList();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📝 Shopping List</h1>

      {items.length === 0 ? (
        <p>Chưa có nguyên liệu nào</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between border p-3 rounded"
            >
              <span>{item.name}</span>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500"
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
