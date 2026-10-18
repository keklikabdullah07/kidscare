import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SurveysPage } from './SurveysPage';
import * as surveysApi from '../../api/surveys';
import * as classroomsApi from '../../api/classrooms';
import type {
  Classroom,
  SurveyListItemDto,
  SurveyDetailDto,
  SurveyStatsOverviewDto,
} from '@kidscare/shared-types';

const mockUseAuth = vi.fn();
vi.mock('../auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../api/surveys');
vi.mock('../../api/classrooms');

const mockStats: SurveyStatsOverviewDto = {
  activeSurveys: 2,
  totalSurveys: 6,
  totalResponses: 38,
  averageSatisfactionScore: 92,
};

const mockSurveys: SurveyListItemDto[] = [
  {
    id: 'srv-1',
    tenantId: 't-1',
    createdById: 'u-1',
    creatorName: 'Müdür Ahmet',
    title: 'Aylık Yemek & Beslenme Menüsü Değerlendirmesi',
    description: 'Yemek kalitesi ve porsiyonlar hakkında görüşleriniz.',
    status: 'ACTIVE',
    targetType: 'ALL_DAYCARE',
    targetClassroomId: null,
    targetClassroomName: null,
    isAnonymous: false,
    expiresAt: '2026-11-01T00:00:00.000Z',
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-18T10:00:00.000Z',
    questionCount: 3,
    responseCount: 18,
    hasResponded: false,
  },
  {
    id: 'srv-2',
    tenantId: 't-1',
    createdById: 'u-1',
    creatorName: 'Müdür Ahmet',
    title: 'Bahar Gezisi Güzergah Oylaması',
    description: 'Akvaryum mu Orman Çiftliği mi?',
    status: 'ACTIVE',
    targetType: 'CLASSROOM',
    targetClassroomId: 'c-1',
    targetClassroomName: 'Papatyalar Sınıfı',
    isAnonymous: false,
    expiresAt: null,
    createdAt: '2026-10-18T11:00:00.000Z',
    updatedAt: '2026-10-18T11:00:00.000Z',
    questionCount: 2,
    responseCount: 12,
    hasResponded: true,
  },
];

