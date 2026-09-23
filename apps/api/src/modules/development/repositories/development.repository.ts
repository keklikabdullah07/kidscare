import { Inject, Injectable } from '@nestjs/common';
import type {
  Prisma,
  DevelopmentDomain,
  PrismaClient,
  HomeActivitySuggestion,
} from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

export type ObservationWithRelations = Prisma.DevelopmentObservationGetPayload<{
  include: {
    student: {
      select: { id: true; firstName: true; lastName: true };
    };
    teacher: {
      select: { id: true; email: true };
    };
    portfolioItems: true;
  };
}>;

export type ObservationCreated = Prisma.DevelopmentObservationGetPayload<{
  include: {
    student: {
      select: { id: true; firstName: true; lastName: true };
    };
    teacher: {
      select: { id: true; email: true };
    };
  };
}>;

export type PortfolioWithRelations = Prisma.PortfolioItemGetPayload<{
  include: {
    student: {
      select: { id: true; firstName: true; lastName: true };
    };
  };
}>;

export interface IDevelopmentRepository {
  listObservations(
    tenantId: string,
    filters?: { studentId?: string; domain?: DevelopmentDomain; parentVisibleOnly?: boolean },
  ): Promise<ObservationWithRelations[]>;
  createObservation(
    tenantId: string,
    teacherId: string,
    data: {
      studentId: string;
      domain: DevelopmentDomain;
      skillName: string;
      observation: string;
      observedAt?: string;
      isParentVisible?: boolean;
    },
  ): Promise<ObservationCreated>;
  listPortfolioItems(
    tenantId: string,
    filters?: { studentId?: string; parentVisibleOnly?: boolean },
  ): Promise<PortfolioWithRelations[]>;
  createPortfolioItem(
    tenantId: string,
    data: {
      studentId: string;
      observationId?: string;
      title: string;
      description?: string;
      mediaUrl: string;
      isParentVisible?: boolean;
    },
  ): Promise<PortfolioWithRelations>;
  listHomeActivities(
    tenantId: string,
    domain?: DevelopmentDomain,
  ): Promise<HomeActivitySuggestion[]>;
  createHomeActivity(
    tenantId: string,
    data: {
      domain: DevelopmentDomain;
      ageGroup?: string;
      title: string;
      description: string;
    },
  ): Promise<HomeActivitySuggestion>;
}

@Injectable()
export class DevelopmentRepository implements IDevelopmentRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listObservations(
    tenantId: string,
    filters?: { studentId?: string; domain?: DevelopmentDomain; parentVisibleOnly?: boolean },
  ): Promise<ObservationWithRelations[]> {
    const where: Prisma.DevelopmentObservationWhereInput = { tenantId };
    if (filters?.studentId) where.studentId = filters.studentId;
    if (filters?.domain) where.domain = filters.domain;
    if (filters?.parentVisibleOnly) where.isParentVisible = true;

    return this.prisma.withTenant((client: PrismaClient) =>
      client.developmentObservation.findMany({
        where,
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true },
          },
          teacher: {
            select: { id: true, email: true },
          },
          portfolioItems: true,
        },
        orderBy: { observedAt: 'desc' },
      }),
    );
  }

  async createObservation(
    tenantId: string,
    teacherId: string,
    data: {
      studentId: string;
      domain: DevelopmentDomain;
      skillName: string;
      observation: string;
      observedAt?: string;
      isParentVisible?: boolean;
    },
  ): Promise<ObservationCreated> {
    return this.prisma.withTenant((client: PrismaClient) =>
      client.developmentObservation.create({
        data: {
          tenantId,
          teacherId,
          studentId: data.studentId,
          domain: data.domain,
          skillName: data.skillName,
          observation: data.observation,
          observedAt: data.observedAt ? new Date(data.observedAt) : new Date(),
          isParentVisible: data.isParentVisible ?? true,
        },
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true },
          },
          teacher: {
            select: { id: true, email: true },
          },
        },
      }),
    );
  }

  async listPortfolioItems(
    tenantId: string,
    filters?: { studentId?: string; parentVisibleOnly?: boolean },
  ): Promise<PortfolioWithRelations[]> {
    const where: Prisma.PortfolioItemWhereInput = { tenantId };
    if (filters?.studentId) where.studentId = filters.studentId;
    if (filters?.parentVisibleOnly) where.isParentVisible = true;

    return this.prisma.withTenant((client: PrismaClient) =>
      client.portfolioItem.findMany({
        where,
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async createPortfolioItem(
    tenantId: string,
    data: {
      studentId: string;
      observationId?: string;
      title: string;
      description?: string;
      mediaUrl: string;
      isParentVisible?: boolean;
    },
  ): Promise<PortfolioWithRelations> {
    return this.prisma.withTenant((client: PrismaClient) =>
      client.portfolioItem.create({
        data: {
          tenantId,
          studentId: data.studentId,
          observationId: data.observationId,
          title: data.title,
          description: data.description,
          mediaUrl: data.mediaUrl,
          isParentVisible: data.isParentVisible ?? true,
        },
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
    );
  }

  async listHomeActivities(
    tenantId: string,
    domain?: DevelopmentDomain,
  ): Promise<HomeActivitySuggestion[]> {
    const where: Prisma.HomeActivitySuggestionWhereInput = { tenantId };
    if (domain) where.domain = domain;

    return this.prisma.withTenant((client: PrismaClient) =>
      client.homeActivitySuggestion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async createHomeActivity(
    tenantId: string,
    data: {
      domain: DevelopmentDomain;
      ageGroup?: string;
      title: string;
      description: string;
    },
  ): Promise<HomeActivitySuggestion> {
    return this.prisma.withTenant((client: PrismaClient) =>
      client.homeActivitySuggestion.create({
        data: {
          tenantId,
          domain: data.domain,
          ageGroup: data.ageGroup,
          title: data.title,
          description: data.description,
        },
      }),
    );
  }
}
