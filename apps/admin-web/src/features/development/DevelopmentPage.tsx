import { useState, useEffect, type JSX } from 'react';
import { Award, BookOpen, Image, Lightbulb, Plus, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/Toast';
import { listStudents } from '../../api/students';
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
  PortfolioItemDto,
  Student,
} from '@kidscare/shared-types';

const DOMAIN_LABELS: Record<DevelopmentDomain, { label: string; color: string; icon: string }> = {
  DIL: { label: 'Dil & Konuşma', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '🗣️' },
  MOTOR: {
    label: 'Motor Beceriler',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: '🏃',
  },
  SOSYAL_DUYGUSAL: {
    label: 'Sosyal & Duygusal',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: '🤝',
  },
  BILISSEL: {
    label: 'Bilişsel Gelişim',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: '🧠',
  },
  OZ_BAKIM: {
    label: 'Öz Bakım & Yaşam',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    icon: '🧼',
  },
  SANAT: {
    label: 'Sanat & Yaratıcılık',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    icon: '🎨',
  },
};

export function DevelopmentPage(): JSX.Element {
  const { state } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'observations' | 'portfolio' | 'activities'>(
    'observations',
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<DevelopmentDomain | ''>('');

  const [observations, setObservations] = useState<DevelopmentObservationDto[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemDto[]>([]);
  const [activities, setActivities] = useState<HomeActivitySuggestionDto[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const [portForm, setPortForm] = useState({
    studentId: '',
    title: '',
    description: '',
    mediaUrl: '',
    isParentVisible: true,
  });

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
    async function init() {
      try {
        const studentList = await listStudents();
        setStudents(studentList);
        if (studentList.length > 0 && !selectedStudentId) {
          setSelectedStudentId(studentList[0]?.id || '');
        }
      } catch (err) {
        console.error(err);
      }
    }
    void init();
  }, [selectedStudentId]);

  useEffect(() => {
    async function loadTabData() {
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
    void loadTabData();
  }, [activeTab, selectedStudentId, selectedDomain]);

  async function handleCreateObservation(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createObservation(obsForm);
      setShowObsModal(false);
      setObsForm({
        studentId: selectedStudentId || (students[0]?.id ?? ''),
        domain: 'DIL',
        skillName: '',
        observation: '',
        isParentVisible: true,
      });
      const res = await listObservations(
        selectedStudentId || undefined,
        (selectedDomain as DevelopmentDomain) || undefined,
      );
      setObservations(res);
      showToast('Gözlem kaydı başarıyla eklendi.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gözlem kaydedilemedi', 'error');
    }
  }

  async function handleCreatePortfolio(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createPortfolioItem(portForm);
      setShowPortModal(false);
      setPortForm({
        studentId: selectedStudentId || (students[0]?.id ?? ''),
        title: '',
        description: '',
        mediaUrl: '',
        isParentVisible: true,
      });
      const res = await listPortfolio(selectedStudentId || undefined);
      setPortfolioItems(res);
      showToast('Portfolyo çalışması başarıyla eklendi.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Portfolyo çalışması kaydedilemedi', 'error');
    }
  }

  async function handleCreateActivity(e: React.FormEvent) {
    e.preventDefault();
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
      showToast('Ev aktivitesi önerisi başarıyla eklendi.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Aktivite kaydedilemedi', 'error');
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            Gelişim Hikâyesi & Öğrenci Portfolyosu
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gelişim alanlarına göre pedagojik gözlem kayıtları, dijital ürün portfolyosu ve ev
            etkinlik önerileri.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            {activeTab === 'observations' && (
              <button
                type="button"
                onClick={() => {
                  setObsForm((prev) => ({
                    ...prev,
                    studentId: selectedStudentId || (students[0]?.id ?? ''),
                  }));
                  setShowObsModal(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Gözlem Ekle
              </button>
            )}
            {activeTab === 'portfolio' && (
              <button
                type="button"
                onClick={() => {
                  setPortForm((prev) => ({
                    ...prev,
                    studentId: selectedStudentId || (students[0]?.id ?? ''),
                  }));
                  setShowPortModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Çalışma Ekle
              </button>
            )}
            {activeTab === 'activities' && (
              <button
                type="button"
                onClick={() => setShowActModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Etkinlik Önerisi Ekle
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('observations')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'observations'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Pedagojik Gözlemler
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'portfolio'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Image className="w-4 h-4" />
            Öğrenci Portfolyosu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'activities'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Ev Etkinlik Havuzu
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {activeTab !== 'activities' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Öğrenci:</span>
              <select
                aria-label="Öğrenci Seç"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Tüm Öğrenciler</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTab !== 'portfolio' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Alan:</span>
              <select
                aria-label="Alan Seç"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value as DevelopmentDomain | '')}
                className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Tüm Gelişim Alanları</option>
                {Object.entries(DOMAIN_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.icon} {v.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Yükleniyor...</div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      ) : (
        <>
          {/* TAB 1: Observations */}
          {activeTab === 'observations' && (
            <div className="space-y-4">
              {observations.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500 text-sm">
                  Henüz kayıtlı gelişim gözlemi bulunmuyor.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {observations.map((obs) => {
                    const domainInfo = DOMAIN_LABELS[obs.domain];
                    return (
                      <div
                        key={obs.id}
                        className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${domainInfo.color}`}
                            >
                              <span>{domainInfo.icon}</span>
                              {domainInfo.label}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(obs.observedAt).toLocaleDateString('tr-TR')}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900">{obs.skillName}</h3>

                          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                            {obs.observation}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <div>
                            <span className="font-semibold text-slate-700">
                              {obs.student
                                ? `${obs.student.firstName} ${obs.student.lastName}`
                                : 'Öğrenci'}
                            </span>
                            {obs.teacher && ` • ${obs.teacher.email}`}
                          </div>
                          {obs.isParentVisible ? (
                            <span className="text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Veli Görür
                            </span>
                          ) : (
                            <span className="text-slate-400">Yalnızca Kurum</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Portfolio */}
          {activeTab === 'portfolio' && (
            <div className="space-y-4">
              {portfolioItems.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500 text-sm">
                  Henüz portfolyoya eklenmiş çalışma bulunmuyor.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {portfolioItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col group hover:shadow-md transition-shadow"
                    >
                      <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                        <img
                          src={item.mediaUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          {item.isParentVisible && (
                            <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              Veli Açık
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                          {item.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span>
                            {item.student
                              ? `${item.student.firstName} ${item.student.lastName}`
                              : 'Öğrenci'}
                          </span>
                          <span>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Home Activities */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500 text-sm">
                  Henüz ev etkinliği önerisi eklenmemiş.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activities.map((act) => {
                    const domainInfo = DOMAIN_LABELS[act.domain];
                    return (
                      <div
                        key={act.id}
                        className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${domainInfo.color}`}
                            >
                              {domainInfo.icon} {domainInfo.label}
                            </span>
                            {act.ageGroup && (
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                {act.ageGroup}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm">{act.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                            {act.description}
                          </p>
                        </div>

                        <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                          Eklenme: {new Date(act.createdAt).toLocaleDateString('tr-TR')}
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

      {/* Observation Modal */}
      {showObsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Yeni Gelişim Gözlemi Ekle</h3>
            <form
              onSubmit={(e) => {
                void handleCreateObservation(e);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Öğrenci</label>
                <select
                  value={obsForm.studentId}
                  onChange={(e) => setObsForm({ ...obsForm, studentId: e.target.value })}
                  required
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
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
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Gelişim Alanı
                </label>
                <select
                  value={obsForm.domain}
                  onChange={(e) =>
                    setObsForm({ ...obsForm, domain: e.target.value as DevelopmentDomain })
                  }
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
                >
                  {Object.entries(DOMAIN_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.icon} {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Kazanım / Becerinin Adı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Makas ile düz çizgi kesebilme"
                  value={obsForm.skillName}
                  onChange={(e) => setObsForm({ ...obsForm, skillName: e.target.value })}
                  required
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Öğretmen Gözlemi & Değerlendirme
                </label>
                <textarea
                  rows={3}
                  placeholder="Öğrencinin sergilediği tutum, başarma düzeyi veya destek ihtiyacı..."
                  value={obsForm.observation}
                  onChange={(e) => setObsForm({ ...obsForm, observation: e.target.value })}
                  required
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="obsParentVisible"
                  checked={obsForm.isParentVisible}
                  onChange={(e) => setObsForm({ ...obsForm, isParentVisible: e.target.checked })}
                  className="rounded border-slate-300 text-amber-500"
                />
                <label htmlFor="obsParentVisible" className="text-xs text-slate-700">
                  Veli Portalı'nda ve gelişim karnesinde gösterilsin
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowObsModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-xs"
                >
                  Gözlemi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Portfolio Modal */}
      {showPortModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Portfolyoya Çalışma Ekle</h3>
            <form
              onSubmit={(e) => {
                void handleCreatePortfolio(e);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Öğrenci</label>
                <select
                  value={portForm.studentId}
                  onChange={(e) => setPortForm({ ...portForm, studentId: e.target.value })}
                  required
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
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
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Çalışma Başlığı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Parmak Boyası ile Sonbahar Ağacı"
                  value={portForm.title}
                  onChange={(e) => setPortForm({ ...portForm, title: e.target.value })}
                  required
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Açıklama</label>
                <textarea
                  rows={2}
                  placeholder="Kullanılan teknik, öğrencinin ifade ettiği fikir..."
                  value={portForm.description}
                  onChange={(e) => setPortForm({ ...portForm, description: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Medya / Fotoğraf URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={portForm.mediaUrl}
                  onChange={(e) => setPortForm({ ...portForm, mediaUrl: e.target.value })}
                  required
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="portParentVisible"
                  checked={portForm.isParentVisible}
                  onChange={(e) => setPortForm({ ...portForm, isParentVisible: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <label htmlFor="portParentVisible" className="text-xs text-slate-700">
                  Veli Portalı'nda sergilensin
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPortModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Portfolyoya Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Suggestion Modal */}
      {showActModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Ev Etkinlik Önerisi Ekle</h3>
            <form
              onSubmit={(e) => {
                void handleCreateActivity(e);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Gelişim Alanı
                </label>
                <select
                  value={actForm.domain}
                  onChange={(e) =>
                    setActForm({ ...actForm, domain: e.target.value as DevelopmentDomain })
                  }
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
                >
                  {Object.entries(DOMAIN_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.icon} {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Yaş Grubu</label>
                <input
                  type="text"
                  placeholder="Örn: 3-4 Yaş veya 4-6 Yaş"
                  value={actForm.ageGroup}
                  onChange={(e) => setActForm({ ...actForm, ageGroup: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Etkinlik Başlığı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Evde Doğa Kolajı Yapımı"
                  value={actForm.title}
                  onChange={(e) => setActForm({ ...actForm, title: e.target.value })}
                  required
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Uygulama Adımları & Veliye Not
                </label>
                <textarea
                  rows={3}
                  placeholder="Gerekli malzemeler ve evde çocuğun becerisini geliştirecek yönergeler..."
                  value={actForm.description}
                  onChange={(e) => setActForm({ ...actForm, description: e.target.value })}
                  required
                  className="w-full text-xs border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowActModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Öneriyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
