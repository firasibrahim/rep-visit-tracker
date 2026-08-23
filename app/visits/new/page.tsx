import { supabase } from "@/lib/supabase";
import NewVisitForm from "@/components/visits/NewVisitForm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewVisitPage() {
  const user = await getCurrentUser();

  if (!user || !user.linked_rep_id) {
    redirect("/");
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("is_active", true);

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true);

  return (
    <NewVisitForm
      initialClients={clients ?? []}
      initialProducts={products ?? []}
      currentRepId={user.linked_rep_id}
    />
  );
}
