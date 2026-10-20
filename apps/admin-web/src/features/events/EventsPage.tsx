import { useState, useEffect, useMemo, type JSX } from 'react';
import {
  Ticket,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Users,
  Printer,
  X,
  Search,
  AlertCircle,
  Bus,
  Sparkles,
  FileText,
  Trash2,
  Ban,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import {
  getEventConsents,
  getEventConsent,
  createEventConsent,
  respondEventConsent,
  cancelEventConsent,
} from '../../api/consents';
import { listClassrooms } from '../../api/classrooms';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader, TactileButton, ConfirmModal } from '../../components/ui';
import { getParentDisplayName } from '../../utils/userDisplay';
import { PrintPreviewModal, EventRosterPrint } from '../../components/print';
import type {
  Classroom,
  EventConsent,
  EventConsentDecision,
  EventConsentResponseItem,
} from '@kidscare/shared-types';

export type EventCategoryTab = 'trips' | 'in_school' | 'forms';

export interface InSchoolWorkshop {
  id: string;
  title: string;
  category: string;
  timing: string;
  targetClassroom: string;
  location: string;
  instructor?: string | undefined;
  requirements?: string | undefined;
  description: string;
  createdAt?: string | undefined;
}

const DEFAULT_WORKSHOPS: InSchoolWorkshop[] = [
  {
    id: 'ws-1',
    title: '🎨 Kil & Çömlek Atölyesi Günü',
    category: 'Sanat & Yaratıcılık',
    timing: 'Bu Hafta',
    targetClassroom: 'Tüm Sınıflar',
    location: 'Etkinlik Salonu',
    instructor: 'Görsel Sanatlar Öğretmeni',
    requirements: 'Önlük gereklidir',
    description:
      'Çocuklarımızın motor becerilerini geliştiren, doğal kil hamuruyla heykeltıraşlık deneyimi.',
  },
  {
    id: 'ws-2',
    title: '🎭 İnteraktif Kukla Tiyatrosu',
    category: 'Sahne Sanatları',
    timing: 'Gelecek Hafta',
    targetClassroom: 'Tüm Sınıflar',
    location: 'Çok Amaçlı Salon',
    instructor: 'Gezici Masal Kukla Ekibi',
    requirements: 'Tüm Sınıflar Katılımlı',
    description:
      'Okulumuza konuk olan profesyonel tiyatro ekibiyle "Ormanın Neşeli Sakinleri" oyunu.',
  },
  {
    id: 'ws-3',
    title: '🎈 Çocuk Şenliği & Kostüm Partisi',
    category: 'Özel Gün',
    timing: '23 Nisan',
    targetClassroom: 'Tüm Sınıflar',
    location: 'Okul Bahçesi',
    instructor: 'Okul Yönetimi & Öğretmenler',
    requirements: 'Veli Katılımlı & Kostüm',
    description:
      'Müzikli dans gösterileri, yüz boyama ve bahçe oyun istasyonlarıyla büyük çocuk bayramı kutlaması.',
  },
  {
    id: 'ws-4',
    title: '🔬 Minik Mucitler Bilim & Yanardağ Deneyi',
    category: 'Bilim & Doğa',
    timing: 'Bu Cuma - 10:30',
    targetClassroom: 'Büyük Yaş Grubu (5-6 Yaş)',
    location: 'Fen & Doğa Köşesi',
    instructor: 'Selin Öğretmen',
    requirements: 'Deney Gözlüğü Okul Tarafından Sağlanır',
    description:
      'Zararsız karbonat ve sirke reaksiyonlarıyla yanardağ püskürmesini gözlemleme ve keşif etkinliği.',
  },
];

