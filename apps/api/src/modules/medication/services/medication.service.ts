import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  MedicationRecordApprove,
  MedicationRecordCreate,
  MedicationRecordGiven,
  MedicationRecordReject,
  MedicationRecordSkip,
} from '@kidscare/shared-schemas';
import type { MedicationRecord, MedicationStatus } from '@kidscare/shared-types';
import type {
  IMedicationRepository,
  MedicationRecordRow,
} from '../repositories/medication.repository';

@Injectable()
export class MedicationService {
  constructor(
    @Inject('IMedicationRepository')
    private readonly repo: IMedicationRepository,
  ) {}

  async list(
    tenantId: string,
    filters?: {
      studentId?: string;
      status?: MedicationStatus;
      from?: Date;
      to?: Date;
    },
  ): Promise<MedicationRecord[]> {
    const rows = await this.repo.list(tenantId, filters);
    return rows.map((row) => this.toResponse(row));
  }

  async create(
    tenantId: string,
    requestedById: string,
    input: MedicationRecordCreate,
  ): Promise<MedicationRecord> {
    const row = await this.repo.create(tenantId, {
      studentId: input.studentId,
      medicationName: input.medicationName,
      dosage: input.dosage,
      instructions: input.instructions ?? null,
      scheduledAt: input.scheduledAt ?? null,
      parentApprovalNote: input.parentApprovalNote ?? null,
      requestedById,
      status: 'REQUESTED',
    });
    return this.toResponse(row);
  }

  async approve(
    tenantId: string,
    id: string,
    approvedById: string,
    input: MedicationRecordApprove,
  ): Promise<MedicationRecord> {
    const existing = await this.repo.find(tenantId, id);
    if (!existing) throw new NotFoundException('MedicationRecord not found');
    if (existing.status !== 'REQUESTED') {
      throw new BadRequestException('Sadece REQUESTED durumdaki kayıt onaylanabilir');
    }
    const row = await this.repo.update(tenantId, id, {
      status: 'APPROVED',
      approvedBy: { connect: { id: approvedById } },
      ...(input.note !== undefined ? { parentApprovalNote: input.note } : {}),
    });
    return this.toResponse(row);
  }

  async reject(
    tenantId: string,
    id: string,
    approvedById: string,
    input: MedicationRecordReject,
  ): Promise<MedicationRecord> {
    const existing = await this.repo.find(tenantId, id);
    if (!existing) throw new NotFoundException('MedicationRecord not found');
    if (existing.status !== 'REQUESTED') {
      throw new BadRequestException('Sadece REQUESTED durumdaki kayıt reddedilebilir');
    }
    const row = await this.repo.update(tenantId, id, {
      status: 'REJECTED',
      approvedBy: { connect: { id: approvedById } },
      rejectionReason: input.reason,
    });
    return this.toResponse(row);
  }

  async markGiven(
    tenantId: string,
    id: string,
    administeredById: string,
    input: MedicationRecordGiven,
  ): Promise<MedicationRecord> {
    const existing = await this.repo.find(tenantId, id);
    if (!existing) throw new NotFoundException('MedicationRecord not found');
    if (existing.status !== 'APPROVED' && existing.status !== 'SCHEDULED') {
      throw new ForbiddenException('Onaylanmamış ilaç uygulanamaz');
    }
    const row = await this.repo.update(tenantId, id, {
      status: 'GIVEN',
      administeredBy: { connect: { id: administeredById } },
      givenAt: input.givenAt ?? new Date(),
      ...(input.note !== undefined ? { instructions: input.note } : {}),
    });
    return this.toResponse(row);
  }

  async markSkipped(
    tenantId: string,
    id: string,
    administeredById: string,
    input: MedicationRecordSkip,
  ): Promise<MedicationRecord> {
    const existing = await this.repo.find(tenantId, id);
    if (!existing) throw new NotFoundException('MedicationRecord not found');
    if (existing.status !== 'APPROVED' && existing.status !== 'SCHEDULED') {
      throw new ForbiddenException('Onaylanmamış kayıt atlanamaz');
    }
    const row = await this.repo.update(tenantId, id, {
      status: 'SKIPPED',
      administeredBy: { connect: { id: administeredById } },
      skipReason: input.reason,
    });
    return this.toResponse(row);
  }

  private toResponse(row: MedicationRecordRow): MedicationRecord {
    return {
      id: row.id,
      tenantId: row.tenantId,
      studentId: row.studentId,
      medicationName: row.medicationName,
      dosage: row.dosage,
      instructions: row.instructions,
      scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString() : null,
      givenAt: row.givenAt ? row.givenAt.toISOString() : null,
      status: row.status,
      requestedById: row.requestedById,
      approvedById: row.approvedById,
      administeredById: row.administeredById,
      parentApprovalNote: row.parentApprovalNote,
      rejectionReason: row.rejectionReason,
      skipReason: row.skipReason,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
