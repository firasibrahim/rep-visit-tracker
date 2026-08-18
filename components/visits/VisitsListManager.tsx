"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronRight, ChevronLeft } from "lucide-react";

type VisitRow = {
  visit_id: number;
  visit_date: string;
  status: "pending_review" | "reviewed";
  clients: { name: string } | null;
  reps: { name: string } | null;
};

const statusLabels: Record<string, string> = {
  pending_review: "بانتظار المراجعة",
  reviewed: "تمت المراجعة",
};

const statusColors: Record<string, string> = {
  pending_review: "bg-amber-100 text-amber-700",
  reviewed: "bg-emerald-100 text-emerald-700",
};

const PAGE_SIZE = 10;

export default function VisitsListManager({
  initialVisits,
}: {
  initialVisits: VisitRow[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return initialVisits.filter(
      (v) =>
        (v.clients?.name ?? "").includes(searchTerm) ||
        (v.reps?.name ?? "").includes(searchTerm),
    );
  }, [searchTerm, initialVisits]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">قائمة الزيارات</h1>
          <span className="text-sm text-slate-400">
            {filtered.length} زيارة
          </span>
        </div>

        <div className="relative max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="ابحث باسم العميل أو المندوب..."
            className="input pl-9"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-500">
                <th className="py-3 px-4 font-medium">العميل</th>
                <th className="py-3 px-4 font-medium">المندوب</th>
                <th className="py-3 px-4 font-medium">التاريخ</th>
                <th className="py-3 px-4 font-medium">الحالة</th>
                <th className="py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((visit) => (
                <tr
                  key={visit.visit_id}
                  className="border-b last:border-0 hover:bg-slate-50"
                >
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {visit.clients?.name ?? "—"}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {visit.reps?.name ?? "—"}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {visit.visit_date}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${statusColors[visit.status]}`}
                    >
                      {statusLabels[visit.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-left">
                    {visit.status === "pending_review" && (
                      <Link
                        href={`/visits/review/${visit.visit_id}`}
                        className="text-emerald-600 hover:underline text-xs font-bold"
                      >
                        مراجعة الآن
                      </Link>
                    )}
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    لا توجد زيارات مطابقة للبحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
              <span className="text-xs text-slate-400">
                صفحة {currentPage} من {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-white"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-white"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
