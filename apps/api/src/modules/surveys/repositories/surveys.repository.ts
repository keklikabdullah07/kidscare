import { Inject, Injectable } from '@nestjs/common';
import type {
  Survey as PrismaSurvey,
  SurveyResponse as PrismaSurveyResponse,
  SurveyStatus as PrismaSurveyStatus,
} from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';
import type {
  CreateSurveyDto,
  SubmitSurveyResponseDto,
  SurveyListItemDto,
  SurveyDetailDto,
  SurveyStatsOverviewDto,
  SurveyQuestionAnalytics,
  SurveyStatus,
} from '@kidscare/shared-types';

export interface ISurveysRepository {
  createSurvey(tenantId: string, createdById: string, data: CreateSurveyDto): Promise<PrismaSurvey>;
  findSurveys(
    tenantId: string,
    query?: { status?: SurveyStatus | undefined; classroomId?: string | undefined },
    currentUserId?: string,
  ): Promise<SurveyListItemDto[]>;
  findSurveyById(
    tenantId: string,
    id: string,
    currentUserId?: string,
  ): Promise<SurveyDetailDto | null>;
  updateSurveyStatus(tenantId: string, id: string, status: SurveyStatus): Promise<PrismaSurvey>;
  createSurveyResponse(
    tenantId: string,
    surveyId: string,
    respondentId: string,
    dto: SubmitSurveyResponseDto,
  ): Promise<PrismaSurveyResponse>;
  getSurveyStatsOverview(tenantId: string): Promise<SurveyStatsOverviewDto>;
}

