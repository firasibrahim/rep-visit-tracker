"use client";

// Diese Seite zeigt dem Supervisor die vom Außendienstmitarbeiter
// eingereichten Besuchsdaten an und ermöglicht die abschließende Bewertung.
import { useState } from "react";
import { mockPendingVisit } from "@/lib/mockData";

export default function ReviewVisitPage() {
  const visit = mockPendingVisit; // لاحقًا هنجيبها بناءً على [id] من قاعدة البيانات

  const [ratings, setRatings] = useState({
    promotion: 5,
    repPerformance: 5,
    repCommitment: 5,
    paymentCommitment: 5,
  });

  const ratingLabels: Record<string, string> = {
    promotion: "تقييم عروض المحل",
    repPerformance: "تقييم عمل المندوب",
    repCommitment: "تقييم التزام المندوب",
    paymentCommitment: "التزام العميل بالسداد",
  };

  const avgScore =
    Object.values(ratings).reduce((a, b) => a + b, 0) /
    Object.keys(ratings).length;

  const handleApprove = () => {
    console.log("تقييم المشرف:", {
      visitId: visit.id,
      ratings,
      status: "reviewed",
    });
    alert("تم اعتماد التقييم بنجاح");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">مراجعة زيارة</h1>
          <span className="text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
            بانتظار المراجعة
          </span>
        </div>

        {/* بيانات الزيارة (للقراءة فقط) */}
        <Card title="بيانات الزيارة">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="العميل" value={visit.clientName} />
            <Info label="المندوب" value={visit.repName} />
            <Info label="التاريخ" value={visit.visitDate} />
          </div>
        </Card>

        {/* ملاحظات المندوب */}
        <Card title="ملاحظات المندوب">
          <p className="text-sm text-slate-600 leading-relaxed">
            {visit.repNotes}
          </p>
        </Card>

        {/* الأصناف اللي سجّلها المندوب */}
        <Card title="الأصناف (كما سجّلها المندوب)">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="text-slate-400 border-b">
                <th className="py-2 font-medium">الصنف</th>
                <th className="py-2 font-medium">بالرف</th>
                <th className="py-2 font-medium">بالمخزن</th>
              </tr>
            </thead>
            <tbody>
              {visit.inventory.map((item, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 text-slate-700">{item.productName}</td>
                  <td className="py-2">
                    {item.availableOnShelf ? (
                      <span className="text-green-600">نعم</span>
                    ) : (
                      <span className="text-red-500">لا</span>
                    )}
                  </td>
                  <td className="py-2">
                    {item.availableInWarehouse ? (
                      <span className="text-green-600">نعم</span>
                    ) : (
                      <span className="text-red-500">لا</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* تقييمات المشرف — هنا فقط بيادخل المشرف */}
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
                  onChange={(e) =>
                    setRatings((prev) => ({
                      ...prev,
                      [key]: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-emerald-600"
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

        <div className="flex justify-end">
          <button
            onClick={handleApprove}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold"
          >
            اعتماد التقييم
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-slate-400 text-xs mb-1">{label}</div>
      <div className="text-slate-700 font-medium">{value}</div>
    </div>
  );
}
