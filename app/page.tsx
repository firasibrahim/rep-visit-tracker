import Link from "next/link";
import {
  Store,
  ClipboardList,
  Users,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: clients } = await supabase
    .from("clients")
    .select("total_score, outstanding_balance")
    .eq("is_active", true);

  const { data: recentVisits } = await supabase
    .from("visits")
    .select(
      `
      visit_id,
      visit_date,
      status,
      clients:client_id (name),
      reps:rep_id (name)
    `,
    )
    .order("visit_date", { ascending: false })
    .limit(5);

  const { count: repsCount } = await supabase
    .from("reps")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const { count: totalVisitsCount } = await supabase
    .from("visits")
    .select("*", { count: "exact", head: true });

  const { count: pendingCount } = await supabase
    .from("visits")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_review");

  const clientsList = clients ?? [];
  const avgClientScore =
    clientsList.length > 0
      ? clientsList.reduce((sum, c) => sum + (c.total_score ?? 0), 0) /
        clientsList.length
      : 0;
  const totalOutstanding = clientsList.reduce(
    (sum, c) => sum + (c.outstanding_balance ?? 0),
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Store}
            label="عدد العملاء النشطين"
            value={clientsList.length}
            color="emerald"
          />
          <StatCard
            icon={ClipboardList}
            label="إجمالي الزيارات"
            value={totalVisitsCount ?? 0}
            color="blue"
          />
          <StatCard
            icon={Users}
            label="عدد المندوبين"
            value={repsCount ?? 0}
            color="amber"
          />
          <StatCard
            icon={TrendingUp}
            label="متوسط تقييم العملاء"
            value={`${avgClientScore.toFixed(1)} / 10`}
            color="emerald"
          />
        </div>

        {(pendingCount ?? 0) > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-amber-600" />
              <span className="text-sm text-amber-800">
                لديك <span className="font-bold">{pendingCount}</span> زيارة
                بانتظار المراجعة
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

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              إجمالي الأرصدة المستحقة على جميع العملاء
            </span>
            <span className="text-xl font-bold text-red-500">
              {totalOutstanding.toFixed(2)} د.ل
            </span>
          </div>
        </div>

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
              {(recentVisits ?? []).map((visit) => {
                const clientName =
                  (visit.clients as unknown as { name: string } | null)?.name ??
                  "—";
                const repName =
                  (visit.reps as unknown as { name: string } | null)?.name ??
                  "—";
                return (
                  <tr key={visit.visit_id} className="border-b last:border-0">
                    <td className="py-3 px-5 font-medium text-slate-700">
                      {clientName}
                    </td>
                    <td className="py-3 px-5 text-slate-500">{repName}</td>
                    <td className="py-3 px-5 text-slate-400">
                      {visit.visit_date}
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
                );
              })}

              {(recentVisits ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">
                    لا توجد زيارات بعد
                  </td>
                </tr>
              )}
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
