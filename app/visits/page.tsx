import { supabase } from "@/lib/supabase";
import VisitsListManager from "@/components/visits/VisitsListManager";

export const dynamic = "force-dynamic";

export default async function VisitsPage() {
  const { data: visits, error } = await supabase
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

  return <VisitsListManager initialVisits={visits ?? []} />;
}
