"use client";

import { useState } from "react";
import { Pencil, Pause, Play, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { notifySuccess, notifyUpdate } from "@/lib/toast";

type Rep = {
  rep_id: number;
  name: string;
  phone: string | null;
  is_active: boolean;
};

export default function RepsManager({ initialReps }: { initialReps: Rep[] }) {
  const [reps, setReps] = useState<Rep[]>(initialReps);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRep, setEditingRep] = useState<Rep | null>(null);
  const [togglingRep, setTogglingRep] = useState<Rep | null>(null);

  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const refreshReps = async () => {
    const { data } = await supabase.from("reps").select("*").order("name");
    setReps(data ?? []);
  };

  const filtered = reps.filter((r) => r.name.includes(searchTerm));

  const openEditModal = (rep: Rep) => {
    setEditingRep(rep);
    setFormName(rep.name);
    setFormPhone(rep.phone ?? "");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingRep) return;

    const { error } = await supabase
      .from("reps")
      .update({ name: formName, phone: formPhone })
      .eq("rep_id", editingRep.rep_id);

    if (error) return;
    notifyUpdate("تم تعديل بيانات المندوب بنجاح");

    setIsModalOpen(false);
    refreshReps();
  };

  const confirmToggleStatus = async () => {
    if (!togglingRep) return;

    const newStatus = !togglingRep.is_active;
    const { error } = await supabase
      .from("reps")
      .update({ is_active: newStatus })
      .eq("rep_id", togglingRep.rep_id);

    if (!error) {
      if (newStatus) {
        notifySuccess("تم استرجاع تفعيل المندوب");
      } else {
        notifyUpdate("تم إيقاف تفعيل المندوب");
      }
      refreshReps();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">المندوبين</h1>
          <p className="text-sm text-slate-400">
            لإضافة مندوب جديد، استخدم صفحة{" "}
            <a
              href="/settings/users"
              className="text-emerald-600 hover:underline font-bold"
            >
              إدارة المستخدمين
            </a>
          </p>
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
            placeholder="ابحث باسم المندوب..."
            className="input pl-9"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-500">
                <th className="py-3 px-4 font-medium">اسم المندوب</th>
                <th className="py-3 px-4 font-medium">رقم الهاتف</th>
                <th className="py-3 px-4 font-medium">الحالة</th>
                <th className="py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rep) => (
                <tr
                  key={rep.rep_id}
                  className={`border-b last:border-0 hover:bg-slate-50 ${!rep.is_active ? "opacity-50" : ""}`}
                >
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {rep.name}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {rep.phone ?? "—"}
                  </td>
                  <td className="py-3 px-4">
                    {rep.is_active ? (
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
                        onClick={() => openEditModal(rep)}
                        className="text-slate-400 hover:text-emerald-600"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setTogglingRep(rep)}
                        className={
                          rep.is_active
                            ? "text-slate-400 hover:text-amber-500"
                            : "text-slate-400 hover:text-emerald-600"
                        }
                      >
                        {rep.is_active ? (
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
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    لا يوجد مندوبين مطابقين للبحث
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
        title="تعديل بيانات المندوب"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              اسم المندوب
            </label>
            <input
              className="input"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
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
          <button
            onClick={handleSave}
            className="w-full mt-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          >
            حفظ التعديلات
          </button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!togglingRep}
        onClose={() => setTogglingRep(null)}
        onConfirm={confirmToggleStatus}
        title={
          togglingRep?.is_active
            ? "إيقاف تفعيل المندوب"
            : "استرجاع تفعيل المندوب"
        }
        message={
          togglingRep?.is_active
            ? `هل تريد إيقاف تفعيل "${togglingRep?.name}"؟ يمكنك استرجاعه لاحقًا في أي وقت.`
            : `هل تريد استرجاع تفعيل "${togglingRep?.name}"؟`
        }
        confirmLabel={togglingRep?.is_active ? "إيقاف" : "استرجاع"}
        variant="warning"
      />
    </div>
  );
}
