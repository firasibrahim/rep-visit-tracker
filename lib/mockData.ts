import { Client, Rep, Product } from "@/types";

export const mockClients: Client[] = [
  {
    id: 1,
    name: "سوبر ماركت الاندلس",
    classification: "A",
    subClassification: "Wholesale_internal",
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
  { id: 1, name: "عصير برتقال", category: "مشروبات" },
  { id: 2, name: "مياه معدنية", category: "مشروبات" },
  { id: 3, name: "بسكويت", category: "سناكس" },
  { id: 4, name: "حليب", category: "ألبان" },
  { id: 5, name: "شيبس", category: "سناكس" },
];
