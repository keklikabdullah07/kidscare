import { FinanceController } from './finance.controller';
import type { FinanceService } from '../services/finance.service';
import type { CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import type { InvoiceWithDetails, PlanWithStudent } from '../repositories/finance.repository';
import type { FinanceSummaryStats } from '@kidscare/shared-types';

describe('FinanceController', () => {
  let controller: FinanceController;
  let service: jest.Mocked<FinanceService>;

  beforeEach(() => {
    service = {
      getStats: jest.fn(),
      listInvoices: jest.fn(),
      createInvoice: jest.fn(),
      recordPayment: jest.fn(),
      listBillingPlans: jest.fn(),
      saveBillingPlan: jest.fn(),
      sendPaymentReminder: jest.fn(),
      getMyChildBilling: jest.fn(),
    } as unknown as jest.Mocked<FinanceService>;

    controller = new FinanceController(service);
  });

  describe('getStats', () => {
    it('returns finance KPI stats', async () => {
      const stats: FinanceSummaryStats = {
        expectedTotal: 100000,
        collectedTotal: 80000,
        overdueTotal: 20000,
        collectionRate: 80,
        activePlansCount: 20,
        overdueInvoicesCount: 2,
      };
      service.getStats.mockResolvedValue(stats);

      const res = await controller.getStats('t-1', '2026-10');
      expect(res.expectedTotal).toBe(100000);
      expect(service.getStats).toHaveBeenCalledWith('t-1', '2026-10');
    });
  });

  describe('listInvoices', () => {
    it('returns filtered invoices', async () => {
      service.listInvoices.mockResolvedValue([
        { id: 'inv-1', totalAmount: 15000 } as unknown as InvoiceWithDetails,
      ]);

      const res = await controller.listInvoices('t-1', undefined, undefined, 'PENDING');
      expect(res).toHaveLength(1);
      expect(service.listInvoices).toHaveBeenCalledWith(
        't-1',
        expect.objectContaining({ status: 'PENDING' }),
      );
    });
  });

  describe('createInvoice', () => {
    it('creates a new billing invoice', async () => {
      service.createInvoice.mockResolvedValue({
        id: 'inv-1',
        totalAmount: 15000,
      } as unknown as InvoiceWithDetails);

      const res = await controller.createInvoice('t-1', {
        studentId: 's-1',
        period: '2026-10',
        totalAmount: 15000,
        dueDate: '2026-10-05T00:00:00Z',
      });
      expect(res.id).toBe('inv-1');
      expect(service.createInvoice).toHaveBeenCalledWith('t-1', expect.anything());
    });
  });

  describe('recordPayment', () => {
    it('records payment transaction and updates invoice', async () => {
      service.recordPayment.mockResolvedValue({
        id: 'inv-1',
        paidAmount: 15000,
        status: 'PAID',
      } as unknown as InvoiceWithDetails);

      const user: CurrentUserPayload = {
        userId: 'admin-1',
        role: 'ADMIN',
        tenantId: 't-1',
      };

      const res = await controller.recordPayment('t-1', user, {
        invoiceId: 'inv-1',
        amount: 15000,
        method: 'BANK_TRANSFER',
      });
      expect(res.status).toBe('PAID');
      expect(service.recordPayment).toHaveBeenCalledWith(
        't-1',
        'admin-1',
        expect.objectContaining({ amount: 15000 }),
      );
    });
  });

  describe('saveBillingPlan', () => {
    it('creates or updates student billing plan', async () => {
      service.saveBillingPlan.mockResolvedValue({
        id: 'plan-1',
        tuitionAmount: 12000,
      } as unknown as PlanWithStudent);

      const res = await controller.saveBillingPlan('t-1', {
        studentId: 's-1',
        tuitionAmount: 12000,
      });
      expect(res.tuitionAmount).toBe(12000);
      expect(service.saveBillingPlan).toHaveBeenCalledWith('t-1', expect.anything());
    });
  });

  describe('sendReminder', () => {
    it('triggers payment reminder notification to parent', async () => {
      service.sendPaymentReminder.mockResolvedValue({
        success: true,
        message: 'Hatırlatma gönderildi',
      });

      const res = await controller.sendReminder('t-1', 'inv-1');
      expect(res.success).toBe(true);
      expect(service.sendPaymentReminder).toHaveBeenCalledWith('t-1', 'inv-1');
    });
  });

  describe('getMyChildBilling', () => {
    it('returns parent child invoices', async () => {
      service.getMyChildBilling.mockResolvedValue([
        { id: 'inv-1', totalAmount: 10000 } as unknown as InvoiceWithDetails,
      ]);

      const user: CurrentUserPayload = {
        userId: 'parent-1',
        role: 'PARENT',
        tenantId: 't-1',
      };

      const res = await controller.getMyChildBilling('t-1', user);
      expect(res).toHaveLength(1);
      expect(service.getMyChildBilling).toHaveBeenCalledWith('t-1', 'parent-1');
    });
  });
});
