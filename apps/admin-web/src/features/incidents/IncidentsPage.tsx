import { useEffect, useState, useMemo, type FormEvent, type JSX } from 'react';
import {
  AlertTriangle,
  Plus,
  CheckCheck,
  RotateCw,
  Activity,
  Bandage,
  HeartPulse,
  ShieldAlert,
  FileText,
  CheckCircle2,
  Calendar,
  Search,
} from 'lucide-react';
import type {
  Classroom,
  IncidentCategory,
  IncidentRecord,
  Student,
  User,
} from '@kidscare/shared-types';
import { createIncident, listIncidents, updateIncident } from '../../api/incidents';
import { listStudents } from '../../api/students';
import { listClassrooms } from '../../api/classrooms';
import { listUsers } from '../../api/users';
import { useAuth } from '../auth/AuthContext';
import { useStudentScope } from '../../hooks/useStudentScope';
import { AdaptiveScopeBadge } from '../../components/ui/AdaptiveScopeBadge';
import { useToast } from '../../components/Toast';
import {
  EmptyState,
  PageHeader,
  TactileButton,
  TactileTabs,
  type TactileTabItem,
} from '../../components/ui';
import { StudentContextBadges } from '../../components/ui/StudentContextBadges';
import { getParentDisplayName, getTeacherDisplayName } from '../../utils/userDisplay';

type TabKey = 'ALL' | 'PENDING_PARENT' | 'INJURIES' | 'ILLNESS' | 'BEHAVIOR';

interface CategoryMeta {
  label: string;
  icon: typeof AlertTriangle;
  badgeCls: string;
  accentBorder: string;
  iconBg: string;
}

const CATEGORY_META: Record<IncidentCategory, CategoryMeta> = {
  DUSME: {
    label: 'Düşme',
    icon: Activity,
    badgeCls:
      'bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700',
    accentBorder: 'border-l-amber-500',
    iconBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
  },
  YARALANMA: {
    label: 'Yaralanma',
    icon: Bandage,
    badgeCls:
      'bg-rose-100/90 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700',
    accentBorder: 'border-l-rose-500',
    iconBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
  },
  HASTALIK: {
    label: 'Hastalık / Ateş',
    icon: HeartPulse,
    badgeCls:
      'bg-sky-100/90 text-sky-900 border-sky-300 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-700',
    accentBorder: 'border-l-sky-500',
    iconBg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400',
  },
  DAVRANIS: {
    label: 'Davranış',
    icon: ShieldAlert,
    badgeCls:
      'bg-purple-100/90 text-purple-900 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-700',
    accentBorder: 'border-l-purple-500',
    iconBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400',
  },
  KAZA: {
    label: 'Kaza',
    icon: AlertTriangle,
    badgeCls:
      'bg-orange-100/90 text-orange-900 border-orange-300 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-700',
    accentBorder: 'border-l-orange-500',
    iconBg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400',
  },
  DIGER: {
    label: 'Diğer',
    icon: FileText,
    badgeCls:
      'bg-stone-200 text-stone-800 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
    accentBorder: 'border-l-stone-500',
    iconBg: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-400',
  },
};

function toLocalDatetimeInput(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}

