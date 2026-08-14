"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { mockRepsDetailed } from "@/lib/mockData";

const PAGE_SIZE = 10;

export default function RepsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(
    () => mockRepsDetailed.filter((r) => r.name.includes(searchTerm)),
    [searchTerm],
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">المندوبين</h1>
          <span className="text-sm text-slate-400">
            {filtered.length} مندوب
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
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
                <th className="py-3 px-4 font-medium">زيارات هذا الشهر</th>
                <th className="py-3 px-4 font-medium">متوسط تقييم العملاء</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((rep) => (
                <tr
                  key={rep.id}
                  className="border-b last:border-0 hover:bg-slate-50"
                >
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {rep.name}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{rep.phone}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {rep.visitsThisMonth}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600">
                    {rep.avgClientScore} / 10
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
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
    </div>
  );
}
