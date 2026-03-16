'use client';
import { useEffect, useState } from 'react';

export type Product = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  origin?: string | null;
  import_date?: string | null;
  usage?: string | null;
  note?: string | null;
  category?: string | null;
};

export default function ProductListPage() {
  // GIỮ NGUYÊexport default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);

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

  const getImageUrl = (image?: string | null) => {
    if (!image || image === 'string' || image.trim() === '') {
      return 'https://via.placeholder.com/80x80?text=No+Image';
    }
    if (image.startsWith('http')) return image;
    if (image.startsWith('/media')) return `http://127.0.0.1:8000${image}`;
    return 'https://via.placeholder.com/80x80?text=No+Image';
  };

  const handleDelete = async (id: string) => {
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

      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Có lỗi khi xoá sản phẩm');
    } finally {
      setDeleting(null);
    }
  };

  const openEditForm = (product: Product) => {
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
        const err = await res.json();
        alert(err.detail || 'Cập nhật thất bại');
        return;
      }

      const updated = await res.json();
      setProducts(prev =>
        prev.map(p => (p.id === updated.id ? updated : p))
      );

      setEditingProduct(null);
      setNewImage(null);
    } catch (err) {
      alert('Lỗi khi cập nhật sản phẩm');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold">Danh sách sản phẩm</h2>

      <div className="mb-4 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Tìm theo tên sản phẩm..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md rounded border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        />
        <span className="text-sm text-gray-500">
          Tổng: {filteredProducts.length} sản phẩm
        </span>
      </div>

      {editingProduct && (
        <div className="my-6 border rounded p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">Chỉnh sửa sản phẩm</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={editingProduct.name}
              onChange={e =>
                setEditingProduct({ ...editingProduct, name: e.target.value })
              }
              className="border px-3 py-2 rounded"
              placeholder="Tên sản phẩm"
            />

            <input
              type="number"
              value={editingProduct.price}
              onChange={e =>
                setEditingProduct({
                  ...editingProduct,
                  price: Number(e.target.value),
                })
              }
              className="border px-3 py-2 rounded"
              placeholder="Giá"
            />

            <input
              type="text"
              value={editingProduct.origin || ''}
              onChange={e =>
                setEditingProduct({
                  ...editingProduct,
                  origin: e.target.value,
                })
              }
              className="border px-3 py-2 rounded"
              placeholder="Xuất xứ"
            />

            <input
              type="date"
              value={editingProduct.import_date || ''}
              onChange={e =>
                setEditingProduct({
                  ...editingProduct,
                  import_date: e.target.value,
                })
              }
              className="border px-3 py-2 rounded"
            />

            <input
              type="text"
              value={editingProduct.usage || ''}
              onChange={e =>
                setEditingProduct({
                  ...editingProduct,
                  usage: e.target.value,
                })
              }
              className="border px-3 py-2 rounded"
              placeholder="Cách dùng"
            />

            <input
              type="text"
              value={editingProduct.note || ''}
              onChange={e =>
                setEditingProduct({
                  ...editingProduct,
                  note: e.target.value,
                })
              }
              className="border px-3 py-2 rounded"
              placeholder="Ghi chú"
            />

            <input
              type="text"
              value={editingProduct.category || ''}
              onChange={e =>
                setEditingProduct({
                  ...editingProduct,
                  category: e.target.value,
                })
              }
              className="border px-3 py-2 rounded"
              placeholder="Danh mục"
            />

            <input
              type="file"
              accept="image/*"
              onChange={e => setNewImage(e.target.files?.[0] || null)}
              className="border px-3 py-2 rounded"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleUpdate}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Lưu
            </button>
            <button
              onClick={() => {
                setEditingProduct(null);
                setNewImage(null);
              }}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Đang tải sản phẩm...</p>
      ) : filteredProducts.length === 0 ? (
        <p>Không có sản phẩm nào phù hợp.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-gray-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600">
                <th className="px-3 py-2">Thông tin sản phẩm</th>
                <th className="px-3 py-2">Đơn vị</th>
                <th className="px-3 py-2">Giá bán</th>
                <th className="px-3 py-2 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-t text-sm">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={getImageUrl(product.image || null)}
                        alt={product.name}
                        onError={e => {
                          e.currentTarget.src =
                            'https://via.placeholder.com/80x80?text=No+Image';
                        }}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {product.name}
                        </div>
                        {product.category && (
                          <div className="text-xs text-gray-500">
                            {product.category}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-2 text-gray-700">Cái</td>

                  <td className="px-3 py-2 font-semibold text-green-700">
                    {Number(product.price || 0).toLocaleString()}₫
                  </td>

                  <td className="px-3 py-2 text-center">
                    <button
                      className="mr-3 text-xs font-medium text-blue-600 hover:underline"
                      onClick={() => openEditForm(product)}
                    >
                      Chỉnh sửa
                    </button>

                    <button
                      className="text-xs font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-red-300"
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
                    >
                      {deleting === product.id ? 'Đang xoá...' : 'Xoá'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

