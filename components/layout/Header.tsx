import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between">
      <div className="relative w-72">
        <Search
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
        />
        <input
          type="text"
          placeholder="بحث..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pr-9 pl-3 text-sm focus:outline-none focus:border-emerald-400"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-slate-400 hover:text-slate-600">
          <Bell size={20} />
          <span className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
            3
          </span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-bold">
            وإ
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-700">وصال إبراهيم</div>
            <div className="text-xs text-slate-400">مشرف</div>
          </div>
        </div>
      </div>
    </header>
  );
}
