import type {
  CreateDevelopmentObservationDto,
  CreateHomeActivitySuggestionDto,
  CreatePortfolioItemDto,
  DevelopmentDomain,
  DevelopmentObservationDto,
  HomeActivitySuggestionDto,
  PortfolioItemDto,
} from '@kidscare/shared-types';
import { apiFetch } from './client';

export async function listObservations(
  studentId?: string,
  domain?: DevelopmentDomain,
): Promise<DevelopmentObservationDto[]> {
  const qs = new URLSearchParams();
  if (studentId) qs.set('studentId', studentId);
  if (domain) qs.set('domain', domain);
  return apiFetch<DevelopmentObservationDto[]>(`/development/observations?${qs.toString()}`);
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
  const qs = new URLSearchParams();
  if (studentId) qs.set('studentId', studentId);
  return apiFetch<PortfolioItemDto[]>(`/development/portfolio?${qs.toString()}`);
}

export async function createPortfolioItem(data: CreatePortfolioItemDto): Promise<PortfolioItemDto> {
  return apiFetch<PortfolioItemDto>('/development/portfolio', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listHomeActivities(
  domain?: DevelopmentDomain,
): Promise<HomeActivitySuggestionDto[]> {
  const qs = new URLSearchParams();
  if (domain) qs.set('domain', domain);
  return apiFetch<HomeActivitySuggestionDto[]>(`/development/activities?${qs.toString()}`);
}

export async function createHomeActivity(
  data: CreateHomeActivitySuggestionDto,
): Promise<HomeActivitySuggestionDto> {
  return apiFetch<HomeActivitySuggestionDto>('/development/activities', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
