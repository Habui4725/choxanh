import AddProductForm from "@/components/AddProductForm";

export default function AddProductPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Thêm sản phẩm mới</h1>
      <AddProductForm />
    </div>
  );
}