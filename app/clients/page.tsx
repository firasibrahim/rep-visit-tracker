"use client";

import { useState, useMemo } from "react";
import { Search, ChevronRight, ChevronLeft } from "lucide-react";
import { mockClients } from "@/lib/mockData";

const classificationLabels: Record<string, string> = {
  A: "صنف A",
  B: "صنف B",
  C: "صنف C",
};

const classificationColors: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-700",
  B: "bg-amber-100 text-amber-700",
  C: "bg-slate-100 text-slate-600",
};

type SortKey = "name" | "totalScore" | "outstandingBalance";
const PAGE_SIZE = 10; // عدد العملاء في كل صفحة — قابل للتعديل بسهولة

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("totalScore");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSorted = useMemo(() => {
    return mockClients
      .filter((c) => c.name.includes(searchTerm))
      .sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (typeof valA === "string") {
          return sortAsc
            ? valA.localeCompare(valB as string)
            : (valB as string).localeCompare(valA);
        }
        return sortAsc
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
  }, [searchTerm, sortKey, sortAsc]);

  const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE);
  const paginatedClients = filteredAndSorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
    setCurrentPage(1); // نرجع لأول صفحة عند تغيير الفرز
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // نرجع لأول صفحة عند البحث
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">العملاء</h1>
          <span className="text-sm text-slate-400">
            {filteredAndSorted.length} عميل مسجّل
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
            placeholder="ابحث باسم العميل..."
            className="input pl-9"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-500">
                <SortableHeader
                  label="اسم العميل"
                  sortKey="name"
                  current={sortKey}
                  asc={sortAsc}
                  onClick={toggleSort}
                />
                <th className="py-3 px-4 font-medium">التصنيف</th>
                <SortableHeader
                  label="التقييم"
                  sortKey="totalScore"
                  current={sortKey}
                  asc={sortAsc}
                  onClick={toggleSort}
                />
                <SortableHeader
                  label="الرصيد المستحق"
                  sortKey="outstandingBalance"
                  current={sortKey}
                  asc={sortAsc}
                  onClick={toggleSort}
                />
                <th className="py-3 px-4 font-medium">آخر دفعة</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b last:border-0 hover:bg-slate-50 cursor-pointer"
                >
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {client.name}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${classificationColors[client.classification]}`}
                    >
                      {classificationLabels[client.classification]}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600">
                    {client.totalScore} / 10
                  </td>
                  <td
                    className={`py-3 px-4 font-bold ${client.outstandingBalance > 0 ? "text-red-500" : "text-emerald-600"}`}
                  >
                    {client.outstandingBalance} د.ل
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {client.lastPaymentDate}
                  </td>
                </tr>
              ))}

              {paginatedClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    لا يوجد عملاء مطابقين للبحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* شريط التنقل بين الصفحات */}
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

function SortableHeader({
  label,
  sortKey,
  current,
  asc,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  asc: boolean;
  onClick: (key: SortKey) => void;
}) {
  const isActive = current === sortKey;
  return (
    <th
      onClick={() => onClick(sortKey)}
      className="py-3 px-4 font-medium cursor-pointer hover:text-emerald-600 select-none"
    >
      {label} {isActive && (asc ? "↑" : "↓")}
    </th>
  );
}
