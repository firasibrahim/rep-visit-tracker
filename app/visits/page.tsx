import { supabase } from "@/lib/supabase";
import VisitsListManager from "@/components/visits/VisitsListManager";

export const dynamic = "force-dynamic";

type RawVisit = {
  visit_id: number;
  visit_date: string;
  status: "pending_review" | "reviewed";
  clients: { name: string }[] | { name: string } | null;
  reps: { name: string }[] | { name: string } | null;
};

export default async function VisitsPage() {
  const { data: visits } = await supabase
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

  // نطبّع الشكل هنا: سواء رجعت Array أو Object، نضمن نتيجة موحدة
  const normalizedVisits = ((visits ?? []) as RawVisit[]).map((v) => ({
    visit_id: v.visit_id,
    visit_date: v.visit_date,
    status: v.status,
    clients: Array.isArray(v.clients) ? (v.clients[0] ?? null) : v.clients,
    reps: Array.isArray(v.reps) ? (v.reps[0] ?? null) : v.reps,
  }));

  return <VisitsListManager initialVisits={normalizedVisits} />;
}
