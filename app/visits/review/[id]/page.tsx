import { supabase } from "@/lib/supabase";
import ReviewVisitForm from "@/components/visits/ReviewVisitForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReviewVisitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: visit } = await supabase
    .from("visits")
    .select(
      `
      visit_id,
      visit_date,
      rep_notes,
      status,
      clients:client_id (name),
      reps:rep_id (name)
    `,
    )
    .eq("visit_id", id)
    .single();

  if (!visit) {
    notFound();
  }

  const { data: inventory } = await supabase
    .from("visit_inventory")
    .select(
      `
      available_on_shelf,
      available_in_warehouse,
      products:product_id (name)
    `,
    )
    .eq("visit_id", id);

  return (
    <ReviewVisitForm
      visit={{
        visit_id: visit.visit_id,
        visit_date: visit.visit_date,
        rep_notes: visit.rep_notes,
        status: visit.status,
        client_name:
          (visit.clients as unknown as { name: string } | null)?.name ?? "—",
        rep_name:
          (visit.reps as unknown as { name: string } | null)?.name ?? "—",
      }}
      inventory={(inventory ?? []).map((item) => ({
        product_name:
          (item.products as unknown as { name: string } | null)?.name ?? "—",
        available_on_shelf: item.available_on_shelf,
        available_in_warehouse: item.available_in_warehouse,
      }))}
    />
  );
}
