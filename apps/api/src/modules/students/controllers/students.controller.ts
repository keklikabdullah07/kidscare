import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Put,
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
  studentCreateSchema,
  studentPassportSchema,
  studentUpdateSchema,
  type StudentCreate,
  type StudentPassportInput,
  type StudentUpdate,
} from '@kidscare/shared-schemas';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import type { StudentPassport } from '@kidscare/shared-types';
import { StudentResponse } from '../dto/student-response.dto';
import { Student } from '../entities/student.entity';
import { StudentsService } from '../services/students.service';

@Controller('students')
@UseGuards(TenantGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
export class StudentsController {
  constructor(@Inject(StudentsService) private readonly studentsService: StudentsService) {}

  @Get()
  async findAll(@CurrentTenantId() tenantId: string): Promise<StudentResponse[]> {
    const rows = await this.studentsService.findAll(tenantId);
    return rows.map((r) => this.toResponse(r));
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<StudentResponse> {
    const row = await this.studentsService.findOne(tenantId, id);
    assertStudentVisibleToUser(row, user.role, user.userId);
    return this.toResponse(row);
  }

  @Get(':id/passport')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async getPassport(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<StudentPassport> {
    const row = await this.studentsService.findOne(tenantId, id);
    assertStudentVisibleToUser(row, user.role, user.userId);
    return this.studentsService.getPassport(tenantId, id);
  }

  @Put(':id/passport')
  @HttpCode(200)
  async updatePassport(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(studentPassportSchema)) body: StudentPassportInput,
  ): Promise<StudentPassport> {
    return this.studentsService.updatePassport(tenantId, id, body);
  }

  @Post()
  @HttpCode(201)
  async create(
    @CurrentTenantId() tenantId: string,
    @Body(new ZodValidationPipe(studentCreateSchema)) body: StudentCreate,
  ): Promise<StudentResponse> {
    const created = await this.studentsService.create(tenantId, body);
    return this.toResponse(created);
  }

  @Patch(':id')
  async update(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(studentUpdateSchema)) body: StudentUpdate,
  ): Promise<StudentResponse> {
    // Strip undefined keys — Prisma's StudentUpdateInput (with
    // exactOptionalPropertyTypes) rejects explicit `undefined`.
    const data = Object.fromEntries(
      Object.entries(body).filter(([, v]) => v !== undefined),
    ) as Parameters<StudentsService['update']>[2];
    const updated = await this.studentsService.update(tenantId, id, data);
    return this.toResponse(updated);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ): Promise<StudentResponse> {
    const removed = await this.studentsService.remove(tenantId, id);
    return this.toResponse(removed);
  }

  private toResponse(s: Student): StudentResponse {
    return {
      id: s.id,
      tenantId: s.tenantId,
      parentId: s.parentId,
      firstName: s.firstName,
      lastName: s.lastName,
      dateOfBirth: s.dateOfBirth.toISOString().slice(0, 10),
      gender: s.gender,
      notes: s.notes,
      passport: s.passport,
      isActive: s.isActive,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      deletedAt: s.deletedAt ? s.deletedAt.toISOString() : null,
    };
  }
}
