import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (
    !currentUser ||
    (currentUser.role !== "supervisor" && currentUser.role !== "admin")
  ) {
    return NextResponse.json(
      { error: "غير مصرح", debug: "فشل في التحقق من المستخدم الحالي" },
      { status: 403 },
    );
  }

  const { email, password, name, role, phone } = await request.json();

  const adminClient = createAdminClient();

  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    return NextResponse.json(
      {
        error: authError?.message,
        debug: "فشل في إنشاء حساب Auth",
        fullError: JSON.stringify(authError),
      },
      { status: 400 },
    );
  }

  let linkedRepId: number | null = null;

  if (role === "rep") {
    const { data: repData, error: repError } = await adminClient
      .from("reps")
      .insert({ name, phone })
      .select()
      .single();

    if (repError) {
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        {
          error: repError.message,
          debug: "فشل في إنشاء صف reps",
          fullError: JSON.stringify(repError),
        },
        { status: 400 },
      );
    }
    linkedRepId = repData.rep_id;
  }

  const { error: userError } = await adminClient.from("users").insert({
    name,
    email,
    role,
    auth_id: authData.user.id,
    linked_rep_id: linkedRepId,
    is_active: true,
  });

  if (userError) {
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json(
      {
        error: userError.message,
        debug: "فشل في إنشاء صف users",
        fullError: JSON.stringify(userError),
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
