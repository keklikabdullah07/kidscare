import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import {
  attendanceUpdateInputSchema,
  checkInInputSchema,
  checkOutInputSchema,
} from '@kidscare/shared-schemas';
import type { Attendance } from '../entities/attendance.entity';
import { AttendanceResponseDto } from '../dto/attendance-response.dto';
import { AttendanceService } from '../services/attendance.service';

@Controller()
@UseGuards(TenantGuard)
export class AttendanceController {
  constructor(@Inject(AttendanceService) private readonly service: AttendanceService) {}

  @Get('attendance')
  async findByDate(
    @CurrentTenantId() tenantId: string,
    @Query('date') dateQuery?: string,
  ): Promise<AttendanceResponseDto[]> {
    const todayStr = new Date().toISOString().slice(0, 10);
    const dateStr = dateQuery || todayStr;
    const list = await this.service.findByDate(tenantId, dateStr);
    return list.map((a) => this.toResponse(a));
  }

  @Get('students/:studentId/attendance/:date')
  async findByStudentAndDate(
    @CurrentTenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Param('date') date: string,
  ): Promise<AttendanceResponseDto | null> {
    const item = await this.service.findByStudentAndDate(tenantId, studentId, date);
    return item ? this.toResponse(item) : null;
  }

  @Post('students/:studentId/attendance/:date/check-in')
  @HttpCode(200)
  async checkIn(
    @CurrentTenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Param('date') date: string,
    @Body() body: unknown,
  ): Promise<AttendanceResponseDto> {
    const parsed = checkInInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid check-in payload',
        issues: parsed.error.issues,
      });
    }
    const saved = await this.service.checkIn(tenantId, studentId, date, parsed.data);
    return this.toResponse(saved);
  }

  @Post('students/:studentId/attendance/:date/check-out')
  @HttpCode(200)
  async checkOut(
    @CurrentTenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Param('date') date: string,
    @Body() body: unknown,
  ): Promise<AttendanceResponseDto> {
    const parsed = checkOutInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid check-out payload',
        issues: parsed.error.issues,
      });
    }
    const saved = await this.service.checkOut(tenantId, studentId, date, parsed.data);
    return this.toResponse(saved);
  }

  @Put('students/:studentId/attendance/:date')
  @HttpCode(200)
  async update(
    @CurrentTenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Param('date') date: string,
    @Body() body: unknown,
  ): Promise<AttendanceResponseDto> {
    const parsed = attendanceUpdateInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid attendance update payload',
        issues: parsed.error.issues,
      });
    }
    const saved = await this.service.update(tenantId, studentId, date, parsed.data);
    return this.toResponse(saved);
  }

  private toResponse(entity: Attendance): AttendanceResponseDto {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      studentId: entity.studentId,
      date: entity.date,
      status: entity.status,
      checkInTime: entity.checkInTime,
      checkInBy: entity.checkInBy,
      checkOutTime: entity.checkOutTime,
      checkOutBy: entity.checkOutBy,
      pickupContactId: entity.pickupContactId,
      pickupNote: entity.pickupNote,
      note: entity.note,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
