"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Modal from "@/components/ui/Modal";
import { notifySuccess, notifyUpdate, notifyDelete } from "@/lib/toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

type Product = {
  product_id: number;
  sku: string;
  name: string;
  category: string;
};

const PAGE_SIZE = 10;

export default function ProductsManager({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const [formSku, setFormSku] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");

  const refreshProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("product_id");
    setProducts(data ?? []);
  };

  const filtered = products.filter(
    (p) => p.name.includes(searchTerm) || p.sku.includes(searchTerm),
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const openAddModal = () => {
    setEditingProduct(null);
    setFormSku("");
    setFormName("");
    setFormCategory("");
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormSku(product.sku);
    setFormName(product.name);
    setFormCategory(product.category);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formSku.trim() || !formName.trim() || !formCategory.trim()) {
      notifyDelete("الرجاء تعبئة كل الحقول");
      return;
    }

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update({ sku: formSku, name: formName, category: formCategory })
        .eq("product_id", editingProduct.product_id);

      if (error) {
        notifyDelete("حدث خطأ أثناء التعديل");
        return;
      }
      notifyUpdate("تم تعديل الصنف بنجاح");
    } else {
      const { error } = await supabase
        .from("products")
        .insert({ sku: formSku, name: formName, category: formCategory });

      if (error) {
        notifyDelete("حدث خطأ أثناء الإضافة");
        return;
      }
      notifySuccess("تمت إضافة الصنف بنجاح");
    }

    setIsModalOpen(false);
    refreshProducts();
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("product_id", deletingProduct.product_id);

    if (error) {
      notifyDelete("حدث خطأ أثناء الحذف");
      return;
    }
    notifyDelete("تم حذف الصنف");
    refreshProducts();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">إدارة الأصناف</h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          >
            <Plus size={16} />
            إضافة صنف
          </button>
        </div>

        <div className="relative max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="ابحث بالاسم أو الكود..."
            className="input pl-9"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-500">
                <th className="py-3 px-4 font-medium">الكود</th>
                <th className="py-3 px-4 font-medium">اسم الصنف</th>
                <th className="py-3 px-4 font-medium">الفئة</th>
                <th className="py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((product) => (
                <tr
                  key={product.product_id}
                  className="border-b last:border-0 hover:bg-slate-50"
                >
                  <td className="py-3 px-4 text-slate-500">{product.sku}</td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {product.name}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {product.category}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-slate-400 hover:text-emerald-600"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingProduct(product)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
              <span className="text-xs text-slate-400">
                صفحة {currentPage} من {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-30"
                >
                  السابق
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-30"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "تعديل صنف" : "إضافة صنف جديد"}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              الكود (SKU)
            </label>
            <input
              className="input"
              value={formSku}
              onChange={(e) => setFormSku(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              اسم الصنف
            </label>
            <input
              className="input"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              الفئة
            </label>
            <input
              className="input"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full mt-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          >
            {editingProduct ? "حفظ التعديلات" : "إضافة الصنف"}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={confirmDelete}
        title="حذف الصنف"
        message={`هل أنت متأكد من حذف "${deletingProduct?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف نهائيًا"
        variant="danger"
      />
    </div>
  );
}
