'use client';
import { useEffect, useState } from 'react';

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newImage, setNewImage] = useState(null);

  // ⭐ pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:8000/api/products/');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getImageUrl = (image) => {
    if (!image || image === 'string' || image.trim() === '') {
      return 'https://via.placeholder.com/80x80?text=No+Image';
    }

    if (image.startsWith('http')) return image;

    if (image.startsWith('/uploads') || image.startsWith('/media')) {
      return `http://127.0.0.1:8000${image}`;
    }

    return 'https://via.placeholder.com/80x80?text=No+Image';
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Bạn có chắc chắn muốn xoá sản phẩm này?');
    if (!ok) return;

    try {
      setDeleting(id);

      const res = await fetch(`http://127.0.0.1:8000/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || 'Xoá sản phẩm thất bại');
        return;
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Có lỗi khi xoá sản phẩm');
    } finally {
      setDeleting(null);
    }
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setNewImage(null);
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;

    const formData = new FormData();
    formData.append('name', editingProduct.name);
    formData.append('price', String(editingProduct.price));
    formData.append('origin', editingProduct.origin || '');
    formData.append('import_date', editingProduct.import_date || '');
    formData.append('usage', editingProduct.usage || '');
    formData.append('note', editingProduct.note || '');
    formData.append('category', editingProduct.category || '');

    if (newImage) {
      formData.append('image', newImage);
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/products/${editingProduct.id}`,
        {
          method: 'PUT',
          body: formData,
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || 'Lỗi khi cập nhật sản phẩm');
        return;
      }

      const updated = await res.json();

      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );

      setEditingProduct(null);
      setNewImage(null);
      alert('Cập nhật sản phẩm thành công');
    } catch (err) {
      alert('Lỗi khi cập nhật sản phẩm');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // ⭐ pagination logic
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
  <div className="p-8 bg-[#f6f3ec] min-h-screen">
    <h2 className="mb-6 text-2xl font-semibold text-green-800">
      Danh sách sản phẩm
    </h2>

    {/* Search */}
    <div className="mb-6 flex items-center justify-between">
      <input
        type="text"
        placeholder="Tìm theo tên sản phẩm..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="w-80 rounded-lg border border-green-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
      />

      <span className="text-sm text-green-700 font-medium">
        Tổng: {filteredProducts.length} sản phẩm
      </span>
    </div>

    {loading ? (
      <p className="text-green-700">Đang tải sản phẩm...</p>
    ) : (
      <div className="rounded-xl border border-green-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          {/* HEADER */}
          <thead>
            <tr className="bg-green-100 text-green-800">
              <th className="px-6 py-3 text-left">Thông tin</th>
              <th className="px-6 py-3 text-center">Đơn vị</th>
              <th className="px-6 py-3 text-center">Giá</th>
              <th className="px-6 py-3 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {currentProducts.map((product) => (
              <tr
                key={product.id}
                className="border-t hover:bg-green-50 transition"
              >
                {/* Thông tin */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={getImageUrl(product.image)}
                      className="h-14 w-14 object-cover rounded-lg border"
                    />

                    <div>
                      <p className="font-semibold text-green-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.category || "Chưa phân loại"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Đơn vị */}
                <td className="px-6 py-4 text-center text-gray-700">
                  Cái
                </td>

                {/* Giá */}
                <td className="px-6 py-4 text-center font-semibold text-green-700">
                  {Number(product.price || 0).toLocaleString()}₫
                </td>

                {/* Hành động */}
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => openEditForm(product)}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    Sửa
                  </button>

                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-500 hover:underline"
                  >
                    {deleting === product.id ? "Đang xoá..." : "Xoá"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 p-4 border-t bg-green-50">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-1 border rounded-lg bg-white hover:bg-green-100 disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-green-800 font-medium">
            Trang {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-1 border rounded-lg bg-white hover:bg-green-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    )}

    {/* ===== FORM EDIT (UI CHỈNH NHẸ) ===== */}
    {editingProduct && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-[#fdfaf5] w-full max-w-2xl rounded-xl shadow-lg p-6 border border-green-200">
          <h3 className="text-xl font-semibold mb-4 text-green-800">
            Sửa sản phẩm
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={editingProduct.name || ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  name: e.target.value,
                })
              }
              className="border rounded px-3 py-2"
              placeholder="Tên sản phẩm"
            />

            <input
              type="number"
              value={editingProduct.price || ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  price: e.target.value,
                })
              }
              className="border rounded px-3 py-2"
              placeholder="Giá"
            />

            <input
              value={editingProduct.origin || ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  origin: e.target.value,
                })
              }
              className="border rounded px-3 py-2"
              placeholder="Xuất xứ"
            />

            <input
              value={editingProduct.import_date || ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  import_date: e.target.value,
                })
              }
              className="border rounded px-3 py-2"
              placeholder="Ngày nhập"
            />

            <input
              value={editingProduct.category || ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  category: e.target.value,
                })
              }
              className="border rounded px-3 py-2"
              placeholder="Danh mục"
            />

            <input
              value={editingProduct.usage || ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  usage: e.target.value,
                })
              }
              className="border rounded px-3 py-2"
              placeholder="Cách dùng"
            />

            <textarea
              value={editingProduct.note || ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  note: e.target.value,
                })
              }
              className="border rounded px-3 py-2 md:col-span-2"
              rows={3}
              placeholder="Ghi chú"
            />

            <div className="md:col-span-2">
              <img
                src={getImageUrl(editingProduct.image)}
                className="h-20 w-20 object-cover rounded border mb-2"
              />
              <input
                type="file"
                onChange={(e) => setNewImage(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setEditingProduct(null)}
              className="px-4 py-2 border rounded"
            >
              Hủy
            </button>

            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}