export type InvoiceStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'OTHER';

export interface StudentBillingPlan {
  id: string;
  tenantId: string;
  studentId: string;
  tuitionAmount: number;
  serviceAmount: number;
  activityAmount: number;
  discountPercent: number;
  dueDayOfMonth: number;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    classroom?: {
      id: string;
      name: string;
    } | null;
  };
}

export interface BillingInvoice {
  id: string;
  tenantId: string;
  studentId: string;
  period: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount?: number;
  dueDate: string;
  status: InvoiceStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    classroom?: {
      id: string;
      name: string;
    } | null;
    parent?: {
      id: string;
      email: string;
    } | null;
  };
  payments?: PaymentTransaction[];
}

export interface PaymentTransaction {
  id: string;
  tenantId: string;
  invoiceId: string;
  studentId: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  referenceNo?: string | null;
  notes?: string | null;
  recordedByUserId: string;
  createdAt: string;
  recordedBy?: {
    id: string;
    email: string;
  };
}

export interface FinanceSummaryStats {
  expectedTotal: number;
  collectedTotal: number;
  overdueTotal: number;
  collectionRate: number;
  activePlansCount: number;
  overdueInvoicesCount: number;
}

export interface CreateBillingPlanInput {
  studentId: string;
  tuitionAmount: number;
  serviceAmount?: number | undefined;
  activityAmount?: number | undefined;
  discountPercent?: number | undefined;
  dueDayOfMonth?: number | undefined;
  notes?: string | undefined;
  isActive?: boolean | undefined;
}

export interface CreateInvoiceInput {
  studentId: string;
  period: string;
  totalAmount: number;
  dueDate: string;
  notes?: string | undefined;
}

export interface RecordPaymentInput {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  referenceNo?: string | undefined;
  notes?: string | undefined;
  paidAt?: string | undefined;
}
