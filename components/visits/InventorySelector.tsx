"use client";

// Diese Komponente zeigt Produkte gruppiert nach Kategorie an
// und erlaubt eine schnelle Live-Suche für den Außendienstmitarbeiter.
import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { mockProducts } from "@/lib/mockData";

type InventoryItem = {
  productId: number;
  productName: string;
  category: string;
  availableOnShelf: boolean;
  availableInWarehouse: boolean;
};

export default function InventorySelector({
  inventory,
  onToggle,
}: {
  inventory: InventoryItem[];
  onToggle: (
    productId: number,
    field: "availableOnShelf" | "availableInWarehouse",
  ) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  // Gruppiert die Produkte nach Kategorie (z. B. "عصائر", "مكرونة")
  const categories = useMemo(() => {
    const map = new Map<string, InventoryItem[]>();
    inventory.forEach((item) => {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    });
    return map;
  }, [inventory]);

  // Filtert live nach Suchbegriff, unabhängig von der Kategorie
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return null;
    return inventory.filter((item) => item.productName.includes(searchTerm));
  }, [searchTerm, inventory]);

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  };

  const selectedCount = inventory.filter(
    (i) => i.availableOnShelf || i.availableInWarehouse,
  ).length;

  return (
    <div>
      {/* خانة البحث */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ابحث عن صنف... (مثال: أناناس)"
          className="input pl-9"
        />
      </div>

      <div className="text-xs text-slate-400 mb-3">
        تم تحديد {selectedCount} صنف من أصل {inventory.length}
      </div>

      {/* نتائج البحث الفوري */}
      {searchResults ? (
        <div className="space-y-1">
          {searchResults.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              لا توجد نتائج
            </p>
          ) : (
            searchResults.map((item) => (
              <ProductRow
                key={item.productId}
                item={item}
                onToggle={onToggle}
              />
            ))
          )}
        </div>
      ) : (
        /* عرض حسب الفئات القابلة للطي */
        <div className="space-y-2">
          {Array.from(categories.entries()).map(([category, items]) => {
            const isOpen = openCategories.has(category);
            const categorySelectedCount = items.filter(
              (i) => i.availableOnShelf || i.availableInWarehouse,
            ).length;

            return (
              <div
                key={category}
                className="border border-slate-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">
                      {category}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({items.length})
                    </span>
                    {categorySelectedCount > 0 && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {categorySelectedCount} مُحدد
                      </span>
                    )}
                  </div>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isOpen && (
                  <div className="p-2 space-y-1">
                    {items.map((item) => (
                      <ProductRow
                        key={item.productId}
                        item={item}
                        onToggle={onToggle}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProductRow({
  item,
  onToggle,
}: {
  item: InventoryItem;
  onToggle: (
    productId: number,
    field: "availableOnShelf" | "availableInWarehouse",
  ) => void;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg">
      <span className="text-sm text-slate-700">{item.productName}</span>
      <div className="flex items-center gap-4 text-xs">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={item.availableOnShelf}
            onChange={() => onToggle(item.productId, "availableOnShelf")}
            className="w-4 h-4 accent-emerald-600"
          />
          <span className="text-slate-500">بالرف</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={item.availableInWarehouse}
            onChange={() => onToggle(item.productId, "availableInWarehouse")}
            className="w-4 h-4 accent-emerald-600"
          />
          <span className="text-slate-500">بالمخزن</span>
        </label>
      </div>
    </div>
  );
}
