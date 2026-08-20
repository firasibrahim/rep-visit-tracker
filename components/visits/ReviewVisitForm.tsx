"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { notifySuccess, notifyDelete } from "@/lib/toast";

type Visit = {
  visit_id: number;
  visit_date: string;
  rep_notes: string | null;
  status: "pending_review" | "reviewed";
  client_name: string;
  rep_name: string;
};

type InventoryItem = {
  product_name: string;
  available_on_shelf: boolean;
  available_in_warehouse: boolean;
};

export default function ReviewVisitForm({
  visit,
  inventory,
}: {
  visit: Visit;
  inventory: InventoryItem[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [ratings, setRatings] = useState({
    promotion_rating: 5,
    rep_performance_rating: 5,
    rep_commitment_rating: 5,
    payment_commitment_rating: 5,
  });

  const ratingLabels: Record<string, string> = {
    promotion_rating: "تقييم عروض المحل",
    rep_performance_rating: "تقييم عمل المندوب",
    rep_commitment_rating: "تقييم التزام المندوب",
    payment_commitment_rating: "التزام العميل بالسداد",
  };

  const avgScore =
    Object.values(ratings).reduce((a, b) => a + b, 0) /
    Object.keys(ratings).length;

  const handleApprove = async () => {
    setSubmitting(true);

    const { error } = await supabase
      .from("visits")
      .update({
        ...ratings,
        status: "reviewed",
        supervisor_reviewed_at: new Date().toISOString(),
      })
      .eq("visit_id", visit.visit_id);

    if (error) {
      notifyDelete("حدث خطأ أثناء اعتماد التقييم");
      setSubmitting(false);
      return;
    }

    notifySuccess("تم اعتماد التقييم بنجاح");
    router.push("/visits");
  };

  const isAlreadyReviewed = visit.status === "reviewed";

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">مراجعة زيارة</h1>
          <span
            className={`text-sm px-3 py-1 rounded-full ${
              isAlreadyReviewed
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {isAlreadyReviewed ? "تمت المراجعة" : "بانتظار المراجعة"}
          </span>
        </div>

        <Card title="بيانات الزيارة">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="العميل" value={visit.client_name} />
            <Info label="المندوب" value={visit.rep_name} />
            <Info label="التاريخ" value={visit.visit_date} />
          </div>
        </Card>

        <Card title="ملاحظات المندوب">
          <p className="text-sm text-slate-600 leading-relaxed">
            {visit.rep_notes || "لا توجد ملاحظات"}
          </p>
        </Card>

        <Card title="الأصناف (كما سجّلها المندوب)">
          {inventory.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              لم يسجّل المندوب أي أصناف في هذه الزيارة
            </p>
          ) : (
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="text-slate-400 border-b">
                  <th className="py-2 font-medium">الصنف</th>
                  <th className="py-2 font-medium">بالرف</th>
                  <th className="py-2 font-medium">بالمخزن</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 text-slate-700">{item.product_name}</td>
                    <td className="py-2">
                      {item.available_on_shelf ? (
                        <span className="text-green-600">نعم</span>
                      ) : (
                        <span className="text-red-500">لا</span>
                      )}
                    </td>
                    <td className="py-2">
                      {item.available_in_warehouse ? (
                        <span className="text-green-600">نعم</span>
                      ) : (
                        <span className="text-red-500">لا</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="تقييمك (من 10)">
          <div className="space-y-4">
            {Object.entries(ratings).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{ratingLabels[key]}</span>
                  <span className="font-bold text-slate-800">{value}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={value}
                  disabled={isAlreadyReviewed}
                  onChange={(e) =>
                    setRatings((prev) => ({
                      ...prev,
                      [key]: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-emerald-600 disabled:opacity-50"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 text-center border-t pt-4">
            <div className="text-3xl font-bold text-emerald-600">
              {avgScore.toFixed(1)} / 10
            </div>
            <div className="text-sm text-slate-400 mt-1">متوسط التقييم</div>
          </div>
        </Card>

        {!isAlreadyReviewed && (
          <div className="flex justify-end">
            <button
              onClick={handleApprove}
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold disabled:opacity-50"
            >
              {submitting ? "جاري الاعتماد..." : "اعتماد التقييم"}
            </button>
          </div>
        )}
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-slate-400 text-xs mb-1">{label}</div>
      <div className="text-slate-700 font-medium">{value}</div>
    </div>
  );
}
