export type Client = {
  id: number;
  name: string;
  classification: "A" | "B" | "C";
  subClassification?: "wholesale_internal" | "wholesale_external";
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
};

// بيانات يُدخلها المندوب وقت الزيارة
export type VisitSubmission = {
  clientId: number;
  repId: number;
  visitDate: string;
  visitTime: string;
  repNotes: string;
  inventory: VisitInventoryItem[];
  status: "pending_review" | "reviewed";
};

// تقييم يُضيفه المشرف لاحقًا فوق نفس الزيارة
export type SupervisorReview = {
  visitId: number;
  supervisorName: string;
  promotionRating: number;
  repPerformanceRating: number;
  repCommitmentRating: number;
  paymentCommitmentRating: number;
  reviewedAt: string;
};
