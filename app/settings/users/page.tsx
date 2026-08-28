import { supabase } from "@/lib/supabase";
import UsersManager from "@/components/settings/UsersManager";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "supervisor") {
    redirect("/");
  }

  const { data: users } = await supabase
    .from("users")
    .select("user_id, name, email, role, is_active, linked_rep_id")
    .order("name");

  return <UsersManager initialUsers={users ?? []} />;
}
