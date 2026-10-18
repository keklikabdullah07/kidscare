import { SurveysController } from './surveys.controller';
import type { SurveysService } from '../services/surveys.service';
import type {
  SurveyDetailDto,
  SurveyListItemDto,
  SurveyStatsOverviewDto,
} from '@kidscare/shared-types';

describe('SurveysController', () => {
  let controller: SurveysController;
  let serviceMock: jest.Mocked<SurveysService>;

  const dummyUser = {
    userId: 'user-1',
    tenantId: 'tenant-1',
    role: 'ADMIN' as const,
  };

  const dummySurvey: SurveyListItemDto = {
    id: 'survey-1',
    tenantId: 'tenant-1',
    createdById: 'user-1',
    creatorName: 'Müdür Ahmet',
    title: 'Güz Dönemi Memnuniyet Anketi',
    description: 'Kreş hizmetleri değerlendirmesi',
    status: 'ACTIVE',
    targetType: 'ALL_DAYCARE',
    isAnonymous: false,
    questionCount: 3,
    responseCount: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hasResponded: false,
  };

  const dummyDetail: SurveyDetailDto = {
    survey: dummySurvey,
    questions: [
      {
        id: 'q-1',
        surveyId: 'survey-1',
        orderIndex: 0,
        questionText: 'Yemek menüsünden memnun musunuz?',
        questionType: 'RATING_1_5',
        options: [],
        isRequired: true,
      },
    ],
    responses: [],
    analytics: [
      {
        questionId: 'q-1',
        questionText: 'Yemek menüsünden memnun musunuz?',
        questionType: 'RATING_1_5',
        averageRating: 4.8,
        ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 8 },
      },
    ],
  };

  const dummyStats: SurveyStatsOverviewDto = {
    activeSurveys: 2,
    totalSurveys: 6,
    totalResponses: 45,
    averageSatisfactionScore: 4.7,
  };

  beforeEach(() => {
    serviceMock = {
      createSurvey: jest.fn().mockResolvedValue({ success: true, id: 'survey-1' }),
      getSurveys: jest.fn().mockResolvedValue([dummySurvey]),
      getSurveyById: jest.fn().mockResolvedValue(dummyDetail),
      updateSurveyStatus: jest.fn().mockResolvedValue({ success: true }),
      submitSurveyResponse: jest.fn().mockResolvedValue({ success: true }),
      getStatsOverview: jest.fn().mockResolvedValue(dummyStats),
    } as unknown as jest.Mocked<SurveysService>;

    controller = new SurveysController(serviceMock);
  });

  it('creates survey with valid payload', async () => {
    const res = await controller.createSurvey(dummyUser, {
      title: 'Yeni Anket',
      targetType: 'ALL_DAYCARE',
      questions: [
        {
          questionText: 'Etkinlikleri nasıl buluyorsunuz?',
          questionType: 'RATING_1_5',
        },
      ],
    });

    expect(res).toEqual({ success: true, id: 'survey-1' });
    expect(serviceMock.createSurvey).toHaveBeenCalledWith('tenant-1', 'user-1', {
      title: 'Yeni Anket',
      targetType: 'ALL_DAYCARE',
      questions: [
        {
          questionText: 'Etkinlikleri nasıl buluyorsunuz?',
          questionType: 'RATING_1_5',
        },
      ],
    });
  });

  it('retrieves survey list with optional filters', async () => {
    const res = await controller.getSurveys(dummyUser, 'ACTIVE', 'class-1');
    expect(res).toEqual([dummySurvey]);
    expect(serviceMock.getSurveys).toHaveBeenCalledWith(
      'tenant-1',
      { status: 'ACTIVE', classroomId: 'class-1' },
      'user-1',
    );
  });

  it('retrieves stats overview', async () => {
    const res = await controller.getStatsOverview(dummyUser);
    expect(res).toEqual(dummyStats);
    expect(serviceMock.getStatsOverview).toHaveBeenCalledWith('tenant-1');
  });

  it('retrieves single survey details and analytics', async () => {
    const res = await controller.getSurveyById(dummyUser, 'survey-1');
    expect(res).toEqual(dummyDetail);
    expect(serviceMock.getSurveyById).toHaveBeenCalledWith('tenant-1', 'survey-1', 'user-1');
  });

  it('updates survey status', async () => {
    const res = await controller.updateStatus(dummyUser, 'survey-1', { status: 'CLOSED' });
    expect(res).toEqual({ success: true });
    expect(serviceMock.updateSurveyStatus).toHaveBeenCalledWith('tenant-1', 'survey-1', 'CLOSED');
  });

  it('submits survey response from parent', async () => {
    const res = await controller.submitResponse(dummyUser, 'survey-1', {
      answers: [
        {
          questionId: 'q-1',
          ratingValue: 5,
        },
      ],
    });
    expect(res).toEqual({ success: true });
    expect(serviceMock.submitSurveyResponse).toHaveBeenCalledWith(
      'tenant-1',
      'survey-1',
      'user-1',
      {
        answers: [
          {
            questionId: 'q-1',
            ratingValue: 5,
          },
        ],
      },
    );
  });
});
