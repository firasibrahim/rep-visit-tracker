"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Dynamic import إلزامي هنا عشان المكتبة تشتغل بس في المتصفح، مش على السيرفر
const LocationPicker = dynamic(
  () => import("@/components/clients/LocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-slate-100 rounded-lg animate-pulse" />
    ),
  },
);

export default function NewClientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [classification, setClassification] = useState<"A" | "B" | "C">("B");
  const [subClassification, setSubClassification] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState({ lat: 32.8872, lng: 13.1913 });

  const handleSubmit = () => {
    const newClient = {
      name,
      classification,
      subClassification: classification === "A" ? subClassification : null,
      address,
      latitude: location.lat,
      longitude: location.lng,
    };
    console.log("عميل جديد:", newClient);
    alert("سيتم ربط هذا بقاعدة البيانات في الخطوة القادمة");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">إضافة عميل جديد</h1>

        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <Field label="اسم العميل (المحل)">
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: سوبر ماركت الأندلس"
            />
          </Field>

          <Field label="التصنيف">
            <select
              className="input"
              value={classification}
              onChange={(e) =>
                setClassification(e.target.value as "A" | "B" | "C")
              }
            >
              <option value="A">صنف A</option>
              <option value="B">صنف B</option>
              <option value="C">صنف C</option>
            </select>
          </Field>

          {classification === "A" && (
            <Field label="نوع صنف A">
              <select
                className="input"
                value={subClassification}
                onChange={(e) => setSubClassification(e.target.value)}
              >
                <option value="">اختر النوع</option>
                <option value="wholesale_internal">محل جملة داخلي</option>
                <option value="wholesale_external">محل جملة خارجي</option>
              </select>
            </Field>
          )}

          <Field label="العنوان (نص وصفي)">
            <input
              type="text"
              className="input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="مثال: طرابلس - حي الأندلس"
            />
          </Field>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-700 mb-3">
            تحديد الموقع على الخريطة
          </h2>
          <p className="text-xs text-slate-400 mb-3">
            اضغط على الخريطة لتحديد موقع المحل بدقة
          </p>
          <LocationPicker onLocationChange={setLocation} />
          <p className="text-xs text-slate-400 mt-2">
            الإحداثيات: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="px-5 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            حفظ العميل
          </button>
        </div>
      </div>
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
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