@Injectable()
export class SurveysRepository implements ISurveysRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async createSurvey(
    tenantId: string,
    createdById: string,
    data: CreateSurveyDto,
  ): Promise<PrismaSurvey> {
    return this.prisma.withTenant(async (client) => {
      const survey = await client.survey.create({
        data: {
          tenantId,
          createdById,
          title: data.title,
          description: data.description ?? null,
          status: (data.status as PrismaSurveyStatus) ?? 'ACTIVE',
          targetType: data.targetType,
          targetClassroomId: data.targetClassroomId ?? null,
          isAnonymous: data.isAnonymous ?? false,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
          questions: {
            create: data.questions.map((q, idx) => ({
              orderIndex: q.orderIndex ?? idx,
              questionText: q.questionText,
              questionType: q.questionType,
              options: q.options ?? [],
              isRequired: q.isRequired ?? true,
            })),
          },
        },
      });

      return survey;
    });
  }

  async findSurveys(
    tenantId: string,
    query?: { status?: SurveyStatus | undefined; classroomId?: string | undefined },
    currentUserId?: string,
  ): Promise<SurveyListItemDto[]> {
    return this.prisma.withTenant(async (client) => {
      const where: Record<string, unknown> = { tenantId };
      if (query?.status) {
        where.status = query.status;
      }
      if (query?.classroomId) {
        where.OR = [
          { targetType: 'ALL_DAYCARE' },
          { targetType: 'CLASSROOM', targetClassroomId: query.classroomId },
        ];
      }

      const surveys = await client.survey.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          targetClassroom: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              questions: true,
              responses: true,
            },
          },
          responses: currentUserId
            ? {
                where: { respondentId: currentUserId },
                select: { id: true },
              }
            : false,
        },
      });

      return surveys.map((s) => {
        const creatorName = s.creator
          ? [s.creator.firstName, s.creator.lastName].filter(Boolean).join(' ').trim() ||
            s.creator.email
          : undefined;

        const hasResponded = Array.isArray(s.responses) && s.responses.length > 0;

        return {
          id: s.id,
          tenantId: s.tenantId,
          createdById: s.createdById,
          creatorName,
          title: s.title,
          description: s.description,
          status: s.status,
          targetType: s.targetType,
          targetClassroomId: s.targetClassroomId,
          targetClassroomName: s.targetClassroom?.name ?? null,
          isAnonymous: s.isAnonymous,
          expiresAt: s.expiresAt?.toISOString() ?? null,
          questionCount: s._count.questions,
          responseCount: s._count.responses,
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
          hasResponded,
        };
      });
    });
  }

  async findSurveyById(
    tenantId: string,
    id: string,
    currentUserId?: string,
  ): Promise<SurveyDetailDto | null> {
    return this.prisma.withTenant(async (client) => {
      const survey = await client.survey.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          targetClassroom: {
            select: {
              name: true,
            },
          },
          questions: {
            orderBy: { orderIndex: 'asc' },
          },
          responses: {
            include: {
              respondent: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              student: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              answers: true,
            },
          },
        },
      });

      if (!survey || survey.tenantId !== tenantId) {
        return null;
      }

      const creatorName = survey.creator
        ? [survey.creator.firstName, survey.creator.lastName].filter(Boolean).join(' ').trim() ||
          survey.creator.email
        : undefined;

      const hasResponded = currentUserId
        ? survey.responses.some((r) => r.respondentId === currentUserId)
        : undefined;

      // Compute question analytics
      const analytics: SurveyQuestionAnalytics[] = survey.questions.map((q) => {
        const questionAnswers = survey.responses.flatMap((r) =>
          r.answers.filter((a) => a.questionId === q.id),
        );

        if (q.questionType === 'RATING_1_5') {
          const ratings = questionAnswers
            .map((a) => a.ratingValue)
            .filter((v): v is number => typeof v === 'number');

          const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          for (const r of ratings) {
            if (distribution[r] !== undefined) distribution[r]++;
          }

          const avg =
            ratings.length > 0
              ? Number((ratings.reduce((sum, v) => sum + v, 0) / ratings.length).toFixed(1))
              : 0;

          return {
            questionId: q.id,
            questionText: q.questionText,
            questionType: q.questionType,
            averageRating: avg,
            ratingDistribution: distribution,
          };
        }

        if (q.questionType === 'SINGLE_CHOICE' || q.questionType === 'MULTIPLE_CHOICE') {
          const optionCounts: Record<string, number> = {};
          for (const opt of q.options) {
            optionCounts[opt] = 0;
          }
          for (const ans of questionAnswers) {
            for (const chosen of ans.selectedOptions) {
              optionCounts[chosen] = (optionCounts[chosen] || 0) + 1;
            }
          }

          return {
            questionId: q.id,
            questionText: q.questionText,
            questionType: q.questionType,
            optionCounts,
          };
        }

        // OPEN_TEXT
        const textAnswers = questionAnswers
          .map((a) => a.textResponse?.trim())
          .filter((t): t is string => Boolean(t));

        return {
          questionId: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          textAnswers,
        };
      });

      return {
        survey: {
          id: survey.id,
          tenantId: survey.tenantId,
          createdById: survey.createdById,
          creatorName,
          title: survey.title,
          description: survey.description,
          status: survey.status,
          targetType: survey.targetType,
          targetClassroomId: survey.targetClassroomId,
          targetClassroomName: survey.targetClassroom?.name ?? null,
          isAnonymous: survey.isAnonymous,
          expiresAt: survey.expiresAt?.toISOString() ?? null,
          questionCount: survey.questions.length,
          responseCount: survey.responses.length,
          createdAt: survey.createdAt.toISOString(),
          updatedAt: survey.updatedAt.toISOString(),
          hasResponded,
        },
        questions: survey.questions.map((q) => ({
          id: q.id,
          surveyId: q.surveyId,
          orderIndex: q.orderIndex,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          isRequired: q.isRequired,
        })),
        responses: survey.responses.map((r) => ({
          id: r.id,
          surveyId: r.surveyId,
          respondentId: r.respondentId,
          respondentName: survey.isAnonymous
            ? 'Anonim Veli'
            : [r.respondent.firstName, r.respondent.lastName].filter(Boolean).join(' ').trim() ||
              r.respondent.email,
          studentId: r.studentId,
          studentName:
            survey.isAnonymous || !r.student
              ? undefined
              : `${r.student.firstName} ${r.student.lastName}`,
          createdAt: r.createdAt.toISOString(),
          answers: r.answers.map((a) => ({
            id: a.id,
            responseId: a.responseId,
            questionId: a.questionId,
            ratingValue: a.ratingValue,
            selectedOptions: a.selectedOptions,
            textResponse: a.textResponse,
          })),
        })),
        analytics,
      };
    });
  }

  async updateSurveyStatus(
    tenantId: string,
    id: string,
    status: SurveyStatus,
  ): Promise<PrismaSurvey> {
    return this.prisma.withTenant((client) =>
      client.survey.update({
        where: { id },
        data: { status },
      }),
    );
  }

  async createSurveyResponse(
    tenantId: string,
    surveyId: string,
    respondentId: string,
    dto: SubmitSurveyResponseDto,
  ): Promise<PrismaSurveyResponse> {
    return this.prisma.withTenant(async (client) => {
      // Validate survey belongs to tenant and is ACTIVE
      const survey = await client.survey.findUnique({
        where: { id: surveyId },
      });
      if (!survey || survey.tenantId !== tenantId) {
        throw new Error('Anket bulunamadı.');
      }
      if (survey.status !== 'ACTIVE') {
        throw new Error('Bu anket şu anda katılıma kapalıdır.');
      }

      // Check if already responded
      const existing = await client.surveyResponse.findUnique({
        where: {
          surveyId_respondentId: {
            surveyId,
            respondentId,
          },
        },
      });
      if (existing) {
        throw new Error('Bu anketi daha önce yanıtladınız.');
      }

      const response = await client.surveyResponse.create({
        data: {
          surveyId,
          respondentId,
          studentId: dto.studentId ?? null,
          answers: {
            create: dto.answers.map((ans) => ({
              questionId: ans.questionId,
              ratingValue: ans.ratingValue ?? null,
              selectedOptions: ans.selectedOptions ?? [],
              textResponse: ans.textResponse ?? null,
            })),
          },
        },
      });

      return response;
    });
  }

  async getSurveyStatsOverview(tenantId: string): Promise<SurveyStatsOverviewDto> {
    return this.prisma.withTenant(async (client) => {
      const [activeSurveys, totalSurveys, totalResponses, avgRatingAgg] = await Promise.all([
        client.survey.count({
          where: { tenantId, status: 'ACTIVE' },
        }),
        client.survey.count({
          where: { tenantId },
        }),
        client.surveyResponse.count({
          where: { survey: { tenantId } },
        }),
        client.surveyAnswer.aggregate({
          where: {
            response: { survey: { tenantId } },
            ratingValue: { not: null },
          },
          _avg: { ratingValue: true },
        }),
      ]);

      const avgScore = avgRatingAgg._avg.ratingValue
        ? Number(avgRatingAgg._avg.ratingValue.toFixed(1))
        : 5.0;

      return {
        activeSurveys,
        totalSurveys,
        totalResponses,
        averageSatisfactionScore: avgScore,
      };
    });
  }
}
