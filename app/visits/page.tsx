import { supabase } from "@/lib/supabase";
import VisitsListManager from "@/components/visits/VisitsListManager";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function VisitsPage() {
  const user = await getCurrentUser();

  let query = supabase
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
    .order("visit_date", { ascending: false });

  // لو المستخدم مندوب، اعرض زياراته بس
  if (user?.role === "rep" && user.linked_rep_id) {
    query = query.eq("rep_id", user.linked_rep_id);
  }

  const { data: visits } = await query;

  const normalizedVisits = (visits ?? []).map((v) => ({
    visit_id: v.visit_id,
    visit_date: v.visit_date,
    status: v.status,
    clients: Array.isArray(v.clients) ? (v.clients[0] ?? null) : v.clients,
    reps: Array.isArray(v.reps) ? (v.reps[0] ?? null) : v.reps,
  }));

  return <VisitsListManager initialVisits={normalizedVisits} />;
}
