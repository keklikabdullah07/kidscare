import { Inject, Injectable } from '@nestjs/common';
import type { DailyReport as PrismaDailyReport, Prisma } from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

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
    const createData: Prisma.DailyReportUncheckedCreateInput = {
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
}
