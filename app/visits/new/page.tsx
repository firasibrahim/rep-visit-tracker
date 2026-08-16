import { supabase } from "@/lib/supabase";
import NewVisitForm from "@/components/visits/NewVisitForm";

export default async function NewVisitPage() {
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
    />
  );
}
