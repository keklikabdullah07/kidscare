import { useState, useEffect, useMemo, type JSX } from 'react';
import {
  Vote,
  BarChart3,
  Star,
  CheckCircle2,
  Users,
  Plus,
  Trash2,
  Sparkles,
  Clock,
  Lock,
  Building2,
  Filter,
  Send,
  RefreshCw,
  AlertCircle,
  FileText,
  X,
  Radio,
  CheckSquare,
} from 'lucide-react';
import {
  StatCard,
  TactileButton,
  Badge,
  EmptyState,
  TactileTabs,
  type TactileTabItem,
} from '../../components/ui';
import { useAuth } from '../auth/AuthContext';
import { listClassrooms } from '../../api/classrooms';
import {
  fetchSurveyStats,
  fetchSurveys,
  fetchSurveyDetail,
  createSurvey,
  updateSurveyStatus,
  submitSurveyResponse,
} from '../../api/surveys';
import type {
  SurveyListItemDto,
  SurveyDetailDto,
  SurveyStatsOverviewDto,
  CreateSurveyDto,
  CreateSurveyQuestionDto,
  SurveyStatus,
  SurveyQuestionType,
  SurveyTargetType,
  Classroom,
} from '@kidscare/shared-types';

interface SurveyQuickTemplate {
  id: string;
  name: string;
  icon: string;
  title: string;
  description: string;
  targetType: SurveyTargetType;
  isAnonymous: boolean;
  questions: CreateSurveyQuestionDto[];
}

const SURVEY_TEMPLATES: SurveyQuickTemplate[] = [
  {
    id: 'food-satisfaction',
    name: 'Aylık Yemek & Menü Memnuniyeti',
    icon: '🍽️',
    title: 'Aylık Yemek & Beslenme Menüsü Veli Değerlendirmesi',
    description:
      'Kreşimizde sunulan sabah kahvaltısı, öğle yemeği ve ikindi atıştırmalıklarının lezzet, porsiyon ve çeşitliliği hakkındaki görüşlerinizi rica ederiz.',
    targetType: 'ALL_DAYCARE',
    isAnonymous: false,
    questions: [
      {
        questionText: 'Genel olarak yemeklerin lezzeti ve çeşitliliğinden memnun musunuz?',
        questionType: 'RATING_1_5',
        options: [],
        isRequired: true,
      },
      {
        questionText: 'Çocuğunuz kreşte en çok hangi öğünü keyifle tüketiyor?',
        questionType: 'SINGLE_CHOICE',
        options: ['Kahvaltı', 'Öğle Yemeği', 'İkindi Kahvaltısı / Meyve', 'Hepsini Severek Yiyor'],
        isRequired: true,
      },
      {
        questionText: 'Menüde daha sık görmek istediğiniz lezzet veya önerileriniz:',
        questionType: 'OPEN_TEXT',
        options: [],
        isRequired: false,
      },
    ],
  },
  {
    id: 'spring-trip',
    name: 'Bahar Gezisi Güzergah Oylaması',
    icon: '🚌',
    title: '2026 Bahar Dönemi Açık Hava Kültür & Doğa Gezisi Seçimi',
    description:
      'Öğrencilerimizle gerçekleştireceğimiz açık hava müze & doğa gezisi lokasyonunu velilerimizin oylarıyla belirliyoruz.',
    targetType: 'ALL_DAYCARE',
    isAnonymous: false,
    questions: [
      {
        questionText: 'Hangi gezi güzergahını tercih edersiniz?',
        questionType: 'SINGLE_CHOICE',
        options: [
          'Dev Akvaryum & Sualtı Dünyası Gezisi',
          'Atatürk Orman Çiftliği & Doğa Atölyesi',
          'Bilim & Teknoloji Keşif Müzesi',
          'Botanika Parkı & Piknik Etkinliği',
        ],
        isRequired: true,
      },
      {
        questionText: 'Gezide servis eşlikçisi olarak gönüllü olmak ister misiniz?',
        questionType: 'SINGLE_CHOICE',
        options: ['Evet, seve seve katılırım', 'Hayır, iş yoğunluğum nedeniyle katılamam'],
        isRequired: true,
      },
      {
        questionText: 'Geziye dair özel bir alerjen veya güvenlik notunuz var mı?',
        questionType: 'OPEN_TEXT',
        options: [],
        isRequired: false,
      },
    ],
  },
  {
    id: 'graduation-concept',
    name: 'Mezuniyet & Yıl Sonu Konsepti',
    icon: '🎓',
    title: 'Yıl Sonu Mezuniyet Töreni & Gösteri Tercihleri',
    description:
      'Dönem sonu törenimizin organizasyon şekli ve saati konusunda velilerimizin ortak kararını alıyoruz.',
    targetType: 'ALL_DAYCARE',
    isAnonymous: false,
    questions: [
      {
        questionText: 'Hangi tören konseptini daha uygun bulursunuz?',
        questionType: 'SINGLE_CHOICE',
        options: [
          'Açık Hava Çim Alan Şenliği & Aile Kokteyli',
          'Kültür Merkezi Tiyatro Salonunda Resmi Kep Töreni',
          'Kreş Bahçesinde Çadır & Çocuk Karnavalı',
        ],
        isRequired: true,
      },
      {
        questionText: 'Tören zamanlaması tercihi:',
        questionType: 'SINGLE_CHOICE',
        options: ['Cumartesi Sabah (10:00 - 12:30)', 'Cumartesi İkindi/Akşamüstü (16:00 - 19:00)'],
        isRequired: true,
      },
      {
        questionText: 'Eklemek istediğiniz özel gösteri / etkinlik fikirleri:',
        questionType: 'OPEN_TEXT',
        options: [],
        isRequired: false,
      },
    ],
  },
  {
    id: 'workshop-evaluation',
    name: 'Atölye & Kulüp Değerlendirmesi',
    icon: '🎨',
    title: 'İngilizce, Robotik Kodlama ve Sanat Atölyeleri Memnuniyeti',
    description:
      'Haftalık branş derslerimizin çocukların gelişimine katkısını ve yeni dönem beklentilerinizi değerlendirin.',
    targetType: 'ALL_DAYCARE',
    isAnonymous: false,
    questions: [
      {
        questionText: 'Branş öğretmenlerimizin iletişim ve ders verimliliğini puanlayın:',
        questionType: 'RATING_1_5',
        options: [],
        isRequired: true,
      },
      {
        questionText:
          'Gelecek dönem eklenmesini istediğiniz yeni kulüpler (Birden fazla seçilebilir):',
        questionType: 'MULTIPLE_CHOICE',
        options: [
          'Satranç & Akıl Oyunları',
          'Drama & Tiyatro',
          'Jimnastik & Bale',
          'Çocuk Yogası & Mindfulness',
        ],
        isRequired: false,
      },
      {
        questionText: 'Görüş ve tavsiyeleriniz:',
        questionType: 'OPEN_TEXT',
        options: [],
        isRequired: false,
      },
    ],
  },
];

