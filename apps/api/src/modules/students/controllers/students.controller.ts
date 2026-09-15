import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import {
  studentCreateSchema,
  studentPassportSchema,
  studentUpdateSchema,
} from '@kidscare/shared-schemas';
import type { StudentPassport } from '@kidscare/shared-types';
import { StudentResponse } from '../dto/student-response.dto';
import { Student } from '../entities/student.entity';
import { StudentsService } from '../services/students.service';

@Controller('students')
@UseGuards(TenantGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  async findAll(@CurrentTenantId() tenantId: string): Promise<StudentResponse[]> {
    const rows = await this.studentsService.findAll(tenantId);
    return rows.map((r) => this.toResponse(r));
  }

  @Get(':id')
  async findOne(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ): Promise<StudentResponse> {
    const row = await this.studentsService.findOne(tenantId, id);
    return this.toResponse(row);
  }

  @Get(':id/passport')
  async getPassport(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ): Promise<StudentPassport> {
    return this.studentsService.getPassport(tenantId, id);
  }

  @Put(':id/passport')
  @HttpCode(200)
  async updatePassport(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<StudentPassport> {
    const parsed = studentPassportSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid passport payload',
        issues: parsed.error.issues,
      });
    }
    return this.studentsService.updatePassport(tenantId, id, parsed.data);
  }

  @Post()
  @HttpCode(201)
  async create(
    @CurrentTenantId() tenantId: string,
    @Body() body: unknown,
  ): Promise<StudentResponse> {
    const parsed = studentCreateSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid student payload',
        issues: parsed.error.issues,
      });
    }
    const created = await this.studentsService.create(tenantId, parsed.data);
    return this.toResponse(created);
  }

  @Patch(':id')
  async update(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<StudentResponse> {
    const parsed = studentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid update payload',
        issues: parsed.error.issues,
      });
    }
    // Strip undefined keys — Prisma's StudentUpdateInput (with
    // exactOptionalPropertyTypes) rejects explicit `undefined`.
    const data = Object.fromEntries(
      Object.entries(parsed.data).filter(([, v]) => v !== undefined),
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
