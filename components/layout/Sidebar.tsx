"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Home,
  ClipboardEdit,
  ClipboardList,
  Store,
  Users,
  BarChart3,
  Settings,
  Package,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: ("supervisor" | "rep")[];
};

const menuItems: MenuItem[] = [
  { label: "الرئيسية", href: "/", icon: Home, roles: ["supervisor", "rep"] },
  {
    label: "تسجيل زيارة",
    href: "/visits/new",
    icon: ClipboardEdit,
    roles: ["rep"],
  },
  {
    label: "قائمة الزيارات",
    href: "/visits",
    icon: ClipboardList,
    roles: ["supervisor", "rep"],
  },
  { label: "العملاء", href: "/clients", icon: Store, roles: ["supervisor"] },
  { label: "المندوبين", href: "/reps", icon: Users, roles: ["supervisor"] },
  { label: "الأصناف", href: "/products", icon: Package, roles: ["supervisor"] },
  {
    label: "التقارير",
    href: "/reports",
    icon: BarChart3,
    roles: ["supervisor"],
  },
];

export default function Sidebar({
  userRole,
  userName,
}: {
  userRole: "supervisor" | "rep";
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(userRole),
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-3 right-3 z-40 bg-white p-2 rounded-lg shadow-md border border-slate-200"
      >
        <Menu size={20} />
      </button>

      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static top-0 right-0 h-full md:h-auto md:min-h-screen w-64
          bg-white border-l border-slate-200 flex flex-col z-50
          transition-transform duration-300
          ${isMobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-5 flex items-center justify-between gap-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
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
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-bold"
                    : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-1">
          <Link
            href="/settings/users"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50"
          >
            <Settings size={18} />
            <span>المستخدمين</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 w-full"
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
