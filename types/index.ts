export type Client = {
  id: number;
  name: string;
  classification: "A" | "B" | "C";
  subClassification?: "Wholesale_internal" | "woholesale_external";
  totalScore: number;
  outstandingBalance: number;
  lastPaymentDate: string;
  isActive: boolean;
};

export type Rep = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  name: string;
  category: string;
};

export type VisitInventoryItem = {
  productId: number;
  productName: string;
  availableOnShelf: boolean;
  availableInWarehouse: boolean;
  shelfQty: number;
  warehouseQty: number;
};

export type Visit = {
  clientId: number;
  repId: number;
  supervisorName: string;
  visitDate: string;
  visitTime: string;
  repPerformanceRating: number;
  repCommitmentRating: number;
  paymentCommitmentRating: number;
  notes: string;
  inventory: VisitInventoryItem[];
};
