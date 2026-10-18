import { apiFetch } from './client';
import type {
  SurveyListItemDto,
  SurveyDetailDto,
  SurveyStatsOverviewDto,
  CreateSurveyDto,
  SubmitSurveyResponseDto,
  SurveyStatus,
} from '@kidscare/shared-types';

export async function fetchSurveyStats(): Promise<SurveyStatsOverviewDto> {
  return apiFetch<SurveyStatsOverviewDto>('/surveys/stats');
}

export async function fetchSurveys(params?: {
  status?: SurveyStatus | undefined;
  classroomId?: string | undefined;
}): Promise<SurveyListItemDto[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.classroomId) query.set('classroomId', params.classroomId);

  const qs = query.toString();
  return apiFetch<SurveyListItemDto[]>(`/surveys${qs ? `?${qs}` : ''}`);
}

export async function fetchSurveyDetail(id: string): Promise<SurveyDetailDto> {
  return apiFetch<SurveyDetailDto>(`/surveys/${id}`);
}

export async function createSurvey(
  dto: CreateSurveyDto,
): Promise<{ success: boolean; id: string }> {
  return apiFetch<{ success: boolean; id: string }>('/surveys', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function updateSurveyStatus(
  id: string,
  status: SurveyStatus,
): Promise<{ success: boolean; status: SurveyStatus }> {
  return apiFetch<{ success: boolean; status: SurveyStatus }>(`/surveys/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function submitSurveyResponse(
  surveyId: string,
  dto: SubmitSurveyResponseDto,
): Promise<{ success: boolean; responseId: string }> {
  return apiFetch<{ success: boolean; responseId: string }>(`/surveys/${surveyId}/responses`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}
