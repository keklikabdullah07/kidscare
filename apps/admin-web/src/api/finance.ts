import { apiFetch } from './client';
import type {
  BillingInvoice,
  CreateBillingPlanInput,
  CreateInvoiceInput,
  FinanceSummaryStats,
  RecordPaymentInput,
  StudentBillingPlan,
} from '@kidscare/shared-types';

export async function getFinanceStats(period?: string): Promise<FinanceSummaryStats> {
  const query = new URLSearchParams();
  if (period) query.set('period', period);
  const qStr = query.toString();
  return apiFetch<FinanceSummaryStats>(`/finance/stats${qStr ? `?${qStr}` : ''}`);
}

export async function listInvoices(params?: {
  studentId?: string;
  classroomId?: string;
  status?: string;
  period?: string;
}): Promise<BillingInvoice[]> {
  const query = new URLSearchParams();
  if (params?.studentId) query.set('studentId', params.studentId);
  if (params?.classroomId) query.set('classroomId', params.classroomId);
  if (params?.status) query.set('status', params.status);
  if (params?.period) query.set('period', params.period);
  const qStr = query.toString();
  return apiFetch<BillingInvoice[]>(`/finance/invoices${qStr ? `?${qStr}` : ''}`);
}

export async function createInvoice(payload: CreateInvoiceInput): Promise<BillingInvoice> {
  return apiFetch<BillingInvoice>('/finance/invoices', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function recordPayment(payload: RecordPaymentInput): Promise<BillingInvoice> {
  return apiFetch<BillingInvoice>('/finance/payments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listBillingPlans(): Promise<StudentBillingPlan[]> {
  return apiFetch<StudentBillingPlan[]>('/finance/plans');
}

export async function saveBillingPlan(
  payload: CreateBillingPlanInput,
): Promise<StudentBillingPlan> {
  return apiFetch<StudentBillingPlan>('/finance/plans', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sendPaymentReminder(
  invoiceId: string,
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(
    `/finance/invoices/${encodeURIComponent(invoiceId)}/remind`,
    {
      method: 'POST',
    },
  );
}

export async function getMyChildBilling(): Promise<BillingInvoice[]> {
  return apiFetch<BillingInvoice[]>('/finance/my-child');
}