export function IncidentsPage(): JSX.Element {
  const { state: authState } = useAuth();
  const [items, setItems] = useState<IncidentRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { showToast } = useToast();

  const isTeacher = authState.status === 'authenticated' && authState.user.role === 'TEACHER';
  const currentUserId = authState.status === 'authenticated' ? authState.user.id : null;

  // Spec 0062: akıllı adaptif kapsam (tek sınıflı öğretmen için rozet)
  const { singleClassroom, showClassroomFilter: scopeShowClassroomFilter } = useStudentScope();

  // Tab & Filter state
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );

  // Create form state
  const [fStudentId, setFStudentId] = useState('');
  const [fCategory, setFCategory] = useState<IncidentCategory>('DUSME');
  const [fOccurredAt, setFOccurredAt] = useState(toLocalDatetimeInput());
  const [fDescription, setFDescription] = useState('');
  const [fActionTaken, setFActionTaken] = useState('');
  const [fParentNotified, setFParentNotified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function getStudentContext(studentId?: string | null, reportedById?: string | null) {
    if (!studentId) return { classroomName: null, teacherName: null, parentName: null };
    const student = students.find((s) => s.id === studentId);
    if (!student) return { classroomName: null, teacherName: null, parentName: null };
    const cls = classrooms.find((c) => c.id === student.classroomId);
    const reporter = reportedById ? teachers.find((u) => u.id === reportedById) : null;
    const teacherAssignment = cls?.teachers?.[0];
    const classTeacher = teacherAssignment
      ? teachers.find((u) => u.id === teacherAssignment.teacherId)
      : null;
    const teacher = reporter || classTeacher;
    const teacherName = teacher ? getTeacherDisplayName(teacher) : null;
    const parentUser = student.parentId ? parents.find((u) => u.id === student.parentId) : null;
    const parentUserFullName = parentUser ? getParentDisplayName(parentUser) : null;
    const parentName =
      parentUserFullName ||
      student.passport?.motherName ||
      student.passport?.fatherName ||
      student.passport?.emergencyContacts?.[0]?.name ||
      null;
    return { classroomName: cls?.name ?? null, teacherName, parentName };
  }

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const [list, studentsRes, classroomsRes, teachersRes, parentsRes] = await Promise.all([
        listIncidents(),
        listStudents().catch(() => []),
        listClassrooms().catch(() => []),
        listUsers('TEACHER').catch(() => []),
        listUsers('PARENT').catch(() => []),
      ]);
      setItems(list);
      setStudents(studentsRes);
      setClassrooms(classroomsRes);
      setTeachers(teachersRes);
      setParents(parentsRes);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Kayıtlar yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  // Öğretmen İzolasyonu (Sınıf Yetki Filtresi)
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

  const scopedStudents = useMemo(() => {
    if (!isTeacher) return students;
    if (teacherClassroomIds.size > 0) {
      return students.filter((s) => s.classroomId && teacherClassroomIds.has(s.classroomId));
    }
    return [];
  }, [isTeacher, students, teacherClassroomIds]);

  const scopedStudentIds = useMemo(
    () => new Set(scopedStudents.map((s) => s.id)),
    [scopedStudents],
  );

  const scopedItems = useMemo(() => {
    if (!isTeacher) return items;
    return items.filter((i) => scopedStudentIds.has(i.studentId));
  }, [isTeacher, items, scopedStudentIds]);

  function getStudent(id: string): Student | undefined {
    return students.find((x) => x.id === id);
  }

  function studentName(id: string): string {
    const s = getStudent(id);
    return s ? `${s.firstName} ${s.lastName}` : `#${id.slice(0, 8)}`;
  }

  // Summary Metrics (Öğretmen için scopedItems baz alınır)
  const totalCount = scopedItems.length;
  const pendingNotificationCount = useMemo(
    () => scopedItems.filter((i) => !i.parentNotified).length,
    [scopedItems],
  );
  const injuryCount = useMemo(
    () =>
      scopedItems.filter(
        (i) => i.category === 'DUSME' || i.category === 'YARALANMA' || i.category === 'KAZA',
      ).length,
    [scopedItems],
  );

  // Filtered Items (Öğretmen için scopedItems üzerinden filtrelenir)
  const filteredItems = useMemo(() => {
    return scopedItems.filter((i) => {
      // 1. Tab filter
      if (activeTab === 'PENDING_PARENT' && i.parentNotified) return false;
      if (
        activeTab === 'INJURIES' &&
        i.category !== 'DUSME' &&
        i.category !== 'YARALANMA' &&
        i.category !== 'KAZA'
      )
        return false;
      if (activeTab === 'ILLNESS' && i.category !== 'HASTALIK') return false;
      if (activeTab === 'BEHAVIOR' && i.category !== 'DAVRANIS' && i.category !== 'DIGER')
        return false;

      // 2. Student filter
      if (selectedStudentFilter && i.studentId !== selectedStudentFilter) return false;

      // 3. Classroom filter
      if (selectedClassroomId !== 'ALL') {
        const st = getStudent(i.studentId);
        if (st?.classroomId !== selectedClassroomId) return false;
      }

      // 4. Date filter (if selected)
      if (selectedDate) {
        const itemDate = new Date(i.occurredAt).toISOString().slice(0, 10);
        if (itemDate !== selectedDate) return false;
      }

      // 5. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const sName = studentName(i.studentId).toLowerCase();
        const desc = i.description.toLowerCase();
        const action = (i.actionTaken || '').toLowerCase();
        const catLabel = (CATEGORY_META[i.category]?.label || '').toLowerCase();
        if (
          !sName.includes(q) &&
          !desc.includes(q) &&
          !action.includes(q) &&
          !catLabel.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    scopedItems,
    activeTab,
    selectedStudentFilter,
    selectedClassroomId,
    selectedDate,
    searchQuery,
    students,
  ]);

  async function submitCreate(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!fStudentId) {
      showToast('Lütfen olayın yaşandığı öğrenciyi seçin.', 'error');
      return;
    }
    if (!fDescription.trim()) {
      showToast('Lütfen olay açıklamasını girin.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createIncident({
        studentId: fStudentId,
        category: fCategory,
        occurredAt: new Date(fOccurredAt),
        description: fDescription.trim(),
        ...(fActionTaken.trim() ? { actionTaken: fActionTaken.trim() } : {}),
        parentNotified: fParentNotified,
      });

      showToast('Olay tutanağı başarıyla kaydedildi! 🛡️', 'success');
      setIsCreateOpen(false);
      setFStudentId('');
      setFDescription('');
      setFActionTaken('');
      setFParentNotified(false);
      setFOccurredAt(toLocalDatetimeInput());
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Kayıt oluşturulamadı', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function markParentNotified(id: string): Promise<void> {
    setBusyId(id);
    try {
      await updateIncident(id, { parentNotified: true });
      showToast('Veli bilgilendirildi olarak kaydedildi. 📞', 'success');
      await refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'İşlem başarısız', 'error');
    } finally {
      setBusyId(null);
    }
  }

  const incidentTabs = useMemo<TactileTabItem<TabKey>[]>(
    () => [
      { id: 'ALL', label: 'Tüm Tutanaklar', count: totalCount, activeVariant: 'teal' },
      {
        id: 'PENDING_PARENT',
        label: 'Bildirim Bekleyenler',
        count: pendingNotificationCount,
        activeVariant: 'amber',
        badgeCls: 'bg-amber-100 text-amber-900 font-extrabold',
      },
      {
        id: 'INJURIES',
        label: 'Düşme & Yaralanma',
        count: injuryCount,
        activeVariant: 'rose',
      },
      { id: 'ILLNESS', label: 'Hastalık & Revir', activeVariant: 'sky' },
      { id: 'BEHAVIOR', label: 'Davranış & Diğer', activeVariant: 'purple' },
    ],
    [totalCount, pendingNotificationCount, injuryCount],
  );

  return (
    <div className="space-y-6">
      {/* Sayfa Başlığı ve Dokunsal Aksiyonlar */}
      {/* Slim Page Hero Card */}
      <PageHeader
        title="Olay Kayıtları & Revir Takibi"
        description={
          isTeacher
            ? `Sorumlu olduğunuz sınıf(lar)ın (${teacherClassrooms.map((c) => c.name).join(', ') || 'Atanmış sınıf yok'}) revir, kaza ve ilk yardım tutanakları`
            : 'Düşme, yaralanma, revir müdahaleleri, ilk yardım ve acil veli bildirim raporları'
        }
        icon={AlertTriangle}
        colorTheme="rose"
        actions={
          <>
            <TactileButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void refresh()}
              title="Kayıtları Yenile"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Yenile</span>
            </TactileButton>

            <TactileButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="whitespace-nowrap text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-700/80 hover:border-rose-400"
              title="Yeni Olay Tutanağı Kaydet"
            >
              <Plus className="w-4 h-4 text-rose-700 dark:text-rose-400" />
              <span>Yeni Tutanak</span>
            </TactileButton>
          </>
        }
      />

      {/* Bütünleşik Konsol Kartı (Sekmeler & Filtreler) */}
      <div className="bg-white dark:bg-[#131B2E] border-2 border-[#DDD4C4] dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Dokunsal Sekmeler (Kapsayıcı Ray & Tıklanabilir 3D Butonlar) */}
        <div className="overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800">
          <TactileTabs
            tabs={incidentTabs}
            activeId={activeTab}
            onChange={setActiveTab}
            ariaLabel="Olay Kategorisi Sekmeleri"
          />
        </div>

        {/* Arama, Sınıf ve Öğrenci Filtreleri */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Olay açıklaması, ilk yardım notu veya öğrenci ara..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            {scopeShowClassroomFilter ? (
              <select
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                aria-label="Sınıf Filtresi"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer font-medium"
              >
                <option value="ALL">🏫 Tüm Sınıflar</option>
                {(isTeacher ? teacherClassrooms : classrooms).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : singleClassroom ? (
              <AdaptiveScopeBadge
                type="classroom"
                label={singleClassroom.name}
                subLabel="Sınıfınız"
              />
            ) : null}
          </div>

          <div>
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer font-medium"
            >
              <option value="">
                {isTeacher
                  ? `Sınıfımdaki Öğrenciler (${scopedStudents.length})`
                  : `Tüm Öğrenciler (${students.length})`}
              </option>
              {scopedStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tarih Filtresi Çubuğu (Varsayılan: Bugün) */}
        <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Tarih:</span>
          </div>

          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label="Olay Tarihi Filtresi"
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
            />
          </div>

          <TactileButton
            type="button"
            variant={selectedDate === new Date().toISOString().slice(0, 10) ? 'amber' : 'secondary'}
            size="sm"
            onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
            title="Bugünün kayıtlarını göster"
          >
            Bugün
          </TactileButton>

          {selectedDate && (
            <TactileButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSelectedDate('')}
              title="Tüm tarihleri göster"
            >
              Tüm Tarihler
            </TactileButton>
          )}

          <div className="ml-auto text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Gösterilen:{' '}
            <strong className="text-slate-800 dark:text-slate-200">{filteredItems.length}</strong> /{' '}
            {scopedItems.length} tutanak
          </div>
        </div>
      </div>

      {/* Kayıtlar Grid Listesi */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-[#131B2E] rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-700/80 shadow-xs">
          <div className="inline-block w-9 h-9 border-3 border-amber-600 dark:border-amber-400 border-t-transparent rounded-full animate-spin mb-3.5" />
          <p className="text-slate-600 dark:text-slate-300 text-sm font-bold">
            Olay tutanakları yükleniyor…
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="Filtreye uygun olay kaydı bulunamadı"
          description={
            searchQuery || selectedStudentFilter || activeTab !== 'ALL'
              ? 'Seçtiğiniz sekme veya arama kriterine uygun bir tutanak yok.'
              : 'Kreşinizde henüz bildirilmiş bir kaza veya yaralanma kaydı bulunmuyor.'
          }
          action={
            !isCreateOpen ? (
              <TactileButton
                type="button"
                variant="amber"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Tutanak Oluştur</span>
              </TactileButton>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
          {filteredItems.map((i) => {
            const meta = CATEGORY_META[i.category] ?? CATEGORY_META.DIGER;
            const CategoryIcon = meta.icon;
            const student = getStudent(i.studentId);
            const context = getStudentContext(i.studentId, i.reportedById);

            return (
              <div
                key={i.id}
                className="bg-white dark:bg-[#131B2E] rounded-2xl border-2 border-[#DDD4C4] dark:border-slate-700/80 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-150"
              >
                <div className="space-y-3.5">
                  {/* Kart Üst Başlık: Kategori ve Veli Bildirim Rozeti */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${meta.iconBg}`}
                      >
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${meta.badgeCls}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        {/* Öğrenci İsmi */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-4.5 h-4.5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200">
                            {student ? student.firstName.charAt(0) : 'Ö'}
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {studentName(i.studentId)}
                          </span>
                        </div>
                        {/* Sınıf, Öğretmen ve Veli Bağlamı */}
                        <StudentContextBadges
                          classroomName={context.classroomName}
                          teacherName={context.teacherName}
                          parentName={context.parentName}
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    {/* Veli Bildirim Etiketi */}
                    {i.parentNotified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Veliye Bildirildi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/80 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        Bildirim Bekliyor
                      </span>
                    )}
                  </div>

                  {/* Olay Açıklaması Kutusu */}
                  <div className="text-xs text-slate-800 dark:text-slate-200 bg-[#FCFAF7] dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 leading-relaxed font-medium">
                    <p>{i.description}</p>
                  </div>

                  {/* İlk Yardım / Müdahale Aksiyonu Kutusu */}
                  {i.actionTaken && (
                    <div className="text-xs text-amber-900 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5">
                      <Bandage className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[11px] text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                          Uygulanan İlk Yardım / Aksiyon
                        </span>
                        <p className="mt-0.5 leading-relaxed font-medium">{i.actionTaken}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Alt Satır: Tarih & Dokunsal Aksiyon Butonu */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(i.occurredAt).toLocaleString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {!i.parentNotified && (
                    <TactileButton
                      type="button"
                      variant="teal"
                      size="sm"
                      onClick={() => void markParentNotified(i.id)}
                      disabled={busyId === i.id}
                      title="Veliye kaza/olay hakkında bilgi verildiğini kaydet"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Veliye Bildirildi Olarak İşaretle</span>
                    </TactileButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Yeni Olay Tutanağı Oluştur */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#131B2E] border-2 border-[#DDD4C4] dark:border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Yeni Olay / Kaza Tutanağı
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Düşme, yaralanma veya revir müdahalesini kayıt altına alın.
                </p>
              </div>
            </div>

            <form onSubmit={(e) => void submitCreate(e)} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Öğrenci *
                </label>
                <select
                  value={fStudentId}
                  onChange={(e) => setFStudentId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                >
                  <option value="">Öğrenci Seçiniz…</option>
                  {scopedStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Olay Kategorisi *
                  </label>
                  <select
                    value={fCategory}
                    onChange={(e) => setFCategory(e.target.value as IncidentCategory)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    {Object.entries(CATEGORY_META).map(([k, meta]) => (
                      <option key={k} value={k}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Olay Zamanı *
                  </label>
                  <input
                    type="datetime-local"
                    value={fOccurredAt}
                    onChange={(e) => setFOccurredAt(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Olay Açıklaması *
                </label>
                <textarea
                  value={fDescription}
                  onChange={(e) => setFDescription(e.target.value)}
                  rows={2}
                  placeholder="Olayın nerede, nasıl ve ne zaman gerçekleştiğini detaylandırın…"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Uygulanan İlk Yardım / Aksiyon (Opsiyonel)
                </label>
                <textarea
                  value={fActionTaken}
                  onChange={(e) => setFActionTaken(e.target.value)}
                  rows={2}
                  placeholder="Örn: Soğuk kompres uygulandı, revir hemşiresi kontrol etti, yara temizlendi…"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60">
                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fParentNotified}
                    onChange={(e) => setFParentNotified(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>
                    Veliye anında bilgi verildi (Telefonla arandı veya yüz yüze görüşüldü)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <TactileButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                >
                  İptal
                </TactileButton>
                <TactileButton type="submit" variant="amber" size="sm" disabled={submitting}>
                  {submitting ? 'Kaydediliyor…' : 'Tutanağı Kaydet'}
                </TactileButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
