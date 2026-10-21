import { useEffect, useState, useMemo, type JSX } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCw,
  Calendar,
  Plus,
  Phone,
  User,
  Clock,
  Check,
  X,
  FileText,
  UserCheck,
  History,
  Lock,
  AlertTriangle,
  Search,
  School,
} from 'lucide-react';
import type {
  Classroom,
  PickupAuthorization,
  PickupAuthorizationStatus,
  PickupEvent,
  PickupVerificationMethod,
  Student,
  User as UserModel,
} from '@kidscare/shared-types';
import {
  listPickupAuthorizations,
  reviewPickupAuthorization,
  listPickupEvents,
  createPickupEvent,
  createPickupContact,
  createPickupAuthorization,
} from '../../api/pickup';
import { listStudents } from '../../api/students';
import { listClassrooms } from '../../api/classrooms';
import { listUsers } from '../../api/users';
import { getParentChildrenOverview } from '../../api/parent';
import { useToast } from '../../components/Toast';
import { useAuth } from '../auth/AuthContext';
import { ConfirmModal } from '../../components/ui/PromptModal';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { TactileButton } from '../../components/ui/TactileButton';
import { TactileTabs } from '../../components/ui/TactileTabs';
import { StudentContextBadges } from '../../components/ui/StudentContextBadges';
import { getTeacherDisplayName } from '../../utils/userDisplay';

const STATUS_LABEL: Record<PickupAuthorizationStatus, string> = {
  PENDING: 'Onay Bekliyor',
  APPROVED: 'Yetkili / Onaylı',
  REJECTED: 'Reddedildi',
  EXPIRED: 'Süresi Doldu',
  REVOKED: 'İptal Edildi',
};

const STATUS_STYLE: Record<PickupAuthorizationStatus, string> = {
  PENDING:
    'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  APPROVED:
    'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
  REJECTED:
    'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-900',
  EXPIRED:
    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  REVOKED:
    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700',
};

const VERIFICATION_LABEL: Record<PickupVerificationMethod, string> = {
  ID_CHECK: 'Nüfus Cüzdanı / TC Kontrolü',
  PHONE_CONFIRM: 'Veli Telefon Teyidi',
  KNOWN_FACE: 'Tanınan Yüz / Rutin Teslim',
  PASSWORD: 'Özel Güvenlik Şifresi',
  OTHER: 'Diğer Doğrulama Yöntemi',
};

const RELATIONS_LIST = [
  'Anneanne',
  'Babaanne',
  'Dede',
  'Teyze',
  'Dayı',
  'Amca',
  'Hala',
  'Servis Şoförü',
  'Servis Hostesi',
  'Servis Personeli',
  'Komşu / Aile Dostu',
  'Diğer',
];

export type DatePreset = 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'ALL' | 'CUSTOM';

function getDateRangeForPreset(
  preset: DatePreset,
  customStart: string,
  customEnd: string,
): { from?: string; to?: string } {
  if (preset === 'ALL') {
    return {};
  }
  const now = new Date();
  if (preset === 'TODAY') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return {
      from: start.toISOString(),
      to: end.toISOString(),
    };
  }
  if (preset === 'YESTERDAY') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
    return {
      from: start.toISOString(),
      to: end.toISOString(),
    };
  }
  if (preset === 'LAST_7_DAYS') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return {
      from: start.toISOString(),
      to: end.toISOString(),
    };
  }
  if (preset === 'THIS_MONTH') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return {
      from: start.toISOString(),
      to: end.toISOString(),
    };
  }
  if (preset === 'CUSTOM') {
    const range: { from?: string; to?: string } = {};
    if (customStart) {
      const [y, m, d] = customStart.split('-').map(Number);
      if (y && m && d) {
        range.from = new Date(y, m - 1, d, 0, 0, 0, 0).toISOString();
      }
    }
    if (customEnd) {
      const [y, m, d] = customEnd.split('-').map(Number);
      if (y && m && d) {
        range.to = new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
      }
    }
    return range;
  }
  return {};
}

