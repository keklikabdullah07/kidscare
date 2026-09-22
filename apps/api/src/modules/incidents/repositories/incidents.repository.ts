import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

export type IncidentRow = Prisma.IncidentRecordGetPayload<{
  select: {
    id: true;
    tenantId: true;
    studentId: true;
    category: true;
    occurredAt: true;
    description: true;
    actionTaken: true;
    parentNotified: true;
    parentNotifiedAt: true;
    parentNotifiedById: true;
    reportedById: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

const INCIDENT_SELECT = {
  id: true,
  tenantId: true,
  studentId: true,
  category: true,
  occurredAt: true,
  description: true,
  actionTaken: true,
  parentNotified: true,
  parentNotifiedAt: true,
  parentNotifiedById: true,
  reportedById: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface IIncidentsRepository {
  list(
    tenantId: string,
    filters?: { studentId?: string; category?: Prisma.IncidentRecordWhereInput['category']; from?: Date; to?: Date },
  ): Promise<IncidentRow[]>;
  find(tenantId: string, id: string): Promise<IncidentRow | null>;
  create(
    tenantId: string,
    data: Omit<Prisma.IncidentRecordUncheckedCreateInput, 'tenantId'>,
  ): Promise<IncidentRow>;
  update(
    tenantId: string,
    id: string,
    data: Prisma.IncidentRecordUpdateInput,
  ): Promise<IncidentRow>;
}

@Injectable()
export class IncidentsRepository implements IIncidentsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(
    tenantId: string,
    filters?: { studentId?: string; category?: Prisma.IncidentRecordWhereInput['category']; from?: Date; to?: Date },
  ): Promise<IncidentRow[]> {
    return this.prisma.withTenant((client) =>
      client.incidentRecord.findMany({
        where: {
          tenantId,
          ...(filters?.studentId ? { studentId: filters.studentId } : {}),
          ...(filters?.category ? { category: filters.category } : {}),
          ...(filters?.from || filters?.to
            ? {
                occurredAt: {
                  ...(filters.from ? { gte: filters.from } : {}),
                  ...(filters.to ? { lte: filters.to } : {}),
                },
              }
            : {}),
        },
        select: INCIDENT_SELECT,
        orderBy: { occurredAt: 'desc' },
      }),
    );
  }

  async find(tenantId: string, id: string): Promise<IncidentRow | null> {
    return this.prisma.withTenant((client) =>
      client.incidentRecord.findFirst({ where: { tenantId, id }, select: INCIDENT_SELECT }),
    );
  }

  async create(
    tenantId: string,
    data: Omit<Prisma.IncidentRecordUncheckedCreateInput, 'tenantId'>,
  ): Promise<IncidentRow> {
    return this.prisma.withTenant((client) =>
      client.incidentRecord.create({
        data: { ...data, tenantId },
        select: INCIDENT_SELECT,
      }),
    );
  }

  async update(
    tenantId: string,
    id: string,
    data: Prisma.IncidentRecordUpdateInput,
  ): Promise<IncidentRow> {
    return this.prisma.withTenant(async (client) => {
      const existing = await client.incidentRecord.findFirst({
        where: { tenantId, id },
        select: { id: true },
      });
      if (!existing) throw new Error('IncidentRecord not found');
      return client.incidentRecord.update({
        where: { id: existing.id },
        data,
        select: INCIDENT_SELECT,
      });
    });
  }
}
