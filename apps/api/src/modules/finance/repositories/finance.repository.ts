import { Inject, Injectable } from '@nestjs/common';
import type { InvoiceStatus, PaymentMethod, Prisma } from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

export type InvoiceWithDetails = Prisma.BillingInvoiceGetPayload<{
  include: {
    student: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        classroom: { select: { id: true; name: true } };
        parent: { select: { id: true; email: true } };
      };
    };
    payments: {
      include: {
        recordedBy: { select: { id: true; email: true } };
      };
    };
  };
}>;

export type PlanWithStudent = Prisma.StudentBillingPlanGetPayload<{
  include: {
    student: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        classroom: { select: { id: true; name: true } };
      };
    };
  };
}>;

@Injectable()
export class FinanceRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getStats(
    tenantId: string,
    period: string,
  ): Promise<{
    expectedTotal: number;
    collectedTotal: number;
    overdueTotal: number;
    collectionRate: number;
    activePlansCount: number;
    overdueInvoicesCount: number;
  }> {
    return this.prisma.withTenant(async (client) => {
      const activePlansCount = await client.studentBillingPlan.count({
        where: { tenantId, isActive: true },
      });

      const invoices = await client.billingInvoice.findMany({
        where: { tenantId, period },
        select: {
          totalAmount: true,
          paidAmount: true,
          status: true,
        },
      });

      let expectedTotal = 0;
      let collectedTotal = 0;

      for (const inv of invoices) {
        expectedTotal += inv.totalAmount;
        collectedTotal += inv.paidAmount;
      }

      const overdueInvoices = await client.billingInvoice.findMany({
        where: {
          tenantId,
          status: { in: ['OVERDUE', 'PENDING', 'PARTIALLY_PAID'] },
          dueDate: { lt: new Date() },
        },
        select: {
          totalAmount: true,
          paidAmount: true,
        },
      });

      let overdueTotal = 0;
      for (const inv of overdueInvoices) {
        overdueTotal += Math.max(0, inv.totalAmount - inv.paidAmount);
      }

      const collectionRate =
        expectedTotal > 0 ? Number(((collectedTotal / expectedTotal) * 100).toFixed(1)) : 0;

      return {
        expectedTotal: Number(expectedTotal.toFixed(2)),
        collectedTotal: Number(collectedTotal.toFixed(2)),
        overdueTotal: Number(overdueTotal.toFixed(2)),
        collectionRate,
        activePlansCount,
        overdueInvoicesCount: overdueInvoices.length,
      };
    });
  }

  async findInvoices(
    tenantId: string,
    filters?: {
      studentId?: string | undefined;
      classroomId?: string | undefined;
      status?: InvoiceStatus | undefined;
      period?: string | undefined;
    },
  ): Promise<InvoiceWithDetails[]> {
    return this.prisma.withTenant((client) => {
      const where: Prisma.BillingInvoiceWhereInput = { tenantId };

      if (filters?.studentId) {
        where.studentId = filters.studentId;
      }
      if (filters?.period) {
        where.period = filters.period;
      }
      if (filters?.status) {
        where.status = filters.status;
      }
      if (filters?.classroomId) {
        where.student = {
          classroomId: filters.classroomId,
        };
      }

      return client.billingInvoice.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              classroom: { select: { id: true, name: true } },
              parent: { select: { id: true, email: true } },
            },
          },
          payments: {
            include: {
              recordedBy: { select: { id: true, email: true } },
            },
            orderBy: { paidAt: 'desc' },
          },
        },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      });
    });
  }

  async findInvoiceById(tenantId: string, id: string): Promise<InvoiceWithDetails | null> {
    return this.prisma.withTenant((client) =>
      client.billingInvoice.findFirst({
        where: { id, tenantId },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              classroom: { select: { id: true, name: true } },
              parent: { select: { id: true, email: true } },
            },
          },
          payments: {
            include: {
              recordedBy: { select: { id: true, email: true } },
            },
            orderBy: { paidAt: 'desc' },
          },
        },
      }),
    );
  }

  async createInvoice(
    tenantId: string,
    data: {
      studentId: string;
      period: string;
      totalAmount: number;
      dueDate: Date;
      notes?: string | null | undefined;
    },
  ): Promise<InvoiceWithDetails> {
    return this.prisma.withTenant((client) =>
      client.billingInvoice.create({
        data: {
          tenantId,
          studentId: data.studentId,
          period: data.period,
          totalAmount: data.totalAmount,
          dueDate: data.dueDate,
          notes: data.notes ?? null,
          status: 'PENDING',
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              classroom: { select: { id: true, name: true } },
              parent: { select: { id: true, email: true } },
            },
          },
          payments: {
            include: {
              recordedBy: { select: { id: true, email: true } },
            },
          },
        },
      }),
    );
  }

  async recordPayment(
    tenantId: string,
    invoiceId: string,
    studentId: string,
    recordedByUserId: string,
    data: {
      amount: number;
      method: PaymentMethod;
      referenceNo?: string | null | undefined;
      notes?: string | null | undefined;
      paidAt?: Date | undefined;
    },
  ): Promise<InvoiceWithDetails> {
    return this.prisma.withTenant(async (client) => {
      const invoice = await client.billingInvoice.findFirstOrThrow({
        where: { id: invoiceId, tenantId },
      });

      const newPaidAmount = Number((invoice.paidAmount + data.amount).toFixed(2));
      let newStatus: InvoiceStatus = invoice.status;

      if (newPaidAmount >= invoice.totalAmount) {
        newStatus = 'PAID';
      } else if (newPaidAmount > 0) {
        newStatus = 'PARTIALLY_PAID';
      }

      await client.paymentTransaction.create({
        data: {
          tenantId,
          invoiceId,
          studentId,
          amount: data.amount,
          method: data.method,
          referenceNo: data.referenceNo ?? null,
          notes: data.notes ?? null,
          recordedByUserId,
          paidAt: data.paidAt ?? new Date(),
        },
      });

      return client.billingInvoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              classroom: { select: { id: true, name: true } },
              parent: { select: { id: true, email: true } },
            },
          },
          payments: {
            include: {
              recordedBy: { select: { id: true, email: true } },
            },
            orderBy: { paidAt: 'desc' },
          },
        },
      });
    });
  }

  async findBillingPlans(tenantId: string): Promise<PlanWithStudent[]> {
    return this.prisma.withTenant((client) =>
      client.studentBillingPlan.findMany({
        where: { tenantId },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              classroom: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
      }),
    );
  }

  async findBillingPlanByStudentId(
    tenantId: string,
    studentId: string,
  ): Promise<PlanWithStudent | null> {
    return this.prisma.withTenant((client) =>
      client.studentBillingPlan.findFirst({
        where: { tenantId, studentId },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              classroom: { select: { id: true, name: true } },
            },
          },
        },
      }),
    );
  }

  async saveBillingPlan(
    tenantId: string,
    data: {
      studentId: string;
      tuitionAmount: number;
      serviceAmount?: number | undefined;
      activityAmount?: number | undefined;
      discountPercent?: number | undefined;
      dueDayOfMonth?: number | undefined;
      notes?: string | null | undefined;
      isActive?: boolean | undefined;
    },
  ): Promise<PlanWithStudent> {
    return this.prisma.withTenant(async (client) => {
      const existing = await client.studentBillingPlan.findFirst({
        where: { tenantId, studentId: data.studentId },
      });

      if (existing) {
        return client.studentBillingPlan.update({
          where: { id: existing.id },
          data: {
            tuitionAmount: data.tuitionAmount,
            serviceAmount: data.serviceAmount ?? 0,
            activityAmount: data.activityAmount ?? 0,
            discountPercent: data.discountPercent ?? 0,
            dueDayOfMonth: data.dueDayOfMonth ?? 5,
            notes: data.notes ?? null,
            isActive: data.isActive ?? true,
          },
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                classroom: { select: { id: true, name: true } },
              },
            },
          },
        });
      }

      return client.studentBillingPlan.create({
        data: {
          tenantId,
          studentId: data.studentId,
          tuitionAmount: data.tuitionAmount,
          serviceAmount: data.serviceAmount ?? 0,
          activityAmount: data.activityAmount ?? 0,
          discountPercent: data.discountPercent ?? 0,
          dueDayOfMonth: data.dueDayOfMonth ?? 5,
          notes: data.notes ?? null,
          isActive: data.isActive ?? true,
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              classroom: { select: { id: true, name: true } },
            },
          },
        },
      });
    });
  }

  async findInvoicesForParentUser(
    tenantId: string,
    parentUserId: string,
  ): Promise<InvoiceWithDetails[]> {
    return this.prisma.withTenant((client) =>
      client.billingInvoice.findMany({
        where: {
          tenantId,
          student: {
            parentId: parentUserId,
          },
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              classroom: { select: { id: true, name: true } },
              parent: { select: { id: true, email: true } },
            },
          },
          payments: {
            include: {
              recordedBy: { select: { id: true, email: true } },
            },
            orderBy: { paidAt: 'desc' },
          },
        },
        orderBy: [{ dueDate: 'desc' }, { createdAt: 'desc' }],
      }),
    );
  }
}
