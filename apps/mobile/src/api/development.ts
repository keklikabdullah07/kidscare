import type {
  CreateDevelopmentObservationDto,
  CreateHomeActivitySuggestionDto,
  CreatePortfolioItemDto,
  DevelopmentObservationDto,
  HomeActivitySuggestionDto,
  PortfolioItemDto,
} from '@kidscare/shared-types';
import { apiFetch } from './client';

export interface ObservationFilters {
  studentId?: string;
  domain?: string;
}

export async function listObservations(
  filters?: ObservationFilters,
): Promise<DevelopmentObservationDto[]> {
  const params = new URLSearchParams();
  if (filters?.studentId) params.append('studentId', filters.studentId);
  if (filters?.domain) params.append('domain', filters.domain);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<DevelopmentObservationDto[]>(`/development/observations${qs}`);
}

export async function createObservation(
  data: CreateDevelopmentObservationDto,
): Promise<DevelopmentObservationDto> {
  return apiFetch<DevelopmentObservationDto>('/development/observations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listPortfolio(studentId?: string): Promise<PortfolioItemDto[]> {
  const qs = studentId ? `?studentId=${encodeURIComponent(studentId)}` : '';
  return apiFetch<PortfolioItemDto[]>(`/development/portfolio${qs}`);
}

export async function createPortfolio(data: CreatePortfolioItemDto): Promise<PortfolioItemDto> {
  return apiFetch<PortfolioItemDto>('/development/portfolio', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listHomeActivities(domain?: string): Promise<HomeActivitySuggestionDto[]> {
  const qs = domain ? `?domain=${encodeURIComponent(domain)}` : '';
  return apiFetch<HomeActivitySuggestionDto[]>(`/development/activities${qs}`);
}

export async function createHomeActivity(
  data: CreateHomeActivitySuggestionDto,
): Promise<HomeActivitySuggestionDto> {
  return apiFetch<HomeActivitySuggestionDto>('/development/activities', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
