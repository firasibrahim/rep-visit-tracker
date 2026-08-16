"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { notifySuccess, notifyUpdate, notifyDelete } from "@/lib/toast";

const LocationPicker = dynamic(
  () => import("@/components/clients/LocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-slate-100 rounded-lg animate-pulse" />
    ),
  },
);

export default function NewOrEditClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id"); // لو موجود، إحنا في وضع "تعديل"

  const [name, setName] = useState("");
  const [classification, setClassification] = useState<"A" | "B" | "C">("B");
  const [subClassification, setSubClassification] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState({ lat: 32.8872, lng: 13.1913 });
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (!editId) return;

    const loadClient = async () => {
      const { data } = await supabase
        .from("clients")
        .select("*")
        .eq("client_id", editId)
        .single();

      if (data) {
        setName(data.name);
        setClassification(data.classification);
        setSubClassification(data.sub_classification ?? "");
        setAddress(data.address ?? "");
        setLocation({
          lat: data.latitude ?? 32.8872,
          lng: data.longitude ?? 13.1913,
        });
      }
      setLoading(false);
    };

    loadClient();
  }, [editId]);

  const handleSubmit = async () => {
    const clientData = {
      name,
      classification,
      sub_classification:
        classification === "A" ? subClassification || null : null,
      address,
      latitude: location.lat,
      longitude: location.lng,
    };

    if (editId) {
      const { error } = await supabase
        .from("clients")
        .update(clientData)
        .eq("client_id", editId);

      if (error) {
        notifyDelete("حدث خطأ أثناء التعديل");
        return;
      }
      notifyUpdate("تم تعديل بيانات العميل بنجاح");
    } else {
      const { error } = await supabase.from("clients").insert(clientData);

      if (error) {
        notifyDelete("حدث خطأ أثناء الإضافة");
        return;
      }
      notifySuccess("تمت إضافة العميل بنجاح");
    }

    router.push("/clients");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">
          {editId ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
        </h1>

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
          <LocationPicker
            initialPosition={location}
            onLocationChange={setLocation}
          />
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
            {editId ? "حفظ التعديلات" : "حفظ العميل"}
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
