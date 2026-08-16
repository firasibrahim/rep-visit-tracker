"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Search,
  Plus,
  Pencil,
  Pause,
  Play,
  ChevronRight,
  ChevronLeft,
  MapPin,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Modal from "@/components/ui/Modal";
import { notifySuccess, notifyUpdate } from "@/lib/toast";

const LocationViewer = dynamic(
  () => import("@/components/clients/LocationViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[250px] bg-slate-100 rounded-lg animate-pulse" />
    ),
  },
);

type Client = {
  client_id: number;
  name: string;
  classification: "A" | "B" | "C";
  total_score: number;
  outstanding_balance: number;
  last_payment_date: string | null;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
};

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

type SortKey = "name" | "total_score" | "outstanding_balance";
const PAGE_SIZE = 10;

export default function ClientsManager({
  initialClients,
}: {
  initialClients: Client[];
}) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("total_score");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [togglingClient, setTogglingClient] = useState<Client | null>(null);
  const [viewingLocation, setViewingLocation] = useState<Client | null>(null);

  const refreshClients = async () => {
    const { data } = await supabase.from("clients").select("*").order("name");
    setClients(data ?? []);
  };

  const filteredAndSorted = clients
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
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const confirmToggleStatus = async () => {
    if (!togglingClient) return;

    const newStatus = !togglingClient.is_active;
    const { error } = await supabase
      .from("clients")
      .update({
        is_active: newStatus,
        deactivated_at: newStatus ? null : new Date().toISOString(),
      })
      .eq("client_id", togglingClient.client_id);

    if (!error) {
      if (newStatus) {
        notifySuccess("تم استرجاع تفعيل العميل");
      } else {
        notifyUpdate("تم إيقاف تفعيل العميل");
      }
      refreshClients();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">العملاء</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              {filteredAndSorted.length} عميل مسجّل
            </span>
            <Link
              href="/clients/new"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
            >
              <Plus size={16} />
              إضافة عميل
            </Link>
          </div>
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
                  sortKey="total_score"
                  current={sortKey}
                  asc={sortAsc}
                  onClick={toggleSort}
                />
                <SortableHeader
                  label="الرصيد المستحق"
                  sortKey="outstanding_balance"
                  current={sortKey}
                  asc={sortAsc}
                  onClick={toggleSort}
                />
                <th className="py-3 px-4 font-medium">الحالة</th>
                <th className="py-3 px-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.map((client) => (
                <tr
                  key={client.client_id}
                  className={`border-b last:border-0 hover:bg-slate-50 ${!client.is_active ? "opacity-50" : ""}`}
                >
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setViewingLocation(client)}
                      className="font-medium text-slate-700 hover:text-emerald-600 flex items-center gap-1.5"
                    >
                      <MapPin size={14} className="text-slate-300" />
                      {client.name}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${classificationColors[client.classification]}`}
                    >
                      {classificationLabels[client.classification]}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600">
                    {client.total_score} / 10
                  </td>
                  <td
                    className={`py-3 px-4 font-bold ${client.outstanding_balance > 0 ? "text-red-500" : "text-emerald-600"}`}
                  >
                    {client.outstanding_balance} د.ل
                  </td>
                  <td className="py-3 px-4">
                    {client.is_active ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        نشط
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
                        موقّف
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/clients/new?id=${client.client_id}`}
                        className="text-slate-400 hover:text-emerald-600"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => setTogglingClient(client)}
                        className={
                          client.is_active
                            ? "text-slate-400 hover:text-amber-500"
                            : "text-slate-400 hover:text-emerald-600"
                        }
                      >
                        {client.is_active ? (
                          <Pause size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    لا يوجد عملاء مطابقين للبحث
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

      <ConfirmModal
        isOpen={!!togglingClient}
        onClose={() => setTogglingClient(null)}
        onConfirm={confirmToggleStatus}
        title={
          togglingClient?.is_active
            ? "إيقاف تفعيل العميل"
            : "استرجاع تفعيل العميل"
        }
        message={
          togglingClient?.is_active
            ? `هل تريد إيقاف تفعيل "${togglingClient?.name}"؟ يمكنك استرجاعه لاحقًا في أي وقت.`
            : `هل تريد استرجاع تفعيل "${togglingClient?.name}"؟`
        }
        confirmLabel={togglingClient?.is_active ? "إيقاف" : "استرجاع"}
        variant={togglingClient?.is_active ? "warning" : "warning"}
      />

      <Modal
        isOpen={!!viewingLocation}
        onClose={() => setViewingLocation(null)}
        title={`موقع: ${viewingLocation?.name ?? ""}`}
      >
        {viewingLocation?.latitude && viewingLocation?.longitude ? (
          <div className="space-y-3">
            <LocationViewer
              lat={viewingLocation.latitude}
              lng={viewingLocation.longitude}
            />
            {viewingLocation.address && (
              <p className="text-sm text-slate-500">
                {viewingLocation.address}
              </p>
            )}
            <p className="text-xs text-slate-400">
              {viewingLocation.latitude.toFixed(6)},{" "}
              {viewingLocation.longitude.toFixed(6)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-8">
            لم يتم تحديد موقع لهذا العميل بعد
          </p>
        )}
      </Modal>
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
