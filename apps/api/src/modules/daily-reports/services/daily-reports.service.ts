import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '@kidscare/database';
import type { BulkDailyReportItem, DailyReportInput } from '@kidscare/shared-schemas';
import { DailyReport } from '../entities/daily-report.entity';
import type { IDailyReportsRepository } from '../repositories/daily-reports.repository';

@Injectable()
export class DailyReportsService {
  constructor(
    @Inject('IDailyReportsRepository')
    private readonly repo: IDailyReportsRepository,
  ) {}

  async findByDate(tenantId: string, dateStr: string): Promise<DailyReport[]> {
    const date = new Date(dateStr);
    const rows = await this.repo.findByDate(tenantId, date);
    return rows.map((row) => DailyReport.fromPrisma(row));
  }

  async findByStudentAndDate(
    tenantId: string,
    studentId: string,
    dateStr: string,
  ): Promise<DailyReport | null> {
    const date = new Date(dateStr);
    const row = await this.repo.findByStudentAndDate(tenantId, studentId, date);
    return row ? DailyReport.fromPrisma(row) : null;
  }

  async saveReport(
    tenantId: string,
    studentId: string,
    dateStr: string,
    input: DailyReportInput,
  ): Promise<DailyReport> {
    const date = new Date(dateStr);
    const updateData = this.toUpdateData(input);
    const saved = await this.repo.upsert(tenantId, studentId, date, updateData);
    return DailyReport.fromPrisma(saved);
  }

  async bulkSaveReports(
    tenantId: string,
    dateStr: string,
    items: BulkDailyReportItem[],
  ): Promise<DailyReport[]> {
    const date = new Date(dateStr);
    const bulkItems = items.map((item) => ({
      studentId: item.studentId,
      data: this.toUpdateData(item),
    }));
    const rows = await this.repo.bulkUpsert(tenantId, date, bulkItems);
    return rows.map((row) => DailyReport.fromPrisma(row));
  }

  private toUpdateData(input: DailyReportInput): Prisma.DailyReportUpdateInput {
    const updateData: Prisma.DailyReportUpdateInput = {};
    if (input.mood !== undefined) updateData.mood = input.mood;
    if (input.meals !== undefined) updateData.meals = input.meals;
    if (input.naps !== undefined) updateData.naps = input.naps;
    if (input.potty !== undefined) updateData.potty = input.potty;
    if (input.activities !== undefined) updateData.activities = input.activities;
    if (input.medications !== undefined) updateData.medications = input.medications;
    if (input.teacherNote !== undefined) updateData.teacherNote = input.teacherNote;
    return updateData;
  }
}
