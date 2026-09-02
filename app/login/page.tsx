"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { notifyDelete } from "@/lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      notifyDelete("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center p-6"
      dir="rtl"
    >
      <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-sm">
        <div className="w-24 h-24 relative mx-auto mb-4">
          <Image
            src="/logo.png"
            alt="شركة ريحان"
            fill
            className="object-contain"
          />
        </div>

        <h1 className="text-xl font-bold text-slate-800 mb-1 text-center">
          منظومة زيارات المشرفين
        </h1>
        <p className="text-sm text-slate-400 mb-6 text-center">شركة ريحان</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@rihan.ly"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </div>
      </div>
    </div>
  );
}
