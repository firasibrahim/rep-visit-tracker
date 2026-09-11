"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import InventorySelector from "@/components/visits/InventorySelector";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { notifySuccess, notifyDelete } from "@/lib/toast";
import { calculateDistance } from "@/lib/distance";
import { MapPin, AlertTriangle, CheckCircle2 } from "lucide-react";

type Product = { product_id: number; name: string; category: string };
type Client = {
  client_id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
};

const MAX_ACCEPTABLE_DISTANCE = 150; // بالمتر — مرجع بصري بس، مش شرط مانع

export default function NewVisitForm({
  initialClients,
  initialProducts,
  currentRepId,
  isSelfVisit,
}: {
  initialClients: Client[];
  initialProducts: Product[];
  currentRepId: number;
  isSelfVisit: boolean;
}) {
  const router = useRouter();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [repNotes, setRepNotes] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [repLocation, setRepLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "loading" | "success" | "denied" | "unavailable"
  >("loading");

  const [inventory, setInventory] = useState(
    initialProducts.map((p) => ({
      productId: p.product_id,
      productName: p.name,
      category: p.category,
      availableOnShelf: false,
      availableInWarehouse: false,
    })),
  );

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }

    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setRepLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus("success");
      },
      () => {
        setLocationStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      requestLocation();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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

  const distanceToClient =
    repLocation && selectedClient?.latitude && selectedClient?.longitude
      ? calculateDistance(
          repLocation.lat,
          repLocation.lng,
          selectedClient.latitude,
          selectedClient.longitude,
        )
      : null;

  const handlePreSubmit = () => {
    if (!selectedClientId) {
      notifyDelete("الرجاء اختيار العميل أولاً");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmedSubmit = async () => {
    setSubmitting(true);

    const { data: visitData, error: visitError } = await supabase
      .from("visits")
      .insert({
        client_id: selectedClientId,
        rep_id: currentRepId,
        rep_notes: repNotes,
        status: "pending_review",
        rep_latitude: repLocation?.lat ?? null,
        rep_longitude: repLocation?.lng ?? null,
        distance_from_client: distanceToClient,
      })
      .select()
      .single();

    if (visitError || !visitData) {
      notifyDelete("حدث خطأ أثناء إرسال الزيارة");
      setSubmitting(false);
      return;
    }

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

    notifySuccess(
      isSelfVisit
        ? "تم إرسال الزيارة بنجاح"
        : "تم إرسال الزيارة بنجاح، بانتظار مراجعة المشرف",
    );
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

          <div className="mt-3">
            {locationStatus === "loading" && (
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <MapPin size={14} className="animate-pulse" />
                جاري تحديد موقعك...
              </p>
            )}

            {locationStatus === "success" &&
              selectedClient &&
              distanceToClient !== null && (
                <div
                  className={`text-xs flex items-center gap-1.5 ${
                    distanceToClient <= MAX_ACCEPTABLE_DISTANCE
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {distanceToClient <= MAX_ACCEPTABLE_DISTANCE ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <AlertTriangle size={14} />
                  )}
                  أنت على بُعد {distanceToClient} متر من موقع العميل المسجّل
                </div>
              )}

            {locationStatus === "success" &&
              selectedClient &&
              distanceToClient === null && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  لا يوجد موقع محفوظ لهذا العميل للمقارنة
                </p>
              )}
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

        {locationStatus === "success" ? (
          <div className="flex justify-end gap-3">
            <button
              onClick={handlePreSubmit}
              className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isSelfVisit ? "إرسال الزيارة" : "إرسال الزيارة للمشرف"}
            </button>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center space-y-3">
            <p className="text-sm text-amber-800">
              {locationStatus === "loading"
                ? "جاري تحديد موقعك، الرجاء الانتظار..."
                : locationStatus === "denied"
                  ? "يجب السماح بالوصول للموقع لتتمكن من تسجيل الزيارة"
                  : "خدمة تحديد الموقع غير مدعومة على هذا الجهاز، لا يمكن تسجيل الزيارة"}
            </p>

            {locationStatus === "denied" && (
              <>
                <p className="text-xs text-amber-700 leading-relaxed">
                  إذا لم تظهر نافذة الإذن، افتح إعدادات المتصفح (⋮) ← Site
                  settings ← Location، وتأكد أن الموقع مسموح له بالوصول، ثم أعد
                  تحميل الصفحة.
                </p>
                <button
                  onClick={requestLocation}
                  className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm hover:bg-amber-700"
                >
                  إعادة المحاولة
                </button>
              </>
            )}
          </div>
        )}
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
