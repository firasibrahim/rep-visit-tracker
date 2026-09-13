import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (
    !currentUser ||
    (currentUser.role !== "supervisor" && currentUser.role !== "admin")
  ) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { authId, newPassword } = await request.json();

  if (!authId || !newPassword || newPassword.length < 6) {
    return NextResponse.json(
      { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
      { status: 400 },
    );
  }

  const adminClient = createAdminClient();

  // المشرف مايقدرش يغيّر كلمة مرور مستخدم في فرع تاني
  if (currentUser.role === "supervisor") {
    const { data: targetUser } = await adminClient
      .from("users")
      .select("branch_id")
      .eq("auth_id", authId)
      .single();

    if (!targetUser || targetUser.branch_id !== currentUser.branch_id) {
      return NextResponse.json(
        { error: "غير مصرح بتعديل هذا المستخدم" },
        { status: 403 },
      );
    }
  }

  const { error } = await adminClient.auth.admin.updateUserById(authId, {
    password: newPassword,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
