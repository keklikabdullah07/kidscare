import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

export type ConsentWithRelations = Prisma.EventConsentGetPayload<{
  include: {
    classroom: { select: { id: true; name: true } };
    responses: {
      include: {
        student: { select: { id: true; firstName: true; lastName: true } };
        parentUser: { select: { id: true; email: true } };
      };
    };
  };
}>;

export type ConsentCreatedWithRelations = Prisma.EventConsentGetPayload<{
  include: {
    classroom: { select: { id: true; name: true } };
    createdBy: { select: { id: true; email: true; role: true } };
  };
}>;

export type ConsentResponseWithStudent = Prisma.EventConsentResponseGetPayload<{
  include: {
    student: { select: { id: true; firstName: true; lastName: true } };
  };
}>;

@Injectable()
export class ConsentsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(
    tenantId: string,
    data: Prisma.EventConsentUncheckedCreateInput,
  ): Promise<ConsentCreatedWithRelations> {
    return this.prisma.withTenant((client) =>
      client.eventConsent.create({
        data,
        include: {
          classroom: { select: { id: true, name: true } },
          createdBy: { select: { id: true, email: true, role: true } },
        },
      }),
    );
  }

  async findAll(
    tenantId: string,
    filters?: { classroomId?: string; status?: string },
  ): Promise<ConsentWithRelations[]> {
    const where: Prisma.EventConsentWhereInput = { tenantId };
    if (filters?.classroomId) {
      where.classroomId = filters.classroomId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.withTenant((client) =>
      client.eventConsent.findMany({
        where,
        include: {
          classroom: { select: { id: true, name: true } },
          responses: {
            include: {
              student: { select: { id: true, firstName: true, lastName: true } },
              parentUser: { select: { id: true, email: true } },
            },
          },
        },
        orderBy: { eventDate: 'desc' },
      }),
    );
  }

  async findById(tenantId: string, id: string): Promise<ConsentWithRelations | null> {
    return this.prisma.withTenant((client) =>
      client.eventConsent.findFirst({
        where: { id, tenantId },
        include: {
          classroom: { select: { id: true, name: true } },
          responses: {
            include: {
              student: { select: { id: true, firstName: true, lastName: true } },
              parentUser: { select: { id: true, email: true } },
            },
          },
        },
      }),
    );
  }

  async respond(
    tenantId: string,
    data: {
      consentId: string;
      studentId: string;
      parentUserId: string;
      decision: string;
      notes?: string | null;
    },
  ): Promise<ConsentResponseWithStudent> {
    return this.prisma.withTenant((client) =>
      client.eventConsentResponse.upsert({
        where: {
          consentId_studentId: {
            consentId: data.consentId,
            studentId: data.studentId,
          },
        },
        create: {
          tenantId,
          consentId: data.consentId,
          studentId: data.studentId,
          parentUserId: data.parentUserId,
          decision: data.decision,
          notes: data.notes ?? null,
        },
        update: {
          decision: data.decision,
          notes: data.notes ?? null,
          respondedAt: new Date(),
        },
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    );
  }

  async updateStatus(tenantId: string, id: string, status: string): Promise<ConsentWithRelations> {
    return this.prisma.withTenant((client) =>
      client.eventConsent.update({
        where: { id, tenantId },
        data: { status },
        include: {
          classroom: { select: { id: true, name: true } },
          responses: {
            include: {
              student: { select: { id: true, firstName: true, lastName: true } },
              parentUser: { select: { id: true, email: true } },
            },
          },
        },
      }),
    );
  }
}
