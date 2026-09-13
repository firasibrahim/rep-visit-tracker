import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: userProfile } = await supabase
    .from("users")
    .select("user_id, name, email, role, linked_rep_id, branch_id")
    .eq("auth_id", authUser.id)
    .single();

  return userProfile;
}
