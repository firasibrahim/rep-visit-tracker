"use client";

import { useState } from "react";
import { Plus, Pause, Play, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { notifySuccess, notifyUpdate, notifyDelete } from "@/lib/toast";

type UserRow = {
  user_id: number;
  name: string;
  email: string;
  role: "supervisor" | "rep";
  is_active: boolean;
  linked_rep_id: number | null;
};

const roleLabels: Record<string, string> = {
  supervisor: "مشرف",
  rep: "مندوب",
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
  const [formRole, setFormRole] = useState<"supervisor" | "rep">("rep");

  const refreshUsers = async () => {
    const { data } = await supabase
      .from("users")
      .select("user_id, name, email, role, is_active, linked_rep_id")
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
      console.log("FULL ERROR DETAILS:", result);
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
                    <button
                      onClick={() => setTogglingUser(user)}
                      className={
                        user.is_active
                          ? "text-slate-400 hover:text-amber-500"
                          : "text-slate-400 hover:text-emerald-600"
                      }
                    >
                      {user.is_active ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                    </button>
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
              onChange={(e) =>
                setFormRole(e.target.value as "supervisor" | "rep")
              }
            >
              <option value="rep">مندوب</option>
              <option value="supervisor">مشرف</option>
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
