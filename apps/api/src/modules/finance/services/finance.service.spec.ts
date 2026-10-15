import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FinanceService } from './finance.service';
import type { FinanceRepository, InvoiceWithDetails } from '../repositories/finance.repository';
import type { NotificationsService } from '../../notifications/services/notifications.service';

describe('FinanceService', () => {
  let service: FinanceService;
  let repo: jest.Mocked<FinanceRepository>;
  let notificationsService: jest.Mocked<NotificationsService>;

  beforeEach(() => {
    repo = {
      getStats: jest.fn(),
      findInvoices: jest.fn(),
      findInvoiceById: jest.fn(),
      createInvoice: jest.fn(),
      recordPayment: jest.fn(),
      findBillingPlans: jest.fn(),
      saveBillingPlan: jest.fn(),
      findInvoicesForParentUser: jest.fn(),
    } as unknown as jest.Mocked<FinanceRepository>;

    notificationsService = {
      notifyStudentParents: jest.fn(),
    } as unknown as jest.Mocked<NotificationsService>;

    service = new FinanceService(repo, notificationsService);
  });

  describe('recordPayment', () => {
    it('throws NotFoundException if invoice not found', async () => {
      repo.findInvoiceById.mockResolvedValue(null);

      await expect(
        service.recordPayment('t-1', 'admin-1', {
          invoiceId: 'inv-404',
          amount: 5000,
          method: 'CASH',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if payment amount exceeds remaining balance', async () => {
      repo.findInvoiceById.mockResolvedValue({
        id: 'inv-1',
        totalAmount: 10000,
        paidAmount: 8000,
      } as unknown as InvoiceWithDetails);

      await expect(
        service.recordPayment('t-1', 'admin-1', {
          invoiceId: 'inv-1',
          amount: 3000, // remaining is 2000
          method: 'CASH',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('records valid payment within remaining balance', async () => {
      repo.findInvoiceById.mockResolvedValue({
        id: 'inv-1',
        studentId: 'student-1',
        totalAmount: 10000,
        paidAmount: 5000,
      } as unknown as InvoiceWithDetails);

      repo.recordPayment.mockResolvedValue({
        id: 'inv-1',
        paidAmount: 10000,
        status: 'PAID',
      } as unknown as InvoiceWithDetails);

      const res = await service.recordPayment('t-1', 'admin-1', {
        invoiceId: 'inv-1',
        amount: 5000,
        method: 'BANK_TRANSFER',
      });

      expect(res.paidAmount).toBe(10000);
      expect(repo.recordPayment).toHaveBeenCalledWith(
        't-1',
        'inv-1',
        'student-1',
        'admin-1',
        expect.objectContaining({
          amount: 5000,
          method: 'BANK_TRANSFER',
        }),
      );
    });
  });

  describe('sendPaymentReminder', () => {
    it('sends push notification with remaining amount and student info', async () => {
      repo.findInvoiceById.mockResolvedValue({
        id: 'inv-1',
        studentId: 'student-1',
        period: '2026-10',
        totalAmount: 12000,
        paidAmount: 4000,
        dueDate: new Date('2026-10-10'),
        student: {
          id: 'student-1',
          firstName: 'Ali',
          lastName: 'Yılmaz',
        },
      } as unknown as InvoiceWithDetails);

      const res = await service.sendPaymentReminder('t-1', 'inv-1');
      expect(res.success).toBe(true);
      expect(notificationsService.notifyStudentParents).toHaveBeenCalledWith(
        't-1',
        'student-1',
        expect.objectContaining({
          title: '🔔 Aidat Ödeme Hatırlatması',
          data: expect.objectContaining({ remainingAmount: 8000 }),
        }),
      );
    });
  });
});
