import { createClient } from "@/lib/supabase/server";
import NewVisitForm from "@/components/visits/NewVisitForm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewVisitPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // كل مستخدم (مندوب، مشرف، أو مدير) لازم يكون مرتبط بصف في جدول reps
  // عشان يقدر يسجّل زيارة باسمه هو مباشرة
  if (!user.linked_rep_id) {
    redirect("/");
  }

  const supabase = await createClient();

  let clientsQuery = supabase.from("clients").select("*").eq("is_active", true);

  if (user.role !== "admin") {
    clientsQuery = clientsQuery.eq("branch_id", user.branch_id);
  }

  const { data: clients } = await clientsQuery;

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true);

  return (
    <NewVisitForm
      initialClients={clients ?? []}
      initialProducts={products ?? []}
      currentRepId={user.linked_rep_id}
      isSelfVisit={user.role !== "rep"}
    />
  );
}
