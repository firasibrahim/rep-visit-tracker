import { createClient } from "@/lib/supabase/server";
import UsersManager from "@/components/settings/UsersManager";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const currentUser = await getCurrentUser();

  if (
    !currentUser ||
    (currentUser.role !== "supervisor" && currentUser.role !== "admin")
  ) {
    redirect("/");
  }

  const supabase = await createClient();

  let usersQuery = supabase
    .from("users")
    .select(
      "user_id, name, email, role, is_active, linked_rep_id, auth_id, branch_id",
    )
    .order("name");

  if (currentUser.role !== "admin") {
    usersQuery = usersQuery.eq("branch_id", currentUser.branch_id);
  }

  const { data: users } = await usersQuery;

  const { data: branches } = await supabase
    .from("branches")
    .select("branch_id, name")
    .eq("is_active", true)
    .order("name");

  const visibleBranches =
    currentUser.role === "admin"
      ? (branches ?? [])
      : (branches ?? []).filter((b) => b.branch_id === currentUser.branch_id);

  return (
    <UsersManager
      initialUsers={users ?? []}
      branches={visibleBranches}
      isAdmin={currentUser.role === "admin"}
      currentBranchId={currentUser.branch_id}
    />
  );
}
