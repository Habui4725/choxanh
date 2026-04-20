"use client";

import { useState } from "react";

export default function AddProductForm() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    origin: "",
    import_date: "",
    usage: "",
    note: "",
    category: "",
    image: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    setForm({ ...form, image: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("origin", form.origin);
    formData.append("import_date", form.import_date);
    formData.append("usage", form.usage);
    formData.append("note", form.note);
    formData.append("category", form.category);

    if (form.image) {
      formData.append("image", form.image);
    }

    const res = await fetch("http://127.0.0.1:8000/api/products/", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Thêm sản phẩm thành công!");
      setForm({
        name: "",
        price: "",
        origin: "",
        import_date: "",
        usage: "",
        note: "",
        category: "",
        image: null,
      });
    } else {
      alert("Lỗi khi thêm sản phẩm");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Tên sản phẩm"
        className="w-full border p-2 rounded"
        required
      />

      <input
        name="price"
        type="number"
        value={form.price}
        onChange={handleChange}
        placeholder="Giá"
        className="w-full border p-2 rounded"
        required
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full border p-2 rounded"
      />

      <input
        name="origin"
        value={form.origin}
        onChange={handleChange}
        placeholder="Xuất xứ"
        className="w-full border p-2 rounded"
      />

      <input
        name="import_date"
        value={form.import_date}
        onChange={handleChange}
        placeholder="Ngày nhập"
        className="w-full border p-2 rounded"
      />

      <input
        name="usage"
        value={form.usage}
        onChange={handleChange}
        placeholder="Cách dùng"
        className="w-full border p-2 rounded"
      />

      <input
        name="note"
        value={form.note}
        onChange={handleChange}
        placeholder="Ghi chú"
        className="w-full border p-2 rounded"
      />

      <input
        name="category"
        value={form.category}
        onChange={handleChange}
        placeholder="Danh mục"
        className="w-full border p-2 rounded"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Thêm sản phẩm
      </button>
    </form>
  );
}