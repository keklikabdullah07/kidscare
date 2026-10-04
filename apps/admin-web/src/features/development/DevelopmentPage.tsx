import { useState, useEffect, useMemo, type FormEvent, type JSX } from 'react';
import {
  Award,
  BookOpen,
  Image as ImageIcon,
  Lightbulb,
  Plus,
  Calendar,
  CheckCircle,
  Check,
  MessageSquare,
  Activity,
  Heart,
  Sparkles,
  Smile,
  Palette,
  Eye,
  Lock,
  RotateCw,
  X,
  User,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/Toast';
import { listStudents } from '../../api/students';
import { listMediaFiles } from '../../api/media';
import {
  listObservations,
  createObservation,
  listPortfolio,
  createPortfolioItem,
  listHomeActivities,
  createHomeActivity,
} from '../../api/development';
import type {
  DevelopmentDomain,
  DevelopmentObservationDto,
  HomeActivitySuggestionDto,
  MediaFileItem,
  PortfolioItemDto,
  Student,
} from '@kidscare/shared-types';
import {
  Badge,
  EmptyState,
  MediaUrlField,
  StatCard,
  TactileButton,
  TactileTabs,
  type TactileTabItem,
} from '../../components/ui';

export const PRESET_PORTFOLIO_PHOTOS = [
  {
    name: 'Sulu Boya Çalışması',
    url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop',
  },
  {
    name: 'Parmak Boyası & Baskı',
    url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&auto=format&fit=crop',
  },
  {
    name: 'Oyun Hamuru & Kil',
    url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop',
  },
  {
    name: 'Renkli Kağıt Kolajı',
    url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Ahşap Blok Kule',
    url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop',
  },
  {
    name: 'Doğal Yaprak & Dal Sanatı',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop',
  },
];

interface DomainMeta {
  label: string;
  badgeCls: string;
  icon: typeof Award;
}

interface PortfolioFormState {
  studentId: string;
  title: string;
  description: string;
  isParentVisible: boolean;
}

const DOMAIN_LABELS: Record<DevelopmentDomain, DomainMeta> = {
  DIL: {
    label: 'Dil & Konuşma',
    badgeCls:
      'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
    icon: MessageSquare,
  },
  MOTOR: {
    label: 'Motor Beceriler',
    badgeCls:
      'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    icon: Activity,
  },
  SOSYAL_DUYGUSAL: {
    label: 'Sosyal & Duygusal',
    badgeCls:
      'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60',
    icon: Heart,
  },
  BILISSEL: {
    label: 'Bilişsel Gelişim',
    badgeCls:
      'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    icon: Sparkles,
  },
  OZ_BAKIM: {
    label: 'Öz Bakım & Yaşam',
    badgeCls:
      'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
    icon: Smile,
  },
  SANAT: {
    label: 'Sanat & Yaratıcılık',
    badgeCls:
      'bg-pink-50 text-pink-800 border-pink-300 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800/60',
    icon: Palette,
  },
};

type TabKey = 'observations' | 'portfolio' | 'activities';

export function DevelopmentPage(): JSX.Element {
  const { state } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('observations');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<DevelopmentDomain | ''>('');

  const [observations, setObservations] = useState<DevelopmentObservationDto[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemDto[]>([]);
  const [activities, setActivities] = useState<HomeActivitySuggestionDto[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [showObsModal, setShowObsModal] = useState(false);
  const [obsForm, setObsForm] = useState({
    studentId: '',
    domain: 'DIL' as DevelopmentDomain,
    skillName: '',
    observation: '',
    isParentVisible: true,
  });

  const [showPortModal, setShowPortModal] = useState(false);
  const [portForm, setPortForm] = useState<PortfolioFormState>({
    studentId: '',
    title: '',
    description: '',
    isParentVisible: true,
  });
  const [portMediaUrls, setPortMediaUrls] = useState<string[]>([]);
  const [tenantMediaFiles, setTenantMediaFiles] = useState<MediaFileItem[]>([]);

  const [showActModal, setShowActModal] = useState(false);
  const [actForm, setActForm] = useState({
    domain: 'DIL' as DevelopmentDomain,
    ageGroup: '3-4 Yaş',
    title: '',
    description: '',
  });

  const canEdit =
    state.status === 'authenticated' &&
    (state.user.role === 'ADMIN' ||
      state.user.role === 'SUPER_ADMIN' ||
      state.user.role === 'TEACHER');

  useEffect(() => {
    if (showPortModal && canEdit) {
      listMediaFiles('PORTFOLIO', 30)
        .then((items) => {
          if (items.length > 0) {
            setTenantMediaFiles(items);
          } else {
            void listMediaFiles(undefined, 30).then(setTenantMediaFiles);
          }
        })
        .catch(() => {
          // silent fallback
        });
    }
  }, [showPortModal, canEdit]);

  function togglePortPreset(url: string): void {
    if (portMediaUrls.includes(url)) {
      setPortMediaUrls(portMediaUrls.filter((u) => u !== url));
    } else {
      setPortMediaUrls([...portMediaUrls, url]);
    }
  }

  function togglePortPhotoUrl(url: string): void {
    if (portMediaUrls.includes(url)) {
      setPortMediaUrls(portMediaUrls.filter((u) => u !== url));
    } else {
      setPortMediaUrls([...portMediaUrls, url]);
    }
  }

  function removePortMediaUrl(url: string): void {
    setPortMediaUrls(portMediaUrls.filter((u) => u !== url));
  }

  useEffect(() => {
    async function init() {
      try {
        const studentList = await listStudents();
        setStudents(studentList);
      } catch (err) {
        console.error(err);
      }
    }
    void init();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'observations') {
        const res = await listObservations(
          selectedStudentId || undefined,
          (selectedDomain as DevelopmentDomain) || undefined,
        );
        setObservations(res);
      } else if (activeTab === 'portfolio') {
        const res = await listPortfolio(selectedStudentId || undefined);
        setPortfolioItems(res);
      } else if (activeTab === 'activities') {
        const res = await listHomeActivities((selectedDomain as DevelopmentDomain) || undefined);
        setActivities(res);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [activeTab, selectedStudentId, selectedDomain]);

  async function handleCreateObservation(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createObservation(obsForm);
      setShowObsModal(false);
      const createdStudentId = obsForm.studentId;
      setObsForm({
        studentId: createdStudentId || (students[0]?.id ?? ''),
        domain: 'DIL',
        skillName: '',
        observation: '',
        isParentVisible: true,
      });
      setSelectedStudentId(createdStudentId);
      setSelectedDomain('');
      const res = await listObservations(createdStudentId || undefined, undefined);
      setObservations(res);
      showToast('Gözlem kaydı başarıyla eklendi! ✨', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gözlem kaydedilemedi', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreatePortfolio(e: FormEvent) {
    e.preventDefault();
    if (portMediaUrls.length === 0) {
      showToast('Lütfen en az bir portfolyo görseli seçin veya yükleyin.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      if (portMediaUrls.length === 1) {
        await createPortfolioItem({
          ...portForm,
          mediaUrl: portMediaUrls[0] as string,
        });
      } else {
        // Çoklu görsel seçildiğinde her biri ardışık olarak portfolyoya kaydedilir
        for (let i = 0; i < portMediaUrls.length; i++) {
          const url = portMediaUrls[i] as string;
          const multiTitle = `${portForm.title} (${i + 1}/${portMediaUrls.length})`;
          await createPortfolioItem({
            ...portForm,
            title: multiTitle,
            mediaUrl: url,
          });
        }
      }
      setShowPortModal(false);
      setPortForm({
        studentId: selectedStudentId || (students[0]?.id ?? ''),
        title: '',
        description: '',
        isParentVisible: true,
      });
      setPortMediaUrls([]);
      const res = await listPortfolio(selectedStudentId || undefined);
      setPortfolioItems(res);
      showToast(
        portMediaUrls.length > 1
          ? `${portMediaUrls.length} portfolyo çalışması başarıyla eklendi! 🎨`
          : 'Portfolyo çalışması başarıyla eklendi! 🎨',
        'success',
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Portfolyo çalışması kaydedilemedi', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateActivity(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createHomeActivity(actForm);
      setShowActModal(false);
      setActForm({
        domain: 'DIL',
        ageGroup: '3-4 Yaş',
        title: '',
        description: '',
      });
      const res = await listHomeActivities((selectedDomain as DevelopmentDomain) || undefined);
      setActivities(res);
      showToast('Ev etkinliği önerisi başarıyla eklendi! 💡', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Aktivite kaydedilemedi', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const tabs = useMemo<TactileTabItem<TabKey>[]>(
    () => [
      {
        id: 'observations',
        label: 'Pedagojik Gözlemler',
        icon: BookOpen,
        count: observations.length,
        activeVariant: 'teal',
      },
      {
        id: 'portfolio',
        label: 'Öğrenci Portfolyosu',
        icon: ImageIcon,
        count: portfolioItems.length,
        activeVariant: 'amber',
      },
      {
        id: 'activities',
        label: 'Ev Etkinlik Havuzu',
        icon: Lightbulb,
        count: activities.length,
        activeVariant: 'sky',
      },
    ],
    [observations.length, portfolioItems.length, activities.length],
  );

  const parentVisibleCount = useMemo(() => {
    return (
      observations.filter((o) => o.isParentVisible).length +
      portfolioItems.filter((p) => p.isParentVisible).length
    );
  }, [observations, portfolioItems]);

  return (
    <div className="space-y-6">
      {/* Üst Başlık ve Dokunsal Aksiyonlar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-slate-800 border-2 border-teal-700/30 dark:border-teal-500/30 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold shadow-[0_3px_0_0_#0f766e]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Gelişim Hikâyesi & Öğrenci Portfolyosu
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Pedagojik gözlem tutanakları, dijital ürün portfolyosu ve ev etkinlik önerileri
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <TactileButton
            variant="secondary"
            size="sm"
            onClick={() => void loadData()}
            disabled={loading}
          >
            <RotateCw className="w-3.5 h-3.5" />
            Yenile
          </TactileButton>

          {canEdit && activeTab === 'observations' && (
            <TactileButton
              variant="teal"
              size="sm"
              onClick={() => {
                setObsForm((prev) => ({
                  ...prev,
                  studentId: selectedStudentId || (students[0]?.id ?? ''),
                }));
                setShowObsModal(true);
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Gözlem Ekle
            </TactileButton>
          )}

          {canEdit && activeTab === 'portfolio' && (
            <TactileButton
              variant="amber"
              size="sm"
              onClick={() => {
                setPortForm((prev) => ({
                  ...prev,
                  studentId: selectedStudentId || (students[0]?.id ?? ''),
                }));
                setShowPortModal(true);
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Çalışma Ekle
            </TactileButton>
          )}

          {canEdit && activeTab === 'activities' && (
            <TactileButton variant="teal" size="sm" onClick={() => setShowActModal(true)}>
              <Plus className="w-3.5 h-3.5" />
              Etkinlik Önerisi Ekle
            </TactileButton>
          )}
        </div>
      </div>

      {/* Dokunsal KPI Özet Sayaçları (Tıklanabilir Sekme Geçişi) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <button
          type="button"
          onClick={() => {
            setActiveTab('observations');
            setSelectedStudentId('');
            setSelectedDomain('');
          }}
          className="text-left w-full cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          aria-label="Toplam Gözlemler sekmesine geç ve filtreleri sıfırla"
        >
          <StatCard
            title="Toplam Gözlem"
            value={observations.length}
            subtitle="Pedagojik kayıt"
            variant="blue"
            icon={BookOpen}
          />
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('portfolio');
            setSelectedStudentId('');
          }}
          className="text-left w-full cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          aria-label="Öğrenci Portfolyosu sekmesine geç"
        >
          <StatCard
            title="Portfolyo Eseri"
            value={portfolioItems.length}
            subtitle="Görsel & proje ürünü"
            variant="amber"
            icon={ImageIcon}
          />
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('activities');
            setSelectedDomain('');
          }}
          className="text-left w-full cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          aria-label="Ev Etkinlikleri sekmesine geç"
        >
          <StatCard
            title="Ev Etkinlikleri"
            value={activities.length}
            subtitle="Aile etkinlik havuzu"
            variant="indigo"
            icon={Lightbulb}
          />
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('observations');
            setSelectedStudentId('');
            setSelectedDomain('');
          }}
          className="text-left w-full cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          aria-label="Veli Paylaşımları görünümüne geç"
        >
          <StatCard
            title="Veli Paylaşımı"
            value={parentVisibleCount}
            subtitle="Veli portalında açık"
            variant="emerald"
            icon={Eye}
          />
        </button>
      </div>

      {/* Evrensel Dokunsal Sekmeler & Filtre Çubuğu */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <TactileTabs<TabKey> tabs={tabs} activeId={activeTab} onChange={setActiveTab} />

        {/* Filtre Kontrolleri */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {activeTab !== 'activities' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Öğrenci:</span>
              <div className="relative">
                <select
                  aria-label="Öğrenci Seç"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700/80 rounded-2xl text-xs font-bold px-3 py-2 text-slate-800 dark:text-white shadow-2xs focus:border-teal-700 focus:outline-none transition"
                >
                  <option value="">Tüm Öğrenciler</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab !== 'portfolio' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Alan:</span>
              <select
                aria-label="Alan Seç"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value as DevelopmentDomain | '')}
                className="bg-[#FCFAF7] dark:bg-slate-900 border-2 border-[#DDD4C4] dark:border-slate-700/80 rounded-2xl text-xs font-bold px-3 py-2 text-slate-800 dark:text-white shadow-2xs focus:border-teal-700 focus:outline-none transition"
              >
                <option value="">Tüm Gelişim Alanları</option>
                {Object.entries(DOMAIN_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Ana İçerik Bölümü */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-2xs">
          <div className="inline-block w-8 h-8 border-3 border-teal-700 dark:border-teal-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 dark:text-slate-300 text-xs font-bold">
            Veriler yükleniyor…
          </p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-200 text-xs font-bold shadow-2xs">
          {error}
        </div>
      ) : (
        <>
          {/* TAB 1: Pedagojik Gözlemler */}
          {activeTab === 'observations' && (
            <div className="space-y-4">
              {observations.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="Henüz kayıtlı gelişim gözlemi bulunmuyor"
                  description="Öğrencilerin pedagojik kazanımlarını belgelemek için yukarıdaki 'Gözlem Ekle' butonunu kullanabilirsiniz."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {observations.map((obs) => {
                    const domainInfo = DOMAIN_LABELS[obs.domain];
                    const DomainIcon = domainInfo?.icon ?? Award;

                    return (
                      <div
                        key={obs.id}
                        className="bg-white dark:bg-[#131B2E] p-5 rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-4 hover:border-teal-700/50 dark:hover:border-teal-500/50 transition-all"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span
                              className={`text-xs font-extrabold px-2.5 py-1 rounded-xl border-2 flex items-center gap-1.5 ${domainInfo.badgeCls}`}
                            >
                              <DomainIcon className="w-3.5 h-3.5" />
                              {domainInfo.label}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                              {new Date(obs.observedAt).toLocaleDateString('tr-TR')}
                            </span>
                          </div>

                          <h3 className="text-sm font-black text-slate-900 dark:text-white">
                            {obs.skillName}
                          </h3>

                          <div className="bg-[#FCFAF7] dark:bg-slate-900/60 p-3.5 rounded-2xl border border-[#DDD4C4] dark:border-slate-800">
                            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                              {obs.observation}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <User className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                            <span className="font-bold text-slate-800 dark:text-white truncate">
                              {obs.student
                                ? `${obs.student.firstName} ${obs.student.lastName}`
                                : 'Öğrenci'}
                            </span>
                          </div>

                          {obs.isParentVisible ? (
                            <Badge variant="success" size="sm">
                              <CheckCircle className="w-3 h-3 mr-1 inline" /> Veli Görür
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="sm">
                              <Lock className="w-3 h-3 mr-1 inline" /> Sadece Kurum
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Öğrenci Portfolyosu */}
          {activeTab === 'portfolio' && (
            <div className="space-y-4">
              {portfolioItems.length === 0 ? (
                <EmptyState
                  icon={ImageIcon}
                  title="Henüz portfolyoya eklenmiş çalışma bulunmuyor"
                  description="Öğrencilerin yaptığı boyama, heykel veya projeleri eklemek için yukarıdaki 'Çalışma Ekle' butonuna basabilirsiniz."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {portfolioItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 overflow-hidden shadow-2xs flex flex-col group hover:border-amber-600/50 dark:hover:border-amber-500/50 transition-all"
                    >
                      <div className="h-44 bg-[#FCFAF7] dark:bg-slate-900 relative overflow-hidden flex items-center justify-center border-b border-[#DDD4C4] dark:border-slate-800">
                        <img
                          src={item.mediaUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute top-2.5 right-2.5">
                          {item.isParentVisible ? (
                            <span className="bg-emerald-600/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs flex items-center gap-1 border border-emerald-400/40">
                              <Eye className="w-3 h-3" /> Veli Açık
                            </span>
                          ) : (
                            <span className="bg-slate-800/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs flex items-center gap-1 border border-slate-600/40">
                              <Lock className="w-3 h-3" /> Kurum İçi
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-bold text-slate-800 dark:text-white">
                            {item.student
                              ? `${item.student.firstName} ${item.student.lastName}`
                              : 'Öğrenci'}
                          </span>
                          <span className="text-[11px]">
                            {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Ev Etkinlik Havuzu */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              {activities.length === 0 ? (
                <EmptyState
                  icon={Lightbulb}
                  title="Henüz ev etkinliği önerisi eklenmemiş"
                  description="Velilerin evde çocuklarıyla yapabileceği gelişimsel aktiviteler eklemek için 'Etkinlik Önerisi Ekle' butonunu kullanabilirsiniz."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activities.map((act) => {
                    const domainInfo = DOMAIN_LABELS[act.domain];
                    const DomainIcon = domainInfo?.icon ?? Award;

                    return (
                      <div
                        key={act.id}
                        className="bg-white dark:bg-[#131B2E] p-5 rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3.5 hover:border-sky-600/50 dark:hover:border-sky-500/50 transition-all"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span
                              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${domainInfo.badgeCls}`}
                            >
                              <DomainIcon className="w-3 h-3" />
                              {domainInfo.label}
                            </span>
                            {act.ageGroup && (
                              <span className="text-[10px] font-extrabold bg-[#FCFAF7] dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full border border-[#DDD4C4] dark:border-slate-700">
                                {act.ageGroup}
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {act.title}
                          </h4>

                          <div className="bg-[#FCFAF7] dark:bg-slate-900/60 p-3.5 rounded-2xl border border-[#DDD4C4] dark:border-slate-800">
                            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                              {act.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                          Öneri Tarihi: {new Date(act.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Gözlem Ekle Modalı */}
      {showObsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DDD4C4] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Yeni Gelişim Gözlemi Ekle
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowObsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                void handleCreateObservation(e);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Öğrenci
                </label>
                <select
                  value={obsForm.studentId}
                  onChange={(e) => setObsForm({ ...obsForm, studentId: e.target.value })}
                  required
                  className="w-full text-xs font-semibold border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl p-2.5 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-teal-700"
                >
                  <option value="">Öğrenci Seçiniz</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Gelişim Alanı
                </label>
                <select
                  value={obsForm.domain}
                  onChange={(e) =>
                    setObsForm({ ...obsForm, domain: e.target.value as DevelopmentDomain })
                  }
                  className="w-full text-xs font-semibold border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl p-2.5 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-teal-700"
                >
                  {Object.entries(DOMAIN_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Kazanım / Beceri Adı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Makas ile düz çizgi kesebilme"
                  value={obsForm.skillName}
                  onChange={(e) => setObsForm({ ...obsForm, skillName: e.target.value })}
                  required
                  className="w-full text-xs border-2 border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 rounded-2xl p-2.5 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Öğretmen Gözlemi & Değerlendirme
                </label>
                <textarea
                  rows={3}
                  placeholder="Öğrencinin sergilediği tutum, başarma düzeyi veya destek ihtiyacı..."
                  value={obsForm.observation}
                  onChange={(e) => setObsForm({ ...obsForm, observation: e.target.value })}
                  required
                  className="w-full text-xs border-2 border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 rounded-2xl p-2.5 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="flex items-center gap-2.5 p-2 bg-[#FCFAF7] dark:bg-slate-900/60 rounded-xl border border-[#DDD4C4] dark:border-slate-800">
                <input
                  type="checkbox"
                  id="obsParentVisible"
                  checked={obsForm.isParentVisible}
                  onChange={(e) => setObsForm({ ...obsForm, isParentVisible: e.target.checked })}
                  className="w-4 h-4 rounded border-[#DDD4C4] text-teal-700 focus:ring-teal-700 cursor-pointer"
                />
                <label
                  htmlFor="obsParentVisible"
                  className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Veli Portalı'nda ve gelişim karnesinde gösterilsin
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DDD4C4] dark:border-slate-800">
                <TactileButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowObsModal(false)}
                  disabled={submitting}
                >
                  İptal
                </TactileButton>
                <TactileButton variant="teal" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Kaydediliyor…' : 'Gözlemi Kaydet'}
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Portfolyo Çalışması Ekle Modalı */}
      {showPortModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#131B2E] rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border-2 border-[#DDD4C4] dark:border-slate-800">
            <div className="p-5 border-b border-[#DDD4C4]/70 dark:border-slate-800 flex items-center justify-between bg-[#FCFAF7] dark:bg-slate-900/60">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>Portfolyoya Yeni Eser Ekle</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowPortModal(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                void handleCreatePortfolio(e);
              }}
              className="p-6 overflow-y-auto space-y-4 flex-1"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Öğrenci *
                </label>
                <select
                  value={portForm.studentId}
                  onChange={(e) => setPortForm({ ...portForm, studentId: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 p-3 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs cursor-pointer"
                >
                  <option value="">Öğrenci Seçiniz</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Çalışma Başlığı *
                </label>
                <input
                  type="text"
                  placeholder="Örn: Parmak Boyası ile Sonbahar Ağacı"
                  value={portForm.title}
                  onChange={(e) => setPortForm({ ...portForm, title: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 p-3 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Açıklama / Pedagojik Notlar
                </label>
                <textarea
                  rows={2}
                  placeholder="Kullanılan teknik, öğrencinin ifade ettiği fikir, gelişim alanı..."
                  value={portForm.description}
                  onChange={(e) => setPortForm({ ...portForm, description: e.target.value })}
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 p-3 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs leading-relaxed"
                />
              </div>

              {/* Custom Photo URL — paylasilan MediaUrlField */}
              <MediaUrlField
                value=""
                onChange={() => {}}
                values={portMediaUrls}
                onValuesChange={setPortMediaUrls}
                category="PORTFOLIO"
                label="Veya Doğrudan Görsel URL'si Ekle"
                placeholder="https://..."
                showMultiplePreview={false}
                multipleFiles
              />

              {/* Selected Photos Gallery (Prominent Preview) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <span>Paylaşılacak Fotoğraflar</span>
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200">
                      {portMediaUrls.length} seçildi
                    </span>
                  </label>
                  {portMediaUrls.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPortMediaUrls([])}
                      className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      Tümünü Temizle
                    </button>
                  )}
                </div>

                {portMediaUrls.length === 0 ? (
                  <div className="p-4 rounded-2xl border border-dashed border-[#DDD4C4] dark:border-slate-700 text-center text-xs text-slate-400 dark:text-slate-500 bg-[#FCFAF7] dark:bg-slate-900/40">
                    Henüz fotoğraf seçilmedi. Cihazınızdan fotoğraf yükleyin veya aşağıdaki
                    galeriden seçin.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2.5">
                    {portMediaUrls.map((url, idx) => {
                      const isPreset = PRESET_PORTFOLIO_PHOTOS.some((p) => p.url === url);
                      return (
                        <div
                          key={`${url}-${idx}`}
                          className="group relative rounded-2xl overflow-hidden border-2 border-amber-600 shadow-[0_2px_0_0_#d97706] bg-white dark:bg-[#131B2E]"
                        >
                          <img
                            src={url}
                            alt={`Seçilen görsel ${idx + 1}`}
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80';
                            }}
                            className="h-24 w-full object-cover"
                          />
                          <div className="p-1.5 flex items-center justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            <span className="truncate max-w-[85px]">
                              {isPreset ? 'Örnek Görsel' : 'Yüklenen Foto'}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePortMediaUrl(url)}
                              className="w-5 h-5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/80 flex items-center justify-center transition cursor-pointer"
                              title="Fotoğrafı Kaldır"
                            >
                              <X className="w-3 h-3 stroke-[3]" />
                            </button>
                          </div>
                          <div className="absolute top-1.5 left-1.5 bg-amber-800/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                            #{idx + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Previously Uploaded Portfolio Photos from Tenant */}
              {tenantMediaFiles.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                    Kreş Arşivinden Seçin ({tenantMediaFiles.length} fotoğraf)
                  </label>
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                    {tenantMediaFiles.map((file) => {
                      const isSelected = portMediaUrls.includes(file.url);
                      return (
                        <div
                          key={file.id}
                          onClick={() => togglePortPhotoUrl(file.url)}
                          className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition ${
                            isSelected
                              ? 'border-amber-600 shadow-[0_2px_0_0_#d97706]'
                              : 'border-[#DDD4C4] dark:border-slate-700 hover:border-amber-500/60 shadow-2xs'
                          }`}
                        >
                          <img
                            src={file.url}
                            alt={file.fileName}
                            className="h-16 w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-amber-600 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Preset Photos Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                  Veya Hazır Örnek Eserlerden Ekleyin
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_PORTFOLIO_PHOTOS.map((item) => {
                    const isSelected = portMediaUrls.includes(item.url);
                    return (
                      <div
                        key={item.url}
                        onClick={() => togglePortPreset(item.url)}
                        className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition ${
                          isSelected
                            ? 'border-amber-600 shadow-[0_2px_0_0_#d97706]'
                            : 'border-[#DDD4C4] dark:border-slate-700 hover:border-amber-500/60 shadow-2xs'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=400&q=80';
                          }}
                          className="h-20 w-full object-cover"
                        />
                        <div className="p-1.5 bg-white dark:bg-[#131B2E] text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate text-center">
                          {item.name}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 bg-[#FCFAF7] dark:bg-slate-900/60 rounded-xl border border-[#DDD4C4] dark:border-slate-800">
                <input
                  type="checkbox"
                  id="portParentVisible"
                  checked={portForm.isParentVisible}
                  onChange={(e) => setPortForm({ ...portForm, isParentVisible: e.target.checked })}
                  className="w-4 h-4 rounded border-[#DDD4C4] text-amber-600 focus:ring-amber-600 cursor-pointer"
                />
                <label
                  htmlFor="portParentVisible"
                  className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Veli Portalı'nda sergilensin
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DDD4C4] dark:border-slate-800">
                <TactileButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPortModal(false)}
                  disabled={submitting}
                >
                  İptal
                </TactileButton>
                <TactileButton variant="amber" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Kaydediliyor…' : 'Portfolyoya Ekle'}
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ev Etkinlik Önerisi Ekle Modalı */}
      {showActModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DDD4C4] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-sky-700 dark:text-sky-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Ev Etkinlik Önerisi Ekle
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowActModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                void handleCreateActivity(e);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Gelişim Alanı
                </label>
                <select
                  value={actForm.domain}
                  onChange={(e) =>
                    setActForm({ ...actForm, domain: e.target.value as DevelopmentDomain })
                  }
                  className="w-full text-xs font-semibold border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl p-2.5 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-sky-700"
                >
                  {Object.entries(DOMAIN_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Yaş Grubu
                </label>
                <input
                  type="text"
                  placeholder="Örn: 3-4 Yaş veya 4-6 Yaş"
                  value={actForm.ageGroup}
                  onChange={(e) => setActForm({ ...actForm, ageGroup: e.target.value })}
                  className="w-full text-xs border-2 border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 rounded-2xl p-2.5 focus:outline-none focus:border-sky-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Etkinlik Başlığı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Evde Doğa Kolajı Yapımı"
                  value={actForm.title}
                  onChange={(e) => setActForm({ ...actForm, title: e.target.value })}
                  required
                  className="w-full text-xs border-2 border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 rounded-2xl p-2.5 focus:outline-none focus:border-sky-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Uygulama Adımları & Veliye Not
                </label>
                <textarea
                  rows={3}
                  placeholder="Gerekli malzemeler ve evde çocuğun becerisini geliştirecek yönergeler..."
                  value={actForm.description}
                  onChange={(e) => setActForm({ ...actForm, description: e.target.value })}
                  required
                  className="w-full text-xs border-2 border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 rounded-2xl p-2.5 focus:outline-none focus:border-sky-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DDD4C4] dark:border-slate-800">
                <TactileButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowActModal(false)}
                  disabled={submitting}
                >
                  İptal
                </TactileButton>
                <TactileButton variant="teal" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Kaydediliyor…' : 'Öneriyi Kaydet'}
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
