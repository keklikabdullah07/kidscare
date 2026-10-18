import { Inject, Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { SurveysRepository } from '../repositories/surveys.repository';
import type {
  CreateSurveyDto,
  SubmitSurveyResponseDto,
  SurveyListItemDto,
  SurveyDetailDto,
  SurveyStatsOverviewDto,
  SurveyStatus,
} from '@kidscare/shared-types';

@Injectable()
export class SurveysService {
  private readonly logger = new Logger(SurveysService.name);

  constructor(
    @Inject(SurveysRepository)
    private readonly repo: SurveysRepository,
  ) {}

  async createSurvey(
    tenantId: string,
    createdById: string,
    dto: CreateSurveyDto,
  ): Promise<{ success: boolean; id: string }> {
    if (!dto.questions || dto.questions.length === 0) {
      throw new BadRequestException('En az bir soru tanımlanmalıdır.');
    }

    const survey = await this.repo.createSurvey(tenantId, createdById, dto);
    this.logger.log(`📋 Yeni anket oluşturuldu: id=${survey.id}, title="${survey.title}"`);
    return { success: true, id: survey.id };
  }

  async getSurveys(
    tenantId: string,
    query?: { status?: SurveyStatus | undefined; classroomId?: string | undefined },
    currentUserId?: string,
  ): Promise<SurveyListItemDto[]> {
    return this.repo.findSurveys(tenantId, query, currentUserId);
  }

  async getSurveyById(
    tenantId: string,
    id: string,
    currentUserId?: string,
  ): Promise<SurveyDetailDto> {
    const detail = await this.repo.findSurveyById(tenantId, id, currentUserId);
    if (!detail) {
      throw new NotFoundException('Anket bulunamadı.');
    }
    return detail;
  }

  async updateSurveyStatus(
    tenantId: string,
    id: string,
    status: SurveyStatus,
  ): Promise<{ success: boolean }> {
    await this.repo.updateSurveyStatus(tenantId, id, status);
    this.logger.log(`📋 Anket durumu güncellendi: id=${id}, status=${status}`);
    return { success: true };
  }

  async submitSurveyResponse(
    tenantId: string,
    surveyId: string,
    respondentId: string,
    dto: SubmitSurveyResponseDto,
  ): Promise<{ success: boolean }> {
    try {
      await this.repo.createSurveyResponse(tenantId, surveyId, respondentId, dto);
      this.logger.log(`🗳️ Anket yanıtlandı: surveyId=${surveyId}, user=${respondentId}`);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Yanıt kaydedilemedi.';
      throw new BadRequestException(msg);
    }
  }

  async getStatsOverview(tenantId: string): Promise<SurveyStatsOverviewDto> {
    return this.repo.getSurveyStatsOverview(tenantId);
  }
}
