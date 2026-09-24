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
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Günlük Yaşam & Aktivite Takibi
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Öğrencilerin beslenme, uyku, tuvalet, ruh hali ve günlük öğretmen notlarını yönetin.
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
          <button
            type="button"
            onClick={() => changeDay(-1)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            title="Önceki Gün"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-transparent px-2 py-1 outline-none cursor-pointer"
          />
          <button
            type="button"
            onClick={() => changeDay(1)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            title="Sonraki Gün"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-lg ml-1 transition"
            >
              Bugün
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 border border-rose-200 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Classroom Card Grid */}
      {classrooms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
                className={`text-left rounded-2xl border p-4 transition shadow-xs flex items-center gap-3 ${
                  isActive
                    ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/40'
                    : 'border-slate-200/80 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                    isActive ? 'bg-white' : 'bg-purple-50'
                  }`}
                >
                  {emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`font-bold truncate ${
                        isActive ? 'text-purple-900' : 'text-slate-900'
                      }`}
                    >
                      {classroom.name}
                    </h3>
                    {isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-white px-1.5 py-0.5 rounded-full border border-purple-200">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {classroomAgeLabel ? `${classroomAgeLabel} · ` : ''}
                    {classroom.studentCount} öğrenci
                  </p>
                  {isActive && activeClassroom && (
                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                      <span className="font-semibold text-purple-800 bg-white px-1.5 py-0.5 rounded border border-purple-200">
                        {filledCount}/{totalStudents} karne
                      </span>
                      {pendingCount > 0 && (
                        <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Toplam Öğrenci</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{totalStudents}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setFilterType(filterType === 'filled' ? 'all' : 'filled')}
          className={`p-4 rounded-2xl border text-left transition shadow-xs flex items-center justify-between ${
            filterType === 'filled'
              ? 'border-teal-700 bg-teal-50/70 ring-2 ring-teal-700'
              : 'border-slate-200/80 bg-white hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-teal-800">Karnesi Girilenler</p>
            <p className="text-2xl font-bold text-teal-950 mt-1 tracking-tight">{filledCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFilterType(filterType === 'pending' ? 'all' : 'pending')}
          className={`p-4 rounded-2xl border text-left transition shadow-xs flex items-center justify-between ${
            filterType === 'pending'
              ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-600'
              : 'border-slate-200/80 bg-white hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-amber-700">Karne Bekleyenler</p>
            <p className="text-2xl font-bold text-amber-900 mt-1 tracking-tight">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Bulk Operations Toolbar */}
      {selectedClassroomId && students.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between p-3.5 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <CheckCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900">Toplu Kayıt</h3>
                <p className="text-[11px] text-slate-500">
                  Aynı alanları seçili öğrencilere tek seferde uygula.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBulkOpen((v) => !v)}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 px-3 py-1.5 rounded-lg transition"
            >
              {bulkOpen ? 'Paneli Kapat' : 'Paneli Aç'}
            </button>
          </div>

          {bulkOpen && (
            <div className="border-t border-slate-100 p-4 space-y-4">
              {/* Mood */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Mod
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['HAPPY', 'CALM', 'ENERGETIC', 'TIRED', 'CRANKY', 'SAD'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setBulkDraft((p) => ({ ...p, mood: p.mood === m ? null : m }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                        bulkDraft.mood === m
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {MOOD_MAP[m].emoji} {MOOD_MAP[m].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meals */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Utensils className="w-3.5 h-3.5 text-orange-500" /> Yemek
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      ['breakfast', 'Kahvaltı'],
                      ['lunch', 'Öğle'],
                      ['afternoonSnack', 'İkindi'],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-slate-600">{label}</span>
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
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
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
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" /> Uyku
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="time"
                    value={bulkDraft.naps.startTime ?? ''}
                    onChange={(e) =>
                      setBulkDraft((p) => ({
                        ...p,
                        naps: { ...p.naps, startTime: e.target.value || undefined },
                      }))
                    }
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
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
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
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
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
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
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" /> Aktiviteler
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ACTIVITY_PRESETS.map((name) => {
                    const selected = bulkDraft.activities.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleBulkActivity(name)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                          selected
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetBulkDraft}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-800 inline-flex items-center gap-1 self-start"
                  disabled={!bulkHasContent || bulkSaving}
                >
                  <X className="w-3.5 h-3.5" /> Taslağı Temizle
                </button>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => void applyBulkToPending()}
                    disabled={bulkSaving || !bulkHasContent || pendingCount === 0}
                    className="px-3 py-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 hover:bg-amber-100 transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Bekleyen {pendingCount} Öğrenciye
                  </button>
                  <button
                    type="button"
                    onClick={() => void applyBulkToAll()}
                    disabled={bulkSaving || !bulkHasContent}
                    className="px-3 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
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
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Öğrenci adı ile filtrele..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tümü ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('filled')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              filterType === 'filled'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            Girilenler ({filledCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              filterType === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Bekleyenler ({pendingCount})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <div className="inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-500 text-sm font-medium">Öğrenci günlük raporları yükleniyor…</p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 text-sm font-semibold">
            {classrooms.length === 0
              ? 'Atanmış sınıf bulunamadı.'
              : 'Bu sınıfta öğrenci bulunamadı.'}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            {classrooms.length === 0
              ? 'Önce admin tarafından sınıf ve öğretmen ataması yapılmalı.'
              : 'Önce Öğrenciler sekmesinden öğrenci ekleyin.'}
          </p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
          <p className="text-slate-500 text-sm">Filtrelere uygun öğrenci bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((student) => {
            const report = reports[student.id];
            const moodInfo = report?.mood ? MOOD_MAP[report.mood] : null;

            return (
              <div
                key={student.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-all group"
              >
                <div>
                  {/* Student Title & Mood */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-teal-800 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                        {student.firstName.charAt(0)}
                        {student.lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-teal-800 transition-colors">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {student.dateOfBirth} · {student.gender ?? '—'}
                        </p>
                      </div>
                    </div>

                    {moodInfo ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${moodInfo.badgeClass}`}
                      >
                        <span>{moodInfo.emoji}</span>
                        <span>{moodInfo.label}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                        Mod girilmedi
                      </span>
                    )}
                  </div>

                  {/* Tracking Highlights */}
                  <div className="py-3.5 space-y-2.5 text-xs">
                    {/* Meals */}
                    <div className="flex items-center justify-between text-slate-600 bg-slate-50/70 px-3 py-2 rounded-xl border border-slate-100">
                      <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                        <span>🍽️</span> Yemek:
                      </span>
                      <span className="text-slate-900 font-medium">
                        {report?.meals?.breakfast ||
                        report?.meals?.lunch ||
                        report?.meals?.afternoonSnack ? (
                          <>
                            K: {MEAL_LABEL_MAP[report.meals.breakfast ?? ''] ?? '—'} · Ö:{' '}
                            {MEAL_LABEL_MAP[report.meals.lunch ?? ''] ?? '—'} · İ:{' '}
                            {MEAL_LABEL_MAP[report.meals.afternoonSnack ?? ''] ?? '—'}
                          </>
                        ) : (
                          <span className="text-slate-400 font-normal">Girilmedi</span>
                        )}
                      </span>
                    </div>

                    {/* Nap */}
                    <div className="flex items-center justify-between text-slate-600 bg-slate-50/70 px-3 py-2 rounded-xl border border-slate-100">
                      <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                        <span>😴</span> Uyku:
                      </span>
                      <span className="text-slate-900 font-medium">
                        {report?.naps?.startTime && report?.naps?.endTime ? (
                          `${report.naps.startTime} - ${report.naps.endTime}`
                        ) : report?.naps?.quality === 'NONE' ? (
                          'Uyumadı'
                        ) : (
                          <span className="text-slate-400 font-normal">Girilmedi</span>
                        )}
                      </span>
                    </div>

                    {/* Potty & Activities */}
                    <div className="flex items-center justify-between text-slate-600 bg-slate-50/70 px-3 py-2 rounded-xl border border-slate-100">
                      <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                        <span>🚻</span> Tuvalet / Bez:
                      </span>
                      <span className="text-slate-900 font-medium">
                        {report?.potty && report.potty.length > 0 ? (
                          `${report.potty.length} kayıt`
                        ) : (
                          <span className="text-slate-400 font-normal">Kayıt yok</span>
                        )}
                      </span>
                    </div>

                    {/* Teacher Note preview */}
                    {report?.teacherNote && (
                      <div className="mt-2 rounded-xl bg-amber-50/70 p-2.5 border border-amber-200/70 text-amber-950 text-xs italic">
                        "{report.teacherNote}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="border-t border-slate-100 pt-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setActiveStudent(student)}
                    className={`w-full rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs ${
                      report
                        ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
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
