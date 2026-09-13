import { createClient } from "@/lib/supabase/server";
import RepsManager from "@/components/reps/RepsManager";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RepsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  let query = supabase
    .from("reps")
    .select("*, branch:branch_id(name)")
    .order("name");

  if (user.role !== "admin") {
    query = query.eq("branch_id", user.branch_id);
  }

  const { data: reps } = await query;

  const normalizedReps = (reps ?? []).map((r) => ({
    ...r,
    branch_name: (r.branch as unknown as { name: string } | null)?.name,
  }));

  return (
    <RepsManager
      initialReps={normalizedReps}
      isAdmin={user.role === "admin"}
      currentBranchId={user.branch_id}
    />
  );
}
