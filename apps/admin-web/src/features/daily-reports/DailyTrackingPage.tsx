import { useEffect, useState, useMemo, type JSX } from 'react';
import type { DailyReport, Student, StudentMood } from '@kidscare/shared-types';
import {
  Sparkles,
  Search,
  Users,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Edit3,
} from 'lucide-react';
import { getDailyReportsByDate } from '../../api/daily-reports';
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

export function DailyTrackingPage(): JSX.Element {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<Record<string, DailyReport>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ReportFilter>('all');
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  const { showToast } = useToast();

  function loadData(): void {
    setLoading(true);
    setError(null);

    Promise.all([listStudents(), getDailyReportsByDate(selectedDate)])
      .then(([studentsList, reportsList]) => {
        setStudents(studentsList);
        const map: Record<string, DailyReport> = {};
        for (const r of reportsList) {
          map[r.studentId] = r;
        }
        setReports(map);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Veriler yüklenemedi');
        setLoading(false);
      });
  }

  useEffect(loadData, [selectedDate]);

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
              ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600'
              : 'border-slate-200/80 bg-white hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-purple-700">Karnesi Girilenler</p>
            <p className="text-2xl font-bold text-purple-900 mt-1 tracking-tight">{filledCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
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
          <p className="text-slate-600 text-sm font-semibold">Kayıtlı öğrenci bulunamadı.</p>
          <p className="text-slate-400 text-xs mt-1">
            Önce Öğrenciler sekmesinden öğrenci ekleyin.
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
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                        {student.firstName.charAt(0)}
                        {student.lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-purple-600 transition-colors">
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
