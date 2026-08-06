"use client";

import { useState } from "react";
import { mockClients, mockReps, mockProducts } from "@/lib/mockData";

export default function NewVisitPage() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedRepId, setSelectedRepId] = useState<number | null>(null);
  const [ratings, setRatings] = useState({
    promotion: 8,
    repPerformance: 9,
    repCommitment: 8,
    paymentCommitment: 9,
  });
  const [notes, setNotes] = useState("");

  const selectedClient = mockClients.find((c) => c.id === selectedClientId);
  const totalScore = Object.values(ratings).reduce((a, b) => a + b, 0);
  const avgScore = (totalScore / (Object.keys(ratings).length * 10)) * 10;

  const ratingLabels: Record<string, string> = {
    promotion: "تقييم عروض المحل",
    repPerformance: "تقييم عمل المندوب",
    repCommitment: "تقييم التزام المندوب",
    paymentCommitment: "التزام العميل بالسداد",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* العنوان */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">
            تسجيل زيارة مشرف
          </h1>
          <span className="text-sm text-slate-400">
            الرئيسية / الزيارات / تسجيل زيارة
          </span>
        </div>

        {/* بطاقات إحصائية */}
        {selectedClient && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="التقييم الإجمالي للعميل"
              value={`${selectedClient.totalScore} / 10`}
            />
            <StatCard
              label="الرصيد المستحق"
              value={`${selectedClient.outstandingBalance} د.ل`}
            />
            <StatCard label="آخر دفعة" value={selectedClient.lastPaymentDate} />
          </div>
        )}

        {/* بيانات الزيارة */}
        <Card title="بيانات الزيارة">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="اسم العميل">
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

            <Field label="اسم المندوب">
              <select
                className="input"
                value={selectedRepId ?? ""}
                onChange={(e) =>
                  setSelectedRepId(Number(e.target.value) || null)
                }
              >
                <option value="">اختر مندوب</option>
                {mockReps.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="تاريخ الزيارة">
              <input
                type="date"
                className="input"
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </Field>

            <Field label="وقت الزيارة">
              <div className="flex gap-2">
                <input type="time" className="input" />
                <span className="self-center text-slate-400 text-sm">إلى</span>
                <input type="time" className="input" />
              </div>
            </Field>
          </div>

          <Field label="ملاحظات عامة">
            <textarea
              className="input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب أي ملاحظات إضافية هنا..."
            />
          </Field>
        </Card>

        {/* الأصناف + التقييمات */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card title="الأصناف المتوفرة بالرف والمخزن">
              <table className="w-full text-sm text-right">
                <thead>
                  <tr className="text-slate-400 border-b">
                    <th className="py-2 font-medium">الصنف</th>
                    <th className="py-2 font-medium">متوفر بالرف</th>
                    <th className="py-2 font-medium">متوفر بالمخزن</th>
                  </tr>
                </thead>
                <tbody>
                  {mockProducts.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2 text-slate-700">{p.name}</td>
                      <td className="py-2">
                        <span className="text-green-600">نعم</span>
                      </td>
                      <td className="py-2">
                        <span className="text-red-500">لا</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          <Card title="التقييمات (من 10)">
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
                    onChange={(e) =>
                      setRatings((prev) => ({
                        ...prev,
                        [key]: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-green-600"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 text-center border-t pt-4">
              <div className="text-3xl font-bold text-green-600">
                {avgScore.toFixed(1)} / 10
              </div>
              <div className="text-sm text-slate-400 mt-1">إجمالي التقييم</div>
            </div>
          </Card>
        </div>

        {/* أزرار الحفظ */}
        <div className="flex justify-end gap-3">
          <button className="px-5 py-2 rounded-lg border border-red-300 text-red-500 hover:bg-red-50">
            إلغاء الزيارة
          </button>
          <button className="px-5 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100">
            حفظ كمسودة
          </button>
          <button className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
            حفظ الزيارة
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 text-center">
      <div className="text-sm text-slate-400 mb-1">{label}</div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
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
