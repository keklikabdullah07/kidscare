import { Inject, Injectable } from '@nestjs/common';
import type { DailyReport as PrismaDailyReport, Prisma } from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

export type BulkDailyReportUpsertItem = {
  studentId: string;
  data: Prisma.DailyReportUpdateInput;
};

export interface IDailyReportsRepository {
  findByStudentAndDate(
    tenantId: string,
    studentId: string,
    date: Date,
  ): Promise<PrismaDailyReport | null>;
  findByDate(tenantId: string, date: Date): Promise<PrismaDailyReport[]>;
  upsert(
    tenantId: string,
    studentId: string,
    date: Date,
    data: Prisma.DailyReportUpdateInput,
  ): Promise<PrismaDailyReport>;
  bulkUpsert(
    tenantId: string,
    date: Date,
    items: BulkDailyReportUpsertItem[],
  ): Promise<PrismaDailyReport[]>;
}

@Injectable()
export class DailyReportsRepository implements IDailyReportsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findByStudentAndDate(
    tenantId: string,
    studentId: string,
    date: Date,
  ): Promise<PrismaDailyReport | null> {
    return this.prisma.withTenant((client) =>
      client.dailyReport.findUnique({
        where: {
          tenantId_studentId_date: {
            tenantId,
            studentId,
            date,
          },
        },
      }),
    );
  }

  async findByDate(tenantId: string, date: Date): Promise<PrismaDailyReport[]> {
    return this.prisma.withTenant((client) =>
      client.dailyReport.findMany({
        where: {
          tenantId,
          date,
        },
        orderBy: { createdAt: 'asc' },
      }),
    );
  }

  async upsert(
    tenantId: string,
    studentId: string,
    date: Date,
    data: Prisma.DailyReportUpdateInput,
  ): Promise<PrismaDailyReport> {
    const createData = this.buildCreateData(tenantId, studentId, date, data);

    return this.prisma.withTenant((client) =>
      client.dailyReport.upsert({
        where: {
          tenantId_studentId_date: {
            tenantId,
            studentId,
            date,
          },
        },
        create: createData,
        update: data,
      }),
    );
  }

  async bulkUpsert(
    tenantId: string,
    date: Date,
    items: BulkDailyReportUpsertItem[],
  ): Promise<PrismaDailyReport[]> {
    return this.prisma.withTenant(async (client) => {
      const results: PrismaDailyReport[] = [];
      for (const item of items) {
        const createData = this.buildCreateData(tenantId, item.studentId, date, item.data);
        const row = await client.dailyReport.upsert({
          where: {
            tenantId_studentId_date: {
              tenantId,
              studentId: item.studentId,
              date,
            },
          },
          create: createData,
          update: item.data,
        });
        results.push(row);
      }
      return results;
    });
  }

  private buildCreateData(
    tenantId: string,
    studentId: string,
    date: Date,
    data: Prisma.DailyReportUpdateInput,
  ): Prisma.DailyReportUncheckedCreateInput {
    return {
      tenantId,
      studentId,
      date,
      mood: typeof data.mood === 'string' ? data.mood : null,
      meals: data.meals as Prisma.InputJsonValue,
      naps: data.naps as Prisma.InputJsonValue,
      potty: data.potty as Prisma.InputJsonValue,
      activities: data.activities as Prisma.InputJsonValue,
      medications: data.medications as Prisma.InputJsonValue,
      teacherNote: typeof data.teacherNote === 'string' ? data.teacherNote : null,
    };
  }
}
