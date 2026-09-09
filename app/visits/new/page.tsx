import { supabase } from "@/lib/supabase";
import NewVisitForm from "@/components/visits/NewVisitForm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewVisitPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // المندوب لازم يكون مرتبط بصف حقيقي في جدول reps
  if (user.role === "rep" && !user.linked_rep_id) {
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

  // المشرف/المدير محتاجين قائمة كل المندوبين عشان يختاروا منها
  let reps: { rep_id: number; name: string }[] = [];
  if (user.role !== "rep") {
    const { data: repsData } = await supabase
      .from("reps")
      .select("rep_id, name")
      .eq("is_active", true)
      .order("name");
    reps = repsData ?? [];
  }

  return (
    <NewVisitForm
      initialClients={clients ?? []}
      initialProducts={products ?? []}
      currentRepId={user.linked_rep_id}
      isRep={user.role === "rep"}
      availableReps={reps}
    />
  );
}
