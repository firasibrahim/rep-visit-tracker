import { createClient } from "@/lib/supabase/server";
import ReviewVisitForm from "@/components/visits/ReviewVisitForm";
import { getCurrentUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReviewVisitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "supervisor" && currentUser.role !== "admin") {
    redirect("/");
  }

  const supabase = await createClient();

  const { data: visit } = await supabase
    .from("visits")
    .select(
      `
      visit_id,
      visit_date,
      rep_notes,
      status,
      distance_from_client,
      clients:client_id (name, branch_id),
      reps:rep_id (name)
    `,
    )
    .eq("visit_id", id)
    .single();

  if (!visit) {
    notFound();
  }

  const visitBranchId = (
    visit.clients as unknown as { branch_id: number | null } | null
  )?.branch_id;

  // المشرف يقدر يراجع بس زيارات فرعه، المدير يقدر يراجع أي زيارة
  if (
    currentUser.role === "supervisor" &&
    visitBranchId !== currentUser.branch_id
  ) {
    redirect("/");
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
        distance_from_client: visit.distance_from_client,
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