export function PickupPage(): JSX.Element {
  const { state } = useAuth();
  const isAdmin =
    state.status === 'authenticated' &&
    (state.user.role === 'SUPER_ADMIN' || state.user.role === 'ADMIN');
  const canOperate = state.status === 'authenticated' && state.user.role !== 'PARENT';

  const [activeTab, setActiveTab] = useState<'AUTHORIZATIONS' | 'EVENTS'>('AUTHORIZATIONS');
  const [allAuthorizations, setAllAuthorizations] = useState<PickupAuthorization[]>([]);
  const [events, setEvents] = useState<PickupEvent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<UserModel[]>([]);
  const [filter, setFilter] = useState<PickupAuthorizationStatus | 'ALL'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);

  // Events filter state (Geçmiş kütük sorguları için)
  const [eventDatePreset, setEventDatePreset] = useState<DatePreset>('TODAY');
  const [eventStartDate, setEventStartDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [eventEndDate, setEventEndDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [eventStudentFilter, setEventStudentFilter] = useState<string>('ALL');
  const [eventSearchQuery, setEventSearchQuery] = useState<string>('');

  // Modals state
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [handoverStudentId, setHandoverStudentId] = useState('');
  const [handoverPersonName, setHandoverPersonName] = useState('');
  const [handoverPersonPhone, setHandoverPersonPhone] = useState('');
  const [handoverMethod, setHandoverMethod] = useState<PickupVerificationMethod>('ID_CHECK');
  const [handoverNote, setHandoverNote] = useState('');
  const [handoverContactId, setHandoverContactId] = useState<string | undefined>(undefined);
  const [handoverAuthId, setHandoverAuthId] = useState<string | undefined>(undefined);
  const [handoverSubmitting, setHandoverSubmitting] = useState(false);

  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newStudentId, setNewStudentId] = useState('');
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Anneanne');
  const [newPhone, setNewPhone] = useState('');
  const [newIdentityNote, setNewIdentityNote] = useState('');
  const [addContactSubmitting, setAddContactSubmitting] = useState(false);

  const { showToast } = useToast();

  // Geçmiş veya seçilen kapsamdaki kütükleri yükle
  async function loadEventsForRange(): Promise<void> {
    setEventsLoading(true);
    try {
      const range = getDateRangeForPreset(eventDatePreset, eventStartDate, eventEndDate);
      const studentParam = eventStudentFilter !== 'ALL' ? eventStudentFilter : undefined;
      const res = await listPickupEvents(studentParam, range.from, range.to);
      setEvents(res);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Kütük kayıtları yüklenemedi', 'error');
    } finally {
      setEventsLoading(false);
    }
  }

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const [authList, studentsList, classList, teachersList] = await Promise.all([
        listPickupAuthorizations(),
        listStudents().catch(() => []),
        listClassrooms().catch(() => []),
        listUsers('TEACHER').catch(() => []),
      ]);
      setAllAuthorizations(authList);
      setStudents(studentsList);
      setClassrooms(classList);
      setTeachers(teachersList);

      if (studentsList.length > 0 && !handoverStudentId) {
        setHandoverStudentId(studentsList[0]?.id || '');
        setNewStudentId(studentsList[0]?.id || '');
      }

      await loadEventsForRange();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Veriler yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    void loadEventsForRange();
  }, [eventDatePreset, eventStudentFilter]);

  const isParent = state.status === 'authenticated' && state.user.role === 'PARENT';
  const isTeacher = state.status === 'authenticated' && state.user.role === 'TEACHER';
  const currentUserId = state.status === 'authenticated' ? state.user.id : null;
  const [parentChildren, setParentChildren] = useState<Student[]>([]);

  useEffect(() => {
    if (isParent) {
      getParentChildrenOverview()
        .then((items) => {
          setParentChildren(items.map((i) => i.student));
        })
        .catch(() => {});
    }
  }, [isParent]);

  // Öğretmen Sınıf İzolasyonu (Role Scoping)
  const teacherClassrooms = useMemo(() => {
    if (!isTeacher || !currentUserId) return [];
    const assigned = classrooms.filter((cls) =>
      cls.teachers?.some((t) => t.teacherId === currentUserId),
    );
    if (assigned.length > 0) return assigned;
    if (classrooms.length === 1) return classrooms;
    const studentClassIds = new Set(students.map((s) => s.classroomId).filter(Boolean));
    const matched = classrooms.filter((c) => studentClassIds.has(c.id));
    if (matched.length > 0) return matched;
    return [];
  }, [isTeacher, currentUserId, classrooms, students]);

  const teacherClassroomIds = useMemo(
    () => new Set(teacherClassrooms.map((c) => c.id)),
    [teacherClassrooms],
  );

  const displayClassrooms = isTeacher ? teacherClassrooms : classrooms;
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('ALL');

  useEffect(() => {
    if (isTeacher && teacherClassrooms.length > 0) {
      setSelectedClassroomId(teacherClassrooms[0]?.id || 'ALL');
    }
  }, [isTeacher, teacherClassrooms]);

  // Rol Bazlı Öğrenci & Veri İzolasyonu (Role Scoping)
  const scopedStudents = useMemo(() => {
    if (isParent) {
      if (parentChildren.length > 0) return parentChildren;
      if (currentUserId) return students.filter((s) => s.parentId === currentUserId);
      return [];
    }
    if (isTeacher) {
      if (teacherClassroomIds.size > 0) {
        return students.filter((s) => s.classroomId && teacherClassroomIds.has(s.classroomId));
      }
      return [];
    }
    return students;
  }, [isParent, isTeacher, parentChildren, currentUserId, teacherClassroomIds, students]);

  const eventsScopedStudents = useMemo(() => {
    if (selectedClassroomId !== 'ALL') {
      return scopedStudents.filter((s) => s.classroomId === selectedClassroomId);
    }
    return scopedStudents;
  }, [scopedStudents, selectedClassroomId]);

  useEffect(() => {
    if (selectedClassroomId !== 'ALL' && eventStudentFilter !== 'ALL') {
      const studentInClass = students.find(
        (s) => s.id === eventStudentFilter && s.classroomId === selectedClassroomId,
      );
      if (!studentInClass) {
        setEventStudentFilter('ALL');
      }
    }
  }, [selectedClassroomId, eventStudentFilter, students]);

  const scopedStudentIds = useMemo(
    () => new Set(scopedStudents.map((s) => s.id)),
    [scopedStudents],
  );

  const scopedAuthorizations = useMemo(() => {
    if (isAdmin) return allAuthorizations;
    return allAuthorizations.filter((a) => scopedStudentIds.has(a.studentId));
  }, [isAdmin, allAuthorizations, scopedStudentIds]);

  const scopedEvents = useMemo(() => {
    if (isAdmin) return events;
    return events.filter((e) => scopedStudentIds.has(e.studentId));
  }, [isAdmin, events, scopedStudentIds]);

  // Sayaçlar (Dokunsal Özellik & Sekme Rozetleri)
  const pendingCount = useMemo(
    () => scopedAuthorizations.filter((i) => i.status === 'PENDING').length,
    [scopedAuthorizations],
  );

  const approvedCount = useMemo(
    () => scopedAuthorizations.filter((i) => i.status === 'APPROVED').length,
    [scopedAuthorizations],
  );

  // Günlük teslimat haritası (Öğrencinin bugün teslim edilip edilmediği)
  const todayHandoverMap = useMemo(() => {
    const map = new Map<string, PickupEvent>();
    const todayStr = new Date().toDateString();
    for (const ev of events) {
      if (new Date(ev.occurredAt).toDateString() === todayStr) {
        if (!map.has(ev.studentId)) {
          map.set(ev.studentId, ev);
        }
      }
    }
    return map;
  }, [events]);

  // Filtrelenmiş yetkiler (Sınıf ve Durum Filtreli)
  const items = useMemo(() => {
    let list =
      filter === 'ALL'
        ? scopedAuthorizations
        : scopedAuthorizations.filter((i) => i.status === filter);

    if (selectedClassroomId !== 'ALL') {
      const classStudentIds = new Set(
        students.filter((s) => s.classroomId === selectedClassroomId).map((s) => s.id),
      );
      list = list.filter((a) => classStudentIds.has(a.studentId));
    }
    return list;
  }, [scopedAuthorizations, filter, selectedClassroomId, students]);

  // Arama ve Sınıf filtreli teslimat günlüğü
  const filteredEvents = useMemo(() => {
    let list = scopedEvents;
    if (selectedClassroomId !== 'ALL') {
      const classStudentIds = new Set(
        students.filter((s) => s.classroomId === selectedClassroomId).map((s) => s.id),
      );
      list = list.filter((e) => classStudentIds.has(e.studentId));
    }

    return list.filter((ev) => {
      if (!eventSearchQuery.trim()) return true;
      const q = eventSearchQuery.toLowerCase();
      const student = scopedStudents.find((s) => s.id === ev.studentId);
      const sName = student ? `${student.firstName} ${student.lastName}`.toLowerCase() : '';
      const pName = (ev.pickupPersonName || '').toLowerCase();
      const phone = (ev.pickupPersonPhone || '').toLowerCase();
      const note = (ev.note || '').toLowerCase();
      return sName.includes(q) || pName.includes(q) || phone.includes(q) || note.includes(q);
    });
  }, [scopedEvents, eventSearchQuery, scopedStudents, selectedClassroomId, students]);

  async function review(id: string, status: 'APPROVED' | 'REJECTED'): Promise<void> {
    setBusyId(id);
    try {
      await reviewPickupAuthorization(id, { status });
      showToast(status === 'APPROVED' ? 'Yetki onaylandı! ✅' : 'Yetki reddedildi.', 'success');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'İşlem başarısız', 'error');
    } finally {
      setBusyId(null);
    }
  }

  function startHandoverFromAuth(item: PickupAuthorization): void {
    const student = students.find((s) => s.id === item.studentId);
    setHandoverStudentId(item.studentId);
    setHandoverPersonName(item.pickupContact?.fullName || '');
    setHandoverPersonPhone(item.pickupContact?.phone || '');
    setHandoverContactId(item.pickupContactId || undefined);
    setHandoverAuthId(item.id);
    setHandoverNote(
      `${student ? student.firstName : 'Öğrenci'} yetkili kişiye (${item.pickupContact?.relation || 'Teslimatçı'}) güvenle teslim edildi.`,
    );
    setIsHandoverOpen(true);
  }

  async function submitHandover(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (handoverSubmitting) return;
    if (!handoverStudentId) {
      showToast('Lütfen teslim edilecek öğrenciyi seçin.', 'error');
      return;
    }
    if (!handoverPersonName.trim()) {
      showToast('Lütfen teslim alan kişinin adını girin.', 'error');
      return;
    }

    try {
      setHandoverSubmitting(true);
      await createPickupEvent(handoverStudentId, handoverPersonName.trim(), handoverMethod, {
        pickupContactId: handoverContactId,
        authorizationId: handoverAuthId,
        pickupPersonPhone: handoverPersonPhone.trim() || undefined,
        note: handoverNote.trim() || undefined,
      });

      showToast('Öğrenci güvenle teslim edildi ve günlüğe kaydedildi! 🛡️', 'success');
      setIsHandoverOpen(false);
      setHandoverPersonName('');
      setHandoverPersonPhone('');
      setHandoverNote('');
      setHandoverContactId(undefined);
      setHandoverAuthId(undefined);
      await refresh();
      setActiveTab('EVENTS');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Teslimat kaydedilemedi.', 'error');
    } finally {
      setHandoverSubmitting(false);
    }
  }

  async function submitAddContact(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (addContactSubmitting) return;
    if (!newStudentId) {
      showToast('Lütfen öğrenci seçin.', 'error');
      return;
    }
    if (!newName.trim()) {
      showToast('Lütfen teslimatçının adını ve soyadını girin.', 'error');
      return;
    }
    if (!newPhone.trim()) {
      showToast('Lütfen iletişim telefonunu girin.', 'error');
      return;
    }
    if (newPhone.trim().length < 3) {
      showToast('Telefon numarası en az 3 karakter olmalıdır.', 'error');
      return;
    }

    try {
      setAddContactSubmitting(true);
      const contact = await createPickupContact({
        studentId: newStudentId,
        fullName: newName.trim(),
        relation: newRelation,
        phone: newPhone.trim(),
        identityNote: newIdentityNote.trim() || undefined,
      });

      await createPickupAuthorization({
        studentId: newStudentId,
        pickupContactId: contact.id,
        note: 'Yönetim tarafından doğrudan tanımlandı.',
      });

      showToast('Yeni teslimatçı yetkilendirildi! 🛡️', 'success');
      setIsAddContactOpen(false);
      setNewName('');
      setNewPhone('');
      setNewIdentityNote('');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Yetkili eklenemedi.', 'error');
    } finally {
      setAddContactSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Güvenlik & Teslimat Kontrolü"
        description={
          isParent
            ? 'Çocuğunuza ait teslim yetkilileri, acil durum irtibatları ve okul çıkışı teslim kütüğü.'
            : 'Öğrenci teslim alma yetkileri, veli talepleri ve gün sonu kapı teslimat günlüğü.'
        }
        icon={ShieldCheck}
        colorTheme="teal"
        actions={
          <>
            {canOperate && (
              <>
                <TactileButton
                  variant="teal"
                  size="md"
                  onClick={() => {
                    setHandoverPersonName('');
                    setHandoverPersonPhone('');
                    setHandoverContactId(undefined);
                    setHandoverAuthId(undefined);
                    setHandoverNote('');
                    setIsHandoverOpen(true);
                  }}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Öğrenciyi Teslim Et</span>
                </TactileButton>

                <TactileButton
                  variant="secondary"
                  size="md"
                  onClick={() => setIsAddContactOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yeni Yetkili Ekle</span>
                </TactileButton>
              </>
            )}

            <TactileButton
              variant="secondary"
              size="sm"
              onClick={() => void refresh()}
              aria-label="Yenile"
              title="Yenile"
              className="px-2.5"
            >
              <RotateCw className="w-4 h-4" />
            </TactileButton>
          </>
        }
      />

      {/* Bütünleşik Konsol Kartı (Entegre Sekmeler & Filtre Çubuğu) */}
      <div className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Üst Satır: Ana Sekmeler ve Sınıf Filtresi */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="overflow-x-auto pb-0.5">
            <TactileTabs<'AUTHORIZATIONS' | 'EVENTS'>
              tabs={[
                {
                  id: 'AUTHORIZATIONS',
                  label: 'Teslimat Yetkileri',
                  count: scopedAuthorizations.length,
                  icon: Lock,
                  activeVariant: 'teal',
                },
                {
                  id: 'EVENTS',
                  label: 'Teslimat Günlüğü & Kütük',
                  count: scopedEvents.length,
                  icon: History,
                  activeVariant: 'teal',
                },
              ]}
              activeId={activeTab}
              onChange={setActiveTab}
              ariaLabel="Teslimat Ana Sekmeleri"
            />
          </div>

          {!isParent && displayClassrooms.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                Sınıf:
              </span>
              <select
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                className="text-xs font-bold border-2 border-[#DDD4C4] dark:border-slate-700 rounded-2xl px-3 py-1.5 bg-[#FCFAF7] dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-teal-700 shadow-2xs cursor-pointer min-w-[180px]"
                aria-label="Sınıf Filtresi"
              >
                {!isTeacher && <option value="ALL">🏫 Tüm Sınıflar & Kreş</option>}
                {displayClassrooms.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.ageGroup ? `(${cls.ageGroup})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Alt Satır: Sekmeye Özel Entegre Filtreler */}
        {activeTab === 'AUTHORIZATIONS' ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="overflow-x-auto pb-0.5">
              <TactileTabs<'ALL' | PickupAuthorizationStatus>
                tabs={[
                  { id: 'ALL', label: 'Tümü' },
                  {
                    id: 'PENDING',
                    label: STATUS_LABEL['PENDING'],
                    count: pendingCount,
                    activeVariant: 'amber',
                  },
                  {
                    id: 'APPROVED',
                    label: STATUS_LABEL['APPROVED'],
                    count: approvedCount,
                    activeVariant: 'teal',
                  },
                  {
                    id: 'REJECTED',
                    label: STATUS_LABEL['REJECTED'],
                    activeVariant: 'rose',
                  },
                ]}
                activeId={filter}
                onChange={setFilter}
                ariaLabel="Yetki Durumu Filtresi"
              />
            </div>

            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Toplam{' '}
              <strong className="text-slate-900 dark:text-white font-bold">{items.length}</strong>{' '}
              yetkili listeleniyor
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 flex-wrap">
              {/* Tarih Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                  <span>Kütük Dönemi:</span>
                </span>
                {(
                  [
                    { id: 'TODAY', label: 'Bugün' },
                    { id: 'YESTERDAY', label: 'Dün' },
                    { id: 'LAST_7_DAYS', label: 'Son 7 Gün' },
                    { id: 'THIS_MONTH', label: 'Bu Ay' },
                    { id: 'ALL', label: 'Tüm Arşiv' },
                    { id: 'CUSTOM', label: 'Özel Tarih' },
                  ] as const
                ).map((p) => {
                  const isActive = eventDatePreset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setEventDatePreset(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer active:translate-y-[2px] ${
                        isActive
                          ? 'bg-teal-700 text-white shadow-2xs font-extrabold'
                          : 'bg-[#FCFAF7] dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-[#DDD4C4] dark:border-slate-800 hover:border-teal-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Öğrenci Filtresi */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                  <span>Öğrenci:</span>
                </span>
                <select
                  value={eventStudentFilter}
                  onChange={(e) => setEventStudentFilter(e.target.value)}
                  className="bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold rounded-2xl px-3 py-1.5 focus:outline-hidden shadow-2xs cursor-pointer"
                >
                  <option value="ALL">
                    {isParent
                      ? `Çocuklarım (${scopedStudents.length})`
                      : selectedClassroomId !== 'ALL'
                        ? `Sınıftaki Öğrenciler (${eventsScopedStudents.length})`
                        : `Tüm Öğrenciler (${students.length})`}
                  </option>
                  {eventsScopedStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Özel Tarih Seçiciler (Yalnızca 'CUSTOM' seçildiğinde açılır) */}
            {eventDatePreset === 'CUSTOM' && (
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Başlangıç:
                  </span>
                  <input
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-hidden shadow-2xs cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Bitiş:
                  </span>
                  <input
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-hidden shadow-2xs cursor-pointer"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void loadEventsForRange()}
                  className="btn-tactile-teal px-3 py-1.5 text-xs font-bold"
                >
                  Filtreyi Uygula
                </button>
              </div>
            )}

            {/* Arama Kutusu ve Sayaç */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  placeholder="Teslim alan kişi, telefon veya güvenlik notu ara..."
                  className="w-full pl-10 pr-3.5 py-2 bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-700 transition shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>
                  Toplam{' '}
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {filteredEvents.length}
                  </strong>{' '}
                  teslimat kütüğü kaydı listeleniyor
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: AUTHORIZATIONS */}
      {activeTab === 'AUTHORIZATIONS' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-2xs">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-teal-700 dark:border-teal-400 border-t-transparent mb-3" />
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Yetkiler yükleniyor…
              </p>
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="Bu filtrede teslim yetkisi kaydı bulunamadı."
              description="Velilerin öğrenci teslimatı için yetkilendirdiği kişiler ve onay talepleri burada listelenir."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => {
                const student = students.find((s) => s.id === item.studentId);
                const contact = item.pickupContact;
                const cls = classrooms.find((c) => c.id === student?.classroomId);
                const teacherAssignment = cls?.teachers?.[0];
                const teacher = teacherAssignment
                  ? teachers.find((u) => u.id === teacherAssignment.teacherId)
                  : null;
                const teacherName = teacher ? getTeacherDisplayName(teacher) : null;
                const parentName =
                  student?.passport?.motherName ||
                  student?.passport?.fatherName ||
                  student?.passport?.emergencyContacts?.[0]?.name ||
                  null;

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-teal-600/50 transition group"
                  >
                    <div className="space-y-3">
                      {/* Student & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Öğrenci
                          </span>
                          <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {student
                              ? `${student.firstName} ${student.lastName}`
                              : `Öğrenci #${item.studentId.slice(0, 8)}`}
                          </h3>
                          {student && (
                            <StudentContextBadges
                              className="mt-1"
                              classroomName={cls?.name}
                              teacherName={teacherName}
                              parentName={parentName}
                            />
                          )}
                        </div>

                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-2xs shrink-0 ${STATUS_STYLE[item.status]}`}
                        >
                          {STATUS_LABEL[item.status]}
                        </span>
                      </div>

                      {/* Authorized Person Card */}
                      <div className="bg-[#FCFAF7] dark:bg-slate-900/60 rounded-2xl p-3.5 border border-[#DDD4C4] dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <User className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                            <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                              {contact ? contact.fullName : 'Yetkili Kişi Belirtilmemiş'}
                            </span>
                          </div>
                          {contact?.relation && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 shrink-0">
                              {contact.relation}
                            </span>
                          )}
                        </div>

                        {contact?.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <a
                              href={`tel:${contact.phone}`}
                              className="hover:underline font-mono text-teal-800 dark:text-teal-300"
                            >
                              {contact.phone}
                            </a>
                          </div>
                        )}

                        {contact?.identityNote && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 italic">
                            <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">Not: {contact.identityNote}</span>
                          </div>
                        )}
                      </div>

                      {/* Request note & dates */}
                      {item.note && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 leading-relaxed italic">
                          "{item.note}"
                        </p>
                      )}

                      {(item.validFrom || item.validUntil) && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Geçerlilik:</span>
                          <strong className="text-slate-700 dark:text-slate-200 font-mono">
                            {item.validFrom
                              ? new Date(item.validFrom).toLocaleDateString('tr-TR')
                              : 'Başlangıçtan'}
                          </strong>
                          <span>→</span>
                          <strong className="text-slate-700 dark:text-slate-200 font-mono">
                            {item.validUntil
                              ? new Date(item.validUntil).toLocaleDateString('tr-TR')
                              : 'Süresiz'}
                          </strong>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-[#DDD4C4]/60 dark:border-slate-800 flex items-center gap-2">
                      {isAdmin && item.status === 'PENDING' ? (
                        <>
                          <TactileButton
                            variant="teal"
                            size="sm"
                            onClick={() => void review(item.id, 'APPROVED')}
                            disabled={busyId === item.id}
                            className="flex-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Onayla</span>
                          </TactileButton>
                          <TactileButton
                            variant="danger"
                            size="sm"
                            onClick={() => setRejectTargetId(item.id)}
                            disabled={busyId === item.id}
                            className="flex-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reddet</span>
                          </TactileButton>
                        </>
                      ) : item.status === 'APPROVED' ? (
                        (() => {
                          const todayDelivery = todayHandoverMap.get(item.studentId);

                          // Veli Portalı: Asla "Öğrenciyi Teslim Et" butonu çıkmaz!
                          if (isParent) {
                            if (todayDelivery) {
                              return (
                                <div className="w-full p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>
                                      Bugün Teslim Alındı (
                                      {new Date(todayDelivery.occurredAt).toLocaleTimeString(
                                        'tr-TR',
                                        {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        },
                                      )}
                                      )
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium truncate max-w-[120px]">
                                    {todayDelivery.pickupPersonName}
                                  </span>
                                </div>
                              );
                            }
                            return (
                              <div className="w-full py-2 px-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                                <span>Okul Çıkışında Teslim Almaya Yetkili</span>
                              </div>
                            );
                          }

                          // Öğretmen / Admin Portalı:
                          if (todayDelivery) {
                            return (
                              <div className="space-y-1.5 w-full">
                                <div className="w-full p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>
                                      Bugün Teslim Edildi (
                                      {new Date(todayDelivery.occurredAt).toLocaleTimeString(
                                        'tr-TR',
                                        {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        },
                                      )}
                                      )
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium truncate max-w-[120px]">
                                    {todayDelivery.pickupPersonName}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => startHandoverFromAuth(item)}
                                  className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold cursor-pointer py-0.5 transition"
                                >
                                  Tekrar / Ek Teslimat Kaydı Gir
                                </button>
                              </div>
                            );
                          }

                          return (
                            <TactileButton
                              variant="secondary"
                              size="sm"
                              onClick={() => startHandoverFromAuth(item)}
                              className="w-full"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Öğrenciyi Teslim Et</span>
                            </TactileButton>
                          );
                        })()
                      ) : (
                        <div className="w-full text-center text-[11px] font-semibold text-slate-400 py-1">
                          Talep sonlandı
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

      {/* TAB 2: EVENTS (TESLİMAT GÜNLÜĞÜ VE GEÇMİŞ KÜTÜK) */}
      {activeTab === 'EVENTS' && (
        <div className="space-y-4">
          <div className="bg-[#FCFAF7] dark:bg-slate-900/60 p-4 rounded-2xl border border-[#DDD4C4] dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Günün Resmi Teslimat Kayıtları
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Kapıdan teslim edilen tüm öğrencilerin doğrulama ve geçmiş kütük arşivi.
            </span>
          </div>

          {eventsLoading ? (
            <div className="py-20 text-center bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-2xs">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-teal-700 dark:border-teal-400 border-t-transparent mb-3" />
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Geçmiş kütük kayıtları sorgulanıyor…
              </p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <EmptyState
              icon={History}
              title="Seçilen tarih aralığında ve kriterlerde teslimat kaydı bulunamadı."
              description="Dönem filtresini değiştirebilir, 'Tüm Arşiv' seçeneğine geçebilir veya öğrenci filtresini sıfırlayabilirsiniz."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setEventDatePreset('ALL');
                    setEventStudentFilter('ALL');
                    setEventSearchQuery('');
                  }}
                  className="text-xs text-teal-900 dark:text-teal-300 font-semibold hover:underline"
                >
                  Tüm Arşivi Göster
                </button>
              }
            />
          ) : (
            <div className="bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#DDD4C4] dark:border-slate-800 bg-[#FCFAF7] dark:bg-slate-900/80 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      <th className="py-3 px-4">Tarih & Saat</th>
                      <th className="py-3 px-4">Teslim Edilen Öğrenci</th>
                      <th className="py-3 px-4">Teslim Alan Kişi</th>
                      <th className="py-3 px-4">Doğrulama Yöntemi</th>
                      <th className="py-3 px-4">Güvenlik Notu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                    {filteredEvents.map((ev) => {
                      const st = students.find((s) => s.id === ev.studentId);
                      const cls = st?.classroomId
                        ? classrooms.find((c) => c.id === st.classroomId)
                        : null;
                      const dateObj = new Date(ev.occurredAt);
                      const timeStr = dateObj.toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const dateStr = dateObj.toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      });

                      return (
                        <tr
                          key={ev.id}
                          className="hover:bg-[#FCFAF7] dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-bold font-mono text-teal-800 dark:text-teal-300">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{timeStr}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                              {dateStr}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {st
                                  ? `${st.firstName} ${st.lastName}`
                                  : `Öğrenci #${ev.studentId.slice(0, 8)}`}
                              </span>
                              {cls && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded-md border border-teal-200/70 dark:border-slate-700">
                                  <School className="w-2.5 h-2.5" />
                                  <span>{cls.name}</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-black text-slate-900 dark:text-slate-100">
                              {ev.pickupPersonName}
                            </span>
                            {ev.pickupPersonPhone && (
                              <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                                {ev.pickupPersonPhone}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs">
                              {VERIFICATION_LABEL[ev.verificationMethod]}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-[11px] max-w-xs truncate">
                            {ev.note || (
                              <span className="text-slate-400 italic">Not girilmedi</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reject Confirm Modal */}
      {rejectTargetId && (
        <ConfirmModal
          isOpen={true}
          title="Teslim Yetkisini Reddet"
          description="Bu teslimat yetkisi talebini reddetmek istediğinize emin misiniz? Öğrenci bu kişiye teslim edilemeyecektir."
          confirmText="Evet, Reddet"
          cancelText="Vazgeç"
          variant="danger"
          onConfirm={() => {
            const id = rejectTargetId;
            setRejectTargetId(null);
            if (id) void review(id, 'REJECTED');
          }}
          onCancel={() => setRejectTargetId(null)}
        />
      )}

      {/* HANDOVER MODAL ("Öğrenciyi Teslim Et") */}
      {isHandoverOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#131B2E] w-full max-w-lg rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-[#DDD4C4]/60 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Öğrenciyi Güvenle Teslim Et
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Kapı teslimatını resmi kütüğe işleyin.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHandoverOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => void submitHandover(e)}
              className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1"
            >
              {/* Student Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Teslim Edilecek Öğrenci *
                </label>
                <select
                  value={handoverStudentId}
                  onChange={(e) => {
                    setHandoverStudentId(e.target.value);
                    setHandoverPersonName('');
                    setHandoverPersonPhone('');
                    setHandoverContactId(undefined);
                    setHandoverAuthId(undefined);
                  }}
                  required
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 p-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs cursor-pointer"
                >
                  {scopedStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.firstName} {st.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Approved Contacts & Passport Emergency Contacts Quick Selection */}
              {(() => {
                const approvedContacts = allAuthorizations
                  .filter(
                    (i) =>
                      i.studentId === handoverStudentId &&
                      i.status === 'APPROVED' &&
                      i.pickupContact,
                  )
                  .map((i) => ({
                    ...i.pickupContact!,
                    authId: i.id,
                  }));

                const currentStudent = students.find((s) => s.id === handoverStudentId);
                const passportContacts = (currentStudent?.passport?.emergencyContacts || [])
                  .filter((c) => c.isAuthorizedPickup || c.phone)
                  .filter(
                    (pc) =>
                      !approvedContacts.some(
                        (ac) => ac.fullName.toLowerCase() === pc.name.toLowerCase(),
                      ),
                  );

                if (approvedContacts.length === 0 && passportContacts.length === 0) return null;

                return (
                  <div className="space-y-2 p-3 rounded-2xl bg-teal-50/60 dark:bg-slate-900/60 border border-teal-200/70 dark:border-teal-800/40">
                    <span className="text-[11px] font-bold text-teal-950 dark:text-teal-200 block">
                      Hızlı Yetkili Seçimi (Onaylı & Pasaport):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {approvedContacts.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setHandoverPersonName(c.fullName);
                            setHandoverPersonPhone(c.phone || '');
                            setHandoverContactId(c.id);
                            setHandoverAuthId(c.authId);
                          }}
                          className="px-2.5 py-1 rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-800 text-teal-900 dark:text-teal-200 text-xs font-bold hover:bg-teal-50 dark:hover:bg-slate-700 transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                          <span>
                            {c.fullName} ({c.relation})
                          </span>
                        </button>
                      ))}
                      {passportContacts.map((c, idx) => (
                        <button
                          key={`pass-${idx}`}
                          type="button"
                          onClick={() => {
                            setHandoverPersonName(c.name);
                            setHandoverPersonPhone(c.phone || '');
                            setHandoverContactId(undefined);
                            setHandoverAuthId(undefined);
                            setHandoverNote(
                              'Öğrenci sağlık ve acil durum pasaportundaki yetkiliye teslim edildi.',
                            );
                          }}
                          className="px-2.5 py-1 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span>
                            {c.name} (Pasaport: {c.relationship || 'Yetkili'})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Pickup Person Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Teslim Alan Kişinin Adı Soyadı *
                </label>
                <input
                  type="text"
                  placeholder="Örn: Ayşe Yılmaz"
                  value={handoverPersonName}
                  onChange={(e) => setHandoverPersonName(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
                />
              </div>

              {/* Unauthorized Person Warning Banner */}
              {(() => {
                if (!handoverPersonName.trim()) return null;
                const approvedContacts = allAuthorizations
                  .filter(
                    (i) =>
                      i.studentId === handoverStudentId &&
                      i.status === 'APPROVED' &&
                      i.pickupContact,
                  )
                  .map((i) => i.pickupContact!);

                const isApproved = approvedContacts.some(
                  (c) =>
                    c.fullName.toLowerCase().trim() === handoverPersonName.toLowerCase().trim(),
                );

                if (isApproved) return null;

                return (
                  <div
                    data-testid="unauthorized-pickup-warning"
                    className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 shadow-2xs"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">
                        ⚠️ Yetkisiz / Tanımsız Teslim Alıcı Uyarısı:
                      </span>
                      <p className="text-[11px] mt-0.5 leading-relaxed">
                        "{handoverPersonName}" öğrencinin onaylı teslim alıcı listesinde kayıtlı
                        değildir. Lütfen veli telefon teyidi veya kimlik kontrolü yapmadan teslimatı
                        tamamlamayınız.
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Pickup Person Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  İletişim Telefonu (İsteğe Bağlı)
                </label>
                <input
                  type="tel"
                  placeholder="Örn: 0555 123 4567"
                  value={handoverPersonPhone}
                  onChange={(e) => setHandoverPersonPhone(e.target.value)}
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs font-mono"
                />
              </div>

              {/* Verification Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Doğrulama Yöntemi *
                </label>
                <select
                  value={handoverMethod}
                  onChange={(e) => setHandoverMethod(e.target.value as PickupVerificationMethod)}
                  required
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 p-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs cursor-pointer"
                >
                  <option value="ID_CHECK">Nüfus Cüzdanı / TC Kimlik Kontrolü</option>
                  <option value="PHONE_CONFIRM">Veli Telefon Teyidi</option>
                  <option value="KNOWN_FACE">Tanınan Yüz / Rutin Teslimat</option>
                  <option value="PASSWORD">Güvenlik Şifresi / Teslim Kodu</option>
                  <option value="OTHER">Diğer Yöntem</option>
                </select>
              </div>

              {/* Handover Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Teslimat Notu (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Örn: Annesinin onayıyla teyzesine teslim edildi."
                  value={handoverNote}
                  onChange={(e) => setHandoverNote(e.target.value)}
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
                />
              </div>

              <div className="pt-3 border-t border-[#DDD4C4]/60 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0 sticky bottom-0 bg-white dark:bg-[#131B2E] pb-1">
                <TactileButton
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsHandoverOpen(false)}
                >
                  İptal
                </TactileButton>
                <TactileButton type="submit" variant="teal" size="md" disabled={handoverSubmitting}>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{handoverSubmitting ? 'Kaydediliyor…' : 'Teslimatı Onayla ve Kaydet'}</span>
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CONTACT MODAL ("Yeni Yetkili Ekle") */}
      {isAddContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#131B2E] w-full max-w-lg rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-[#DDD4C4]/60 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Yeni Teslimat Yetkilisi Tanımla
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Öğrenciyi teslim alabilecek yeni bir kişi ekleyin.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddContactOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => void submitAddContact(e)}
              className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1"
            >
              {/* Student */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Öğrenci *
                </label>
                <select
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 p-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs cursor-pointer"
                >
                  {scopedStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.firstName} {st.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pasaporttan Hızlı Aktarım */}
              {(() => {
                const sel = students.find((s) => s.id === newStudentId);
                const passportContacts = (sel?.passport?.emergencyContacts || []).filter(
                  (c) => c.isAuthorizedPickup || c.phone,
                );
                if (passportContacts.length === 0) return null;

                return (
                  <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-950 dark:text-amber-200 block">
                      📋 Pasaporttaki Yetkili Kişilerden Doldur:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {passportContacts.map((c, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setNewName(c.name);
                            setNewPhone(c.phone);
                            if (c.relationship && RELATIONS_LIST.includes(c.relationship)) {
                              setNewRelation(c.relationship);
                            } else {
                              setNewRelation('Diğer');
                            }
                            setNewIdentityNote(
                              'Öğrenci sağlık ve acil durum pasaportundan aktarıldı.',
                            );
                          }}
                          className="px-2.5 py-1 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 dark:hover:bg-slate-700 transition shadow-2xs cursor-pointer"
                        >
                          + {c.name} ({c.relationship || 'Yetkili'})
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Yetkilinin Adı ve Soyadı *
                </label>
                <input
                  type="text"
                  placeholder="Örn: Fatma Demir"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
                />
              </div>

              {/* Relation & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Yakınlık Derecesi *
                  </label>
                  <select
                    value={newRelation}
                    onChange={(e) => setNewRelation(e.target.value)}
                    className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 p-3 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs cursor-pointer"
                  >
                    {RELATIONS_LIST.map((rel) => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Telefon Numarası *
                  </label>
                  <input
                    type="tel"
                    placeholder="05xx xxx xxxx"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs font-mono"
                  />
                </div>
              </div>

              {/* Identity Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Kimlik Notu / Açıklama (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Örn: TC son 4 hane: 1234, Sarı servis aracı"
                  value={newIdentityNote}
                  onChange={(e) => setNewIdentityNote(e.target.value)}
                  className="w-full rounded-2xl border border-[#DDD4C4] dark:border-slate-700 bg-[#FCFAF7] dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
                />
              </div>

              <div className="pt-3 border-t border-[#DDD4C4]/60 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0 sticky bottom-0 bg-white dark:bg-[#131B2E] pb-1">
                <TactileButton
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsAddContactOpen(false)}
                >
                  İptal
                </TactileButton>
                <TactileButton
                  type="submit"
                  variant="teal"
                  size="md"
                  disabled={addContactSubmitting}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{addContactSubmitting ? 'Kaydediliyor…' : 'Yetkiliyi Kaydet'}</span>
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
