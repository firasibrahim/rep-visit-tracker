import Link from "next/link";
import {
  Store,
  ClipboardList,
  Users,
  AlertCircle,
  TrendingUp,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const isRep = currentUser.role === "rep";
  const isAdmin = currentUser.role === "admin";
  const userBranchId = currentUser.branch_id;

  const supabase = await createClient();

  // ===== عملاء الفرع (أو كل الفروع للمدير) =====
  let clientsQuery = supabase
    .from("clients")
    .select("client_id, name, total_score, outstanding_balance")
    .eq("is_active", true);
  if (!isAdmin) clientsQuery = clientsQuery.eq("branch_id", userBranchId);
  const { data: clients } = await clientsQuery;

  // ===== آخر الزيارات (فلترة عبر rep_id اللي ينتمي لنفس الفرع) =====
  let repIdsInBranch: number[] | null = null;
  if (!isAdmin) {
    const { data: branchReps } = await supabase
      .from("reps")
      .select("rep_id")
      .eq("branch_id", userBranchId);
    repIdsInBranch = (branchReps ?? []).map((r) => r.rep_id);
  }

  let recentVisitsQuery = supabase
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
  if (!isAdmin && repIdsInBranch) {
    recentVisitsQuery = recentVisitsQuery.in("rep_id", repIdsInBranch);
  }
  const { data: recentVisits } = await recentVisitsQuery;

  // ===== كل الزيارات (لحساب الرسوم البيانية والقوائم) =====
  let allVisitsQuery = supabase.from("visits").select(
    `
      visit_id,
      visit_date,
      status,
      client_id,
      rep_id,
      promotion_rating,
      rep_performance_rating,
      rep_commitment_rating,
      payment_commitment_rating,
      clients:client_id (name),
      reps:rep_id (name)
    `,
  );
  if (!isAdmin && repIdsInBranch) {
    allVisitsQuery = allVisitsQuery.in("rep_id", repIdsInBranch);
  }
  const { data: allVisits } = await allVisitsQuery;

  // ===== عدد المندوبين =====
  let repsCountQuery = supabase
    .from("reps")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);
  if (!isAdmin) repsCountQuery = repsCountQuery.eq("branch_id", userBranchId);
  const { count: repsCount } = await repsCountQuery;

  // ===== إجمالي الزيارات =====
  let totalVisitsQuery = supabase
    .from("visits")
    .select("*", { count: "exact", head: true });
  if (!isAdmin && repIdsInBranch) {
    totalVisitsQuery = totalVisitsQuery.in("rep_id", repIdsInBranch);
  }
  const { count: totalVisitsCount } = await totalVisitsQuery;

  // ===== الزيارات المعلّقة =====
  let pendingQuery = supabase
    .from("visits")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_review");
  if (!isAdmin && repIdsInBranch) {
    pendingQuery = pendingQuery.in("rep_id", repIdsInBranch);
  }
  const { count: pendingCount } = await pendingQuery;

  const clientsList = clients ?? [];
  const visitsList = allVisits ?? [];

  const avgClientScore =
    clientsList.length > 0
      ? clientsList.reduce((sum, c) => sum + (c.total_score ?? 0), 0) /
        clientsList.length
      : 0;

  // ===== قائمة: أكثر العملاء زيارة =====
  const visitCountByClient = new Map<number, { name: string; count: number }>();
  visitsList.forEach((v) => {
    const clientName =
      (v.clients as unknown as { name: string } | null)?.name ?? "—";
    const existing = visitCountByClient.get(v.client_id) ?? {
      name: clientName,
      count: 0,
    };
    existing.count += 1;
    visitCountByClient.set(v.client_id, existing);
  });
  const topClientsByVisits = Array.from(visitCountByClient.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ===== قائمة: أعلى المندوبين تقييمًا =====
  const repStats = new Map<
    number,
    { name: string; totalScore: number; count: number }
  >();
  visitsList
    .filter((v) => v.status === "reviewed")
    .forEach((v) => {
      const repName =
        (v.reps as unknown as { name: string } | null)?.name ?? "—";
      const visitAvg =
        ((v.promotion_rating ?? 0) +
          (v.rep_performance_rating ?? 0) +
          (v.rep_commitment_rating ?? 0) +
          (v.payment_commitment_rating ?? 0)) /
        4;
      const existing = repStats.get(v.rep_id) ?? {
        name: repName,
        totalScore: 0,
        count: 0,
      };
      existing.totalScore += visitAvg;
      existing.count += 1;
      repStats.set(v.rep_id, existing);
    });
  const topRatedReps = Array.from(repStats.values())
    .map((r) => ({ name: r.name, avgScore: r.totalScore / r.count }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5);

  // ===== قائمة: العملاء المستحقات =====
  const overdueClients = clientsList
    .filter((c) => c.outstanding_balance > 0)
    .sort((a, b) => b.outstanding_balance - a.outstanding_balance)
    .slice(0, 5);

  // ===== بيانات الرسم الخطي: الزيارات آخر 7 أيام =====
  const last7Days: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const label = date.toLocaleDateString("ar", { weekday: "short" });
    const count = visitsList.filter((v) => v.visit_date === dateStr).length;
    last7Days.push({ label, count });
  }

  // ===== بيانات الدائرة النسبية: حالة الزيارات =====
  const reviewedCount = visitsList.filter(
    (v) => v.status === "reviewed",
  ).length;
  const pendingCountForChart = visitsList.filter(
    (v) => v.status === "pending_review",
  ).length;
  const statusDistribution = [
    { name: "تمت المراجعة", value: reviewedCount, color: "#10b981" },
    { name: "بانتظار المراجعة", value: pendingCountForChart, color: "#f59e0b" },
  ];

  const totalOutstanding = clientsList.reduce(
    (sum, c) => sum + (c.outstanding_balance ?? 0),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">الرئيسية</h1>
          <p className="text-sm text-slate-400 mt-1">
            نظرة عامة على أداء المنظومة
          </p>
        </div>

        {/* بطاقات إحصائية */}
        <div
          className={`grid grid-cols-2 ${isRep ? "md:grid-cols-3" : "md:grid-cols-4"} gap-4`}
        >
          <StatCard
            icon={Store}
            label="عدد العملاء"
            value={clientsList.length}
            bg="bg-emerald-100"
            iconColor="text-emerald-600"
          />
          <StatCard
            icon={ClipboardList}
            label="إجمالي الزيارات"
            value={totalVisitsCount ?? 0}
            bg="bg-blue-100"
            iconColor="text-blue-600"
          />
          {!isRep && (
            <StatCard
              icon={Users}
              label="عدد المندوبين"
              value={repsCount ?? 0}
              bg="bg-purple-100"
              iconColor="text-purple-600"
            />
          )}
          <StatCard
            icon={Star}
            label="متوسط التقييم"
            value={`${avgClientScore.toFixed(1)} / 10`}
            bg="bg-amber-100"
            iconColor="text-amber-600"
          />
        </div>

        {/* تنبيه الزيارات المعلّقة */}
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

        {/* الرسوم البيانية */}
        <DashboardCharts
          visitsTrend={last7Days}
          statusDistribution={statusDistribution}
        />

        {/* القوائم الجانبية الثلاثة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SideListCard
            title="أكثر العملاء زيارة"
            items={topClientsByVisits.map((c) => ({
              label: c.name,
              value: `${c.count} زيارة`,
            }))}
            viewAllHref="/clients"
            viewAllLabel="عرض جميع العملاء"
          />
          <SideListCard
            title="أعلى المندوبين تقييمًا"
            items={topRatedReps.map((r) => ({
              label: r.name,
              value: `${r.avgScore.toFixed(1)}`,
              valueColor: "text-emerald-600",
            }))}
            viewAllHref={isRep ? undefined : "/reports"}
            viewAllLabel="عرض جميع المندوبين"
          />
          <SideListCard
            title="العملاء لديهم مستحقات"
            items={overdueClients.map((c) => ({
              label: c.name,
              value: `${c.outstanding_balance} د.ل`,
              valueColor: "text-red-500",
            }))}
            viewAllHref="/clients"
            viewAllLabel="عرض جميع المستحقات"
          />
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
  bg,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  bg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}
      >
        <Icon size={20} className={iconColor} />
      </div>
      <div>
        <div className="text-xl font-bold text-slate-800">{value}</div>
        <div className="text-xs text-slate-400 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function SideListCard({
  title,
  items,
  viewAllHref,
  viewAllLabel,
}: {
  title: string;
  items: { label: string; value: string; valueColor?: string }[];
  viewAllHref?: string;
  viewAllLabel: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="font-bold text-slate-700 text-sm mb-3">{title}</h3>
      <div className="space-y-2.5">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            لا توجد بيانات بعد
          </p>
        ) : (
          items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-slate-600 truncate">{item.label}</span>
              <span
                className={`font-bold flex-shrink-0 ${item.valueColor ?? "text-slate-700"}`}
              >
                {item.value}
              </span>
            </div>
          ))
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="block text-center mt-4 py-2 text-xs font-bold text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50"
        >
          {viewAllLabel}
        </Link>
      )}
    </div>
  );
}
