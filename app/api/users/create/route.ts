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

  const { email, password, name, role, phone, branchId } = await request.json();

  // المشرف ممنوع ينشئ حساب admin، وممنوع يحدد فرع غير فرعه
  if (currentUser.role === "supervisor") {
    if (role === "admin") {
      return NextResponse.json(
        { error: "غير مصرح بإنشاء حساب مدير", debug: "محاولة تجاوز صلاحيات" },
        { status: 403 },
      );
    }
    if (branchId !== currentUser.branch_id) {
      return NextResponse.json(
        {
          error: "غير مصرح بإنشاء مستخدم في فرع آخر",
          debug: "محاولة تجاوز صلاحيات الفرع",
        },
        { status: 403 },
      );
    }
  }

  // المدير مايحتاجش فرع محدد (بيشوف كل الفروع)، باقي الأدوار لازم تختار فرع
  if (role !== "admin" && !branchId) {
    return NextResponse.json(
      { error: "الرجاء اختيار الفرع", debug: "فشل التحقق من الفرع" },
      { status: 400 },
    );
  }

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

  const finalBranchId = role === "admin" ? null : branchId;

  // ننشئ صف في reps لكل الأدوار (مندوب، مشرف، مدير)
  // عشان أي مستخدم يقدر يسجّل زيارة باسمه هو مباشرة عند الحاجة
  const { data: repData, error: repError } = await adminClient
    .from("reps")
    .insert({ name, phone: phone || null, branch_id: finalBranchId })
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

  const linkedRepId = repData.rep_id;

  const { error: userError } = await adminClient.from("users").insert({
    name,
    email,
    role,
    auth_id: authData.user.id,
    linked_rep_id: linkedRepId,
    branch_id: finalBranchId,
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
