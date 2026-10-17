import { Inject, Injectable } from '@nestjs/common';
import type { DevelopmentDomain } from '@kidscare/database';
import type {
  CreateDevelopmentObservationDto,
  CreateHomeActivitySuggestionDto,
  CreatePortfolioItemDto,
  DevelopmentObservationDto,
  HomeActivitySuggestionDto,
  PortfolioItemDto,
} from '@kidscare/shared-types';
import { DevelopmentRepository } from '../repositories/development.repository';
import { NotificationsService } from '../../notifications/services/notifications.service';

import { PrismaService } from '../../../prisma/prisma.service';
import { getScopedStudentIdsForUser } from '../../../common/utils/student-access';
import type { CurrentUserPayload } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class DevelopmentService {
  constructor(
    @Inject(DevelopmentRepository) private readonly repository: DevelopmentRepository,
    @Inject(NotificationsService) private readonly notificationsService: NotificationsService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async listObservations(
    tenantId: string,
    filters?: { studentId?: string; domain?: DevelopmentDomain; parentVisibleOnly?: boolean },
    user?: CurrentUserPayload,
  ): Promise<DevelopmentObservationDto[]> {
    const activeFilters: {
      studentId?: string;
      studentIds?: string[];
      domain?: DevelopmentDomain;
      parentVisibleOnly?: boolean;
    } = { ...filters };

    if (user) {
      const allowedStudentIds = await getScopedStudentIdsForUser(this.prisma, tenantId, user);
      if (allowedStudentIds !== null) {
        if (allowedStudentIds.length === 0) return [];
        if (activeFilters.studentId) {
          if (!allowedStudentIds.includes(activeFilters.studentId)) return [];
        } else {
          activeFilters.studentIds = allowedStudentIds;
        }
      }
    }

    const rows = await this.repository.listObservations(tenantId, activeFilters);
    return rows.map((r) => ({
      ...r,
      observedAt: r.observedAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      portfolioItems: r.portfolioItems?.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    }));
  }

  async createObservation(
    tenantId: string,
    teacherId: string,
    dto: CreateDevelopmentObservationDto,
  ): Promise<DevelopmentObservationDto> {
    const r = await this.repository.createObservation(tenantId, teacherId, dto);

    // Madde 20: Veliye pedagojik gözlem eklendiğinde anlık sistem & push bildirimi gönder
    if (r.isParentVisible) {
      await this.notificationsService.notifyStudentParents(tenantId, dto.studentId, {
        title: '🌱 Yeni Gelişim Gözlemi',
        body: `${dto.skillName} alanında yeni bir pedagojik gelişim gözlemi paylaşıldı.`,
        type: 'ANNOUNCEMENT',
        data: { observationId: r.id, studentId: dto.studentId },
      });
    }

    return {
      ...r,
      observedAt: r.observedAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  async listPortfolioItems(
    tenantId: string,
    filters?: { studentId?: string; parentVisibleOnly?: boolean },
    user?: CurrentUserPayload,
  ): Promise<PortfolioItemDto[]> {
    const activeFilters: {
      studentId?: string;
      studentIds?: string[];
      parentVisibleOnly?: boolean;
    } = { ...filters };

    if (user) {
      const allowedStudentIds = await getScopedStudentIdsForUser(this.prisma, tenantId, user);
      if (allowedStudentIds !== null) {
        if (allowedStudentIds.length === 0) return [];
        if (activeFilters.studentId) {
          if (!allowedStudentIds.includes(activeFilters.studentId)) return [];
        } else {
          activeFilters.studentIds = allowedStudentIds;
        }
      }
    }

    const rows = await this.repository.listPortfolioItems(tenantId, activeFilters);
    return rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async createPortfolioItem(
    tenantId: string,
    dto: CreatePortfolioItemDto,
  ): Promise<PortfolioItemDto> {
    const r = await this.repository.createPortfolioItem(tenantId, dto);
    return {
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  async listHomeActivities(
    tenantId: string,
    domain?: DevelopmentDomain,
  ): Promise<HomeActivitySuggestionDto[]> {
    const rows = await this.repository.listHomeActivities(tenantId, domain);
    return rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async createHomeActivity(
    tenantId: string,
    dto: CreateHomeActivitySuggestionDto,
  ): Promise<HomeActivitySuggestionDto> {
    const r = await this.repository.createHomeActivity(tenantId, dto);
    return {
      ...r,
      createdAt: r.createdAt.toISOString(),
    };
  }
}
