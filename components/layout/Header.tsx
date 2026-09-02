"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, ClipboardList, ChevronsLeft } from "lucide-react";

const roleLabels: Record<string, string> = {
  supervisor: "مشرف",
  rep: "مندوب",
  admin: "مدير",
};

type PendingVisit = {
  visit_id: number;
  client_name: string;
  rep_name: string;
  visit_date: string;
};

export default function Header({
  userName,
  userRole,
  pendingVisits,
}: {
  userName: string;
  userRole: "supervisor" | "rep" | "admin";
  pendingVisits: PendingVisit[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initials = userName.slice(0, 2);
  const pendingCount = pendingVisits.length;

  // إغلاق القائمة عند الضغط في أي مكان خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToVisit = (visitId: number) => {
    setIsOpen(false);
    router.push(`/visits/review/${visitId}`);
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-100 shadow-sm px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
      <div />
      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="relative text-slate-400 hover:text-emerald-600 transition-colors p-2 rounded-full hover:bg-slate-50"
          >
            <Bell size={20} />
            {pendingCount > 0 && (
              <span className="absolute top-1 left-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center ring-2 ring-white">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            )}
          </button>

          {/* القائمة المنسدلة */}
          <div
            className={`absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden origin-top-left transition-all duration-200 ${
              isOpen
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-700">
                زيارات بانتظار المراجعة
              </h3>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {pendingVisits.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-400">
                  لا توجد زيارات بانتظار المراجعة 🎉
                </div>
              ) : (
                pendingVisits.map((visit) => (
                  <button
                    key={visit.visit_id}
                    onClick={() => goToVisit(visit.visit_id)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-right border-b border-slate-50 last:border-0"
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ClipboardList size={16} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-700 truncate">
                        {visit.client_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        المندوب: {visit.rep_name} · {visit.visit_date}
                      </div>
                    </div>
                    <ChevronsLeft
                      size={16}
                      className="text-slate-300 mt-1.5 flex-shrink-0"
                    />
                  </button>
                ))
              )}
            </div>

            {pendingVisits.length > 0 && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/visits");
                }}
                className="w-full text-center py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 border-t border-slate-100"
              >
                عرض كل الزيارات
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pr-3 border-r border-slate-200">
          <div>
            <div className="text-sm font-bold text-slate-700 text-left">
              {userName}
            </div>
            <div className="text-xs text-slate-400 text-left">
              {roleLabels[userRole]}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
