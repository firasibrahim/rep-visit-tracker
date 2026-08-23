"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import InventorySelector from "@/components/visits/InventorySelector";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { notifySuccess, notifyDelete } from "@/lib/toast";

type Product = { product_id: number; name: string; category: string };
type Client = { client_id: number; name: string };

export default function NewVisitForm({
  initialClients,
  initialProducts,
  currentRepId,
}: {
  initialClients: Client[];
  initialProducts: Product[];
  currentRepId: number;
}) {
  const router = useRouter();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [repNotes, setRepNotes] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inventory, setInventory] = useState(
    initialProducts.map((p) => ({
      productId: p.product_id,
      productName: p.name,
      category: p.category,
      availableOnShelf: false,
      availableInWarehouse: false,
    })),
  );

  const toggleAvailability = (
    productId: number,
    field: "availableOnShelf" | "availableInWarehouse",
  ) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, [field]: !item[field] }
          : item,
      ),
    );
  };

  const selectedClient = initialClients.find(
    (c) => c.client_id === selectedClientId,
  );
  const selectedItemsCount = inventory.filter(
    (i) => i.availableOnShelf || i.availableInWarehouse,
  ).length;

  // التحقق قبل فتح نافذة التأكيد
  const handlePreSubmit = () => {
    if (!selectedClientId) {
      notifyDelete("الرجاء اختيار العميل أولاً");
      return;
    }
    setShowConfirm(true);
  };

  // الإرسال الفعلي بعد التأكيد
  const handleConfirmedSubmit = async () => {
    setSubmitting(true);

    // 1. إنشاء الزيارة نفسها
    const { data: visitData, error: visitError } = await supabase
      .from("visits")
      .insert({
        client_id: selectedClientId,
        rep_id: currentRepId,
        rep_notes: repNotes,
        status: "pending_review",
      })
      .select()
      .single();

    if (visitError || !visitData) {
      notifyDelete("حدث خطأ أثناء إرسال الزيارة");
      setSubmitting(false);
      return;
    }

    // 2. إضافة الأصناف المُحددة بس (توفيرًا للبيانات، مفيش داعي نضيف صنف مفيش فيه حركة)
    const selectedInventory = inventory
      .filter((i) => i.availableOnShelf || i.availableInWarehouse)
      .map((i) => ({
        visit_id: visitData.visit_id,
        product_id: i.productId,
        available_on_shelf: i.availableOnShelf,
        available_in_warehouse: i.availableInWarehouse,
      }));

    if (selectedInventory.length > 0) {
      const { error: inventoryError } = await supabase
        .from("visit_inventory")
        .insert(selectedInventory);

      if (inventoryError) {
        notifyDelete("تم إرسال الزيارة، لكن حدث خطأ في حفظ الأصناف");
        setSubmitting(false);
        return;
      }
    }

    notifySuccess("تم إرسال الزيارة بنجاح، بانتظار مراجعة المشرف");
    setSubmitting(false);
    router.push("/visits");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">تسجيل زيارة</h1>
          <span className="text-sm text-slate-400">
            الرئيسية / الزيارات / تسجيل زيارة
          </span>
        </div>

        <Card title="بيانات الزيارة">
          <div>
            <Field label="اسم العميل (المحل)">
              <select
                className="input"
                value={selectedClientId ?? ""}
                onChange={(e) =>
                  setSelectedClientId(Number(e.target.value) || null)
                }
              >
                <option value="">اختر عميل</option>
                {initialClients.map((c) => (
                  <option key={c.client_id} value={c.client_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        <Card title="الأصناف المتوفرة بالرف والمخزن">
          <InventorySelector
            inventory={inventory}
            onToggle={toggleAvailability}
          />
        </Card>

        <Card title="ملاحظاتك على الزيارة">
          <textarea
            className="input"
            rows={4}
            value={repNotes}
            onChange={(e) => setRepNotes(e.target.value)}
            placeholder="اكتب ملاحظاتك عن حالة المحل، أي طلبات أو مشاكل واجهتها..."
          />
        </Card>

        <div className="flex justify-end gap-3">
          <button className="px-5 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">
            حفظ كمسودة
          </button>
          <button
            onClick={handlePreSubmit}
            className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            إرسال الزيارة للمشرف
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmedSubmit}
        title="تأكيد إرسال الزيارة"
        message={`سيتم إرسال زيارة "${selectedClient?.name}" مع ${selectedItemsCount} صنف محدد. تأكد من مراجعة البيانات قبل الإرسال — لن تتمكن من التعديل بعد الإرسال.`}
        confirmLabel={submitting ? "جاري الإرسال..." : "تأكيد الإرسال"}
        variant="warning"
      />
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h2 className="text-base font-bold text-slate-700 mb-4 border-b pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-slate-600 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
