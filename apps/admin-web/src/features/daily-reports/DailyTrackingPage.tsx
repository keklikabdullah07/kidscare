import { useEffect, useState, useMemo, type JSX } from 'react';
import type {
  BulkDailyReportItem,
  Classroom,
  ClassroomDailyFlow,
  DailyReport,
  Student,
  StudentMood,
} from '@kidscare/shared-types';
import {
  Sparkles,
  Search,
  Users,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Edit3,
  CheckCheck,
  X,
  Utensils,
  Moon,
  Activity,
  Save,
} from 'lucide-react';
import {
  bulkSaveClassroomDailyReports,
  getClassroomDailyFlow,
  listClassrooms,
} from '../../api/classrooms';
import { listStudents } from '../../api/students';
import { DailyReportEditorModal } from './DailyReportEditorModal';
import { useToast } from '../../components/Toast';
import { EmptyState } from '../../components/ui/EmptyState';

const MOOD_MAP: Record<StudentMood, { label: string; emoji: string; badgeClass: string }> = {
  HAPPY: {
    label: 'Mutlu',
    emoji: '😄',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  CALM: { label: 'Sakin', emoji: '😌', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' },
  ENERGETIC: {
    label: 'Enerjik',
    emoji: '⚡',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  TIRED: {
    label: 'Yorgun',
    emoji: '🥱',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  CRANKY: {
    label: 'Huysuz',
    emoji: '😣',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
  },
  SAD: { label: 'Üzgün', emoji: '😢', badgeClass: 'bg-rose-50 text-rose-800 border-rose-200' },
};

const MEAL_LABEL_MAP: Record<string, string> = {
  ALL: 'Tam',
  HALF: 'Yarım',
  LITTLE: 'Az',
  NONE: 'Yemedi',
};

type ReportFilter = 'all' | 'filled' | 'pending';

type BulkMealSlot = 'breakfast' | 'lunch' | 'afternoonSnack';
type BulkNapQuality = 'GOOD' | 'INTERRUPTED' | 'NONE';

interface BulkDraft {
  mood: StudentMood | null;
  meals: Partial<Record<BulkMealSlot, 'ALL' | 'HALF' | 'LITTLE' | 'NONE'>>;
  naps: {
    startTime?: string | undefined;
    endTime?: string | undefined;
    quality?: BulkNapQuality | undefined;
  };
  activities: string[];
}

const EMPTY_BULK_DRAFT: BulkDraft = {
  mood: null,
  meals: {},
  naps: {},
  activities: [],
};

function pickClassroomEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('arı')) return '🐝';
  if (lower.includes('kelebek')) return '🦋';
  if (lower.includes('yıldız')) return '⭐';
  if (lower.includes('güneş')) return '☀️';
  if (lower.includes('ay')) return '🌙';
  if (lower.includes('minik')) return '🐣';
  if (lower.includes('papatya')) return '🌼';
  if (lower.includes('çiçek')) return '🌷';
  return '🏫';
}

function buildBulkItems(targets: Student[], draft: BulkDraft): BulkDailyReportItem[] {
  const items: BulkDailyReportItem[] = [];
  for (const student of targets) {
    const item: BulkDailyReportItem = { studentId: student.id };
    if (draft.mood) item.mood = draft.mood;
    const mealsClean = stripEmpty(draft.meals);
    if (Object.keys(mealsClean).length > 0) {
      item.meals = mealsClean;
    }
    const napsClean = stripEmpty(draft.naps);
    if (Object.keys(napsClean).length > 0) {
      item.naps = napsClean;
    }
    if (draft.activities.length > 0) item.activities = [...draft.activities];
    items.push(item);
  }
  return items;
}

function stripEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== '') {
      (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
}

export function DailyTrackingPage(): JSX.Element {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<Record<string, DailyReport>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ReportFilter>('all');
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  const [bulkDraft, setBulkDraft] = useState<BulkDraft>(EMPTY_BULK_DRAFT);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    listClassrooms()
      .then((classroomList) => {
        if (cancelled) return;
        setClassrooms(classroomList);
        setSelectedClassroomId((current) =>
          current && classroomList.some((classroom) => classroom.id === current)
            ? current
            : (classroomList[0]?.id ?? ''),
        );
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Sınıflar yüklenemedi');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedClassroomId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([listStudents(), getClassroomDailyFlow(selectedClassroomId, selectedDate)])
      .then(([studentsList, flow]: [Student[], ClassroomDailyFlow]) => {
        if (cancelled) return;
        const flowStudentIds = new Set(flow.students.map((item) => item.student.id));
        setStudents(studentsList.filter((student) => flowStudentIds.has(student.id)));
        const map: Record<string, DailyReport> = {};
        for (const item of flow.students) {
          if (item.dailyReport) map[item.student.id] = item.dailyReport;
        }
        setReports(map);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Günlük akış yüklenemedi');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedClassroomId, selectedDate]);

  function changeDay(delta: number): void {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().slice(0, 10));
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = selectedDate === todayStr;

  // Counts
  const totalStudents = students.length;
  const filledCount = students.filter((s) => !!reports[s.id]).length;
  const pendingCount = totalStudents - filledCount;

  const activeClassroom = classrooms.find((c) => c.id === selectedClassroomId);

  function resetBulkDraft(): void {
    setBulkDraft(EMPTY_BULK_DRAFT);
  }

  function toggleBulkActivity(name: string): void {
    setBulkDraft((prev) => {
      const has = prev.activities.includes(name);
      return {
        ...prev,
        activities: has ? prev.activities.filter((a) => a !== name) : [...prev.activities, name],
      };
    });
  }

  async function applyBulkToAll(): Promise<void> {
    if (!selectedClassroomId) return;
    const targets = filteredStudents.length > 0 ? filteredStudents : students;
    if (targets.length === 0) {
      showToast('Uygulanacak öğrenci yok.', 'info');
      return;
    }
    const items = buildBulkItems(targets, bulkDraft);
    if (items.length === 0) {
      showToast('En az bir alan seçmelisiniz (mod/yemek/uyku/aktivite).', 'info');
      return;
    }
    await submitBulk(items, `${targets.length} öğrenci için uygulandı.`);
  }

  async function applyBulkToPending(): Promise<void> {
    if (!selectedClassroomId) return;
    const pending = students.filter((s) => !reports[s.id]);
    if (pending.length === 0) {
      showToast('Karne bekleyen öğrenci yok.', 'info');
      return;
    }
    const items = buildBulkItems(pending, bulkDraft);
    if (items.length === 0) {
      showToast('En az bir alan seçmelisiniz (mod/yemek/uyku/aktivite).', 'info');
      return;
    }
    await submitBulk(items, `${pending.length} bekleyen öğrenciye uygulandı.`);
  }

  async function submitBulk(items: BulkDailyReportItem[], successMessage: string): Promise<void> {
    setBulkSaving(true);
    try {
      const updated = await bulkSaveClassroomDailyReports(selectedClassroomId, selectedDate, {
        items,
      });
      const next: Record<string, DailyReport> = { ...reports };
      for (const row of updated) next[row.studentId] = row;
      setReports(next);
      showToast(successMessage, 'success');
      resetBulkDraft();
      setBulkOpen(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Toplu kayıt başarısız.', 'error');
    } finally {
      setBulkSaving(false);
    }
  }

  const bulkHasContent =
    bulkDraft.mood !== null ||
    Object.values(bulkDraft.meals).some(Boolean) ||
    Boolean(bulkDraft.naps.startTime) ||
    Boolean(bulkDraft.naps.endTime) ||
    Boolean(bulkDraft.naps.quality) ||
    bulkDraft.activities.length > 0;

  const ACTIVITY_PRESETS = ['Oyun', 'Sanat', 'Müzik', 'Hikaye', 'Bahçe', 'El becerisi'];

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        if (!fullName.includes(q)) return false;
      }

      if (filterType === 'filled') return !!reports[s.id];
      if (filterType === 'pending') return !reports[s.id];

      return true;
    });
  }, [students, reports, searchQuery, filterType]);

  return (
    <div className="space-y-6">
      {/* Header & Date Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800/60 flex items-center justify-center font-bold shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Günlük Yaşam & Aktivite Takibi
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                Öğrencilerin beslenme, uyku, tuvalet, ruh hali ve günlük öğretmen notlarını yönetin.
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#131B2E] border border-[#DDD4C4] dark:border-slate-800 p-1.5 rounded-2xl shadow-[0_4px_16px_-2px_rgba(20,32,54,0.06),0_2px_4px_-1px_rgba(20,32,54,0.03)]">
          <button
            type="button"
            onClick={() => changeDay(-1)}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-[#F9F7F3] dark:hover:bg-slate-800 transition cursor-pointer"
            title="Önceki Gün"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent px-2 py-1 outline-none cursor-pointer"
          />
          <button
            type="button"
            onClick={() => changeDay(1)}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-[#F9F7F3] dark:hover:bg-slate-800 transition cursor-pointer"
            title="Sonraki Gün"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className="text-[11px] font-bold text-teal-800 dark:text-teal-300 hover:text-teal-900 dark:hover:text-teal-200 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-xl ml-1 transition border border-teal-200/60 dark:border-teal-500/30 cursor-pointer"
            >
              Bugün
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700 border border-rose-200 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Classroom Card Grid */}
      {classrooms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {classrooms.map((classroom) => {
            const isActive = classroom.id === selectedClassroomId;
            const classroomAgeLabel = classroom.ageGroup ?? '';
            const emoji = pickClassroomEmoji(classroom.name);
            return (
              <button
                key={classroom.id}
                type="button"
                onClick={() => setSelectedClassroomId(classroom.id)}
                aria-pressed={isActive}
                className={`text-left rounded-3xl border-2 p-4.5 transition-all duration-150 flex items-center gap-3.5 cursor-pointer active:translate-y-[3px] active:shadow-none ${
                  isActive
                    ? 'border-teal-700 bg-teal-50/80 ring-2 ring-teal-600/30 dark:border-teal-500/80 dark:bg-teal-950/30 shadow-[0_4px_0_0_#0f766e,0_8px_20px_-3px_rgba(15,118,110,0.2)]'
                    : 'border-[#DDD4C4] bg-white hover:border-[#b8ad9b] dark:bg-[#131B2E] dark:border-slate-700 shadow-[0_4px_0_0_#D5CBB9,0_6px_14px_rgba(45,38,30,0.06)] hover:-translate-y-1'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 shadow-2xs border border-teal-200 dark:border-teal-800'
                      : 'bg-[#FCFAF7] dark:bg-slate-800/80 border border-[#DDD4C4]/60 dark:border-slate-700'
                  }`}
                >
                  {emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`font-bold truncate text-sm ${
                        isActive
                          ? 'text-teal-950 dark:text-teal-200'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {classroom.name}
                    </h3>
                    {isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-500/40">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate font-medium">
                    {classroomAgeLabel ? `${classroomAgeLabel} · ` : ''}
                    {classroom.studentCount} öğrenci
                  </p>
                  {isActive && activeClassroom && (
                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                      <span className="font-bold text-teal-900 dark:text-slate-200 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-slate-700">
                        {filledCount}/{totalStudents} karne
                      </span>
                      {pendingCount > 0 && (
                        <span className="font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-700/50">
                          {pendingCount} bekliyor
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Progress / KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`p-5 rounded-3xl border-2 text-left transition-all duration-150 cursor-pointer flex items-center justify-between active:translate-y-[3px] active:shadow-none ${
            filterType === 'all'
              ? 'border-teal-700 bg-teal-700 text-white shadow-[0_4px_0_0_#042f2e,0_8px_20px_-3px_rgba(15,118,110,0.3)]'
              : 'border-[#DDD4C4] dark:border-slate-700/80 bg-white dark:bg-[#131B2E] shadow-[0_4px_0_0_#D5CBB9,0_6px_14px_rgba(45,38,30,0.06)] hover:-translate-y-1 hover:border-[#b8ad9b]'
          }`}
        >
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wider ${
                filterType === 'all' ? 'text-teal-100' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Toplam Öğrenci
            </p>
            <p
              className={`text-3xl font-black mt-1 tracking-tight tabular-nums ${
                filterType === 'all' ? 'text-white' : 'text-slate-900 dark:text-white'
              }`}
            >
              {totalStudents}
            </p>
          </div>
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-2xs ${
              filterType === 'all'
                ? 'bg-teal-800 text-white border border-teal-500/50'
                : 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60'
            }`}
          >
            <Users className="w-5 h-5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFilterType(filterType === 'filled' ? 'all' : 'filled')}
          className={`p-5 rounded-3xl border-2 text-left transition-all duration-150 cursor-pointer flex items-center justify-between active:translate-y-[3px] active:shadow-none ${
            filterType === 'filled'
              ? 'border-emerald-700 bg-emerald-600 text-white shadow-[0_4px_0_0_#064e3b,0_8px_20px_-3px_rgba(5,150,105,0.3)]'
              : 'border-[#DDD4C4] dark:border-slate-700/80 bg-white dark:bg-[#131B2E] shadow-[0_4px_0_0_#D5CBB9,0_6px_14px_rgba(45,38,30,0.06)] hover:-translate-y-1 hover:border-emerald-500/50'
          }`}
        >
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wider ${
                filterType === 'filled'
                  ? 'text-emerald-100'
                  : 'text-emerald-800 dark:text-emerald-300'
              }`}
            >
              Karnesi Girilenler
            </p>
            <p
              className={`text-3xl font-black mt-1 tracking-tight tabular-nums ${
                filterType === 'filled' ? 'text-white' : 'text-slate-900 dark:text-emerald-200'
              }`}
            >
              {filledCount}
            </p>
          </div>
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-2xs ${
              filterType === 'filled'
                ? 'bg-emerald-700/80 text-white border border-emerald-400/40'
                : 'bg-emerald-50 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFilterType(filterType === 'pending' ? 'all' : 'pending')}
          className={`p-5 rounded-3xl border-2 text-left transition-all duration-150 cursor-pointer flex items-center justify-between active:translate-y-[3px] active:shadow-none ${
            filterType === 'pending'
              ? 'border-amber-700 bg-amber-600 text-white shadow-[0_4px_0_0_#78350f,0_8px_20px_-3px_rgba(217,119,6,0.3)]'
              : 'border-[#DDD4C4] dark:border-slate-700/80 bg-white dark:bg-[#131B2E] shadow-[0_4px_0_0_#D5CBB9,0_6px_14px_rgba(45,38,30,0.06)] hover:-translate-y-1 hover:border-amber-500/50'
          }`}
        >
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wider ${
                filterType === 'pending' ? 'text-amber-100' : 'text-amber-800 dark:text-amber-300'
              }`}
            >
              Karne Bekleyenler
            </p>
            <p
              className={`text-3xl font-black mt-1 tracking-tight tabular-nums ${
                filterType === 'pending' ? 'text-white' : 'text-slate-900 dark:text-amber-200'
              }`}
            >
              {pendingCount}
            </p>
          </div>
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-2xs ${
              filterType === 'pending'
                ? 'bg-amber-700/80 text-white border border-amber-400/40'
                : 'bg-amber-50 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Bulk Operations Toolbar */}
      {selectedClassroomId && students.length > 0 && (
        <div className="bg-white dark:bg-[#131B2E] rounded-3xl border border-[#DDD4C4] dark:border-slate-800 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)] overflow-hidden">
          <div className="flex items-center justify-between p-4.5 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center shrink-0 shadow-2xs">
                <CheckCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Toplu Kayıt</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Aynı alanları seçili öğrencilere tek seferde uygula.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBulkOpen((v) => !v)}
              className="btn-tactile-secondary px-3.5 py-1.5 text-xs font-bold text-teal-900 dark:text-teal-300"
            >
              {bulkOpen ? 'Paneli Kapat' : 'Paneli Aç'}
            </button>
          </div>

          {bulkOpen && (
            <div className="border-t border-[#DDD4C4]/70 dark:border-slate-800 p-5 space-y-4.5 bg-[#FCFAF7]/50 dark:bg-slate-900/30">
              {/* Mood */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Mod
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['HAPPY', 'CALM', 'ENERGETIC', 'TIRED', 'CRANKY', 'SAD'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setBulkDraft((p) => ({ ...p, mood: p.mood === m ? null : m }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer active:scale-95 ${
                        bulkDraft.mood === m
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border-amber-400 shadow-2xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#DDD4C4] dark:border-slate-700 hover:bg-[#F9F7F3] dark:hover:bg-slate-800'
                      }`}
                    >
                      {MOOD_MAP[m].emoji} {MOOD_MAP[m].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meals */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Utensils className="w-3.5 h-3.5 text-orange-500" /> Yemek
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      ['breakfast', 'Kahvaltı'],
                      ['lunch', 'Öğle'],
                      ['afternoonSnack', 'İkindi'],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-400">
                        {label}
                      </span>
                      <select
                        value={bulkDraft.meals[key] ?? ''}
                        onChange={(e) =>
                          setBulkDraft((p) => ({
                            ...p,
                            meals: {
                              ...p.meals,
                              [key]: e.target.value
                                ? (e.target.value as 'ALL' | 'HALF' | 'LITTLE' | 'NONE')
                                : undefined,
                            },
                          }))
                        }
                        className="text-xs border border-[#DDD4C4] dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
                      >
                        <option value="">—</option>
                        <option value="ALL">Tam</option>
                        <option value="HALF">Yarım</option>
                        <option value="LITTLE">Az</option>
                        <option value="NONE">Yemedi</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Naps */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Moon className="w-3.5 h-3.5 text-blue-500 dark:text-amber-400" /> Uyku
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="time"
                    value={bulkDraft.naps.startTime ?? ''}
                    onChange={(e) =>
                      setBulkDraft((p) => ({
                        ...p,
                        naps: { ...p.naps, startTime: e.target.value || undefined },
                      }))
                    }
                    className="text-xs border border-[#DDD4C4] dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
                    aria-label="Uyku başlangıç"
                  />
                  <input
                    type="time"
                    value={bulkDraft.naps.endTime ?? ''}
                    onChange={(e) =>
                      setBulkDraft((p) => ({
                        ...p,
                        naps: { ...p.naps, endTime: e.target.value || undefined },
                      }))
                    }
                    className="text-xs border border-[#DDD4C4] dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
                    aria-label="Uyku bitiş"
                  />
                  <select
                    value={bulkDraft.naps.quality ?? ''}
                    onChange={(e) =>
                      setBulkDraft((p) => ({
                        ...p,
                        naps: {
                          ...p.naps,
                          quality: e.target.value ? (e.target.value as BulkNapQuality) : undefined,
                        },
                      }))
                    }
                    className="text-xs border border-[#DDD4C4] dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-medium"
                  >
                    <option value="">Kalite seç</option>
                    <option value="GOOD">İyi</option>
                    <option value="INTERRUPTED">Bölünmüş</option>
                    <option value="NONE">Uyumadı</option>
                  </select>
                </div>
              </div>

              {/* Activities */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Activity className="w-3.5 h-3.5 text-amber-500" /> Aktiviteler
                </label>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITY_PRESETS.map((name) => {
                    const selected = bulkDraft.activities.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleBulkActivity(name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer active:scale-95 ${
                          selected
                            ? 'bg-amber-500/20 text-amber-950 dark:text-amber-200 border-amber-400 shadow-2xs'
                            : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-[#DDD4C4] dark:border-slate-700 hover:bg-[#F9F7F3] dark:hover:bg-slate-700'
                        }`}
                      >
                        {selected ? '✓ ' : ''}
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#DDD4C4]/70 dark:border-slate-800">
                <button
                  type="button"
                  onClick={resetBulkDraft}
                  className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1.5 self-start cursor-pointer"
                  disabled={!bulkHasContent || bulkSaving}
                >
                  <X className="w-3.5 h-3.5" /> Taslağı Temizle
                </button>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => void applyBulkToPending()}
                    disabled={bulkSaving || !bulkHasContent || pendingCount === 0}
                    className="btn-tactile-amber px-3.5 py-2 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Bekleyen {pendingCount} Öğrenciye
                  </button>
                  <button
                    type="button"
                    onClick={() => void applyBulkToAll()}
                    disabled={bulkSaving || !bulkHasContent}
                    className="btn-tactile-teal px-4 py-2 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {bulkSaving
                      ? 'Kaydediliyor…'
                      : `Tüm ${filteredStudents.length > 0 ? filteredStudents.length : students.length} Öğrenciye Uygula`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-[#131B2E] p-4.5 rounded-3xl border border-[#DDD4C4] dark:border-slate-800 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Öğrenci adı ile filtrele..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-[#FCFAF7] dark:bg-slate-900 border border-[#DDD4C4] dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-700 dark:focus:ring-amber-500/20 dark:focus:border-amber-500 transition shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto bg-[#FCFAF7] dark:bg-slate-900 p-1 rounded-2xl border border-[#DDD4C4] dark:border-slate-700 shadow-2xs">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-teal-700 text-white dark:bg-teal-600 shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Tümü ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('filled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === 'filled'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-800 dark:text-emerald-400 hover:bg-emerald-100/50'
            }`}
          >
            Girilenler ({filledCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === 'pending'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-amber-800 dark:text-amber-400 hover:bg-amber-100/50'
            }`}
          >
            Bekleyenler ({pendingCount})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-[#131B2E] rounded-3xl border border-[#DDD4C4] dark:border-slate-800 shadow-[0_6px_20px_-3px_rgba(20,32,54,0.08),0_2px_6px_-1px_rgba(20,32,54,0.04)]">
          <div className="inline-block w-8 h-8 border-3 border-teal-700 dark:border-teal-400 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">
            Öğrenci günlük raporları yükleniyor…
          </p>
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title={
            classrooms.length === 0 ? 'Atanmış sınıf bulunamadı.' : 'Bu sınıfta öğrenci bulunamadı.'
          }
          description={
            classrooms.length === 0
              ? 'Önce admin tarafından sınıf ve öğretmen ataması yapılmalı.'
              : 'Önce Öğrenciler sekmesinden öğrenci ekleyin.'
          }
        />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Filtrelere uygun öğrenci bulunamadı."
          description="Arama sorgusunu değiştirin ya da filtreleri temizleyin."
          action={
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              className="text-xs text-teal-900 dark:text-teal-300 font-semibold hover:underline"
            >
              Filtreleri Temizle
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((student) => {
            const report = reports[student.id];
            const moodInfo = report?.mood ? MOOD_MAP[report.mood] : null;

            return (
              <div
                key={student.id}
                className="flex flex-col justify-between rounded-3xl border border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#131B2E] p-5.5 shadow-[0_4px_16px_-4px_rgba(45,38,30,0.06)] group"
              >
                <div>
                  {/* Student Title & Mood */}
                  <div className="flex items-start justify-between gap-3 border-b border-[#DDD4C4]/60 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 shrink-0 rounded-2xl bg-teal-100 text-teal-900 dark:bg-slate-800 dark:text-teal-300 font-bold text-sm flex items-center justify-center shadow-xs border border-teal-200/60 dark:border-slate-700">
                        {student.firstName.charAt(0)}
                        {student.lastName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-teal-800 dark:group-hover:text-teal-300 transition-colors truncate"
                          title={`${student.firstName} ${student.lastName}`}
                        >
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 truncate font-medium">
                          {student.dateOfBirth} · {student.gender ?? '—'}
                        </p>
                      </div>
                    </div>

                    {moodInfo ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${moodInfo.badgeClass}`}
                      >
                        <span>{moodInfo.emoji}</span>
                        <span>{moodInfo.label}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-[#FCFAF7] dark:bg-slate-800 px-2.5 py-1 rounded-full border border-[#DDD4C4] dark:border-slate-700">
                        Mod girilmedi
                      </span>
                    )}
                  </div>

                  {/* Tracking Highlights */}
                  <div className="py-4 space-y-2.5 text-xs">
                    {/* Meals */}
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-200 bg-[#FCFAF7] dark:bg-slate-900/60 px-3.5 py-2.5 rounded-2xl border border-[#DDD4C4]/70 dark:border-slate-800">
                      <span className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                        <span>🍽️</span> Yemek:
                      </span>
                      <span
                        className="text-slate-900 dark:text-white font-medium"
                        title="K: Kahvaltı, Ö: Öğle Yemeği, İ: İkindi Ara Öğünü"
                      >
                        {report?.meals?.breakfast ||
                        report?.meals?.lunch ||
                        report?.meals?.afternoonSnack ? (
                          <>
                            K: {MEAL_LABEL_MAP[report.meals.breakfast ?? ''] ?? '—'} · Ö:{' '}
                            {MEAL_LABEL_MAP[report.meals.lunch ?? ''] ?? '—'} · İ:{' '}
                            {MEAL_LABEL_MAP[report.meals.afternoonSnack ?? ''] ?? '—'}
                          </>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-400 font-normal">
                            Girilmedi
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Nap */}
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-200 bg-[#FCFAF7] dark:bg-slate-900/60 px-3.5 py-2.5 rounded-2xl border border-[#DDD4C4]/70 dark:border-slate-800">
                      <span className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                        <span>😴</span> Uyku:
                      </span>
                      <span className="text-slate-900 dark:text-white font-medium">
                        {report?.naps?.startTime && report?.naps?.endTime ? (
                          `${report.naps.startTime} - ${report.naps.endTime}`
                        ) : report?.naps?.quality === 'NONE' ? (
                          'Uyumadı'
                        ) : (
                          <span className="text-slate-400 dark:text-slate-400 font-normal">
                            Girilmedi
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Potty & Activities */}
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-200 bg-[#FCFAF7] dark:bg-slate-900/60 px-3.5 py-2.5 rounded-2xl border border-[#DDD4C4]/70 dark:border-slate-800">
                      <span className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                        <span>🚻</span> Tuvalet / Bez:
                      </span>
                      <span className="text-slate-900 dark:text-white font-medium">
                        {report?.potty && report.potty.length > 0 ? (
                          `${report.potty.length} kayıt`
                        ) : (
                          <span className="text-slate-400 dark:text-slate-400 font-normal">
                            Kayıt yok
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Teacher Note preview */}
                    {report?.teacherNote && (
                      <div className="mt-2 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 p-3 border border-amber-200/70 dark:border-amber-800/50 text-amber-950 dark:text-amber-200 text-xs italic">
                        "{report.teacherNote}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="border-t border-[#DDD4C4]/60 dark:border-slate-800 pt-3.5 mt-1">
                  <button
                    type="button"
                    onClick={() => setActiveStudent(student)}
                    className={`w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 ${
                      report
                        ? 'btn-tactile-secondary text-emerald-900 dark:text-emerald-300'
                        : 'btn-tactile-teal'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{report ? 'Raporu Düzenle' : 'Günlük Rapor Gir'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      <DailyReportEditorModal
        student={activeStudent}
        date={selectedDate}
        onClose={() => setActiveStudent(null)}
        onSaved={(updated) => {
          setReports((prev) => ({ ...prev, [updated.studentId]: updated }));
          showToast('Günlük karne ve öğretmen notu kaydedildi.', 'success');
        }}
      />
    </div>
  );
}
