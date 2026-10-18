import { useState, useEffect, useMemo, type JSX } from 'react';
import {
  Megaphone,
  Send,
  Radio,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  GraduationCap,
  Sparkles,
  Smartphone,
  Search,
  Check,
  RefreshCw,
  Bell,
  X,
  Building2,
  UserCheck,
} from 'lucide-react';
import { StatCard, TactileButton, Badge, EmptyState } from '../../components/ui';
import { listClassrooms } from '../../api/classrooms';
import { listStudents } from '../../api/students';
import { fetchBroadcastStats, fetchBroadcastHistory, sendBroadcast } from '../../api/broadcast';
import type {
  BroadcastLog,
  BroadcastStatsDto,
  BroadcastTargetType,
  BroadcastPriority,
  Classroom,
  Student,
} from '@kidscare/shared-types';

interface QuickTemplate {
  id: string;
  name: string;
  icon: string;
  title: string;
  body: string;
  priority: BroadcastPriority;
  targetType: BroadcastTargetType;
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    id: 'snow-day',
    name: 'Kar Tatili & Hava Muhalefeti',
    icon: '❄️',
    title: 'Hava Muhalefeti Nedeniyle Eğitime Ara Verilmiştir',
    body: 'Değerli Velilerimiz, Meteoroloji Genel Müdürlüğü ve Valilik kararı doğrultusunda olumsuz hava koşulları ve buzlanma riski sebebiyle kreşimizde eğitime bir gün süreyle ara verilmiştir. Öğrencilerimizin güvenliği önceliğimizdir.',
    priority: 'URGENT',
    targetType: 'ALL_DAYCARE',
  },
  {
    id: 'bus-delay',
    name: 'Servis Gecikmesi',
    icon: '🚌',
    title: 'Akşam Servis Güzergahında Trafik Gecikmesi',
    body: 'Sayın Velimiz, ana arterlerdeki yoğun trafik ve yol çalışması sebebiyle servis araçlarımızın varış saatlerinde yaklaşık 15-20 dakikalık gecikme yaşanmaktadır. Servis rehber öğretmenlerimiz sizlerle sürekli irtibatta kalacaktır.',
    priority: 'IMPORTANT',
    targetType: 'ALL_DAYCARE',
  },
  {
    id: 'costume-event',
    name: 'Kostüm & Etkinlik Hatırlatması',
    icon: '🎭',
    title: 'Yarınki Bahar Şenliği Kostüm Hatırlatması',
    body: "Sevgili Velilerimiz, yarın sabah saat 10:00'da başlayacak olan Bahar Şenliği etkinliğimiz için miniklerimizin belirlenen doğa temalı kostümleriyle gelmelerini rica ederiz. Yedek kıyafet çantasını da unutmayınız.",
    priority: 'NORMAL',
    targetType: 'ALL_DAYCARE',
  },
  {
    id: 'health-alert',
    name: 'Sağlık & Hijyen İkazı',
    icon: '🩺',
    title: 'Mevsimsel Grip ve Salgın Tedbirleri',
    body: 'Kıymetli Velilerimiz, son günlerde yaygınlaşan mevsimsel üst solunum yolu enfeksiyonları nedeniyle, ateş veya halsizlik belirtisi gösteren öğrencilerimizin tam iyileşme sağlanana kadar evde istirahat etmeleri tüm çocuklarımızın sağlığı açısından önem taşımaktadır.',
    priority: 'IMPORTANT',
    targetType: 'ALL_DAYCARE',
  },
  {
    id: 'parent-meeting',
    name: 'Veli Toplantısı',
    icon: '📅',
    title: '2026 Güz Dönemi Veli Bilgilendirme Toplantısı',
    body: "Değerli Velilerimiz, öğrencilerimizin gelişim süreçlerini, dönem içi kazanımlarını ve pedagojik gözlem raporlarını değerlendirmek üzere bu Cumartesi saat 14:00'te sınıf veli toplantımız gerçekleştirilecektir. Katılımınızı bekleriz.",
    priority: 'NORMAL',
    targetType: 'ALL_DAYCARE',
  },
  {
    id: 'menu-change',
    name: 'Yemek Menüsü Değişikliği',
    icon: '🍎',
    title: 'Öğle Yemeği Menüsü Güncellemesi',
    body: 'Sayın Velilerimiz, taze tedarik koşulları gereği bugünkü öğle yemeğimizde Mercimek Çorbası yerine Fırında Sebzeli Yayla Çorbası ve Ev Yapımı Yoğurt servis edilecektir. Besin değerleri ve diyet kısıtları titizlikle gözetilmiştir.',
    priority: 'NORMAL',
    targetType: 'ALL_DAYCARE',
  },
];

