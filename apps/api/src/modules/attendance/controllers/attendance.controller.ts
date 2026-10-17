import {
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
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { assertStudentVisibleToUser } from '../../../common/utils/student-access';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import {
  attendanceUpdateInputSchema,
  checkInInputSchema,
  checkOutInputSchema,
  createAttendanceExcuseInputSchema,
  type AttendanceUpdateInput,
  type CheckInInput,
  type CheckOutInput,
  type CreateAttendanceExcuseInput,
} from '@kidscare/shared-schemas';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import type { Attendance } from '../entities/attendance.entity';
import { AttendanceResponseDto } from '../dto/attendance-response.dto';
import { AttendanceService } from '../services/attendance.service';
import { StudentsService } from '../../students/services/students.service';
import type { AttendanceExcuseWithStudent } from '../repositories/attendance.repository';

@Controller()
@UseGuards(TenantGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
export class AttendanceController {
  constructor(
    @Inject(AttendanceService) private readonly service: AttendanceService,
    @Inject(StudentsService) private readonly studentsService: StudentsService,
  ) {}

  @Get('attendance')
  async findByDate(
    @CurrentTenantId() tenantId: string,
    @Query('date') dateQuery?: string,
    @Query('startDate') startDateQuery?: string,
    @Query('endDate') endDateQuery?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ): Promise<AttendanceResponseDto[]> {
    if (startDateQuery && endDateQuery) {
      const list = user
        ? await this.service.findByDateRange(tenantId, startDateQuery, endDateQuery, user)
        : await this.service.findByDateRange(tenantId, startDateQuery, endDateQuery);
      return list.map((a) => this.toResponse(a));
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const dateStr = dateQuery || todayStr;
    const list = user
      ? await this.service.findByDate(tenantId, dateStr, user)
      : await this.service.findByDate(tenantId, dateStr);
    return list.map((a) => this.toResponse(a));
  }

  @Get('students/:studentId/attendance/:date')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async findByStudentAndDate(
    @CurrentTenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Param('date') date: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<AttendanceResponseDto | null> {
    const student = await this.studentsService.findOne(tenantId, studentId);
    let teacherClassroomIds: string[] | undefined;
    if (user.role === 'TEACHER') {
      teacherClassroomIds = await this.studentsService.getTeacherClassroomIds(tenantId, user.userId);
    }
    assertStudentVisibleToUser(student, user.role, user.userId, teacherClassroomIds);
    const item = await this.service.findByStudentAndDate(tenantId, studentId, date);
    return item ? this.toResponse(item) : null;
  }

  @Post('students/:studentId/attendance/:date/check-in')
  @HttpCode(200)
  async checkIn(
    @CurrentTenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Param('date') date: string,
    @Body(new ZodValidationPipe(checkInInputSchema)) body: CheckInInput,
    @CurrentUser() user?: CurrentUserPayload,
  ): Promise<AttendanceResponseDto> {
    if (user) {
      const student = await this.studentsService.findOne(tenantId, studentId);
      let teacherClassroomIds: string[] | undefined;
      if (user.role === 'TEACHER') {
        teacherClassroomIds = await this.studentsService.getTeacherClassroomIds(tenantId, user.userId);
      }
      assertStudentVisibleToUser(student, user.role, user.userId, teacherClassroomIds);
    }
    const saved = await this.service.checkIn(tenantId, studentId, date, body);
    return this.toResponse(saved);
  }

  @Post('students/:studentId/attendance/:date/check-out')
  @HttpCode(200)
  async checkOut(
    @CurrentTenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Param('date') date: string,
    @Body(new ZodValidationPipe(checkOutInputSchema)) body: CheckOutInput,
    @CurrentUser() user?: CurrentUserPayload,
  ): Promise<AttendanceResponseDto> {
    if (user) {
      const student = await this.studentsService.findOne(tenantId, studentId);
      let teacherClassroomIds: string[] | undefined;
      if (user.role === 'TEACHER') {
        teacherClassroomIds = await this.studentsService.getTeacherClassroomIds(tenantId, user.userId);
      }
      assertStudentVisibleToUser(student, user.role, user.userId, teacherClassroomIds);
    }
    const saved = await this.service.checkOut(tenantId, studentId, date, body);
    return this.toResponse(saved);
  }

  @Put('students/:studentId/attendance/:date')
  @HttpCode(200)
  async update(
    @CurrentTenantId() tenantId: string,
    @Param('studentId') studentId: string,
    @Param('date') date: string,
    @Body(new ZodValidationPipe(attendanceUpdateInputSchema)) body: AttendanceUpdateInput,
    @CurrentUser() user?: CurrentUserPayload,
  ): Promise<AttendanceResponseDto> {
    if (user) {
      const student = await this.studentsService.findOne(tenantId, studentId);
      let teacherClassroomIds: string[] | undefined;
      if (user.role === 'TEACHER') {
        teacherClassroomIds = await this.studentsService.getTeacherClassroomIds(tenantId, user.userId);
      }
      assertStudentVisibleToUser(student, user.role, user.userId, teacherClassroomIds);
    }
    const saved = await this.service.update(tenantId, studentId, date, body);
    return this.toResponse(saved);
  }

  @Post('attendance/excuses')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  @HttpCode(201)
  async createExcuse(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(createAttendanceExcuseInputSchema))
    body: CreateAttendanceExcuseInput,
  ): Promise<AttendanceExcuseWithStudent> {
    const student = await this.studentsService.findOne(tenantId, body.studentId);
    let teacherClassroomIds: string[] | undefined;
    if (user.role === 'TEACHER') {
      teacherClassroomIds = await this.studentsService.getTeacherClassroomIds(tenantId, user.userId);
    }
    assertStudentVisibleToUser(student, user.role, user.userId, teacherClassroomIds);
    const excuseInput: { studentId: string; date: string; reason: string; notes?: string } = {
      studentId: body.studentId,
      date: body.date,
      reason: body.reason,
    };
    if (body.notes) excuseInput.notes = body.notes;
    return this.service.createExcuse(tenantId, user.userId, excuseInput);
  }

  @Get('attendance/excuses')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async findExcuses(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Query('date') dateQuery?: string,
    @Query('studentId') studentIdQuery?: string,
  ): Promise<AttendanceExcuseWithStudent[]> {
    let studentIds: string[] | undefined;
    if (user.role === 'PARENT') {
      const parentStudents = await this.studentsService.findByParent(tenantId, user.userId);
      studentIds = parentStudents.map((s) => s.id);
    } else if (user.role === 'TEACHER') {
      const teacherStudents = await this.studentsService.findAll(tenantId, user);
      studentIds = teacherStudents.map((s) => s.id);
    }

    const filterParams: { dateStr?: string; studentId?: string; studentIds?: string[] } = {};
    if (dateQuery) filterParams.dateStr = dateQuery;
    if (studentIdQuery) filterParams.studentId = studentIdQuery;
    if (studentIds && studentIds.length > 0) filterParams.studentIds = studentIds;

    return this.service.findExcuses(tenantId, filterParams);
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
