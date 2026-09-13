import { createClient } from "@/lib/supabase/server";
import ReportsManager from "@/components/reports/ReportsManager";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "supervisor" && user.role !== "admin")) {
    redirect("/");
  }

  const isAdmin = user.role === "admin";
  const supabase = await createClient();

  // تقرير أداء المندوبين — نجيب بس مندوبين فرع المشرف (أو الكل لو مدير)
  let repsQuery = supabase
    .from("reps")
    .select("rep_id, name")
    .eq("is_active", true);

  if (!isAdmin) {
    repsQuery = repsQuery.eq("branch_id", user.branch_id);
  }

  const { data: reps } = await repsQuery;
  const repIds = (reps ?? []).map((r) => r.rep_id);

  let visitsQuery = supabase
    .from("visits")
    .select(
      "rep_id, status, promotion_rating, rep_performance_rating, rep_commitment_rating, payment_commitment_rating",
    )
    .eq("status", "reviewed");

  if (!isAdmin) {
    visitsQuery = visitsQuery.in("rep_id", repIds);
  }

  const { data: visits } = await visitsQuery;

  const repsPerformance = (reps ?? []).map((rep) => {
    const repVisits = (visits ?? []).filter((v) => v.rep_id === rep.rep_id);
    const totalVisits = repVisits.length;
    const avgScore =
      totalVisits > 0
        ? repVisits.reduce((sum, v) => {
            const visitAvg =
              ((v.promotion_rating ?? 0) +
                (v.rep_performance_rating ?? 0) +
                (v.rep_commitment_rating ?? 0) +
                (v.payment_commitment_rating ?? 0)) /
              4;
            return sum + visitAvg;
          }, 0) / totalVisits
        : 0;

    return {
      rep_id: rep.rep_id,
      name: rep.name,
      totalVisits,
      avgScore: Math.round(avgScore * 10) / 10,
    };
  });

  // تقرير العملاء المتأخرين في السداد
  let clientsQuery = supabase
    .from("clients")
    .select("client_id, name, outstanding_balance, last_payment_date")
    .eq("is_active", true)
    .gt("outstanding_balance", 0)
    .order("outstanding_balance", { ascending: false });

  if (!isAdmin) {
    clientsQuery = clientsQuery.eq("branch_id", user.branch_id);
  }

  const { data: clientsData } = await clientsQuery;

  // تقرير الأصناف الأكثر نقصًا
  const inventoryQuery = supabase
    .from("visit_inventory")
    .select(
      "product_id, available_on_shelf, products:product_id (name), visits:visit_id (rep_id)",
    );

  const { data: inventoryDataRaw } = await inventoryQuery;

  const inventoryData = isAdmin
    ? inventoryDataRaw
    : (inventoryDataRaw ?? []).filter((item) => {
        const itemRepId = (item.visits as unknown as { rep_id: number } | null)
          ?.rep_id;
        return itemRepId != null && repIds.includes(itemRepId);
      });

  const productShortage = new Map<
    number,
    { name: string; shortageCount: number; totalCount: number }
  >();
  (inventoryData ?? []).forEach((item) => {
    const productName =
      (item.products as unknown as { name: string } | null)?.name ?? "—";
    const existing = productShortage.get(item.product_id) ?? {
      name: productName,
      shortageCount: 0,
      totalCount: 0,
    };
    existing.totalCount += 1;
    if (!item.available_on_shelf) existing.shortageCount += 1;
    productShortage.set(item.product_id, existing);
  });

  const shortageReport = Array.from(productShortage.values())
    .filter((p) => p.totalCount >= 2) // نتجاهل الأصناف اللي ظهرت مرة واحدة بس (بيانات قليلة جدًا)
    .sort(
      (a, b) => b.shortageCount / b.totalCount - a.shortageCount / a.totalCount,
    )
    .slice(0, 10);

  // تقرير عام
  let totalVisitsQuery = supabase
    .from("visits")
    .select("*", { count: "exact", head: true });

  let reviewedQuery = supabase
    .from("visits")
    .select("*", { count: "exact", head: true })
    .eq("status", "reviewed");

  if (!isAdmin) {
    totalVisitsQuery = totalVisitsQuery.in("rep_id", repIds);
    reviewedQuery = reviewedQuery.in("rep_id", repIds);
  }

  const { count: totalVisitsCount } = await totalVisitsQuery;
  const { count: reviewedCount } = await reviewedQuery;

  const overallAvg =
    repsPerformance.length > 0
      ? repsPerformance.reduce(
          (sum, r) => sum + r.avgScore * r.totalVisits,
          0,
        ) / repsPerformance.reduce((sum, r) => sum + r.totalVisits, 0) || 0
      : 0;

  return (
    <ReportsManager
      repsPerformance={repsPerformance}
      overdueClients={clientsData ?? []}
      shortageReport={shortageReport}
      summary={{
        totalVisits: totalVisitsCount ?? 0,
        reviewedVisits: reviewedCount ?? 0,
        overallAvgScore: Math.round(overallAvg * 10) / 10,
      }}
    />
  );
}
