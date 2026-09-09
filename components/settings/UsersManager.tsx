"use client";

import { useState } from "react";
import { Plus, Pause, Play, Search, Pencil, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { notifySuccess, notifyUpdate, notifyDelete } from "@/lib/toast";

type UserRole = "supervisor" | "rep" | "admin";

type UserRow = {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  linked_rep_id: number | null;
  auth_id: string;
};

const roleLabels: Record<string, string> = {
  supervisor: "مشرف",
  rep: "مندوب",
  admin: "مدير",
};

export default function UsersManager({
  initialUsers,
}: {
  initialUsers: UserRow[];
}) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [togglingUser, setTogglingUser] = useState<UserRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("rep");

  // تعديل الاسم
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");

  // إعادة تعيين كلمة المرور
  const [passwordUser, setPasswordUser] = useState<UserRow | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const refreshUsers = async () => {
    const { data } = await supabase
      .from("users")
      .select("user_id, name, email, role, is_active, linked_rep_id, auth_id")
      .order("name");
    setUsers(data ?? []);
  };

  const filtered = users.filter((u) => u.name.includes(searchTerm));

  const openAddModal = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormPhone("");
    setFormRole("rep");
    setIsModalOpen(true);
  };

  const handleCreate = async () => {
    if (!formName || !formEmail || !formPassword) {
      notifyDelete("الرجاء تعبئة كل الحقول المطلوبة");
      return;
    }

    setSubmitting(true);

    const res = await fetch("/api/users/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
        phone: formPhone,
      }),
    });

    const result = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      notifyDelete(`${result.debug}: ${result.error}`);
      return;
    }

    notifySuccess("تم إنشاء الحساب بنجاح");
    setIsModalOpen(false);
    refreshUsers();
  };

  const confirmToggleStatus = async () => {
    if (!togglingUser) return;

    const newStatus = !togglingUser.is_active;
    const { error } = await supabase
      .from("users")
      .update({ is_active: newStatus })
      .eq("user_id", togglingUser.user_id);

    if (!error) {
      if (newStatus) {
        notifySuccess("تم استرجاع تفعيل الحساب");
      } else {
        notifyUpdate("تم إيقاف تفعيل الحساب");
      }
      refreshUsers();
    }
  };

  const openEditModal = (user: UserRow) => {
    setEditingUser(user);
    setEditName(user.name);
    setIsEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingUser || !editName.trim()) {
      notifyDelete("الرجاء إدخال الاسم");
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ name: editName })
      .eq("user_id", editingUser.user_id);

    if (error) {
      notifyDelete("حدث خطأ أثناء التعديل");
      return;
    }

    // لو الحساب مرتبط بمندوب، حدّث اسمه في جدول reps كمان
    if (editingUser.linked_rep_id) {
      await supabase
        .from("reps")
        .update({ name: editName })
        .eq("rep_id", editingUser.linked_rep_id);
    }

    notifyUpdate("تم تعديل الاسم بنجاح");
    setIsEditModalOpen(false);
    refreshUsers();
  };

  const openPasswordModal = (user: UserRow) => {
    setPasswordUser(user);
    setNewPassword("");
    setIsPasswordModalOpen(true);
  };

  const handlePasswordReset = async () => {
    if (!passwordUser || newPassword.length < 6) {
      notifyDelete("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setPasswordSubmitting(true);

    const res = await fetch("/api/users/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authId: passwordUser.auth_id,
        newPassword,
      }),
    });

    const result = await res.json();
    setPasswordSubmitting(false);

    if (!res.ok) {
      notifyDelete(result.error || "حدث خطأ أثناء تغيير كلمة المرور");
      return;
    }

    notifySuccess("تم تغيير كلمة المرور بنجاح");
    setIsPasswordModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">
            إدارة المستخدمين
          </h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          >
            <Plus size={16} />
            إضافة مستخدم
          </button>
        </div>

        <div className="relative max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالاسم..."
            className="input pl-9"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-500">
                <th className="py-3 px-4 font-medium">الاسم</th>
                <th className="py-3 px-4 font-medium">البريد الإلكتروني</th>
                <th className="py-3 px-4 font-medium">الدور</th>
                <th className="py-3 px-4 font-medium">الحالة</th>
                <th className="py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.user_id}
                  className={`border-b last:border-0 hover:bg-slate-50 ${!user.is_active ? "opacity-50" : ""}`}
                >
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {user.name}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {user.is_active ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        نشط
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
                        موقّف
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-slate-400 hover:text-emerald-600"
                        title="تعديل الاسم"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => openPasswordModal(user)}
                        className="text-slate-400 hover:text-blue-500"
                        title="إعادة تعيين كلمة المرور"
                      >
                        <KeyRound size={16} />
                      </button>
                      <button
                        onClick={() => setTogglingUser(user)}
                        className={
                          user.is_active
                            ? "text-slate-400 hover:text-amber-500"
                            : "text-slate-400 hover:text-emerald-600"
                        }
                        title={user.is_active ? "إيقاف" : "استرجاع"}
                      >
                        {user.is_active ? (
                          <Pause size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    لا يوجد مستخدمين مطابقين للبحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: إضافة مستخدم جديد */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة مستخدم جديد"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              الدور
            </label>
            <select
              className="input"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value as UserRole)}
            >
              <option value="rep">مندوب</option>
              <option value="supervisor">مشرف</option>
              <option value="admin">مدير</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              الاسم الكامل
            </label>
            <input
              className="input"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          {formRole === "rep" && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                رقم الهاتف
              </label>
              <input
                className="input"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              className="input"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              className="input"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={submitting}
            className="w-full mt-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? "جاري الإنشاء..." : "إنشاء الحساب"}
          </button>
        </div>
      </Modal>

      {/* Modal: تعديل الاسم */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="تعديل الاسم"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              الاسم الكامل
            </label>
            <input
              className="input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <button
            onClick={handleEditSave}
            className="w-full mt-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          >
            حفظ التعديلات
          </button>
        </div>
      </Modal>

      {/* Modal: إعادة تعيين كلمة المرور */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="إعادة تعيين كلمة المرور"
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            تعيين كلمة مرور جديدة لـ{" "}
            <span className="font-bold">{passwordUser?.name}</span>
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              كلمة المرور الجديدة
            </label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="6 أحرف على الأقل"
            />
          </div>
          <button
            onClick={handlePasswordReset}
            disabled={passwordSubmitting}
            className="w-full mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {passwordSubmitting ? "جاري التحديث..." : "تحديث كلمة المرور"}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!togglingUser}
        onClose={() => setTogglingUser(null)}
        onConfirm={confirmToggleStatus}
        title={
          togglingUser?.is_active
            ? "إيقاف تفعيل الحساب"
            : "استرجاع تفعيل الحساب"
        }
        message={
          togglingUser?.is_active
            ? `هل تريد إيقاف تفعيل حساب "${togglingUser?.name}"؟ لن يتمكن من تسجيل الدخول بعد الآن.`
            : `هل تريد استرجاع تفعيل حساب "${togglingUser?.name}"؟`
        }
        confirmLabel={togglingUser?.is_active ? "إيقاف" : "استرجاع"}
        variant="warning"
      />
    </div>
  );
}
