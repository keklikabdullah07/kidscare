import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { InvoiceStatus } from '@kidscare/database';
import type {
  CreateBillingPlanInput,
  CreateInvoiceInput,
  FinanceSummaryStats,
  RecordPaymentInput,
} from '@kidscare/shared-types';
import {
  FinanceRepository,
  type InvoiceWithDetails,
  type PlanWithStudent,
} from '../repositories/finance.repository';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class FinanceService {
  constructor(
    @Inject(FinanceRepository)
    private readonly financeRepo: FinanceRepository,
    @Inject(NotificationsService)
    private readonly notificationsService: NotificationsService,
  ) {}

  private getCurrentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  async getStats(tenantId: string, period?: string): Promise<FinanceSummaryStats> {
    const targetPeriod = period || this.getCurrentPeriod();
    return this.financeRepo.getStats(tenantId, targetPeriod);
  }

  async listInvoices(
    tenantId: string,
    filters?: {
      studentId?: string | undefined;
      classroomId?: string | undefined;
      status?: InvoiceStatus | undefined;
      period?: string | undefined;
    },
  ): Promise<InvoiceWithDetails[]> {
    return this.financeRepo.findInvoices(tenantId, filters);
  }

  async createInvoice(tenantId: string, input: CreateInvoiceInput): Promise<InvoiceWithDetails> {
    const dueDate = new Date(input.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw new BadRequestException('Geçersiz son ödeme tarihi');
    }

    return this.financeRepo.createInvoice(tenantId, {
      studentId: input.studentId,
      period: input.period,
      totalAmount: input.totalAmount,
      dueDate,
      notes: input.notes ?? null,
    });
  }

  async recordPayment(
    tenantId: string,
    recordedByUserId: string,
    input: RecordPaymentInput,
  ): Promise<InvoiceWithDetails> {
    const invoice = await this.financeRepo.findInvoiceById(tenantId, input.invoiceId);
    if (!invoice) {
      throw new NotFoundException('Fatura bulunamadı');
    }

    const remaining = invoice.totalAmount - invoice.paidAmount;
    if (input.amount > remaining + 0.01) {
      throw new BadRequestException(
        `Ödeme tutarı (₺${input.amount}) kalan borç tutarını (₺${remaining}) aşamaz.`,
      );
    }

    const paidAt = input.paidAt ? new Date(input.paidAt) : new Date();

    return this.financeRepo.recordPayment(
      tenantId,
      input.invoiceId,
      invoice.studentId,
      recordedByUserId,
      {
        amount: input.amount,
        method: input.method,
        referenceNo: input.referenceNo ?? null,
        notes: input.notes ?? null,
        paidAt,
      },
    );
  }

  async listBillingPlans(tenantId: string): Promise<PlanWithStudent[]> {
    return this.financeRepo.findBillingPlans(tenantId);
  }

  async saveBillingPlan(tenantId: string, input: CreateBillingPlanInput): Promise<PlanWithStudent> {
    return this.financeRepo.saveBillingPlan(tenantId, {
      studentId: input.studentId,
      tuitionAmount: input.tuitionAmount,
      serviceAmount: input.serviceAmount ?? 0,
      activityAmount: input.activityAmount ?? 0,
      discountPercent: input.discountPercent ?? 0,
      dueDayOfMonth: input.dueDayOfMonth ?? 5,
      notes: input.notes ?? null,
      isActive: input.isActive ?? true,
    });
  }

  async getMyChildBilling(tenantId: string, parentUserId: string): Promise<InvoiceWithDetails[]> {
    return this.financeRepo.findInvoicesForParentUser(tenantId, parentUserId);
  }

  async sendPaymentReminder(
    tenantId: string,
    invoiceId: string,
  ): Promise<{ success: boolean; message: string }> {
    const invoice = await this.financeRepo.findInvoiceById(tenantId, invoiceId);
    if (!invoice) {
      throw new NotFoundException('Fatura bulunamadı');
    }

    const remaining = Number((invoice.totalAmount - invoice.paidAmount).toFixed(2));
    const studentName = `${invoice.student.firstName} ${invoice.student.lastName}`;
    const dueDateStr = new Date(invoice.dueDate).toLocaleDateString('tr-TR');

    await this.notificationsService.notifyStudentParents(tenantId, invoice.studentId, {
      title: '🔔 Aidat Ödeme Hatırlatması',
      body: `${studentName} için ${invoice.period} dönemi aidat bakiyesi ₺${remaining.toLocaleString('tr-TR')}. Son ödeme tarihi: ${dueDateStr}.`,
      type: 'SYSTEM',
      data: {
        invoiceId: invoice.id,
        type: 'FINANCE_REMINDER',
        remainingAmount: remaining,
      },
    });

    return {
      success: true,
      message: `${studentName} velisine ödeme hatırlatması başarıyla iletildi.`,
    };
  }
}
