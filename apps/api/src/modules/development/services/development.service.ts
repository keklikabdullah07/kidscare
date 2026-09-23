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

@Injectable()
export class DevelopmentService {
  constructor(@Inject(DevelopmentRepository) private readonly repository: DevelopmentRepository) {}

  async listObservations(
    tenantId: string,
    filters?: { studentId?: string; domain?: DevelopmentDomain; parentVisibleOnly?: boolean },
  ): Promise<DevelopmentObservationDto[]> {
    const rows = await this.repository.listObservations(tenantId, filters);
    return rows.map((r) => ({
      ...r,
      observedAt: r.observedAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async createObservation(
    tenantId: string,
    teacherId: string,
    dto: CreateDevelopmentObservationDto,
  ): Promise<DevelopmentObservationDto> {
    const r = await this.repository.createObservation(tenantId, teacherId, dto);
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
  ): Promise<PortfolioItemDto[]> {
    const rows = await this.repository.listPortfolioItems(tenantId, filters);
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
      updatedAt: r.updatedAt.toISOString(),
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
      updatedAt: r.updatedAt.toISOString(),
    };
  }
}
