import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { dailyReportInputSchema } from '@kidscare/shared-schemas';
import type { DailyReport } from '../entities/daily-report.entity';
import { DailyReportResponseDto } from '../dto/daily-report-response.dto';
import { DailyReportsService } from '../services/daily-reports.service';

@Controller()
@UseGuards(TenantGuard)
export class DailyReportsController {
  constructor(private readonly service: DailyReportsService) {}

  @Get('daily-reports')
  async findByDate(
    @CurrentTenantId() tenantId: string,
    @Query('date') dateQuery?: string,
  ): Promise<DailyReportResponseDto[]> {
    const todayStr = new Date().toISOString().slice(0, 10);
    const dateStr = dateQuery || todayStr;
    const reports = await this.service.findByDate(tenantId, dateStr);
    return reports.map((r) => this.toResponse(r));
  }

  @Get('students/:studentId/daily-reports/:date')
  async findByStudentAndDate(
    @CurrentTenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Param('date') date: string,
  ): Promise<DailyReportResponseDto | null> {
    const report = await this.service.findByStudentAndDate(tenantId, studentId, date);
    return report ? this.toResponse(report) : null;
  }

  @Put('students/:studentId/daily-reports/:date')
  @HttpCode(200)
  async saveReport(
    @CurrentTenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Param('date') date: string,
    @Body() body: unknown,
  ): Promise<DailyReportResponseDto> {
    const parsed = dailyReportInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid daily report payload',
        issues: parsed.error.issues,
      });
    }

    const saved = await this.service.saveReport(tenantId, studentId, date, parsed.data);
    return this.toResponse(saved);
  }

  private toResponse(entity: DailyReport): DailyReportResponseDto {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      studentId: entity.studentId,
      date: entity.date,
      mood: entity.mood,
      meals: entity.meals,
      naps: entity.naps,
      potty: entity.potty,
      activities: entity.activities,
      medications: entity.medications,
      teacherNote: entity.teacherNote,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