export function SurveysPage(): JSX.Element {
  const { state: authState } = useAuth();
  const userRole = 'user' in authState && authState.user ? authState.user.role : 'PARENT';
  const isParent = userRole === 'PARENT';
  const canManage = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'TEACHER';

  // Stats state
  const [stats, setStats] = useState<SurveyStatsOverviewDto>({
    activeSurveys: 0,
    totalSurveys: 0,
    totalResponses: 0,
    averageSatisfactionScore: 0,
  });

  // Data lists
  const [surveys, setSurveys] = useState<SurveyListItemDto[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState<'active' | 'create' | 'closed'>('active');
  const [filterClassroomId, setFilterClassroomId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [analyticsDetail, setAnalyticsDetail] = useState<SurveyDetailDto | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isLoadingAnalytics, setIsLoadingAnalyticsOpen] = useState<boolean>(false);

  // Parent voting modal
  const [votingSurvey, setVotingSurvey] = useState<SurveyDetailDto | null>(null);
  const [isVotingOpen, setIsVotingOpen] = useState<boolean>(false);
  const [voteAnswers, setVoteAnswers] = useState<
    Record<string, { rating?: number; selectedOptions?: string[]; text?: string }>
  >({});

  // Survey Creation Form
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newTargetType, setNewTargetType] = useState<SurveyTargetType>('ALL_DAYCARE');
  const [newClassroomId, setNewClassroomId] = useState<string>('');
  const [newIsAnonymous, setNewIsAnonymous] = useState<boolean>(false);
  const [newExpiresAt, setNewExpiresAt] = useState<string>('');
  const [newQuestions, setNewQuestions] = useState<CreateSurveyQuestionDto[]>([
    {
      questionText: '',
      questionType: 'RATING_1_5',
      options: [],
      isRequired: true,
    },
  ]);

  // Load initial data
  const loadData = async (): Promise<void> => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [statsRes, surveysRes, classesRes] = await Promise.all([
        fetchSurveyStats().catch(() => ({
          activeSurveys: 0,
          totalSurveys: 0,
          totalResponses: 0,
          averageSatisfactionScore: 0,
        })),
        fetchSurveys({
          classroomId: filterClassroomId ? filterClassroomId : undefined,
        }),
        listClassrooms().catch(() => []),
      ]);

      setStats(statsRes);
      setSurveys(surveysRes);
      setClassrooms(classesRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Veriler yüklenirken hata oluştu.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [filterClassroomId]);

  // Tab counts
  const activeSurveysList = useMemo(() => surveys.filter((s) => s.status === 'ACTIVE'), [surveys]);
  const closedSurveysList = useMemo(() => surveys.filter((s) => s.status === 'CLOSED'), [surveys]);

  const displayedSurveys = useMemo(() => {
    const list = activeTab === 'closed' ? closedSurveysList : activeSurveysList;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.targetClassroomName && s.targetClassroomName.toLowerCase().includes(q)),
    );
  }, [activeTab, activeSurveysList, closedSurveysList, searchQuery]);

  const tabs: TactileTabItem<'active' | 'create' | 'closed'>[] = useMemo(() => {
    const list: TactileTabItem<'active' | 'create' | 'closed'>[] = [
      {
        id: 'active',
        label: 'Aktif Oylama & Anketler',
        count: activeSurveysList.length,
        icon: Vote,
        activeVariant: 'teal',
      },
    ];
    if (canManage) {
      list.push({
        id: 'create',
        label: 'Yeni Anket Oluştur',
        icon: Plus,
        activeVariant: 'amber',
      });
    }
    list.push({
      id: 'closed',
      label: 'Arşiv & Tamamlanan',
      count: closedSurveysList.length,
      icon: CheckCircle2,
      activeVariant: 'sky',
    });
    return list;
  }, [activeSurveysList.length, closedSurveysList.length, canManage]);

  // Apply Quick Template
  const applyTemplate = (tmpl: SurveyQuickTemplate): void => {
    setNewTitle(tmpl.title);
    setNewDescription(tmpl.description);
    setNewTargetType(tmpl.targetType);
    setNewIsAnonymous(tmpl.isAnonymous);
    setNewQuestions(
      tmpl.questions.map((q) => ({
        questionText: q.questionText,
        questionType: q.questionType,
        options: [...(q.options || [])],
        isRequired: q.isRequired ?? true,
      })),
    );
    setSuccessToast(`"${tmpl.name}" şablonu uygulandı! İstediğiniz gibi düzenleyebilirsiniz.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Add Question
  const handleAddQuestion = (): void => {
    setNewQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        questionType: 'RATING_1_5',
        options: [],
        isRequired: true,
      },
    ]);
  };

  // Remove Question
  const handleRemoveQuestion = (idx: number): void => {
    setNewQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Update Question
  const handleUpdateQuestion = (idx: number, patch: Partial<CreateSurveyQuestionDto>): void => {
    setNewQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== idx) return q;
        const updated = { ...q, ...patch };
        if (
          (patch.questionType === 'SINGLE_CHOICE' || patch.questionType === 'MULTIPLE_CHOICE') &&
          (!updated.options || updated.options.length === 0)
        ) {
          updated.options = ['Seçenek 1', 'Seçenek 2'];
        }
        return updated;
      }),
    );
  };

  // Add Option to a question
  const handleAddOption = (qIdx: number): void => {
    setNewQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = q.options || [];
        return {
          ...q,
          options: [...opts, `Seçenek ${opts.length + 1}`],
        };
      }),
    );
  };

  // Update option text
  const handleUpdateOption = (qIdx: number, optIdx: number, val: string): void => {
    setNewQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = [...(q.options || [])];
        opts[optIdx] = val;
        return { ...q, options: opts };
      }),
    );
  };

  // Remove option
  const handleRemoveOption = (qIdx: number, optIdx: number): void => {
    setNewQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = (q.options || []).filter((_: string, oi: number) => oi !== optIdx);
        return { ...q, options: opts };
      }),
    );
  };

  // Submit New Survey
  const handleCreateSurvey = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setErrorMsg('Lütfen bir anket başlığı giriniz.');
      return;
    }
    if (newQuestions.length === 0) {
      setErrorMsg('En az 1 adet soru tanımlamalısınız.');
      return;
    }
    for (let i = 0; i < newQuestions.length; i++) {
      const q = newQuestions[i]!;
      if (!q.questionText.trim()) {
        setErrorMsg(`${i + 1}. sorunun metni boş bırakılamaz.`);
        return;
      }
      if (
        (q.questionType === 'SINGLE_CHOICE' || q.questionType === 'MULTIPLE_CHOICE') &&
        (!q.options || q.options.length < 2)
      ) {
        setErrorMsg(`${i + 1}. soru için en az 2 seçenek eklemelisiniz.`);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload: CreateSurveyDto = {
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        targetType: newTargetType,
        targetClassroomId: newTargetType === 'CLASSROOM' ? newClassroomId : undefined,
        isAnonymous: newIsAnonymous,
        expiresAt: newExpiresAt ? new Date(newExpiresAt).toISOString() : undefined,
        questions: newQuestions.map((q, idx) => ({
          questionText: q.questionText.trim(),
          questionType: q.questionType,
          options:
            q.questionType === 'SINGLE_CHOICE' || q.questionType === 'MULTIPLE_CHOICE'
              ? (q.options || []).map((o: string) => o.trim()).filter(Boolean)
              : [],
          isRequired: q.isRequired ?? true,
          orderIndex: idx,
        })),
      };

      await createSurvey(payload);
      setSuccessToast('🎉 Yeni anket başarıyla oluşturuldu ve velilerin katılımına açıldı!');
      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewTargetType('ALL_DAYCARE');
      setNewClassroomId('');
      setNewExpiresAt('');
      setNewQuestions([
        {
          questionText: '',
          questionType: 'RATING_1_5',
          options: [],
          isRequired: true,
        },
      ]);
      setActiveTab('active');
      await loadData();
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Anket oluşturulurken hata oluştu.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Analytics Modal
  const handleOpenAnalytics = async (surveyId: string): Promise<void> => {
    setIsLoadingAnalyticsOpen(true);
    setIsAnalyticsOpen(true);
    try {
      const detail = await fetchSurveyDetail(surveyId);
      setAnalyticsDetail(detail);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analitik verileri alınamadı.';
      setErrorMsg(msg);
    } finally {
      setIsLoadingAnalyticsOpen(false);
    }
  };

  // Toggle Survey Status (Close / Reopen)
  const handleToggleStatus = async (
    surveyId: string,
    currentStatus: SurveyStatus,
  ): Promise<void> => {
    const nextStatus: SurveyStatus = currentStatus === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    try {
      await updateSurveyStatus(surveyId, nextStatus);
      setSuccessToast(
        nextStatus === 'CLOSED'
          ? 'Anket başarıyla tamamlandı ve arşive taşındı.'
          : 'Anket tekrar aktif hale getirildi.',
      );
      if (analyticsDetail && analyticsDetail.survey.id === surveyId) {
        setAnalyticsDetail({
          ...analyticsDetail,
          survey: { ...analyticsDetail.survey, status: nextStatus },
        });
      }
      await loadData();
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Durum güncellenirken hata oluştu.';
      setErrorMsg(msg);
    }
  };

  // Open Vote Modal for Parents / Direct Answering
  const handleOpenVoting = async (surveyId: string): Promise<void> => {
    try {
      const detail = await fetchSurveyDetail(surveyId);
      setVotingSurvey(detail);
      const initDraft: Record<
        string,
        { rating?: number; selectedOptions?: string[]; text?: string }
      > = {};
      detail.questions.forEach((q) => {
        if (q.questionType === 'RATING_1_5') {
          initDraft[q.id] = { rating: 5 };
        } else if (q.questionType === 'MULTIPLE_CHOICE') {
          initDraft[q.id] = { selectedOptions: [] };
        } else if (q.questionType === 'SINGLE_CHOICE') {
          initDraft[q.id] = { selectedOptions: q.options[0] ? [q.options[0]] : [] };
        } else {
          initDraft[q.id] = { text: '' };
        }
      });
      setVoteAnswers(initDraft);
      setIsVotingOpen(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Anket yüklenemedi.';
      setErrorMsg(msg);
    }
  };

  // Submit Parent Vote
  const handleSubmitVote = async (): Promise<void> => {
    if (!votingSurvey) return;
    setIsSubmitting(true);
    try {
      const answersPayload = votingSurvey.questions.map((q) => {
        const draft = voteAnswers[q.id];
        return {
          questionId: q.id,
          ratingValue: q.questionType === 'RATING_1_5' ? draft?.rating : undefined,
          selectedOptions:
            q.questionType === 'SINGLE_CHOICE' || q.questionType === 'MULTIPLE_CHOICE'
              ? draft?.selectedOptions || []
              : [],
          textResponse: q.questionType === 'OPEN_TEXT' ? draft?.text : undefined,
        };
      });

      await submitSurveyResponse(votingSurvey.survey.id, { answers: answersPayload });
      setSuccessToast('🎉 Oyunuz ve değerli yanıtlarınız başarıyla kaydedildi! Teşekkür ederiz.');
      setIsVotingOpen(false);
      await loadData();
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Oy kaydedilirken hata oluştu.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-teal-800 text-white rounded-xl shadow-lg border border-teal-600 animate-slide-up"
        >
          <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" />
          <span className="text-sm font-semibold">{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stone-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-300 shadow-xs">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">
                Veli Anketleri & Etkinlik Oylamaları
              </h1>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Yemek menüsü memnuniyeti, gezi lokasyonları, mezuniyet konsepti ve atölye
                değerlendirmeleri
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TactileButton
            variant="secondary"
            onClick={() => void loadData()}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Yenile
          </TactileButton>

          {canManage && activeTab !== 'create' && (
            <TactileButton
              variant="amber"
              onClick={() => setActiveTab('create')}
              className="flex items-center gap-2 text-xs"
            >
              <Plus className="w-4 h-4" />
              Yeni Anket Başlat
            </TactileButton>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-sm flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Aktif Anketler"
          value={stats.activeSurveys}
          subtitle="Şu an oylamaya açık"
          icon={Vote}
          variant="teal"
        />
        <StatCard
          title="Toplam Veli Yanıtı"
          value={stats.totalResponses}
          subtitle="Toplanan toplam oy sayısı"
          icon={Users}
          variant="amber"
        />
        <StatCard
          title="Memnuniyet Skoru"
          value={
            stats.averageSatisfactionScore > 0
              ? `${(stats.averageSatisfactionScore / 20).toFixed(1)} / 5.0`
              : '—'
          }
          subtitle={
            stats.averageSatisfactionScore > 0
              ? `%${stats.averageSatisfactionScore} genel memnuniyet`
              : 'Puanlama bekleniyor'
          }
          icon={Star}
          variant="amber"
        />
        <StatCard
          title="Toplam Anket"
          value={stats.totalSurveys}
          subtitle="Oluşturulan tüm anketler"
          icon={CheckCircle2}
          variant="teal"
        />
      </div>

      {/* Main Tabs Navigation */}
      <TactileTabs<'active' | 'create' | 'closed'>
        tabs={tabs}
        activeId={activeTab}
        onChange={setActiveTab}
        ariaLabel="Anket sekmeleri"
      />

      {/* Tab: ACTIVE & CLOSED LIST */}
      {(activeTab === 'active' || activeTab === 'closed') && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-stone-200 dark:border-slate-700 shadow-xs">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Anket başlığı, açıklama veya sınıf ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-stone-900 dark:text-white"
              />
              <Filter className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-stone-400 shrink-0" />
              <select
                aria-label="Sınıf filtrele"
                value={filterClassroomId}
                onChange={(e) => setFilterClassroomId(e.target.value)}
                className="text-xs bg-stone-50 dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-lg px-3 py-2 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Tüm Kreş / Tüm Sınıflar</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Surveys Cards Grid */}
          {isLoading ? (
            <div className="p-12 text-center text-stone-400">
              <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-teal-600" />
              <p className="text-sm">Anketler ve oylamalar yükleniyor...</p>
            </div>
          ) : displayedSurveys.length === 0 ? (
            <EmptyState
              title={
                activeTab === 'active' ? 'Aktif Anket Bulunmuyor' : 'Arşivlenmiş Anket Bulunmuyor'
              }
              description={
                activeTab === 'active'
                  ? 'Şu an oylamaya açık bir veli anketi bulunmuyor. Yeni bir memnuniyet veya gezi oylaması başlatabilirsiniz.'
                  : 'Henüz tamamlanıp arşive kaldırılmış anket bulunmuyor.'
              }
              action={
                canManage && activeTab === 'active' ? (
                  <TactileButton variant="amber" onClick={() => setActiveTab('create')}>
                    <Plus className="w-4 h-4 inline mr-1" />
                    Yeni Anket Başlat
                  </TactileButton>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedSurveys.map((survey) => {
                const isTargetAll = survey.targetType === 'ALL_DAYCARE';
                const hasExpired =
                  survey.expiresAt && new Date(survey.expiresAt).getTime() < Date.now();

                return (
                  <div
                    key={survey.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 p-5 shadow-xs flex flex-col justify-between hover:border-teal-500/40 transition-colors"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant={survey.status === 'ACTIVE' ? 'success' : 'neutral'}>
                            {survey.status === 'ACTIVE' ? 'Aktif Oylama' : 'Tamamlandı'}
                          </Badge>

                          <Badge variant={isTargetAll ? 'brand' : 'accent'}>
                            {isTargetAll ? 'Tüm Kreş' : survey.targetClassroomName || 'Sınıf Özel'}
                          </Badge>

                          {survey.isAnonymous && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-slate-700/80 px-2 py-0.5 rounded-md">
                              <Lock className="w-3 h-3 text-stone-400" />
                              Anonim
                            </span>
                          )}
                        </div>

                        {survey.hasResponded && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                            Yanıtınız Alındı
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-stone-900 dark:text-white leading-snug line-clamp-2 mb-1.5">
                        {survey.title}
                      </h3>
                      {survey.description && (
                        <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3 mb-4">
                          {survey.description}
                        </p>
                      )}

                      {/* Meta stats bar */}
                      <div className="grid grid-cols-2 gap-2 bg-stone-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-stone-200/80 dark:border-slate-700/60 text-xs mb-4">
                        <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                          <FileText className="w-3.5 h-3.5 text-teal-600" />
                          <span>{survey.questionCount} Soru</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                          <Users className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-semibold text-stone-800 dark:text-stone-200">
                            {survey.responseCount} Veli Katıldı
                          </span>
                        </div>
                        {survey.expiresAt && (
                          <div className="col-span-2 flex items-center gap-1.5 text-[11px] text-stone-500">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>
                              Son Katılım:{' '}
                              {new Date(survey.expiresAt).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                              {hasExpired && (
                                <span className="text-rose-600 ml-1 font-bold">(Süre Doldu)</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-slate-700/60">
                      {/* Parent Vote CTA */}
                      {isParent && survey.status === 'ACTIVE' && !survey.hasResponded && (
                        <TactileButton
                          variant="amber"
                          onClick={() => void handleOpenVoting(survey.id)}
                          className="flex items-center gap-1.5 text-xs font-bold"
                        >
                          <Vote className="w-3.5 h-3.5" />
                          Anketi Doldur & Oy Ver
                        </TactileButton>
                      )}

                      {/* Parent can also view live results if already responded */}
                      {isParent && (survey.hasResponded || survey.status === 'CLOSED') && (
                        <TactileButton
                          variant="secondary"
                          onClick={() => void handleOpenAnalytics(survey.id)}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
                          Sonuçları Gör
                        </TactileButton>
                      )}

                      {/* Staff Actions */}
                      {canManage && (
                        <div className="flex items-center gap-2 w-full justify-between">
                          <TactileButton
                            variant="secondary"
                            onClick={() => void handleOpenAnalytics(survey.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold"
                          >
                            <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
                            Canlı Analitik & Yanıtlar ({survey.responseCount})
                          </TactileButton>

                          <div className="flex items-center gap-1.5">
                            {!survey.hasResponded && survey.status === 'ACTIVE' && (
                              <button
                                type="button"
                                onClick={() => void handleOpenVoting(survey.id)}
                                className="text-xs text-amber-700 dark:text-amber-400 hover:underline px-2 py-1 font-medium"
                                title="Anketi veli gözüyle dene"
                              >
                                Test Oyu Ver
                              </button>
                            )}

                            <TactileButton
                              variant={survey.status === 'ACTIVE' ? 'secondary' : 'teal'}
                              onClick={() => void handleToggleStatus(survey.id, survey.status)}
                              className="text-xs"
                            >
                              {survey.status === 'ACTIVE' ? 'Anketi Kapat' : 'Tekrar Aç'}
                            </TactileButton>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: CREATE SURVEY (WIZARD) */}
      {activeTab === 'create' && canManage && (
        <div className="space-y-6">
          {/* Quick Templates Shelf */}
          <div className="bg-linear-to-r from-stone-50 to-stone-100 dark:from-slate-800/90 dark:to-slate-900/90 p-5 rounded-2xl border border-stone-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                Hızlı Hazır Şablonlar (Tek Tıkla Doldur)
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SURVEY_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => applyTemplate(tmpl)}
                  className="text-left bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-stone-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-sm transition-all group"
                >
                  <div className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">
                    {tmpl.icon}
                  </div>
                  <h3 className="text-xs font-bold text-stone-900 dark:text-white line-clamp-1">
                    {tmpl.name}
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-0.5">
                    {tmpl.questions.length} soru · {tmpl.title}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => void handleCreateSurvey(e)}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-stone-200 dark:border-slate-700 shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-slate-700 pb-4">
              <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Vote className="w-5 h-5 text-teal-600" />
                Yeni Anket & Oylama Detayları
              </h2>
              <span className="text-xs text-stone-500">
                Tüm sorular veli mobil ve web arayüzünde canlı oylamaya açılacaktır.
              </span>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Anket Başlığı <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 2026 Mayıs Ayı Yemek & Beslenme Memnuniyet Anketi"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm bg-stone-50 dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 text-stone-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Açıklama / Veliye Bilgilendirme Notu
                </label>
                <textarea
                  rows={3}
                  placeholder="Değerli velilerimiz, kreşimizdeki eğitim ve hizmet kalitesini artırmak adına görüşleriniz..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-sm bg-stone-50 dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 text-stone-900 dark:text-white"
                />
              </div>

              {/* Target Type */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Hedef Kitle (Kapsam)
                </label>
                <select
                  value={newTargetType}
                  onChange={(e) => setNewTargetType(e.target.value as SurveyTargetType)}
                  className="w-full text-sm bg-stone-50 dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="ALL_DAYCARE">Tüm Kreş Velileri</option>
                  <option value="CLASSROOM">Belirli Bir Sınıf</option>
                </select>
              </div>

              {/* Classroom picker if CLASSROOM */}
              {newTargetType === 'CLASSROOM' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Hedef Sınıf <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newClassroomId}
                    onChange={(e) => setNewClassroomId(e.target.value)}
                    required
                    className="w-full text-sm bg-stone-50 dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Sınıf Seçiniz</option>
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Son Katılım Tarihi (Opsiyonel)
                </label>
                <input
                  type="date"
                  value={newExpiresAt}
                  onChange={(e) => setNewExpiresAt(e.target.value)}
                  className="w-full text-sm bg-stone-50 dark:bg-slate-900 border border-stone-300 dark:border-slate-700 rounded-xl px-3 py-2 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center gap-2 pt-6">
                <input
                  id="anonymousCheck"
                  type="checkbox"
                  checked={newIsAnonymous}
                  onChange={(e) => setNewIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded-sm border-stone-300 focus:ring-teal-500"
                />
                <label
                  htmlFor="anonymousCheck"
                  className="text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer"
                >
                  🔒 Anonim Anket (Veli isimleri gizli tutulsun, sadece oy oranları listelensin)
                </label>
              </div>
            </div>

            {/* Questions Builder */}
            <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                    Anket Soruları ({newQuestions.length})
                  </h3>
                  <p className="text-xs text-stone-500">
                    Yıldız puanlama, tekli seçim, çoklu seçim ve açık uçlu yorum soruları
                    ekleyebilirsiniz.
                  </p>
                </div>
                <TactileButton
                  variant="secondary"
                  onClick={handleAddQuestion}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Soru Ekle
                </TactileButton>
              </div>

              {newQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-stone-50 dark:bg-slate-900/60 p-4 rounded-xl border border-stone-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-200 font-bold text-xs flex items-center justify-center shrink-0 mt-1">
                      {idx + 1}
                    </span>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          required
                          placeholder={`${idx + 1}. Soru metnini yazınız...`}
                          value={q.questionText}
                          onChange={(e) =>
                            handleUpdateQuestion(idx, { questionText: e.target.value })
                          }
                          className="w-full text-sm bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-lg px-3 py-2 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <select
                          value={q.questionType}
                          onChange={(e) =>
                            handleUpdateQuestion(idx, {
                              questionType: e.target.value as SurveyQuestionType,
                            })
                          }
                          className="w-full text-xs bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-lg px-2.5 py-2 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="RATING_1_5">⭐ 1-5 Yıldız Puanlama</option>
                          <option value="SINGLE_CHOICE">🔘 Tekli Seçim (Radyo)</option>
                          <option value="MULTIPLE_CHOICE">☑️ Çoklu Seçim (Kutucuk)</option>
                          <option value="OPEN_TEXT">📝 Açık Uçlu Yorum / Metin</option>
                        </select>
                      </div>
                    </div>

                    {newQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                        title="Soruyu Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Options editor for choice types */}
                  {(q.questionType === 'SINGLE_CHOICE' || q.questionType === 'MULTIPLE_CHOICE') && (
                    <div className="pl-9 space-y-2">
                      <p className="text-[11px] font-bold text-stone-600 dark:text-stone-400">
                        Seçenekler:
                      </p>
                      {(q.options || []).map((opt: string, optIdx: number) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <span className="text-xs text-stone-400 font-mono">{optIdx + 1}.</span>
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                            placeholder={`Seçenek ${optIdx + 1}`}
                            className="flex-1 text-xs bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-stone-900 dark:text-white"
                          />
                          {(q.options || []).length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(idx, optIdx)}
                              className="text-stone-400 hover:text-rose-500"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddOption(idx)}
                        className="text-xs text-teal-700 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1 pt-1"
                      >
                        <Plus className="w-3 h-3" />
                        Seçenek Ekle
                      </button>
                    </div>
                  )}

                  <div className="pl-9 flex items-center gap-2">
                    <input
                      id={`req-${idx}`}
                      type="checkbox"
                      checked={q.isRequired ?? true}
                      onChange={(e) => handleUpdateQuestion(idx, { isRequired: e.target.checked })}
                      className="w-3.5 h-3.5 text-teal-600 rounded-sm"
                    />
                    <label
                      htmlFor={`req-${idx}`}
                      className="text-xs text-stone-600 dark:text-stone-400 cursor-pointer"
                    >
                      Cevaplanması zorunlu soru
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-slate-700">
              <TactileButton
                variant="secondary"
                onClick={() => setActiveTab('active')}
                disabled={isSubmitting}
              >
                İptal
              </TactileButton>

              <TactileButton
                variant="teal"
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Yayınlanıyor...' : 'Anketi Yayınla & Oylamaya Aç'}
              </TactileButton>
            </div>
          </form>
        </div>
      )}

      {/* ANALYTICS & RESULTS MODAL */}
      {isAnalyticsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 dark:border-slate-700 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={analyticsDetail?.survey.status === 'ACTIVE' ? 'success' : 'neutral'}
                  >
                    {analyticsDetail?.survey.status === 'ACTIVE' ? 'Aktif Oylama' : 'Tamamlandı'}
                  </Badge>
                  <span className="text-xs text-stone-500">
                    Oluşturan: {analyticsDetail?.survey.creatorName || 'Yönetim'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                  {analyticsDetail?.survey.title || 'Anket Analitiği'}
                </h2>
                {analyticsDetail?.survey.description && (
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    {analyticsDetail.survey.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsAnalyticsOpen(false);
                  setAnalyticsDetail(null);
                }}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingAnalytics || !analyticsDetail ? (
              <div className="p-12 text-center text-stone-400">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-teal-600" />
                <p className="text-xs">Canlı sonuçlar ve oy dağılımları hesaplanıyor...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Participation Summary bar */}
                <div className="bg-stone-50 dark:bg-slate-900/60 p-4 rounded-xl border border-stone-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-600" />
                    <div>
                      <span className="text-xs text-stone-500">Toplam Katılan Veli:</span>
                      <p className="text-base font-black text-stone-900 dark:text-white">
                        {analyticsDetail.survey.responseCount} Yanıt
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <div>
                      <span className="text-xs text-stone-500">Soru Sayısı:</span>
                      <p className="text-base font-black text-stone-900 dark:text-white">
                        {analyticsDetail.questions.length} Soru
                      </p>
                    </div>
                  </div>

                  {canManage && (
                    <TactileButton
                      variant={analyticsDetail.survey.status === 'ACTIVE' ? 'secondary' : 'teal'}
                      onClick={() =>
                        void handleToggleStatus(
                          analyticsDetail.survey.id,
                          analyticsDetail.survey.status,
                        )
                      }
                      className="text-xs"
                    >
                      {analyticsDetail.survey.status === 'ACTIVE'
                        ? 'Oylamayı Sonlandır'
                        : 'Tekrar Aktifleştir'}
                    </TactileButton>
                  )}
                </div>

                {/* Questions Breakdown */}
                <div className="space-y-5">
                  {(analyticsDetail.analytics ?? []).map((qa, qIdx) => {
                    const totalOptionVotes = Object.values(qa.optionCounts || {}).reduce(
                      (a, b) => a + b,
                      0,
                    );
                    const totalRatingVotes = Object.values(qa.ratingDistribution || {}).reduce(
                      (a, b) => a + b,
                      0,
                    );

                    return (
                      <div
                        key={qa.questionId}
                        className="bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-stone-200 dark:border-slate-700 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {qIdx + 1}
                            </span>
                            <div>
                              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                                {qa.questionText}
                              </h3>
                              <span className="text-[11px] text-stone-400">
                                {qa.questionType === 'RATING_1_5'
                                  ? `${totalRatingVotes} veli puanladı`
                                  : qa.questionType === 'OPEN_TEXT'
                                    ? `${qa.textAnswers?.length || 0} yorum yapıldı`
                                    : `${totalOptionVotes} oy kullanıldı`}
                              </span>
                            </div>
                          </div>

                          {qa.averageRating !== undefined && qa.averageRating !== null && (
                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-lg">
                              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                              <span className="text-sm font-black text-amber-900 dark:text-amber-200">
                                {qa.averageRating.toFixed(1)} / 5.0
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Rating Distribution Bars */}
                        {qa.ratingDistribution && (
                          <div className="space-y-1.5 pt-2">
                            {[5, 4, 3, 2, 1].map((starNum) => {
                              const count = qa.ratingDistribution?.[starNum] || 0;
                              const pct =
                                totalRatingVotes > 0
                                  ? Math.round((count / totalRatingVotes) * 100)
                                  : 0;
                              return (
                                <div key={starNum} className="flex items-center gap-2 text-xs">
                                  <span className="w-12 text-stone-600 dark:text-stone-400 font-medium shrink-0 flex items-center gap-0.5">
                                    {starNum}{' '}
                                    <Star className="w-3 h-3 text-amber-500 inline fill-amber-500" />
                                  </span>
                                  <div className="flex-1 bg-stone-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
                                    <div
                                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="w-14 text-right text-stone-600 dark:text-stone-300 font-semibold text-[11px]">
                                    {count} oy (%{pct})
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Choice Distribution Bars */}
                        {qa.optionCounts && Object.keys(qa.optionCounts).length > 0 && (
                          <div className="space-y-2 pt-2">
                            {Object.entries(qa.optionCounts).map(([optName, count]) => {
                              const pct =
                                totalOptionVotes > 0
                                  ? Math.round((count / totalOptionVotes) * 100)
                                  : 0;
                              return (
                                <div key={optName} className="space-y-0.5">
                                  <div className="flex justify-between text-xs font-semibold text-stone-800 dark:text-stone-200">
                                    <span>{optName}</span>
                                    <span>
                                      {count} oy (%{pct})
                                    </span>
                                  </div>
                                  <div className="w-full bg-stone-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                                    <div
                                      className="bg-teal-600 h-full rounded-full transition-all duration-500"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Text Answers Shelf */}
                        {qa.textAnswers && qa.textAnswers.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <p className="text-xs font-bold text-stone-600 dark:text-stone-400">
                              Veli Yorum & Görüşleri ({qa.textAnswers.length}):
                            </p>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {qa.textAnswers.map((txt, ti) => (
                                <div
                                  key={ti}
                                  className="p-2.5 bg-stone-50 dark:bg-slate-800/80 rounded-lg text-xs text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-slate-700"
                                >
                                  &ldquo;{txt}&rdquo;
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Respondents Table */}
                {(analyticsDetail.responses ?? []).length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-stone-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-teal-600" />
                      Katılan Veliler & Yanıt Tarihleri
                    </h3>
                    <div className="border border-stone-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 dark:bg-slate-900/80 text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-slate-700">
                          <tr>
                            <th className="py-2.5 px-3 font-semibold">Veli / Katılımcı</th>
                            <th className="py-2.5 px-3 font-semibold">Öğrenci</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Tarih</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-slate-800 text-stone-800 dark:text-stone-200">
                          {(analyticsDetail.responses ?? []).map((r) => (
                            <tr
                              key={r.id}
                              className="hover:bg-stone-50/50 dark:hover:bg-slate-800/40"
                            >
                              <td className="py-2.5 px-3 font-medium">
                                {analyticsDetail.survey.isAnonymous
                                  ? '🔒 Anonim Veli'
                                  : r.respondentName || 'Veli'}
                              </td>
                              <td className="py-2.5 px-3 text-stone-500">
                                {analyticsDetail.survey.isAnonymous ? '—' : r.studentName || '—'}
                              </td>
                              <td className="py-2.5 px-3 text-right text-stone-400">
                                {new Date(r.createdAt).toLocaleDateString('tr-TR', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PARENT / DIRECT VOTING MODAL */}
      {isVotingOpen && votingSurvey && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 max-w-xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 dark:border-slate-700 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="brand">Anket & Oylama</Badge>
                  {votingSurvey.survey.isAnonymous && (
                    <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Anonim Yanıt
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                  {votingSurvey.survey.title}
                </h2>
                {votingSurvey.survey.description && (
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                    {votingSurvey.survey.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsVotingOpen(false);
                  setVotingSurvey(null);
                }}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions Form */}
            <div className="space-y-5">
              {votingSurvey.questions.map((q, idx) => {
                const currentAnswer = voteAnswers[q.id];

                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                          {q.questionText}
                          {q.isRequired && <span className="text-rose-500 ml-1">*</span>}
                        </h3>
                      </div>
                    </div>

                    {/* RATING 1-5 */}
                    {q.questionType === 'RATING_1_5' && (
                      <div className="flex items-center gap-3 pt-1">
                        {[1, 2, 3, 4, 5].map((starVal) => {
                          const isSelected = (currentAnswer?.rating || 0) >= starVal;
                          return (
                            <button
                              key={starVal}
                              type="button"
                              onClick={() =>
                                setVoteAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: { ...prev[q.id], rating: starVal },
                                }))
                              }
                              className="p-1 hover:scale-125 transition-transform focus:outline-none"
                            >
                              <Star
                                className={`w-7 h-7 ${
                                  isSelected
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-stone-300 dark:text-slate-700'
                                }`}
                              />
                            </button>
                          );
                        })}
                        <span className="text-xs font-black text-amber-700 dark:text-amber-300 ml-2">
                          {currentAnswer?.rating || 0} / 5 Yıldız
                        </span>
                      </div>
                    )}

                    {/* SINGLE CHOICE */}
                    {q.questionType === 'SINGLE_CHOICE' && (
                      <div className="space-y-2 pt-1">
                        {q.options.map((opt) => {
                          const isChecked = currentAnswer?.selectedOptions?.[0] === opt;
                          return (
                            <label
                              key={opt}
                              onClick={() =>
                                setVoteAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: { ...prev[q.id], selectedOptions: [opt] },
                                }))
                              }
                              className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-200 font-bold shadow-xs'
                                  : 'bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-800 dark:text-stone-200'
                              }`}
                            >
                              <Radio
                                className={`w-4 h-4 shrink-0 ${
                                  isChecked ? 'text-teal-600' : 'text-stone-400'
                                }`}
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* MULTIPLE CHOICE */}
                    {q.questionType === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-2 pt-1">
                        {q.options.map((opt) => {
                          const selected = currentAnswer?.selectedOptions || [];
                          const isChecked = selected.includes(opt);
                          return (
                            <label
                              key={opt}
                              onClick={() => {
                                const next = isChecked
                                  ? selected.filter((s) => s !== opt)
                                  : [...selected, opt];
                                setVoteAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: { ...prev[q.id], selectedOptions: next },
                                }));
                              }}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-200 font-bold shadow-xs'
                                  : 'bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-stone-800 dark:text-stone-200'
                              }`}
                            >
                              <CheckSquare
                                className={`w-4 h-4 shrink-0 ${
                                  isChecked ? 'text-teal-600' : 'text-stone-400'
                                }`}
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* OPEN TEXT */}
                    {q.questionType === 'OPEN_TEXT' && (
                      <textarea
                        rows={3}
                        placeholder="Fikir veya önerilerinizi buraya yazabilirsiniz..."
                        value={currentAnswer?.text || ''}
                        onChange={(e) =>
                          setVoteAnswers((prev) => ({
                            ...prev,
                            [q.id]: { ...prev[q.id], text: e.target.value },
                          }))
                        }
                        className="w-full text-xs bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl p-3 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-slate-700">
              <TactileButton
                variant="secondary"
                onClick={() => {
                  setIsVotingOpen(false);
                  setVotingSurvey(null);
                }}
                disabled={isSubmitting}
              >
                Vazgeç
              </TactileButton>

              <TactileButton
                variant="amber"
                onClick={() => void handleSubmitVote()}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Vote className="w-4 h-4" />
                {isSubmitting ? 'Kaydediliyor...' : 'Oylamamı Gönder'}
              </TactileButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default SurveysPage;