export function EventsPage(): JSX.Element {
  const { state: authState } = useAuth();
  const userRole = authState.status === 'authenticated' ? authState.user.role : 'PARENT';
  const isStaff = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'TEACHER';
  const isTeacher = userRole === 'TEACHER';
  const currentUserId = authState.status === 'authenticated' ? authState.user.id : null;

  // Master Category: 'trips' (Dış Geziler) | 'in_school' (Okul İçi Etkinlikler) | 'forms' (Genel İzin & Onay Formları)
  const [categoryTab, setCategoryTab] = useState<EventCategoryTab>('trips');

  const [consents, setConsents] = useState<EventConsent[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Öğretmen Sınıf İzolasyonu (Role Scoping)
  const teacherClassrooms = useMemo(() => {
    if (!isTeacher) return classrooms;
    if (!currentUserId) return [];
    const assigned = classrooms.filter((cls) =>
      cls.teachers?.some((t) => t.teacherId === currentUserId),
    );
    if (assigned.length > 0) return assigned;
    if (classrooms.length === 1) return classrooms;
    return [];
  }, [isTeacher, currentUserId, classrooms]);

  const displayClassrooms = isTeacher ? teacherClassrooms : classrooms;

  // Parent tab state: 'active' | 'history'
  const [parentTab, setParentTab] = useState<'active' | 'history'>('active');

  // Staff filters
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (isTeacher && teacherClassrooms.length > 0) {
      if (
        selectedClassroomId === 'all' ||
        !teacherClassrooms.some((c) => c.id === selectedClassroomId)
      ) {
        const first = teacherClassrooms[0];
        if (first) setSelectedClassroomId(first.id);
      }
    }
  }, [isTeacher, teacherClassrooms, selectedClassroomId]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [rosterConsent, setRosterConsent] = useState<EventConsent | null>(null);
  const [isLoadingRoster, setIsLoadingRoster] = useState<boolean>(false);

  // In-School Workshops Management
  const tenantId = authState.status === 'authenticated' ? authState.user.tenantId : 'default';
  const workshopsStorageKey = `kidscare.workshops.${tenantId}`;

  const [workshops, setWorkshops] = useState<InSchoolWorkshop[]>(() => {
    try {
      const saved = localStorage.getItem(workshopsStorageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as InSchoolWorkshop[];
      }
    } catch {
      // fallback
    }
    return DEFAULT_WORKSHOPS;
  });

  const [isCreateWorkshopModalOpen, setIsCreateWorkshopModalOpen] = useState<boolean>(false);
  const [workshopCategoryFilter, setWorkshopCategoryFilter] = useState<string>('all');

  const filteredWorkshops = useMemo(() => {
    if (workshopCategoryFilter === 'all') return workshops;
    return workshops.filter((w) => w.category === workshopCategoryFilter);
  }, [workshops, workshopCategoryFilter]);

  function saveWorkshops(updated: InSchoolWorkshop[]) {
    setWorkshops(updated);
    try {
      localStorage.setItem(workshopsStorageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  function handleCreateWorkshop(newWs: InSchoolWorkshop) {
    const updated = [newWs, ...workshops];
    saveWorkshops(updated);
    setIsCreateWorkshopModalOpen(false);
    setActionSuccess(`"${newWs.title}" atölyesi başarıyla eklendi.`);
  }

  interface ConfirmDialogState {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'primary' | 'success';
    onConfirm: () => void | Promise<void>;
  }

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  function handleDeleteWorkshop(id: string, title: string) {
    setConfirmDialog({
      isOpen: true,
      title: 'Atölyeyi Sil',
      description: `"${title}" atölyesini okul içi etkinlikler listesinden kaldırmak istediğinizden emin misiniz?`,
      confirmText: 'Evet, Sil',
      cancelText: 'Vazgeç',
      variant: 'danger',
      onConfirm: () => {
        setConfirmDialog(null);
        const updated = workshops.filter((w) => w.id !== id);
        saveWorkshops(updated);
        setActionSuccess('Atölye başarıyla kaldırıldı.');
      },
    });
  }

  // Parent response state
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseNotes, setResponseNotes] = useState<Record<string, string>>({});
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    void loadData();
  }, [selectedClassroomId, selectedStatus]);

  async function loadData(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const params: { classroomId?: string; status?: string } = {};
      if (selectedClassroomId !== 'all') params.classroomId = selectedClassroomId;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const [consentsData, classroomsData] = await Promise.all([
        getEventConsents(params).catch(() => []),
        isStaff ? listClassrooms().catch(() => []) : Promise.resolve([]),
      ]);
      setConsents(Array.isArray(consentsData) ? consentsData : []);
      setClassrooms(Array.isArray(classroomsData) ? classroomsData : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  async function handleParentResponse(
    consent: EventConsent,
    decision: EventConsentDecision,
    customNote?: string,
  ): Promise<void> {
    const studentId =
      consent.myResponse?.studentId || (consent.responses && consent.responses[0]?.studentId);
    if (!studentId) {
      setError('Öğrenci kimliği belirlenemedi.');
      return;
    }

    setRespondingId(consent.id);
    setActionSuccess(null);
    try {
      const note = customNote || responseNotes[consent.id]?.trim();
      const payload: {
        studentId: string;
        decision: EventConsentDecision;
        notes?: string;
      } = {
        studentId,
        decision,
      };
      if (note) payload.notes = note;

      await respondEventConsent(consent.id, payload);
      setActionSuccess(
        decision === 'APPROVED'
          ? 'Gezi izniniz başarıyla onaylandı. Servis ve etkinlik listesine eklendiniz.'
          : 'Gezi katılım izniniz iptal edildi (Katılmayacak olarak kaydedildi).',
      );
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'İzin yanıtı iletilirken hata oluştu.');
    } finally {
      setRespondingId(null);
    }
  }

  function handleCancelConsent(consent: EventConsent): void {
    setConfirmDialog({
      isOpen: true,
      title: 'Geziyi İptal Etmek İstiyor Musunuz?',
      description: `"${consent.title}" gezisi iptal edilecek, veli izinleri geçersiz kalacak ve yeni izin girişi kapatılacaktır. Bu işlem geri alınamaz.`,
      confirmText: 'Evet, Geziyi İptal Et',
      cancelText: 'Vazgeç',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await cancelEventConsent(consent.id);
          setActionSuccess(`"${consent.title}" gezisi başarıyla iptal edildi.`);
          if (rosterConsent?.id === consent.id) {
            setRosterConsent((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
          }
          await loadData();
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Gezi iptal edilirken hata oluştu.');
        }
      },
    });
  }

  function handleUpdateStaffDecision(
    consentId: string,
    studentId: string,
    decision: EventConsentDecision,
    studentName: string,
  ): void {
    const isDeclining = decision === 'DECLINED';
    setConfirmDialog({
      isOpen: true,
      title: isDeclining ? 'Öğrenci İznini İptal Et' : 'Öğrenciye İzin Ver',
      description: isDeclining
        ? `${studentName} adlı öğrencinin bu geziye katılım iznini iptal etmek istediğinizden emin misiniz? Öğrenci etkinlik ve servis listesinden çıkarılacaktır.`
        : `${studentName} adlı öğrencinin bu geziye katılımını onaylamak istediğinizden emin misiniz? Servis ve katılımcı listesine dahil edilecektir.`,
      confirmText: isDeclining ? 'Evet, İzni İptal Et' : 'Evet, İzin Ver',
      cancelText: 'Vazgeç',
      variant: isDeclining ? 'danger' : 'success',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await respondEventConsent(consentId, {
            studentId,
            decision,
            notes: isDeclining
              ? 'Yönetici/Öğretmen tarafından iptal edildi'
              : 'Yönetici/Öğretmen tarafından izin verildi',
          });
          setActionSuccess(
            isDeclining
              ? `${studentName} için izin iptal edildi (Katılmayacak olarak güncellendi).`
              : `${studentName} için gezi izni onaylandı.`,
          );
          if (rosterConsent?.id === consentId) {
            const refreshed = await getEventConsent(consentId);
            setRosterConsent(refreshed);
          }
          await loadData();
        } catch (err: unknown) {
          setError(
            err instanceof Error ? err.message : 'Öğrenci izin durumu güncellenirken hata oluştu.',
          );
        }
      },
    });
  }

  async function openRosterModal(consent: EventConsent): Promise<void> {
    setIsLoadingRoster(true);
    try {
      const full = await getEventConsent(consent.id);
      setRosterConsent(full);
    } catch {
      setRosterConsent(consent);
    } finally {
      setIsLoadingRoster(false);
    }
  }

  // Filtered consents for parent view
  const parentActiveConsents = useMemo(() => {
    return consents.filter((c) => {
      const isPast = new Date(c.eventDate).getTime() < Date.now();
      return !isPast && c.status === 'ACTIVE';
    });
  }, [consents]);

  const parentHistoryConsents = useMemo(() => {
    return consents.filter((c) => {
      const isPast = new Date(c.eventDate).getTime() < Date.now();
      return isPast || c.status !== 'ACTIVE';
    });
  }, [consents]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Slim Page Hero Card */}
      <PageHeader
        title="Etkinlikler & İzin Yönetimi"
        description={
          isStaff
            ? 'Okul dışı geziler, kurum içi etkinlikler, veli izin takibi ve servis biniş listeleri'
            : 'Çocuğunuzun okul gezileri, etkinlikleri, dijital izin onayları ve geçmiş etkinlik arşivi'
        }
        icon={Ticket}
        colorTheme="indigo"
        badges={
          <>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 font-bold text-[11px] border border-indigo-200/80 dark:border-indigo-800/60">
              {categoryTab === 'in_school'
                ? `${workshops.length} Kurum İçi Atölye`
                : `${consents.length} Kayıtlı Etkinlik`}
            </span>
          </>
        }
        actions={
          isStaff && categoryTab === 'trips' ? (
            <TactileButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="whitespace-nowrap text-indigo-900 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700/80 hover:border-indigo-400"
              title="Yeni Gezi veya Etkinlik Planla"
            >
              <Plus className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
              <span>Yeni Gezi / Etkinlik Oluştur</span>
            </TactileButton>
          ) : isStaff && categoryTab === 'in_school' ? (
            <TactileButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateWorkshopModalOpen(true)}
              className="whitespace-nowrap text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700/80 hover:border-purple-400"
              title="Yeni Okul İçi Atölye veya Etkinlik Ekle"
            >
              <Plus className="w-4 h-4 text-purple-700 dark:text-purple-400" />
              <span>Yeni Atölye / Etkinlik Ekle</span>
            </TactileButton>
          ) : undefined
        }
      />

      {/* MASTER CATEGORY TABS (Çatı Modül Sekmeleri) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#FAF9F6] dark:bg-[#0F172A] rounded-2xl border border-[#DDD4C4] dark:border-slate-800 shadow-2xs">
        <button
          type="button"
          onClick={() => setCategoryTab('trips')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            categoryTab === 'trips'
              ? 'bg-teal-900 text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
          }`}
        >
          <Bus className="w-4 h-4 text-amber-400" />
          <span>Dış Geziler (İzin & Servis)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-800 text-teal-100 dark:bg-slate-800">
            {consents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCategoryTab('in_school')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            categoryTab === 'in_school'
              ? 'bg-teal-900 text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Okul İçi Etkinlikler & Atölyeler</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-800 text-teal-100 dark:bg-slate-800">
            {workshops.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCategoryTab('forms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            categoryTab === 'forms'
              ? 'bg-teal-900 text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Genel İzin & Onay Formları</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-700/60 text-rose-900 dark:text-rose-200 text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-700 hover:text-rose-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: DIŞ GEZİLER (İzin & Servis) */}
      {categoryTab === 'trips' && (
        <div className="space-y-6">
          {/* PARENT TABS */}
          {!isStaff && (
            <div className="flex items-center gap-2 border-b border-[#DDD4C4] dark:border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setParentTab('active')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                  parentTab === 'active'
                    ? 'bg-teal-800 text-white shadow-2xs'
                    : 'bg-white dark:bg-[#131B2E] text-slate-700 dark:text-slate-300 border border-[#DDD4C4] dark:border-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Onay Bekleyen & Yaklaşan Geziler</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    parentTab === 'active'
                      ? 'bg-white text-teal-800'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {parentActiveConsents.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setParentTab('history')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                  parentTab === 'history'
                    ? 'bg-teal-800 text-white shadow-2xs'
                    : 'bg-white dark:bg-[#131B2E] text-slate-700 dark:text-slate-300 border border-[#DDD4C4] dark:border-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Geçmiş Gezilerimiz</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    parentTab === 'history'
                      ? 'bg-white text-teal-800'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {parentHistoryConsents.length}
                </span>
              </button>
            </div>
          )}

          {/* STAFF FILTERS */}
          {isStaff && (
            <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-[#131B2E] p-4 rounded-2xl border border-[#DDD4C4] dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Sınıf:</span>
                <select
                  value={selectedClassroomId}
                  onChange={(e) => setSelectedClassroomId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white"
                >
                  {!isTeacher && <option value="all">Tüm Sınıflar</option>}
                  {displayClassrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Durum:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="ACTIVE">Aktif (Onay Sürecinde)</option>
                  <option value="COMPLETED">Tamamlandı</option>
                  <option value="CANCELLED">İptal Edildi</option>
                </select>
              </div>
            </div>
          )}

          {/* CONTENT LIST */}
          {loading ? (
            <div className="flex items-center justify-center p-12 bg-white dark:bg-[#131B2E] rounded-3xl border border-[#DDD4C4] dark:border-slate-800">
              <div className="w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isStaff ? (
            consents.length === 0 ? (
              <EmptyState
                icon={Ticket}
                title="Henüz Gezi Oluşturulmadı"
                description="Kreşiniz için yeni bir okul dışı gezi veya etkinlik izin formu tanımlayarak başlayabilirsiniz."
                action={
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-tactile-teal py-2.5 px-4 text-xs font-bold cursor-pointer"
                  >
                    İlk Geziyi Oluştur
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {consents.map((consent) => {
                  const approvedCount = consent.stats?.approvedCount ?? 0;
                  const declinedCount = consent.stats?.declinedCount ?? 0;
                  const totalResponses = approvedCount + declinedCount;

                  return (
                    <div
                      key={consent.id}
                      className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 p-5 shadow-2xs space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 mb-1.5">
                              {consent.classroom?.name || 'Tüm Okul'}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                              {consent.title}
                            </h3>
                          </div>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                              consent.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : consent.status === 'CANCELLED'
                                  ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {consent.status === 'ACTIVE'
                              ? 'Aktif'
                              : consent.status === 'CANCELLED'
                                ? 'İptal Edildi'
                                : consent.status}
                          </span>
                        </div>

                        {consent.location && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                            <span className="truncate">{consent.location}</span>
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 pt-1 border-t border-[#DDD4C4]/40 dark:border-slate-800">
                          <span>
                            📅{' '}
                            {new Date(consent.eventDate).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="font-bold text-teal-900 dark:text-teal-300">
                            {consent.price ? `${consent.price} TL` : 'Ücretsiz'}
                          </span>
                        </div>

                        {/* KPI & Response Bar */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-emerald-700 dark:text-emerald-400">
                              {approvedCount} İzin Verildi
                            </span>
                            <span className="text-rose-600 dark:text-rose-400">
                              {declinedCount} Katılmıyor
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                            <div
                              style={{
                                width: `${
                                  totalResponses > 0 ? (approvedCount / totalResponses) * 100 : 0
                                }`,
                              }}
                              className="bg-emerald-500 h-full transition-all"
                            />
                            <div
                              style={{
                                width: `${
                                  totalResponses > 0 ? (declinedCount / totalResponses) * 100 : 0
                                }`,
                              }}
                              className="bg-rose-500 h-full transition-all"
                            />
                          </div>
                          <div className="text-[11px] text-slate-500 text-right">
                            Toplam {totalResponses} veli yanıt verdi
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#DDD4C4]/60 dark:border-slate-800 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void openRosterModal(consent)}
                          className="flex-1 btn-tactile-secondary py-2 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Servis & Katılımcı Listesi</span>
                        </button>
                        {consent.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => void handleCancelConsent(consent)}
                            title="Geziyi İptal Et"
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                          >
                            <Ban className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            <span>İptal Et</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : /* PARENT VIEW */
          (parentTab === 'active' ? parentActiveConsents : parentHistoryConsents).length === 0 ? (
            <EmptyState
              icon={Ticket}
              title={
                parentTab === 'active'
                  ? 'Onay Bekleyen Gezi Bulunmuyor'
                  : 'Geçmiş Gezi Kaydı Bulunmuyor'
              }
              description={
                parentTab === 'active'
                  ? 'Şu anda çocuğunuz için onay bekleyen herhangi bir gezi veya etkinlik izni bulunmamaktadır.'
                  : 'Çocuğunuzun geçmişte katıldığı gezi ve etkinlikler burada arşivlenir.'
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(parentTab === 'active' ? parentActiveConsents : parentHistoryConsents).map(
                (consent) => {
                  const hasResponded = !!consent.myResponse;
                  const isApproved = consent.myResponse?.decision === 'APPROVED';

                  return (
                    <div
                      key={consent.id}
                      className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 p-6 shadow-2xs space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 mb-1.5">
                            {consent.classroom?.name || 'Tüm Okul'}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                            {consent.title}
                          </h3>
                          {consent.location && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                              <span>{consent.location}</span>
                            </p>
                          )}
                        </div>

                        {hasResponded ? (
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 border shadow-2xs ${
                              isApproved
                                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300'
                            }`}
                          >
                            {isApproved ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>İzin Verildi</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Katılmayacak</span>
                              </>
                            )}
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 shadow-2xs animate-pulse">
                            Onay Bekliyor
                          </span>
                        )}
                      </div>

                      {consent.description && (
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-[#FCFAF7] dark:bg-slate-900/60 p-3.5 rounded-2xl border border-[#DDD4C4]/60 dark:border-slate-800">
                          {consent.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-3 text-xs bg-[#FCFAF7] dark:bg-slate-900/40 p-3 rounded-2xl border border-[#DDD4C4]/40 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Etkinlik Tarihi</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {new Date(consent.eventDate).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Kişi Başı Ücret</span>
                          <span className="font-bold text-teal-800 dark:text-teal-300">
                            {consent.price ? `${consent.price} TL` : 'Ücretsiz'}
                          </span>
                        </div>
                      </div>

                      {/* Parent Note or Response Form */}
                      {!hasResponded && consent.status === 'ACTIVE' && (
                        <div className="space-y-3 pt-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Öğretmene İletilecek Not (İsteğe Bağlı)
                            </label>
                            <input
                              type="text"
                              placeholder="Örn: Araç tutması, astım veya özel hassasiyet..."
                              value={responseNotes[consent.id] || ''}
                              onChange={(e) =>
                                setResponseNotes({ ...responseNotes, [consent.id]: e.target.value })
                              }
                              className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-slate-800 dark:text-white"
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              disabled={respondingId === consent.id}
                              onClick={() => void handleParentResponse(consent, 'APPROVED')}
                              className="btn-tactile-teal flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>İzin Veriyorum</span>
                            </button>
                            <button
                              type="button"
                              disabled={respondingId === consent.id}
                              onClick={() => void handleParentResponse(consent, 'DECLINED')}
                              className="btn-tactile-secondary py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span>Katılmayacak</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {hasResponded && consent.myResponse?.notes && (
                        <div className="text-xs text-slate-600 dark:text-slate-300 bg-amber-50/60 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                          <span className="font-bold text-amber-900 dark:text-amber-200">
                            İlettiğiniz Not:{' '}
                          </span>
                          <span>{consent.myResponse.notes}</span>
                        </div>
                      )}

                      {consent.status === 'CANCELLED' ? (
                        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2 font-medium">
                          <Ban className="w-4 h-4 shrink-0 text-rose-600" />
                          <span>Bu gezi kreş yönetimi / öğretmen tarafından iptal edilmiştir.</span>
                        </div>
                      ) : hasResponded && consent.status === 'ACTIVE' ? (
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#DDD4C4]/60 dark:border-slate-800">
                          <span className="text-[11px] text-slate-500">
                            {isApproved
                              ? 'Fikriniz değiştiyse katılım iznini geri çekebilirsiniz:'
                              : 'Fikriniz değiştiyse geziye katılım izni verebilirsiniz:'}
                          </span>
                          {isApproved ? (
                            <button
                              type="button"
                              disabled={respondingId === consent.id}
                              onClick={() => {
                                setConfirmDialog({
                                  isOpen: true,
                                  title: 'Gezi İznini İptal Et',
                                  description:
                                    'Çocuğunuzun bu geziye katılım iznini iptal etmek istediğinizden emin misiniz? Öğrenciniz servis ve etkinlik listesinden çıkarılacaktır.',
                                  confirmText: 'Evet, İznimi İptal Et',
                                  cancelText: 'Vazgeç',
                                  variant: 'danger',
                                  onConfirm: () => {
                                    setConfirmDialog(null);
                                    void handleParentResponse(
                                      consent,
                                      'DECLINED',
                                      'Veli izni iptal etti',
                                    );
                                  },
                                });
                              }}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:text-rose-300 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>İzni İptal Et (Katılmayacak)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={respondingId === consent.id}
                              onClick={() => {
                                void handleParentResponse(
                                  consent,
                                  'APPROVED',
                                  'Veli izni onayladı',
                                );
                              }}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Fikrimi Değiştirdim: İzin Ver</span>
                            </button>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OKUL İÇİ ETKİNLİKLER & ATÖLYELER */}
      {categoryTab === 'in_school' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>Kurum İçi Etkinlikler, Gösteriler & Atölyeler</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Okul bahçesinde veya etkinlik salonunda gerçekleşen tiyatro, atölye, kostüm
                  günleri ve kutlamalar
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 self-start sm:self-auto">
                  Dış Servis Gerekmez
                </span>
                {isStaff && (
                  <TactileButton
                    type="button"
                    variant="teal"
                    size="sm"
                    onClick={() => setIsCreateWorkshopModalOpen(true)}
                    className="whitespace-nowrap"
                    title="Yeni Atölye veya Etkinlik Planla"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yeni Atölye Ekle</span>
                  </TactileButton>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#DDD4C4]/60 dark:border-slate-800">
              {[
                { id: 'all', label: 'Tüm Atölyeler' },
                { id: 'Sanat & Yaratıcılık', label: '🎨 Sanat & Yaratıcılık' },
                { id: 'Sahne Sanatları', label: '🎭 Sahne Sanatları' },
                { id: 'Bilim & Doğa', label: '🔬 Bilim & Doğa' },
                { id: 'Müzik & Ritim', label: '🎵 Müzik & Ritim' },
                { id: 'Özel Gün', label: '🎈 Özel Gün & Kutlama' },
                { id: 'Spor & Hareket', label: '⚽ Spor & Hareket' },
              ].map((cat) => {
                const active = workshopCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setWorkshopCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-purple-700 text-white shadow-2xs'
                        : 'bg-[#FCFAF7] dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-[#DDD4C4] dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Workshop Grid or EmptyState */}
            {filteredWorkshops.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="Bu Kategoride Atölye Bulunmuyor"
                description="Seçtiğiniz filtreye uygun okul içi etkinlik henüz planlanmadı."
                action={
                  isStaff ? (
                    <TactileButton
                      type="button"
                      variant="teal"
                      size="sm"
                      onClick={() => setIsCreateWorkshopModalOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                      <span>İlk Atölyeyi Ekle</span>
                    </TactileButton>
                  ) : undefined
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {filteredWorkshops.map((ws) => {
                  return (
                    <div
                      key={ws.id}
                      className="p-5 rounded-2xl bg-[#FCFAF7] dark:bg-[#0F172A] border border-[#DDD4C4] dark:border-slate-800 space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300">
                            {ws.category}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-semibold text-slate-500">
                              {ws.timing}
                            </span>
                            {isStaff && (
                              <button
                                type="button"
                                onClick={() => handleDeleteWorkshop(ws.id, ws.title)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors ml-1 cursor-pointer"
                                title="Atölyeyi Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                            {ws.title}
                          </h3>
                          <span className="inline-block mt-1 text-[11px] font-medium text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-800/40">
                            Hedef: {ws.targetClassroom}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {ws.description}
                        </p>
                      </div>

                      <div className="pt-3 text-[11px] text-teal-800 dark:text-teal-300 font-bold border-t border-[#DDD4C4]/50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <span>📍 {ws.location}</span>
                        {ws.requirements && (
                          <span className="text-slate-600 dark:text-slate-400 font-medium">
                            {ws.requirements}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GENEL İZİN & ONAY FORMLARI */}
      {categoryTab === 'forms' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 p-6 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Resmi İzin & Yasal Onay Belgeleri</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Eğitim yılı boyunca geçerli olan genel muvafakatnameler, KVKK medya izinleri ve
                sağlık protokolleri
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-[#FCFAF7] dark:bg-[#0F172A] border border-[#DDD4C4] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      📸 KVKK & Medya Paylaşım İzni
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Onaylandı
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Öğrencinin sınıf içi etkinlik fotoğraflarının veli portalında ve bültende
                    paylaşım onayı.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 shrink-0">
                  Dönemlik Onay: 2026-2027
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FCFAF7] dark:bg-[#0F172A] border border-[#DDD4C4] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      🚑 Acil Durum Tıbbi Müdahale Muvafakatnamesi
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Onaylandı
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Ani rahatsızlık veya kaza durumunda yetkili sağlık kuruluşuna sevk ve ilk yardım
                    yetkisi.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 shrink-0">
                  Dönemlik Onay: 2026-2027
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FCFAF7] dark:bg-[#0F172A] border border-[#DDD4C4] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      🌳 Okul Dışı Park & Doğa Yürüyüşü İzni
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Onaylandı
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Kreş bitişiğindeki park ve botanik yürüyüş yolunda öğretmen gözetiminde açık
                    hava dersleri.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 shrink-0">
                  Dönemlik Onay: 2026-2027
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL (Staff only) */}
      {isCreateModalOpen && (
        <CreateEventModal
          classrooms={classrooms}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={() => {
            setIsCreateModalOpen(false);
            setActionSuccess('Yeni gezi ve etkinlik izin formu başarıyla oluşturuldu.');
            void loadData();
          }}
        />
      )}

      {/* ROSTER MODAL (Staff only) */}
      {rosterConsent && (
        <EventRosterModal
          consent={rosterConsent}
          onClose={() => setRosterConsent(null)}
          isLoading={isLoadingRoster}
          onCancelConsent={handleCancelConsent}
          onUpdateStaffDecision={handleUpdateStaffDecision}
        />
      )}

      {/* CREATE WORKSHOP MODAL (Staff only) */}
      {isCreateWorkshopModalOpen && (
        <CreateWorkshopModal
          classrooms={classrooms}
          onClose={() => setIsCreateWorkshopModalOpen(false)}
          onCreated={handleCreateWorkshop}
        />
      )}

      {/* TACTILE CONFIRMATION POPUP MODAL (Replaces browser window.confirm) */}
      {confirmDialog && confirmDialog.isOpen && (
        <ConfirmModal
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
          variant={confirmDialog.variant}
          onConfirm={() => void confirmDialog.onConfirm()}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CREATE EVENT MODAL
// ---------------------------------------------------------------------------
function CreateEventModal({
  classrooms,
  onClose,
  onCreated,
}: {
  classrooms: Classroom[];
  onClose: () => void;
  onCreated: () => void;
}): JSX.Element {
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [classroomId, setClassroomId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!title || !eventDate) {
      setModalError('Lütfen gezi başlığını ve tarihini eksiksiz giriniz.');
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      const payload: {
        title: string;
        eventDate: string;
        deadline?: string;
        location?: string;
        price?: number;
        classroomId?: string;
        description?: string;
      } = {
        title: title.trim(),
        eventDate: new Date(eventDate).toISOString(),
      };

      if (deadline) payload.deadline = new Date(deadline).toISOString();
      if (location.trim()) payload.location = location.trim();
      if (typeof price === 'number') payload.price = price;
      if (classroomId.trim()) payload.classroomId = classroomId;
      if (description.trim()) payload.description = description.trim();

      await createEventConsent(payload);
      onCreated();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Gezi oluşturulurken hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#DDD4C4]/60 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Yeni Gezi & İzin Formu Oluştur
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {modalError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium">
            {modalError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-3.5"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Gezi / Etkinlik Başlığı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Atatürk Arboretumu & Doğa Keşif Gezisi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Etkinlik Tarihi & Saati *
              </label>
              <input
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Son İzin Tarihi
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Konum / Varış Yeri
              </label>
              <input
                type="text"
                placeholder="Örn: Sarıyer, İstanbul"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kişi Başı Ücret (TL)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0 (Ücretsiz)"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Hedef Sınıf (Tüm Okul İçin Boş Bırakın)
            </label>
            <select
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
            >
              <option value="">Tüm Kreş / Tüm Sınıflar</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Açıklama & Veli Bilgilendirme Notu
            </label>
            <textarea
              rows={3}
              placeholder="Gezi programı, yanlarında getirmeleri gereken eşyalar, kıyafet önerileri..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-xs text-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DDD4C4]/60 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-tactile-teal py-2.5 px-5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {submitting ? 'Oluşturuluyor...' : 'Gezil & İzin Formunu Başlat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EVENT ROSTER MODAL (Servis ve Katılımcı Listesi)
// ---------------------------------------------------------------------------
function EventRosterModal({
  consent,
  onClose,
  isLoading,
  onCancelConsent,
  onUpdateStaffDecision,
}: {
  consent: EventConsent;
  onClose: () => void;
  isLoading: boolean;
  onCancelConsent?: (consent: EventConsent) => void | Promise<void>;
  onUpdateStaffDecision?: (
    consentId: string,
    studentId: string,
    decision: EventConsentDecision,
    studentName: string,
  ) => void | Promise<void>;
}): JSX.Element {
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'DECLINED'>('ALL');
  const [search, setSearch] = useState('');
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const responses: EventConsentResponseItem[] = consent.responses || [];

  const filteredResponses = useMemo(() => {
    return responses.filter((r) => {
      if (filter !== 'ALL' && r.decision !== filter) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      const sName = `${r.student?.firstName || ''} ${r.student?.lastName || ''}`.toLowerCase();
      const pEmail = (r.parentUser?.email || '').toLowerCase();
      return sName.includes(term) || pEmail.includes(term);
    });
  }, [responses, filter, search]);

  const approvedCount = responses.filter((r) => r.decision === 'APPROVED').length;
  const declinedCount = responses.filter((r) => r.decision === 'DECLINED').length;

  function handlePrint(): void {
    setShowPrintPreview(true);
  }

  return (
    <>
      <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col p-6 space-y-4">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-[#DDD4C4]/60 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                  {consent.classroom?.name || 'Tüm Okul'}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {consent.title} — Servis & Katılımcı Listesi
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                📅{' '}
                {new Date(consent.eventDate).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                {consent.location && `· 📍 ${consent.location}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {consent.status === 'ACTIVE' && onCancelConsent && (
                <button
                  type="button"
                  onClick={() => void onCancelConsent(consent)}
                  className="py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl transition-colors"
                >
                  <Ban className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Geziyi İptal Et</span>
                </button>
              )}
              {consent.status === 'CANCELLED' && (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 flex items-center gap-1.5">
                  <Ban className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Bu Gezi İptal Edilmiştir</span>
                </span>
              )}
              <button
                type="button"
                onClick={handlePrint}
                className="btn-tactile-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Yazdır</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick KPI stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">
                İzin Verenler (Servise Biniş)
              </span>
              <span className="text-xl font-bold text-emerald-900 dark:text-emerald-200">
                {approvedCount}
              </span>
            </div>
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 block">
                Katılmayacaklar
              </span>
              <span className="text-xl font-bold text-rose-900 dark:text-rose-200">
                {declinedCount}
              </span>
            </div>
            <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 p-3 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 block">
                Tahmini Gelir
              </span>
              <span className="text-xl font-bold text-teal-900 dark:text-teal-200">
                {consent.price ? `${approvedCount * Number(consent.price)} TL` : 'Ücretsiz'}
              </span>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  filter === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Tümü ({responses.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  filter === 'APPROVED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400'
                }`}
              >
                İzin Verenler ({approvedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('DECLINED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  filter === 'DECLINED'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-rose-700 dark:text-rose-400'
                }`}
              >
                Katılmayanlar ({declinedCount})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Öğrenci veya veli ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Table list */}
          <div className="flex-1 overflow-y-auto border border-[#DDD4C4]/60 dark:border-slate-800 rounded-2xl">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">Yükleniyor...</div>
            ) : filteredResponses.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Bu filtreye uygun öğrenci yanıtı bulunamadı.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F6] dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 sticky top-0 border-b border-[#DDD4C4]/60 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3.5 font-bold">#</th>
                    <th className="py-2.5 px-3.5 font-bold">Öğrenci</th>
                    <th className="py-2.5 px-3.5 font-bold">Veli Hesabı</th>
                    <th className="py-2.5 px-3.5 font-bold">İzin Durumu</th>
                    <th className="py-2.5 px-3.5 font-bold">Veli Notu</th>
                    <th className="py-2.5 px-3.5 font-bold">Yanıt Tarihi</th>
                    <th className="py-2.5 px-3.5 font-bold text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD4C4]/40 dark:divide-slate-800">
                  {filteredResponses.map((r, idx) => {
                    const isApproved = r.decision === 'APPROVED';
                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-2.5 px-3.5 font-medium text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">
                          {r.student?.firstName} {r.student?.lastName}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-400">
                          {r.parentUser ? getParentDisplayName(r.parentUser) : '-'}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isApproved
                                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300'
                            }`}
                          >
                            {isApproved ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>İzin Verildi</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>Katılmıyor</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                          {r.notes ? (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-200 font-medium text-[11px]">
                              {r.notes}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-500 text-[11px]">
                          {new Date(r.respondedAt).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          {consent.status === 'ACTIVE' && onUpdateStaffDecision ? (
                            isApproved ? (
                              <button
                                type="button"
                                onClick={() =>
                                  void onUpdateStaffDecision(
                                    consent.id,
                                    r.studentId,
                                    'DECLINED',
                                    `${r.student?.firstName || ''} ${r.student?.lastName || ''}`,
                                  )
                                }
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:text-rose-300 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                                title="Velinin talebiyle veya mazeret nedeniyle bu öğrencinin iznini iptal et"
                              >
                                İzni İptal Et
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  void onUpdateStaffDecision(
                                    consent.id,
                                    r.studentId,
                                    'APPROVED',
                                    `${r.student?.firstName || ''} ${r.student?.lastName || ''}`,
                                  )
                                }
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                                title="Öğrenciye izin ver (Servis listesine ekle)"
                              >
                                İzin Verildi Yap
                              </button>
                            )
                          ) : (
                            <span className="text-[11px] text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        title={`${consent.title} — Servis & Katılımcı Listesi`}
        subtitle="Resmî Gezi, Etkinlik ve Servis Biniş Kontrol Çizelgesi"
        orientation="portrait"
      >
        <EventRosterPrint consent={consent} responses={responses} />
      </PrintPreviewModal>
    </>
  );
}

// ---------------------------------------------------------------------------
// CREATE WORKSHOP MODAL (In-School Events & Workshops)
// ---------------------------------------------------------------------------
function CreateWorkshopModal({
  classrooms,
  onClose,
  onCreated,
}: {
  classrooms: Classroom[];
  onClose: () => void;
  onCreated: (workshop: InSchoolWorkshop) => void;
}): JSX.Element {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Sanat & Yaratıcılık');
  const [targetClassroom, setTargetClassroom] = useState('Tüm Sınıflar');
  const [timing, setTiming] = useState('Bu Hafta');
  const [location, setLocation] = useState('Etkinlik Salonu');
  const [instructor, setInstructor] = useState('');
  const [requirements, setRequirements] = useState('');
  const [description, setDescription] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (!title.trim()) {
      setModalError('Lütfen atölye veya etkinlik başlığını giriniz.');
      return;
    }
    if (!description.trim()) {
      setModalError('Lütfen atölye açıklamasını ve içeriğini belirtiniz.');
      return;
    }

    const newWorkshop: InSchoolWorkshop = {
      id: `ws-${Date.now()}`,
      title: title.trim(),
      category,
      targetClassroom,
      timing: timing.trim() || 'Yakında',
      location: location.trim() || 'Etkinlik Salonu',
      instructor: instructor.trim() || undefined,
      requirements: requirements.trim() || undefined,
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    onCreated(newWorkshop);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#DDD4C4]/60 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Yeni Okul İçi Atölye / Etkinlik Ekle
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {modalError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium">
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Atölye / Etkinlik Başlığı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: 🎨 Ebru Sanatı Atölyesi veya 🔬 Yanardağ Deneyi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
              >
                <option value="Sanat & Yaratıcılık">🎨 Sanat & Yaratıcılık</option>
                <option value="Sahne Sanatları">🎭 Sahne Sanatları</option>
                <option value="Bilim & Doğa">🔬 Bilim & Doğa</option>
                <option value="Müzik & Ritim">🎵 Müzik & Ritim</option>
                <option value="Özel Gün">🎈 Özel Gün & Kutlama</option>
                <option value="Spor & Hareket">⚽ Spor & Hareket</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hedef Sınıf / Kitle
              </label>
              <select
                value={targetClassroom}
                onChange={(e) => setTargetClassroom(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
              >
                <option value="Tüm Sınıflar">Tüm Sınıflar (Tüm Okul)</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Etkinlik Zamanı / Tarih *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Bu Hafta Çarşamba, 25 Ekim 10:30"
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mekan / Lokasyon
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
              >
                <option value="Etkinlik Salonu">Etkinlik Salonu</option>
                <option value="Çok Amaçlı Salon">Çok Amaçlı Salon</option>
                <option value="Sanat Atölyesi">Sanat Atölyesi</option>
                <option value="Okul Bahçesi">Okul Bahçesi</option>
                <option value="Fen & Doğa Köşesi">Fen & Doğa Köşesi</option>
                <option value="Sınıf İçi">Sınıf İçi</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Eğitmen / Sorumlu (İsteğe Bağlı)
              </label>
              <input
                type="text"
                placeholder="Örn: Görsel Sanatlar Öğretmeni"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ön Koşul / Not (İsteğe Bağlı)
              </label>
              <input
                type="text"
                placeholder="Örn: Önlük gereklidir, Veli katılımlı"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Atölye Açıklaması & Kazanımlar *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Atölyenin amacı, çocuklara katacağı beceriler ve etkinlik süreci..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DDD4C4]/60 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-tactile-secondary px-4 py-2 text-xs font-bold cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="btn-tactile-teal px-5 py-2 text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Atölyeyi Ekle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
