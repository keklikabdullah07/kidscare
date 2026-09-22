import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { assertStudentVisibleToUser } from '../../../common/utils/student-access';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import {
  bulkDailyReportsInputSchema,
  dailyReportInputSchema,
  type BulkDailyReportsInput,
  type DailyReportInput,
} from '@kidscare/shared-schemas';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import type { DailyReport } from '../entities/daily-report.entity';
import { DailyReportResponseDto } from '../dto/daily-report-response.dto';
import { DailyReportsService } from '../services/daily-reports.service';
import { StudentsService } from '../../students/services/students.service';
import { ClassroomsService } from '../../classrooms/services/classrooms.service';

@Controller()
@UseGuards(TenantGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
export class DailyReportsController {
  constructor(
    @Inject(DailyReportsService) private readonly service: DailyReportsService,
    @Inject(StudentsService) private readonly studentsService: StudentsService,
    @Inject(ClassroomsService) private readonly classroomsService: ClassroomsService,
  ) {}

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
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async findByStudentAndDate(
    @CurrentTenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Param('date') date: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DailyReportResponseDto | null> {
    const student = await this.studentsService.findOne(tenantId, studentId);
    assertStudentVisibleToUser(student, user.role, user.userId);
    const report = await this.service.findByStudentAndDate(tenantId, studentId, date);
    return report ? this.toResponse(report) : null;
  }

  @Put('students/:studentId/daily-reports/:date')
  @HttpCode(200)
  async saveReport(
    @CurrentTenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Param('date') date: string,
    @Body(new ZodValidationPipe(dailyReportInputSchema)) body: DailyReportInput,
  ): Promise<DailyReportResponseDto> {
    const saved = await this.service.saveReport(tenantId, studentId, date, body);
    return this.toResponse(saved);
  }

  @Put('classrooms/:classroomId/daily-reports/bulk')
  @HttpCode(200)
  async bulkSaveReports(
    @CurrentTenantId() tenantId: string,
    @Param('classroomId') classroomId: string,
    @Query('date') dateQuery: string | undefined,
    @Body(new ZodValidationPipe(bulkDailyReportsInputSchema)) body: BulkDailyReportsInput,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DailyReportResponseDto[]> {
    const dateStr = dateQuery ?? new Date().toISOString().slice(0, 10);
    const teacherId = user.role === 'TEACHER' ? user.userId : undefined;
    const classroom = await this.classroomsService.findById(tenantId, classroomId, teacherId);
    if (!classroom) throw new NotFoundException('Classroom not found');
    const saved = await this.service.bulkSaveReports(tenantId, dateStr, body.items);
    return saved.map((row) => this.toResponse(row));
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
