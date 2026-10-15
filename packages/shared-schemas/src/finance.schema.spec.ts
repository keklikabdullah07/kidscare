import {
  createBillingPlanInputSchema,
  createInvoiceInputSchema,
  recordPaymentInputSchema,
} from './finance.schema';

describe('Finance Schemas', () => {
  describe('createBillingPlanInputSchema', () => {
    it('validates a valid billing plan payload with defaults', () => {
      const input = {
        studentId: 'student-123',
        tuitionAmount: 15000,
      };

      const parsed = createBillingPlanInputSchema.parse(input);
      expect(parsed.studentId).toBe('student-123');
      expect(parsed.tuitionAmount).toBe(15000);
      expect(parsed.serviceAmount).toBe(0);
      expect(parsed.activityAmount).toBe(0);
      expect(parsed.discountPercent).toBe(0);
      expect(parsed.dueDayOfMonth).toBe(5);
      expect(parsed.isActive).toBe(true);
    });

    it('rejects negative tuition amount', () => {
      expect(() =>
        createBillingPlanInputSchema.parse({
          studentId: 'student-123',
          tuitionAmount: -100,
        }),
      ).toThrow();
    });

    it('rejects discount percent greater than 100', () => {
      expect(() =>
        createBillingPlanInputSchema.parse({
          studentId: 'student-123',
          tuitionAmount: 10000,
          discountPercent: 120,
        }),
      ).toThrow();
    });
  });

  describe('createInvoiceInputSchema', () => {
    it('validates a valid invoice payload', () => {
      const input = {
        studentId: 'student-123',
        period: '2026-10',
        totalAmount: 15000,
        dueDate: '2026-10-05T00:00:00.000Z',
      };

      const parsed = createInvoiceInputSchema.parse(input);
      expect(parsed.period).toBe('2026-10');
      expect(parsed.totalAmount).toBe(15000);
    });

    it('rejects invalid period format', () => {
      expect(() =>
        createInvoiceInputSchema.parse({
          studentId: 'student-123',
          period: '10-2026',
          totalAmount: 15000,
          dueDate: '2026-10-05T00:00:00.000Z',
        }),
      ).toThrow();
    });
  });

  describe('recordPaymentInputSchema', () => {
    it('validates a valid payment transaction payload', () => {
      const input = {
        invoiceId: 'inv-123',
        amount: 7500,
        method: 'BANK_TRANSFER' as const,
        referenceNo: 'EFT-9921',
      };

      const parsed = recordPaymentInputSchema.parse(input);
      expect(parsed.invoiceId).toBe('inv-123');
      expect(parsed.amount).toBe(7500);
      expect(parsed.method).toBe('BANK_TRANSFER');
    });

    it('rejects zero or negative payment amount', () => {
      expect(() =>
        recordPaymentInputSchema.parse({
          invoiceId: 'inv-123',
          amount: 0,
          method: 'CASH',
        }),
      ).toThrow();
    });
  });
});
