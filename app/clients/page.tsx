import { supabase } from "@/lib/supabase";
import ClientsManager from "@/components/clients/ClientsManager";

export default async function ClientsPage() {
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  return <ClientsManager initialClients={clients ?? []} />;
}