const mockClassrooms: Classroom[] = [
  {
    id: 'c-1',
    tenantId: 't-1',
    name: 'Papatyalar Sınıfı',
    ageGroup: '4-5 Yaş',
    isActive: true,
    teachers: [],
    studentCount: 15,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

const mockDetail: SurveyDetailDto = {
  survey: {
    ...mockSurveys[0]!,
    hasResponded: false,
  },
  questions: [
    {
      id: 'q-1',
      surveyId: 'srv-1',
      orderIndex: 0,
      questionText: 'Yemeklerin lezzetinden memnun musunuz?',
      questionType: 'RATING_1_5',
      options: [],
      isRequired: true,
    },
    {
      id: 'q-2',
      surveyId: 'srv-1',
      orderIndex: 1,
      questionText: 'En sevilen öğün?',
      questionType: 'SINGLE_CHOICE',
      options: ['Kahvaltı', 'Öğle Yemeği'],
      isRequired: true,
    },
  ],
  responses: [
    {
      id: 'r-1',
      surveyId: 'srv-1',
      respondentId: 'u-2',
      respondentName: 'Mehmet Yılmaz',
      studentName: 'Ada Yılmaz',
      createdAt: '2026-10-18T12:00:00.000Z',
      answers: [],
    },
  ],
  analytics: [
    {
      questionId: 'q-1',
      questionText: 'Yemeklerin lezzetinden memnun musunuz?',
      questionType: 'RATING_1_5',
      averageRating: 4.8,
      ratingDistribution: { 5: 14, 4: 4, 3: 0, 2: 0, 1: 0 },
    },
    {
      questionId: 'q-2',
      questionText: 'En sevilen öğün?',
      questionType: 'SINGLE_CHOICE',
      optionCounts: { Kahvaltı: 6, 'Öğle Yemeği': 12 },
    },
  ],
};

describe('SurveysPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      state: {
        status: 'authenticated',
        token: 'test-token',
        user: { id: 'u-1', email: 'admin@demo.test', role: 'ADMIN' },
      },
    });
    vi.mocked(surveysApi.fetchSurveyStats).mockResolvedValue(mockStats);
    vi.mocked(surveysApi.fetchSurveys).mockResolvedValue(mockSurveys);
    vi.mocked(surveysApi.fetchSurveyDetail).mockResolvedValue(mockDetail);
    vi.mocked(classroomsApi.listClassrooms).mockResolvedValue(mockClassrooms);
    vi.mocked(surveysApi.createSurvey).mockResolvedValue({ success: true, id: 'srv-new' });
    vi.mocked(surveysApi.submitSurveyResponse).mockResolvedValue({
      success: true,
      responseId: 'resp-new',
    });
    vi.mocked(surveysApi.updateSurveyStatus).mockResolvedValue({
      success: true,
      status: 'CLOSED',
    });
  });

  it('renders page header and stat cards properly', async () => {
    render(<SurveysPage />);

    expect(screen.getByText('Veli Anketleri & Etkinlik Oylamaları')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Aktif Anketler')).toBeInTheDocument();
      expect(screen.getByText('Toplam Veli Yanıtı')).toBeInTheDocument();
      expect(screen.getByText('38')).toBeInTheDocument();
      expect(screen.getByText('4.6 / 5.0')).toBeInTheDocument();
    });
  });

  it('displays survey cards with classroom badges and response badges', async () => {
    render(<SurveysPage />);

    await waitFor(() => {
      expect(screen.getByText('Aylık Yemek & Beslenme Menüsü Değerlendirmesi')).toBeInTheDocument();
    });
    expect(screen.getByText('Bahar Gezisi Güzergah Oylaması')).toBeInTheDocument();
    expect(screen.getAllByText('Papatyalar Sınıfı').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Yanıtınız Alındı')).toBeInTheDocument();
  });

  it('switches to create survey tab and applies a quick template', async () => {
    const user = userEvent.setup();
    render(<SurveysPage />);

    await waitFor(() => {
      expect(screen.getByText('Yeni Anket Oluştur')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Yeni Anket Oluştur'));

    await waitFor(() => {
      expect(screen.getByText('Bahar Gezisi Güzergah Oylaması')).toBeInTheDocument();
    });

    // Click Bahar Gezisi template
    await user.click(screen.getByText('Bahar Gezisi Güzergah Oylaması'));

    // Check title input is populated
    const titleInput = screen.getByPlaceholderText(/Örn: 2026 Mayıs Ayı Yemek/i);
    expect(titleInput).toHaveValue('2026 Bahar Dönemi Açık Hava Kültür & Doğa Gezisi Seçimi');
  });

  it('opens analytics modal when clicking Canlı Analitik', async () => {
    const user = userEvent.setup();
    render(<SurveysPage />);

    await waitFor(() => {
      expect(screen.getByText('Canlı Analitik & Yanıtlar (18)')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Canlı Analitik & Yanıtlar (18)'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('4.8 / 5.0')).toBeInTheDocument();
      expect(screen.getByText('Mehmet Yılmaz')).toBeInTheDocument();
    });
  });

  it('allows parent to open voting modal and cast response', async () => {
    mockUseAuth.mockReturnValue({
      state: {
        status: 'authenticated',
        token: 'test-token',
        user: { id: 'u-parent', email: 'parent@demo.test', role: 'PARENT' },
      },
    });
    const user = userEvent.setup();
    render(<SurveysPage />);

    await waitFor(() => {
      expect(screen.getByText('Anketi Doldur & Oy Ver')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Anketi Doldur & Oy Ver'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Oylamamı Gönder')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Oylamamı Gönder'));

    await waitFor(() => {
      expect(surveysApi.submitSurveyResponse).toHaveBeenCalledWith('srv-1', expect.any(Object));
    });
  });
});
