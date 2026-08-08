"use client";

import { useState } from "react";
import { mockClients, mockReps, mockProducts } from "@/lib/mockData";
import InventorySelector from "@/components/visits/InventorySelector";

export default function NewVisitPage() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  // const [selectedRepId, setSelectedRepId] = useState<number | null>(null);
  const [repNotes, setRepNotes] = useState("");
  const [inventory, setInventory] = useState(
    mockProducts.map((p) => ({
      productId: p.id,
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

  const handleSubmit = () => {
    const submission = {
      clientId: selectedClientId,
      repId: 1,
      visitDate: new Date().toISOString().split("T")[0],
      repNotes,
      inventory,
      status: "pending_review",
    };
    console.log("بيانات الزيارة المُرسلة:", submission);
    alert("تم إرسال الزيارة بنجاح، بانتظار مراجعة المشرف");
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
                {mockClients.map((c) => (
                  <option key={c.id} value={c.id}>
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
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            إرسال الزيارة للمشرف
          </button>
        </div>
      </div>
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
