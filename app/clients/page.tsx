import { supabase } from "@/lib/supabase";
import ClientsManager from "@/components/clients/ClientsManager";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const user = await getCurrentUser();

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  return (
    <ClientsManager
      initialClients={clients ?? []}
      userRole={user?.role ?? "rep"}
    />
  );
}
