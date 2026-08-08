import { Client, Rep, Product } from "@/types";

export const mockClients: Client[] = [
  {
    id: 1,
    name: "سوبر ماركت الاندلس",
    classification: "A",
    subClassification: "wholesale_internal",
    totalScore: 8.6,
    outstandingBalance: 2450,
    lastPaymentDate: "2026-07-20",
    isActive: true,
  },
  {
    id: 2,
    name: "سوق طيبة",
    classification: "B",
    totalScore: 7.2,
    outstandingBalance: 0,
    lastPaymentDate: "2026-08-01",
    isActive: true,
  },
];

export const mockReps: Rep[] = [
  { id: 1, name: "أحمد محمد" },
  { id: 2, name: "خالد علي" },
];

export const mockProducts: Product[] = [
  { id: 1, name: "عصير أناناس", category: "عصائر" },
  { id: 2, name: "عصير برتقال", category: "عصائر" },
  { id: 3, name: "عصير مانجو", category: "عصائر" },
  { id: 4, name: "مكرونة قلم", category: "مكرونة" },
  { id: 5, name: "مكرونة اسباجيتي", category: "مكرونة" },
  { id: 6, name: "معجون طماطم صغير", category: "معجون طماطم" },
  { id: 7, name: "معجون طماطم كبير", category: "معجون طماطم" },
  { id: 8, name: "دقيق أبيض", category: "دقيق" },
];

export const mockPendingVisit = {
  id: 1,
  clientId: 1,
  clientName: "سوبر ماركت الأندلس",
  repId: 1,
  repName: "أحمد محمد",
  visitDate: "2026-08-07",
  repNotes:
    "العميل طلب توريد كمية إضافية من عصير الأناناس، الرف شبه فاضي من المكرونة.",
  inventory: [
    {
      productName: "عصير أناناس",
      category: "عصائر",
      availableOnShelf: false,
      availableInWarehouse: true,
    },
    {
      productName: "عصير برتقال",
      category: "عصائر",
      availableOnShelf: true,
      availableInWarehouse: true,
    },
    {
      productName: "مكرونة قلم",
      category: "مكرونة",
      availableOnShelf: false,
      availableInWarehouse: false,
    },
  ],
  status: "pending_review",
};
