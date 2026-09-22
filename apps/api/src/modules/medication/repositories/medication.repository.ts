import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

export type MedicationRecordRow = Prisma.MedicationRecordGetPayload<{
  select: {
    id: true;
    tenantId: true;
    studentId: true;
    medicationName: true;
    dosage: true;
    instructions: true;
    scheduledAt: true;
    givenAt: true;
    status: true;
    requestedById: true;
    approvedById: true;
    administeredById: true;
    parentApprovalNote: true;
    rejectionReason: true;
    skipReason: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

const MEDICATION_SELECT = {
  id: true,
  tenantId: true,
  studentId: true,
  medicationName: true,
  dosage: true,
  instructions: true,
  scheduledAt: true,
  givenAt: true,
  status: true,
  requestedById: true,
  approvedById: true,
  administeredById: true,
  parentApprovalNote: true,
  rejectionReason: true,
  skipReason: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface IMedicationRepository {
  list(
    tenantId: string,
    filters?: {
      studentId?: string;
      status?: Prisma.MedicationRecordWhereInput['status'];
      from?: Date;
      to?: Date;
    },
  ): Promise<MedicationRecordRow[]>;
  find(tenantId: string, id: string): Promise<MedicationRecordRow | null>;
  create(
    tenantId: string,
    data: Omit<Prisma.MedicationRecordUncheckedCreateInput, 'tenantId'>,
  ): Promise<MedicationRecordRow>;
  update(
    tenantId: string,
    id: string,
    data: Prisma.MedicationRecordUpdateInput,
  ): Promise<MedicationRecordRow>;
}

@Injectable()
export class MedicationRepository implements IMedicationRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(
    tenantId: string,
    filters?: {
      studentId?: string;
      status?: Prisma.MedicationRecordWhereInput['status'];
      from?: Date;
      to?: Date;
    },
  ): Promise<MedicationRecordRow[]> {
    return this.prisma.withTenant((client) =>
      client.medicationRecord.findMany({
        where: {
          tenantId,
          ...(filters?.studentId ? { studentId: filters.studentId } : {}),
          ...(filters?.status ? { status: filters.status } : {}),
          ...(filters?.from || filters?.to
            ? {
                scheduledAt: {
                  ...(filters.from ? { gte: filters.from } : {}),
                  ...(filters.to ? { lte: filters.to } : {}),
                },
              }
            : {}),
        },
        select: MEDICATION_SELECT,
        orderBy: [{ status: 'asc' }, { scheduledAt: 'asc' }],
      }),
    );
  }

  async find(tenantId: string, id: string): Promise<MedicationRecordRow | null> {
    return this.prisma.withTenant((client) =>
      client.medicationRecord.findFirst({ where: { tenantId, id }, select: MEDICATION_SELECT }),
    );
  }

  async create(
    tenantId: string,
    data: Omit<Prisma.MedicationRecordUncheckedCreateInput, 'tenantId'>,
  ): Promise<MedicationRecordRow> {
    return this.prisma.withTenant((client) =>
      client.medicationRecord.create({
        data: { ...data, tenantId },
        select: MEDICATION_SELECT,
      }),
    );
  }

  async update(
    tenantId: string,
    id: string,
    data: Prisma.MedicationRecordUpdateInput,
  ): Promise<MedicationRecordRow> {
    return this.prisma.withTenant(async (client) => {
      const existing = await client.medicationRecord.findFirst({
        where: { tenantId, id },
        select: { id: true },
      });
      if (!existing) throw new Error('MedicationRecord not found');
      return client.medicationRecord.update({
        where: { id: existing.id },
        data,
        select: MEDICATION_SELECT,
      });
    });
  }
}