export function BroadcastPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');

  // Stats
  const [stats, setStats] = useState<BroadcastStatsDto>({
    totalBroadcasts: 0,
    thisMonthBroadcasts: 0,
    urgentBroadcasts: 0,
    totalDelivered: 0,
  });

  // Data
  const [history, setHistory] = useState<BroadcastLog[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetType, setTargetType] = useState<BroadcastTargetType>('ALL_DAYCARE');
  const [targetClassroomId, setTargetClassroomId] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [priority, setPriority] = useState<BroadcastPriority>('NORMAL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  // History search filter
  const [historySearch, setHistorySearch] = useState('');
  const [historyPriorityFilter, setHistoryPriorityFilter] = useState<string>('ALL');

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Initial load
  const loadData = async () => {
    try {
      const [statsRes, historyRes, classroomsRes, studentsRes] = await Promise.all([
        fetchBroadcastStats().catch(() => ({
          totalBroadcasts: 0,
          thisMonthBroadcasts: 0,
          urgentBroadcasts: 0,
          totalDelivered: 0,
        })),
        fetchBroadcastHistory().catch(() => []),
        listClassrooms().catch(() => []),
        listStudents().catch(() => []),
      ]);
      setStats(statsRes);
      setHistory(historyRes);
      setClassrooms(classroomsRes);
      setStudents(studentsRes);
      if (classroomsRes.length > 0 && !targetClassroomId) {
        setTargetClassroomId(classroomsRes[0]!.id);
      }
    } catch {
      // quiet fail on initial load
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Filtered students for multi-select
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const query = studentSearch.toLowerCase();
    return students.filter((s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(query));
  }, [students, studentSearch]);

  // Target label for preview
  const targetLabel = useMemo(() => {
    switch (targetType) {
      case 'ALL_DAYCARE':
        return 'Tüm Kreş (Veliler & Öğretmenler)';
      case 'CLASSROOM': {
        const cls = classrooms.find((c) => c.id === targetClassroomId);
        return cls ? `${cls.name} Sınıfı Velileri` : 'Sınıf Bazlı';
      }
      case 'SPECIFIC_STUDENTS':
        return `${selectedStudentIds.length} Seçili Öğrencinin Velisi`;
      case 'TEACHERS_ONLY':
        return 'Tüm Öğretmen Kadrosu';
      default:
        return 'Alıcılar';
    }
  }, [targetType, targetClassroomId, selectedStudentIds, classrooms]);

  const handleApplyTemplate = (tpl: QuickTemplate) => {
    setTitle(tpl.title);
    setBody(tpl.body);
    setPriority(tpl.priority);
    setFeedback(null);
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  };

  const handleSubmit = (): void => {
    if (!title.trim() || !body.trim()) {
      setFeedback({ type: 'error', message: 'Lütfen başlık ve mesaj içeriğini doldurunuz.' });
      return;
    }

    if (targetType === 'CLASSROOM' && !targetClassroomId) {
      setFeedback({ type: 'error', message: 'Lütfen hedef bir sınıf seçiniz.' });
      return;
    }

    if (targetType === 'SPECIFIC_STUDENTS' && selectedStudentIds.length === 0) {
      setFeedback({ type: 'error', message: 'Lütfen en az bir öğrenci seçiniz.' });
      return;
    }

    setShowConfirmModal(true);
  };

  const executeSend = async (): Promise<void> => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setFeedback(null);

    try {
      let targetName = targetLabel;
      if (targetType === 'CLASSROOM') {
        const cls = classrooms.find((c) => c.id === targetClassroomId);
        if (cls) targetName = cls.name;
      }

      const res = await sendBroadcast({
        title: title.trim(),
        body: body.trim(),
        targetType,
        targetId: targetType === 'CLASSROOM' ? targetClassroomId : undefined,
        targetName,
        studentIds: targetType === 'SPECIFIC_STUDENTS' ? selectedStudentIds : undefined,
        priority,
        channels: ['PUSH', 'IN_APP'],
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Duyuru başarıyla iletildi! (${res.log.recipientCount} alıcıya ulaştırıldı)`,
        });
        // Reset form
        setTitle('');
        setBody('');
        setSelectedStudentIds([]);
        // Refresh data
        void loadData();
      }
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Duyuru gönderilirken bir hata oluştu.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered history list
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchSearch =
        !historySearch ||
        item.title.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.body.toLowerCase().includes(historySearch.toLowerCase()) ||
        (item.senderName && item.senderName.toLowerCase().includes(historySearch.toLowerCase()));

      const matchPriority =
        historyPriorityFilter === 'ALL' || item.priority === historyPriorityFilter;

      return matchSearch && matchPriority;
    });
  }, [history, historySearch, historyPriorityFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 shadow-sm dark:bg-teal-950/70 dark:text-teal-300">
              <Megaphone className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Toplu Duyuru & Bildirim Merkezi
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tüm velilere, sınıflara veya öğretmen kadrosuna anlık push bildirim ve resmi duyuru
                iletimi
              </p>
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-200/60 p-1.5 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('send')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === 'send'
                ? 'bg-white text-teal-900 shadow-xs dark:bg-slate-700 dark:text-teal-200'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Send className="h-4 w-4" />
            Yeni Duyuru Gönder
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-teal-900 shadow-xs dark:bg-slate-700 dark:text-teal-200'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="h-4 w-4" />
            Gönderim Geçmişi ({history.length})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Duyuru"
          value={stats.totalBroadcasts}
          subtitle="Sistem genelinde iletilen tüm duyurular"
          icon={Radio}
          variant="teal"
        />
        <StatCard
          title="Bu Ay Gönderilen"
          value={stats.thisMonthBroadcasts}
          subtitle="Cari ay içerisindeki duyuru sayısı"
          icon={Clock}
          variant="amber"
        />
        <StatCard
          title="Acil Bildirimler"
          value={stats.urgentBroadcasts}
          subtitle="Yüksek öncelikli acil durum ikazları"
          icon={AlertTriangle}
          variant="rose"
        />
        <StatCard
          title="Ulaşılan Alıcı"
          value={stats.totalDelivered}
          subtitle="Toplam teslim edilen push/inbox bildirimi"
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      {/* TAB 1: YENİ DUYURU GÖNDER */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Form (7 cols) */}
          <div className="space-y-6 lg:col-span-7">
            {feedback && (
              <div
                className={`flex items-center justify-between rounded-xl p-4 text-sm font-medium ${
                  feedback.type === 'success'
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300'
                    : 'border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  )}
                  <span>{feedback.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Quick Templates Bar */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Hızlı Kreş Şablonları (Tek Tıkla Doldur)
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:border-teal-500 hover:bg-teal-50/50 hover:text-teal-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-teal-500/60 dark:hover:bg-teal-950/40 dark:hover:text-teal-200"
                  >
                    <span>{tpl.icon}</span>
                    <span>{tpl.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Container */}
            <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              {/* Target Audience Selector */}
              <div>
                <label className="mb-2 block text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-slate-400">
                  1. Hedef Kitle Seçimi
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => setTargetType('ALL_DAYCARE')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                      targetType === 'ALL_DAYCARE'
                        ? 'border-teal-600 bg-teal-50/80 text-teal-900 shadow-xs dark:border-teal-500 dark:bg-teal-950/50 dark:text-teal-200'
                        : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400'
                    }`}
                  >
                    <Building2 className="mb-1.5 h-5 w-5" />
                    <span className="text-xs font-bold">Tüm Kreş</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Veli & Öğretmen
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('CLASSROOM')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                      targetType === 'CLASSROOM'
                        ? 'border-teal-600 bg-teal-50/80 text-teal-900 shadow-xs dark:border-teal-500 dark:bg-teal-950/50 dark:text-teal-200'
                        : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400'
                    }`}
                  >
                    <GraduationCap className="mb-1.5 h-5 w-5" />
                    <span className="text-xs font-bold">Sınıf Bazlı</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Seçili sınıf velileri
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('SPECIFIC_STUDENTS')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                      targetType === 'SPECIFIC_STUDENTS'
                        ? 'border-teal-600 bg-teal-50/80 text-teal-900 shadow-xs dark:border-teal-500 dark:bg-teal-950/50 dark:text-teal-200'
                        : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400'
                    }`}
                  >
                    <Users className="mb-1.5 h-5 w-5" />
                    <span className="text-xs font-bold">Öğrenci Bazlı</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {selectedStudentIds.length > 0
                        ? `${selectedStudentIds.length} öğrenci`
                        : 'Özel veliler'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('TEACHERS_ONLY')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                      targetType === 'TEACHERS_ONLY'
                        ? 'border-teal-600 bg-teal-50/80 text-teal-900 shadow-xs dark:border-teal-500 dark:bg-teal-950/50 dark:text-teal-200'
                        : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400'
                    }`}
                  >
                    <UserCheck className="mb-1.5 h-5 w-5" />
                    <span className="text-xs font-bold">Öğretmenler</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Sadece eğitim kadrosu
                    </span>
                  </button>
                </div>

                {/* Sub-selectors */}
                {targetType === 'CLASSROOM' && (
                  <div className="mt-3 rounded-xl border border-teal-100 bg-teal-50/40 p-3 dark:border-teal-900/30 dark:bg-teal-950/20">
                    <label className="mb-1.5 block text-xs font-semibold text-teal-950 dark:text-teal-200">
                      Gönderilecek Sınıfı Seçiniz:
                    </label>
                    <select
                      value={targetClassroomId}
                      onChange={(e) => setTargetClassroomId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus:border-teal-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {classrooms.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} (
                          {cls.studentCount
                            ? `${cls.studentCount} Öğrenci`
                            : cls.ageGroup || 'Sınıf'}
                          )
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {targetType === 'SPECIFIC_STUDENTS' && (
                  <div className="mt-3 space-y-2 rounded-xl border border-teal-100 bg-teal-50/40 p-3 dark:border-teal-900/30 dark:bg-teal-950/20">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-teal-950 dark:text-teal-200">
                        Öğrenci Listesinden Seçiniz ({selectedStudentIds.length} seçili):
                      </label>
                      {selectedStudentIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedStudentIds([])}
                          className="text-xs text-rose-600 hover:underline dark:text-rose-400"
                        >
                          Temizle
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Öğrenci adı ile filtrele..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pr-3 pl-9 text-xs focus:border-teal-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
                      {filteredStudents.length === 0 ? (
                        <p className="py-2 text-center text-xs text-slate-400">
                          Öğrenci bulunamadı.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {filteredStudents.map((s) => {
                            const isSelected = selectedStudentIds.includes(s.id);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => handleToggleStudent(s.id)}
                                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${
                                  isSelected
                                    ? 'bg-teal-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {isSelected && <Check className="h-3 w-3" />}
                                <span>
                                  {s.firstName} {s.lastName}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Priority Selector */}
              <div>
                <label className="mb-2 block text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-slate-400">
                  2. Öncelik & Önem Derecesi
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPriority('NORMAL')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      priority === 'NORMAL'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>🟢 Normal Bilgilendirme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority('IMPORTANT')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      priority === 'IMPORTANT'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-xs dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>🟡 Önemli Duyuru</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority('URGENT')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      priority === 'URGENT'
                        ? 'border-rose-600 bg-rose-50 text-rose-900 shadow-xs dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>🔴 Acil Durum İkazı</span>
                  </button>
                </div>
              </div>

              {/* Title & Body Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-slate-400">
                    3. Duyuru Başlığı
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn: 2026 Bahar Şenliği ve Servis Bilgilendirmesi"
                    maxLength={200}
                    className="w-full rounded-xl border border-slate-300 bg-[#FCFAF7] px-4 py-2.5 text-sm font-medium text-slate-900 transition-colors focus:border-teal-600 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-slate-400">
                      4. Duyuru & Bildirim Metni
                    </label>
                    <span className="text-xs text-slate-400">{body.length} / 2000 karakter</span>
                  </div>
                  <textarea
                    rows={5}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Bildirim metnini detaylı şekilde yazınız. Veliler bu metni hem anlık push bildirim olarak hem de uygulama içindeki bildirim kutusunda görecektir."
                    maxLength={2000}
                    className="w-full rounded-xl border border-slate-300 bg-[#FCFAF7] p-4 text-sm font-medium text-slate-900 transition-colors focus:border-teal-600 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800"
                  />
                </div>
              </div>

              {/* Dispatch Channels */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Otomatik İletim Kanalları:
                </span>
                <div className="mt-1.5 flex items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Expo Push Bildirimi (Mobil Telefonlara Anında)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>KidsCare Uygulama İçi Bildirim Çanı</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <TactileButton
                  variant="secondary"
                  onClick={() => {
                    setTitle('');
                    setBody('');
                    setSelectedStudentIds([]);
                    setFeedback(null);
                  }}
                  disabled={isSubmitting}
                >
                  Formu Temizle
                </TactileButton>

                <TactileButton
                  variant={priority === 'URGENT' ? 'danger' : 'teal'}
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  <span className="flex items-center gap-2">
                    {isSubmitting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>
                      {priority === 'URGENT' ? 'Acil Duyuruyu Başlat' : 'Duyuruyu Şimdi Gönder'}
                    </span>
                  </span>
                </TactileButton>
              </div>
            </div>
          </div>

          {/* Right Column: Live Smartphone Preview (5 cols) */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  <Smartphone className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  Canlı Mobil Kilit Ekranı Önizlemesi
                </div>
                <Badge variant="brand" size="sm">
                  {targetLabel}
                </Badge>
              </div>

              {/* Smartphone Frame */}
              <div className="mx-auto max-w-[320px] rounded-[38px] border-4 border-slate-800 bg-slate-950 p-3 shadow-2xl ring-1 ring-slate-900/50">
                {/* Dynamic Island / Speaker */}
                <div className="mx-auto mb-3 h-4 w-28 rounded-full bg-black/90" />

                {/* Status Bar */}
                <div className="mb-6 flex items-center justify-between px-2 text-[11px] font-bold text-slate-300">
                  <span>09:41</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">5G</span>
                    <span className="h-2 w-3 rounded-xs border border-slate-400" />
                  </div>
                </div>

                {/* Clock on lockscreen */}
                <div className="mb-8 text-center">
                  <div className="text-4xl font-extralight tracking-tight text-white/90">09:41</div>
                  <div className="text-xs font-medium text-slate-300">18 Ekim Pazar</div>
                </div>

                {/* The Push Notification Bubble */}
                <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/15 p-3.5 shadow-lg backdrop-blur-xl">
                  {/* Notification App Header */}
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-teal-600 text-white shadow-xs">
                        <Bell className="h-3 w-3" />
                      </div>
                      <span className="text-xs font-bold text-white">KidsCare</span>
                      <span className="text-[10px] text-white/60">• Şimdi</span>
                    </div>

                    {priority === 'URGENT' ? (
                      <span className="rounded bg-rose-500/90 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-white uppercase">
                        🚨 ACİL
                      </span>
                    ) : priority === 'IMPORTANT' ? (
                      <span className="rounded bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-white uppercase">
                        ÖNEMLİ
                      </span>
                    ) : (
                      <span className="rounded bg-teal-500/80 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-white uppercase">
                        DUYURU
                      </span>
                    )}
                  </div>

                  {/* Notification Title & Body */}
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white line-clamp-1">
                      {title.trim() || 'Duyuru Başlığı Burada Gözükecek'}
                    </p>
                    <p className="text-[11px] leading-relaxed text-white/80 line-clamp-3">
                      {body.trim() ||
                        'Duyuru metnini yazdığınızda anlık olarak telefon kilit ekranında bu şekilde görüntülenecektir.'}
                    </p>
                  </div>

                  {/* Target audience pill in mockup */}
                  <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-white/60">
                    <span>Hedef: {targetLabel}</span>
                    <span className="italic">Açmak için dokunun</span>
                  </div>
                </div>

                {/* Home bar indicator */}
                <div className="mx-auto mt-16 h-1 w-28 rounded-full bg-white/40" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GÖNDERİM GEÇMİŞİ */}
      {activeTab === 'history' && (
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          {/* Filters Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Başlık veya içerikte ara..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 pr-3 pl-9 text-xs font-medium focus:border-teal-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Öncelik:</span>
              <select
                value={historyPriorityFilter}
                onChange={(e) => setHistoryPriorityFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-teal-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">Tümü</option>
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">Önemli</option>
                <option value="URGENT">Acil</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  void loadData();
                }}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Yenile</span>
              </button>
            </div>
          </div>

          {/* History Table */}
          {filteredHistory.length === 0 ? (
            <EmptyState
              title="Gönderim Kaydı Bulunamadı"
              description="Arama kriterlerinize uyan geçmiş duyuru kaydı bulunmamaktadır."
              action={
                <TactileButton variant="teal" size="sm" onClick={() => setActiveTab('send')}>
                  Yeni Duyuru Gönder
                </TactileButton>
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Zaman</th>
                    <th className="px-4 py-3">Başlık & İçerik</th>
                    <th className="px-4 py-3">Hedef Kitle</th>
                    <th className="px-4 py-3">Öncelik</th>
                    <th className="px-4 py-3">Alıcı Sayısı</th>
                    <th className="px-4 py-3">Gönderen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                  {filteredHistory.map((log) => (
                    <tr
                      key={log.id}
                      className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {new Date(log.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-[10px]">
                          {new Date(log.createdAt).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="max-w-xs px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {log.title}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 dark:text-slate-400">
                          {log.body}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="brand" size="sm">
                          {log.targetName || log.targetType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {log.priority === 'URGENT' ? (
                          <Badge variant="danger" size="sm">
                            🚨 Acil
                          </Badge>
                        ) : log.priority === 'IMPORTANT' ? (
                          <Badge variant="warning" size="sm">
                            Önemli
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            Normal
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{log.recipientCount} Alıcıya İletildi</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {log.senderName || 'Yönetici'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-xs ${
                  priority === 'URGENT'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                }`}
              >
                {priority === 'URGENT' ? (
                  <AlertTriangle className="h-6 w-6" />
                ) : (
                  <Megaphone className="h-6 w-6" />
                )}
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {priority === 'URGENT' ? 'Acil Duyuruyu Onaylayın' : 'Duyuru Gönderimi'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hedef:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{targetLabel}</strong>
                </p>
              </div>
            </div>

            <div className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/60">
              <p className="font-semibold text-slate-800 dark:text-slate-200">{title}</p>
              <p className="mt-1 text-slate-600 line-clamp-3 dark:text-slate-400">{body}</p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Bu bildirim ilgili alıcıların mobil cihazlarına anında push bildirim olarak
              gönderilecek ve KidsCare sistemine kaydedilecektir. Onaylıyor musunuz?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <TactileButton variant="secondary" onClick={() => setShowConfirmModal(false)}>
                Vazgeç
              </TactileButton>
              <TactileButton
                variant={priority === 'URGENT' ? 'danger' : 'teal'}
                onClick={() => {
                  void executeSend();
                }}
              >
                Evet, Gönder
              </TactileButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default BroadcastPage;
