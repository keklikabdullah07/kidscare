import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

export type PickupContactRow = Prisma.PickupContactGetPayload<{
  select: {
    id: true;
    tenantId: true;
    studentId: true;
    fullName: true;
    relation: true;
    phone: true;
    identityNote: true;
    isActive: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

export type PickupAuthorizationRow = Prisma.PickupAuthorizationGetPayload<{
  select: {
    id: true;
    tenantId: true;
    studentId: true;
    pickupContactId: true;
    requestedById: true;
    reviewedById: true;
    status: true;
    validFrom: true;
    validUntil: true;
    note: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

export type PickupEventRow = Prisma.PickupEventGetPayload<{
  select: {
    id: true;
    tenantId: true;
    studentId: true;
    pickupContactId: true;
    authorizationId: true;
    pickupPersonName: true;
    pickupPersonPhone: true;
    verificationMethod: true;
    verifiedByUserId: true;
    occurredAt: true;
    note: true;
  };
}>;

const CONTACT_SELECT = {
  id: true,
  tenantId: true,
  studentId: true,
  fullName: true,
  relation: true,
  phone: true,
  identityNote: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const AUTH_SELECT = {
  id: true,
  tenantId: true,
  studentId: true,
  pickupContactId: true,
  requestedById: true,
  reviewedById: true,
  status: true,
  validFrom: true,
  validUntil: true,
  note: true,
  createdAt: true,
  updatedAt: true,
} as const;

const EVENT_SELECT = {
  id: true,
  tenantId: true,
  studentId: true,
  pickupContactId: true,
  authorizationId: true,
  pickupPersonName: true,
  pickupPersonPhone: true,
  verificationMethod: true,
  verifiedByUserId: true,
  occurredAt: true,
  note: true,
} as const;

export interface IPickupRepository {
  listContacts(tenantId: string, studentId: string): Promise<PickupContactRow[]>;
  createContact(
    tenantId: string,
    data: Omit<Prisma.PickupContactUncheckedCreateInput, 'tenantId'>,
  ): Promise<PickupContactRow>;
  updateContact(
    tenantId: string,
    id: string,
    data: Prisma.PickupContactUpdateInput,
  ): Promise<PickupContactRow>;
  deleteContact(tenantId: string, id: string): Promise<void>;
  findContact(tenantId: string, id: string): Promise<PickupContactRow | null>;

  listAuthorizations(
    tenantId: string,
    filters?: { studentId?: string; status?: Prisma.PickupAuthorizationWhereInput['status'] },
  ): Promise<PickupAuthorizationRow[]>;
  createAuthorization(
    tenantId: string,
    data: Omit<Prisma.PickupAuthorizationUncheckedCreateInput, 'tenantId'>,
  ): Promise<PickupAuthorizationRow>;
  reviewAuthorization(
    tenantId: string,
    id: string,
    data: Prisma.PickupAuthorizationUpdateInput,
  ): Promise<PickupAuthorizationRow>;
  findAuthorization(tenantId: string, id: string): Promise<PickupAuthorizationRow | null>;

  listEvents(
    tenantId: string,
    filters?: { studentId?: string; from?: Date; to?: Date },
  ): Promise<PickupEventRow[]>;
  createEvent(
    tenantId: string,
    data: Omit<Prisma.PickupEventUncheckedCreateInput, 'tenantId'>,
  ): Promise<PickupEventRow>;
}

@Injectable()
export class PickupRepository implements IPickupRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listContacts(tenantId: string, studentId: string): Promise<PickupContactRow[]> {
    return this.prisma.withTenant((client) =>
      client.pickupContact.findMany({
        where: { tenantId, studentId },
        select: CONTACT_SELECT,
        orderBy: [{ isActive: 'desc' }, { fullName: 'asc' }],
      }),
    );
  }

  async createContact(
    tenantId: string,
    data: Omit<Prisma.PickupContactUncheckedCreateInput, 'tenantId'>,
  ): Promise<PickupContactRow> {
    return this.prisma.withTenant((client) =>
      client.pickupContact.create({
        data: { ...data, tenantId },
        select: CONTACT_SELECT,
      }),
    );
  }

  async updateContact(
    tenantId: string,
    id: string,
    data: Prisma.PickupContactUpdateInput,
  ): Promise<PickupContactRow> {
    return this.prisma.withTenant(async (client) => {
      const existing = await client.pickupContact.findFirst({
        where: { tenantId, id },
        select: { id: true },
      });
      if (!existing) throw new Error('PickupContact not found');
      return client.pickupContact.update({
        where: { id: existing.id },
        data,
        select: CONTACT_SELECT,
      });
    });
  }

  async deleteContact(tenantId: string, id: string): Promise<void> {
    await this.prisma.withTenant(async (client) => {
      const existing = await client.pickupContact.findFirst({
        where: { tenantId, id },
        select: { id: true },
      });
      if (!existing) return;
      await client.pickupContact.delete({ where: { id: existing.id } });
    });
  }

  async findContact(tenantId: string, id: string): Promise<PickupContactRow | null> {
    return this.prisma.withTenant((client) =>
      client.pickupContact.findFirst({ where: { tenantId, id }, select: CONTACT_SELECT }),
    );
  }

  async listAuthorizations(
    tenantId: string,
    filters?: { studentId?: string; status?: Prisma.PickupAuthorizationWhereInput['status'] },
  ): Promise<PickupAuthorizationRow[]> {
    return this.prisma.withTenant((client) =>
      client.pickupAuthorization.findMany({
        where: {
          tenantId,
          ...(filters?.studentId ? { studentId: filters.studentId } : {}),
          ...(filters?.status ? { status: filters.status } : {}),
        },
        select: AUTH_SELECT,
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async createAuthorization(
    tenantId: string,
    data: Omit<Prisma.PickupAuthorizationUncheckedCreateInput, 'tenantId'>,
  ): Promise<PickupAuthorizationRow> {
    return this.prisma.withTenant((client) =>
      client.pickupAuthorization.create({
        data: { ...data, tenantId },
        select: AUTH_SELECT,
      }),
    );
  }

  async reviewAuthorization(
    tenantId: string,
    id: string,
    data: Prisma.PickupAuthorizationUpdateInput,
  ): Promise<PickupAuthorizationRow> {
    return this.prisma.withTenant(async (client) => {
      const existing = await client.pickupAuthorization.findFirst({
        where: { tenantId, id },
        select: { id: true },
      });
      if (!existing) throw new Error('PickupAuthorization not found');
      return client.pickupAuthorization.update({
        where: { id: existing.id },
        data,
        select: AUTH_SELECT,
      });
    });
  }

  async findAuthorization(tenantId: string, id: string): Promise<PickupAuthorizationRow | null> {
    return this.prisma.withTenant((client) =>
      client.pickupAuthorization.findFirst({ where: { tenantId, id }, select: AUTH_SELECT }),
    );
  }

  async listEvents(
    tenantId: string,
    filters?: { studentId?: string; from?: Date; to?: Date },
  ): Promise<PickupEventRow[]> {
    return this.prisma.withTenant((client) =>
      client.pickupEvent.findMany({
        where: {
          tenantId,
          ...(filters?.studentId ? { studentId: filters.studentId } : {}),
          ...(filters?.from || filters?.to
            ? {
                occurredAt: {
                  ...(filters.from ? { gte: filters.from } : {}),
                  ...(filters.to ? { lte: filters.to } : {}),
                },
              }
            : {}),
        },
        select: EVENT_SELECT,
        orderBy: { occurredAt: 'desc' },
      }),
    );
  }

  async createEvent(
    tenantId: string,
    data: Omit<Prisma.PickupEventUncheckedCreateInput, 'tenantId'>,
  ): Promise<PickupEventRow> {
    return this.prisma.withTenant((client) =>
      client.pickupEvent.create({
        data: { ...data, tenantId },
        select: EVENT_SELECT,
      }),
    );
  }
}
