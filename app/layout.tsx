import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Toaster } from "react-hot-toast";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "تسجيل زيارات المندوبين",
  description: "نظام تسجيل وتقييم زيارات المندوبين",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  let pendingVisits: {
    visit_id: number;
    client_name: string;
    rep_name: string;
    visit_date: string;
  }[] = [];

  if (user && (user.role === "supervisor" || user.role === "admin")) {
    const { data } = await supabase
      .from("visits")
      .select(
        "visit_id, visit_date, clients:client_id (name), reps:rep_id (name)",
      )
      .eq("status", "pending_review")
      .order("visit_date", { ascending: false })
      .limit(5);

    pendingVisits = (data ?? []).map((v) => ({
      visit_id: v.visit_id,
      visit_date: v.visit_date,
      client_name:
        (v.clients as unknown as { name: string } | null)?.name ?? "—",
      rep_name: (v.reps as unknown as { name: string } | null)?.name ?? "—",
    }));
  }

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex">
        {user && <Sidebar userRole={user.role} userName={user.name} />}
        <div className="flex-1 flex flex-col w-full">
          {user && (
            <Header
              userName={user.name}
              userRole={user.role}
              pendingVisits={pendingVisits}
            />
          )}
          <main className="flex-1 bg-slate-50">{children}</main>
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { fontFamily: "inherit", direction: "rtl" },
          }}
        />
      </body>
    </html>
  );
}
