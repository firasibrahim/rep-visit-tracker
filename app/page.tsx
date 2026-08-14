import Link from "next/link";
import {
  Store,
  ClipboardList,
  Users,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { mockClients, mockVisits, mockRepsDetailed } from "@/lib/mockData";

export default function DashboardPage() {
  const pendingVisits = mockVisits.filter((v) => v.status === "pending_review");
  const avgClientScore =
    mockClients.reduce((sum, c) => sum + c.totalScore, 0) / mockClients.length;
  const totalOutstanding = mockClients.reduce(
    (sum, c) => sum + c.outstandingBalance,
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">الرئيسية</h1>
          <p className="text-sm text-slate-400 mt-1">
            نظرة عامة على أداء اليوم
          </p>
        </div>

        {/* بطاقات إحصائية */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Store}
            label="عدد العملاء"
            value={mockClients.length}
            color="emerald"
          />
          <StatCard
            icon={ClipboardList}
            label="إجمالي الزيارات"
            value={mockVisits.length}
            color="blue"
          />
          <StatCard
            icon={Users}
            label="عدد المندوبين"
            value={mockRepsDetailed.length}
            color="amber"
          />
          <StatCard
            icon={TrendingUp}
            label="متوسط تقييم العملاء"
            value={`${avgClientScore.toFixed(1)} / 10`}
            color="emerald"
          />
        </div>

        {/* تنبيه الزيارات المعلّقة */}
        {pendingVisits.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-amber-600" />
              <span className="text-sm text-amber-800">
                لديك <span className="font-bold">{pendingVisits.length}</span>{" "}
                زيارة بانتظار المراجعة
              </span>
            </div>
            <Link
              href="/visits"
              className="text-sm font-bold text-amber-700 hover:underline"
            >
              عرض الآن ←
            </Link>
          </div>
        )}

        {/* الرصيد المستحق الإجمالي */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              إجمالي الأرصدة المستحقة على جميع العملاء
            </span>
            <span className="text-xl font-bold text-red-500">
              {totalOutstanding} د.ل
            </span>
          </div>
        </div>

        {/* آخر الزيارات */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-bold text-slate-700">آخر الزيارات</h2>
            <Link
              href="/visits"
              className="text-xs text-emerald-600 hover:underline"
            >
              عرض الكل
            </Link>
          </div>
          <table className="w-full text-sm text-right">
            <tbody>
              {mockVisits.slice(0, 5).map((visit) => (
                <tr key={visit.id} className="border-b last:border-0">
                  <td className="py-3 px-5 font-medium text-slate-700">
                    {visit.clientName}
                  </td>
                  <td className="py-3 px-5 text-slate-500">{visit.repName}</td>
                  <td className="py-3 px-5 text-slate-400">
                    {visit.visitDate}
                  </td>
                  <td className="py-3 px-5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        visit.status === "reviewed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {visit.status === "reviewed"
                        ? "تمت المراجعة"
                        : "بانتظار المراجعة"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: "emerald" | "blue" | "amber";
}) {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}
      >
        <Icon size={18} />
      </div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}
