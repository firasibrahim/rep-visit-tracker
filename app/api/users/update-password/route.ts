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

  const { error } = await adminClient.auth.admin.updateUserById(authId, {
    password: newPassword,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
