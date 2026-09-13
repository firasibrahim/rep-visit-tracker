import { createClient } from "@/lib/supabase/server";
import ClientsManager from "@/components/clients/ClientsManager";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  let query = supabase
    .from("clients")
    .select("*, branch:branch_id(name)")
    .order("name");

  if (user.role !== "admin") {
    query = query.eq("branch_id", user.branch_id);
  }

  const { data: clients } = await query;

  const normalizedClients = (clients ?? []).map((c) => ({
    ...c,
    branch_name: (c.branch as unknown as { name: string } | null)?.name,
  }));

  return (
    <ClientsManager
      initialClients={normalizedClients}
      userRole={user.role}
      isAdmin={user.role === "admin"}
      currentBranchId={user.branch_id}
    />
  );
}
