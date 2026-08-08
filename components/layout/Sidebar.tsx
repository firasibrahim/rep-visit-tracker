"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardEdit,
  ClipboardList,
  Store,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

const menuItems = [
  { label: "الرئيسية", href: "/", icon: Home },
  { label: "تسجيل زيارة", href: "/visits/new", icon: ClipboardEdit },
  { label: "قائمة الزيارات", href: "/visits", icon: ClipboardList },
  { label: "العملاء", href: "/clients", icon: Store },
  { label: "المندوبين", href: "/reps", icon: Users },
  { label: "التقارير", href: "/reports", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-l border-slate-200 min-h-screen flex flex-col">
      <div className="p-5 flex items-center gap-2 border-b border-slate-100">
        <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
          <Store size={18} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-800">
            منظومة الزيارات
          </div>
          <div className="text-xs text-slate-400">شركة ريحان</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 font-bold"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50"
        >
          <Settings size={18} />
          <span>الإعدادات</span>
        </Link>
      </div>
    </aside>
  );
}
