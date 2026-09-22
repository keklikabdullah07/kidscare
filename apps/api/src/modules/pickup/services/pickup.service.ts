import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  PickupAuthorizationCreate,
  PickupAuthorizationReview,
  PickupContactCreate,
  PickupContactUpdate,
  PickupEventCreate,
} from '@kidscare/shared-schemas';
import type {
  PickupAuthorization,
  PickupContact,
  PickupEvent,
} from '@kidscare/shared-types';
import type {
  IPickupRepository,
  PickupAuthorizationRow,
  PickupContactRow,
  PickupEventRow,
} from '../repositories/pickup.repository';

@Injectable()
export class PickupService {
  constructor(
    @Inject('IPickupRepository')
    private readonly repo: IPickupRepository,
  ) {}

  async listContacts(tenantId: string, studentId: string): Promise<PickupContact[]> {
    const rows = await this.repo.listContacts(tenantId, studentId);
    return rows.map((row) => this.contactToResponse(row));
  }

  async createContact(
    tenantId: string,
    input: PickupContactCreate,
  ): Promise<PickupContact> {
    const row = await this.repo.createContact(tenantId, {
      studentId: input.studentId,
      fullName: input.fullName,
      relation: input.relation,
      phone: input.phone,
      identityNote: input.identityNote ?? null,
      isActive: input.isActive ?? true,
    });
    return this.contactToResponse(row);
  }

  async updateContact(
    tenantId: string,
    id: string,
    input: PickupContactUpdate,
  ): Promise<PickupContact> {
    const existing = await this.repo.findContact(tenantId, id);
    if (!existing) throw new NotFoundException('PickupContact not found');
    const row = await this.repo.updateContact(tenantId, id, {
      ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
      ...(input.relation !== undefined ? { relation: input.relation } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.identityNote !== undefined ? { identityNote: input.identityNote } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    });
    return this.contactToResponse(row);
  }

  async deleteContact(tenantId: string, id: string): Promise<void> {
    const existing = await this.repo.findContact(tenantId, id);
    if (!existing) throw new NotFoundException('PickupContact not found');
    await this.repo.deleteContact(tenantId, id);
  }

  async listAuthorizations(
    tenantId: string,
    filters?: { studentId?: string; status?: PickupAuthorization['status'] },
  ): Promise<PickupAuthorization[]> {
    const rows = await this.repo.listAuthorizations(tenantId, filters);
    return rows.map((row) => this.authToResponse(row));
  }

  async createAuthorization(
    tenantId: string,
    requestedById: string,
    input: PickupAuthorizationCreate,
  ): Promise<PickupAuthorization> {
    const row = await this.repo.createAuthorization(tenantId, {
      studentId: input.studentId,
      pickupContactId: input.pickupContactId ?? null,
      requestedById,
      status: 'PENDING',
      validFrom: input.validFrom ?? null,
      validUntil: input.validUntil ?? null,
      note: input.note ?? null,
    });
    return this.authToResponse(row);
  }

  async reviewAuthorization(
    tenantId: string,
    id: string,
    reviewedById: string,
    input: PickupAuthorizationReview,
  ): Promise<PickupAuthorization> {
    const existing = await this.repo.findAuthorization(tenantId, id);
    if (!existing) throw new NotFoundException('PickupAuthorization not found');
    const row = await this.repo.reviewAuthorization(tenantId, id, {
      status: input.status,
      reviewedBy: { connect: { id: reviewedById } },
      ...(input.validFrom !== undefined ? { validFrom: input.validFrom } : {}),
      ...(input.validUntil !== undefined ? { validUntil: input.validUntil } : {}),
      ...(input.note !== undefined ? { note: input.note } : {}),
    });
    return this.authToResponse(row);
  }

  async listEvents(
    tenantId: string,
    filters?: { studentId?: string; from?: Date; to?: Date },
  ): Promise<PickupEvent[]> {
    const rows = await this.repo.listEvents(tenantId, filters);
    return rows.map((row) => this.eventToResponse(row));
  }

  async createEvent(
    tenantId: string,
    verifiedByUserId: string,
    input: PickupEventCreate,
  ): Promise<PickupEvent> {
    const row = await this.repo.createEvent(tenantId, {
      studentId: input.studentId,
      pickupContactId: input.pickupContactId ?? null,
      authorizationId: input.authorizationId ?? null,
      pickupPersonName: input.pickupPersonName,
      pickupPersonPhone: input.pickupPersonPhone ?? null,
      verificationMethod: input.verificationMethod,
      verifiedByUserId,
      note: input.note ?? null,
    });
    return this.eventToResponse(row);
  }

  private contactToResponse(row: PickupContactRow): PickupContact {
    return {
      id: row.id,
      tenantId: row.tenantId,
      studentId: row.studentId,
      fullName: row.fullName,
      relation: row.relation,
      phone: row.phone,
      identityNote: row.identityNote,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private authToResponse(row: PickupAuthorizationRow): PickupAuthorization {
    return {
      id: row.id,
      tenantId: row.tenantId,
      studentId: row.studentId,
      pickupContactId: row.pickupContactId,
      requestedById: row.requestedById,
      reviewedById: row.reviewedById,
      status: row.status,
      validFrom: row.validFrom ? row.validFrom.toISOString() : null,
      validUntil: row.validUntil ? row.validUntil.toISOString() : null,
      note: row.note,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private eventToResponse(row: PickupEventRow): PickupEvent {
    return {
      id: row.id,
      tenantId: row.tenantId,
      studentId: row.studentId,
      pickupContactId: row.pickupContactId,
      authorizationId: row.authorizationId,
      pickupPersonName: row.pickupPersonName,
      pickupPersonPhone: row.pickupPersonPhone,
      verificationMethod: row.verificationMethod,
      verifiedByUserId: row.verifiedByUserId,
      occurredAt: row.occurredAt.toISOString(),
      note: row.note,
    };
  }
}
