import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IncidentRecordCreate, IncidentRecordUpdate } from '@kidscare/shared-schemas';
import type { IncidentCategory, IncidentRecord } from '@kidscare/shared-types';
import type { CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { PrismaService } from '../../../prisma/prisma.service';
import type { IIncidentsRepository, IncidentRow } from '../repositories/incidents.repository';

@Injectable()
export class IncidentsService {
  constructor(
    @Inject('IIncidentsRepository')
    private readonly repo: IIncidentsRepository,
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async list(
    tenantId: string,
    filters?: {
      studentId?: string;
      studentIds?: string[];
      category?: IncidentCategory;
      from?: Date;
      to?: Date;
    },
    user?: CurrentUserPayload,
  ): Promise<IncidentRecord[]> {
    const activeFilters = { ...filters };

    // Veli (PARENT) rolü için sadece kendi çocuklarının olayları (Madde 19)
    if (user?.role === 'PARENT') {
      const children = await this.prisma.withTenant((client) =>
        client.student.findMany({
          where: { tenantId, parentId: user.userId, deletedAt: null },
          select: { id: true },
        }),
      );
      const childIds = children.map((c) => c.id);
      if (childIds.length === 0) return [];

      if (activeFilters.studentId) {
        if (!childIds.includes(activeFilters.studentId)) return [];
      } else {
        activeFilters.studentIds = childIds;
      }
    }

    const rows = await this.repo.list(tenantId, activeFilters);
    return rows.map((row) => this.toResponse(row));
  }

  async create(
    tenantId: string,
    reportedById: string,
    input: IncidentRecordCreate,
  ): Promise<IncidentRecord> {
    const row = await this.repo.create(tenantId, {
      studentId: input.studentId,
      category: input.category,
      occurredAt: input.occurredAt,
      description: input.description,
      actionTaken: input.actionTaken ?? null,
      parentNotified: input.parentNotified ?? false,
      reportedById,
    });
    return this.toResponse(row);
  }

  async update(
    tenantId: string,
    id: string,
    notifierUserId: string,
    input: IncidentRecordUpdate,
  ): Promise<IncidentRecord> {
    const existing = await this.repo.find(tenantId, id);
    if (!existing) throw new NotFoundException('IncidentRecord not found');
    const data: Parameters<IIncidentsRepository['update']>[2] = {
      ...(input.actionTaken !== undefined ? { actionTaken: input.actionTaken } : {}),
    };
    if (input.parentNotified !== undefined) {
      data.parentNotified = input.parentNotified;
      data.parentNotifiedAt = input.parentNotified ? new Date() : null;
      if (input.parentNotified) {
        data.parentNotifiedBy = { connect: { id: notifierUserId } };
      }
    }
    const row = await this.repo.update(tenantId, id, data);
    return this.toResponse(row);
  }

  private toResponse(row: IncidentRow): IncidentRecord {
    return {
      id: row.id,
      tenantId: row.tenantId,
      studentId: row.studentId,
      category: row.category,
      occurredAt: row.occurredAt.toISOString(),
      description: row.description,
      actionTaken: row.actionTaken,
      parentNotified: row.parentNotified,
      parentNotifiedAt: row.parentNotifiedAt ? row.parentNotifiedAt.toISOString() : null,
      parentNotifiedById: row.parentNotifiedById,
      reportedById: row.reportedById,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
