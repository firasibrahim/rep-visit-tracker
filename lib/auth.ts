import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    console.log("لا يوجد مستخدم مسجل دخول في Supabase Auth");
    return null;
  }

  const { data: userProfile, error } = await supabase
    .from("users")
    .select("user_id, name, email, role, linked_rep_id")
    .eq("auth_id", authUser.id)
    .single();

  return userProfile;
}
