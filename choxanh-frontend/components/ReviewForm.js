"use client";

import { useState } from "react";

export default function ReviewForm({ onSubmit }) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [author, setAuthor] = useState("");

  const handleSubmit = () => {
    if (!comment.trim()) {
      alert("Vui lòng nhập nội dung đánh giá");
      return;
    }

    // Gửi dữ liệu về page cha
    onSubmit({
      rating: Number(rating),
      comment,
      author: author || "Khách hàng",
    });

    // reset form
    setComment("");
    setRating(5);
    setAuthor("");
  };

  return (
    <div className="mt-8 border rounded-lg p-4 bg-white">
      <h3 className="text-lg font-semibold mb-3">Viết đánh giá của bạn</h3>

      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Tên của bạn (không bắt buộc)"
        className="border rounded px-3 py-2 w-full mb-3"
      />

      <select
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        className="border rounded px-3 py-2 w-full mb-3"
      >
        {[5, 4, 3, 2, 1].map((r) => (
          <option key={r} value={r}>
            {r} ⭐
          </option>
        ))}
      </select>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Nhập nội dung đánh giá..."
        rows={3}
        className="border rounded px-3 py-2 w-full mb-3"
      />

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Gửi đánh giá
      </button>
    </div>
  );
}
