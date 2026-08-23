import { Bell } from "lucide-react";

const roleLabels: Record<string, string> = {
  supervisor: "مشرف",
  rep: "مندوب",
};

export default function Header({
  userName,
  userRole,
}: {
  userName: string;
  userRole: "supervisor" | "rep";
}) {
  const initials = userName.slice(0, 2);

  return (
    <header className="bg-white border-b border-slate-100 px-4 md:px-6 py-3 flex items-center justify-end">
      <div className="flex items-center gap-4">
        <button className="relative text-slate-400 hover:text-slate-600">
          <Bell size={20} />
          <span className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
            3
          </span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">
            {initials}
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-700">{userName}</div>
            <div className="text-xs text-slate-400">{roleLabels[userRole]}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
