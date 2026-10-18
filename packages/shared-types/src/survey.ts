export type SurveyStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export type SurveyQuestionType = 'RATING_1_5' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'OPEN_TEXT';

export type SurveyTargetType = 'ALL_DAYCARE' | 'CLASSROOM' | 'SPECIFIC_STUDENTS' | 'TEACHERS_ONLY';

export interface SurveyQuestionDto {
  id: string;
  surveyId: string;
  orderIndex: number;
  questionText: string;
  questionType: SurveyQuestionType;
  options: string[];
  isRequired: boolean;
}

export interface SurveyAnswerDto {
  id: string;
  responseId: string;
  questionId: string;
  ratingValue?: number | null | undefined;
  selectedOptions: string[];
  textResponse?: string | null | undefined;
}

export interface SurveyResponseDto {
  id: string;
  surveyId: string;
  respondentId: string;
  respondentName?: string | null | undefined;
  studentId?: string | null | undefined;
  studentName?: string | null | undefined;
  createdAt: string;
  answers: SurveyAnswerDto[];
}

export interface SurveyListItemDto {
  id: string;
  tenantId: string;
  createdById: string;
  creatorName?: string | null | undefined;
  title: string;
  description?: string | null | undefined;
  status: SurveyStatus;
  targetType: SurveyTargetType;
  targetClassroomId?: string | null | undefined;
  targetClassroomName?: string | null | undefined;
  isAnonymous: boolean;
  expiresAt?: string | null | undefined;
  questionCount: number;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
  hasResponded?: boolean | undefined;
}

export interface SurveyQuestionAnalytics {
  questionId: string;
  questionText: string;
  questionType: SurveyQuestionType;
  averageRating?: number | undefined;
  ratingDistribution?: Record<number, number> | undefined;
  optionCounts?: Record<string, number> | undefined;
  textAnswers?: string[] | undefined;
}

export interface SurveyDetailDto {
  survey: SurveyListItemDto;
  questions: SurveyQuestionDto[];
  responses?: SurveyResponseDto[] | undefined;
  analytics?: SurveyQuestionAnalytics[] | undefined;
}

export interface CreateSurveyQuestionInput {
  questionText: string;
  questionType: SurveyQuestionType;
  options?: string[] | undefined;
  isRequired?: boolean | undefined;
  orderIndex?: number | undefined;
}
export type CreateSurveyQuestionDto = CreateSurveyQuestionInput;

export interface CreateSurveyDto {
  title: string;
  description?: string | undefined;
  targetType: SurveyTargetType;
  targetClassroomId?: string | undefined;
  isAnonymous?: boolean | undefined;
  expiresAt?: string | undefined;
  status?: SurveyStatus | undefined;
  questions: CreateSurveyQuestionInput[];
}

export interface SubmitSurveyAnswerInput {
  questionId: string;
  ratingValue?: number | undefined;
  selectedOptions?: string[] | undefined;
  textResponse?: string | undefined;
}

export interface SubmitSurveyResponseDto {
  studentId?: string | undefined;
  answers: SubmitSurveyAnswerInput[];
}

export interface SurveyStatsOverviewDto {
  activeSurveys: number;
  totalSurveys: number;
  totalResponses: number;
  averageSatisfactionScore: number;
}
