"use client";

import { useState } from "react";
import Image from "next/image";
import { Users, Store, Package, TrendingUp, Printer } from "lucide-react";

type RepPerformance = {
  rep_id: number;
  name: string;
  totalVisits: number;
  avgScore: number;
};

type OverdueClient = {
  client_id: number;
  name: string;
  outstanding_balance: number;
  last_payment_date: string | null;
};

type ShortageItem = {
  name: string;
  shortageCount: number;
  totalCount: number;
};

type Summary = {
  totalVisits: number;
  reviewedVisits: number;
  overallAvgScore: number;
};

const tabs = [
  { id: "reps", label: "أداء المندوبين", icon: Users },
  { id: "overdue", label: "العملاء المتأخرين", icon: Store },
  { id: "shortage", label: "الأصناف الناقصة", icon: Package },
] as const;

type TabId = (typeof tabs)[number]["id"];

const tabLabels: Record<TabId, string> = {
  reps: "تقرير أداء المندوبين",
  overdue: "تقرير العملاء المتأخرين في السداد",
  shortage: "تقرير الأصناف الأكثر نقصًا",
};

export default function ReportsManager({
  repsPerformance,
  overdueClients,
  shortageReport,
  summary,
}: {
  repsPerformance: RepPerformance[];
  overdueClients: OverdueClient[];
  shortageReport: ShortageItem[];
  summary: Summary;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("reps");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between no-print">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">
            التقارير
          </h1>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white text-sm hover:bg-slate-800"
          >
            <Printer size={16} />
            طباعة
          </button>
        </div>

        {/* رأس مخصص يظهر بس وقت الطباعة */}
        <div className="print-header hidden items-center justify-between border-b-2 border-emerald-600 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 relative">
              <Image
                src="/logo.png"
                alt="شركة ريحان"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <div className="font-bold text-lg">شركة ريحان</div>
              <div className="text-sm text-slate-500">
                {tabLabels[activeTab]}
              </div>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            تاريخ الطباعة: {new Date().toLocaleDateString("ar-LY")}
          </div>
        </div>

        {/* ملخص عام */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 no-print">
          <SummaryCard
            icon={TrendingUp}
            label="إجمالي الزيارات"
            value={summary.totalVisits}
          />
          <SummaryCard
            icon={TrendingUp}
            label="زيارات مراجعة"
            value={summary.reviewedVisits}
          />
          <SummaryCard
            icon={TrendingUp}
            label="متوسط التقييم العام"
            value={`${summary.overallAvgScore} / 10`}
          />
        </div>

        {/* تبويبات */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-print">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* محتوى التبويب: أداء المندوبين */}
        {activeTab === "reps" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500">
                  <th className="py-3 px-4 font-medium">المندوب</th>
                  <th className="py-3 px-4 font-medium">عدد الزيارات</th>
                  <th className="py-3 px-4 font-medium">متوسط التقييم</th>
                </tr>
              </thead>
              <tbody>
                {repsPerformance
                  .sort((a, b) => b.avgScore - a.avgScore)
                  .map((rep) => (
                    <tr key={rep.rep_id} className="border-b last:border-0">
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {rep.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {rep.totalVisits}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600">
                        {rep.totalVisits > 0 ? `${rep.avgScore} / 10` : "—"}
                      </td>
                    </tr>
                  ))}
                {repsPerformance.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-12 text-slate-400"
                    >
                      لا توجد بيانات كافية بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* محتوى التبويب: العملاء المتأخرين */}
        {activeTab === "overdue" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500">
                  <th className="py-3 px-4 font-medium">العميل</th>
                  <th className="py-3 px-4 font-medium">الرصيد المستحق</th>
                  <th className="py-3 px-4 font-medium">آخر دفعة</th>
                </tr>
              </thead>
              <tbody>
                {overdueClients.map((client) => (
                  <tr key={client.client_id} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {client.name}
                    </td>
                    <td className="py-3 px-4 font-bold text-red-500">
                      {client.outstanding_balance} د.ل
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {client.last_payment_date ?? "—"}
                    </td>
                  </tr>
                ))}
                {overdueClients.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-12 text-slate-400"
                    >
                      لا يوجد عملاء متأخرين حاليًا 🎉
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* محتوى التبويب: الأصناف الناقصة */}
        {activeTab === "shortage" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500">
                  <th className="py-3 px-4 font-medium">الصنف</th>
                  <th className="py-3 px-4 font-medium">نسبة النقص</th>
                </tr>
              </thead>
              <tbody>
                {shortageReport.map((item, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {item.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-amber-600">
                        {Math.round(
                          (item.shortageCount / item.totalCount) * 100,
                        )}
                        %
                      </span>
                      <span className="text-slate-400 text-xs mr-1">
                        ({item.shortageCount} من {item.totalCount} زيارة)
                      </span>
                    </td>
                  </tr>
                ))}
                {shortageReport.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="text-center py-12 text-slate-400"
                    >
                      لا توجد بيانات كافية بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 text-center">
      <Icon size={18} className="text-emerald-600 mx-auto mb-1" />
      <div className="text-lg md:text-xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}
