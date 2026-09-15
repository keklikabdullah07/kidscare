import { useEffect, useState } from 'react';
import type { DailyReport, Student, StudentMood } from '@kidscare/shared-types';
import { getDailyReportsByDate } from '../../api/daily-reports';
import { listStudents } from '../../api/students';
import { DailyReportEditorModal } from './DailyReportEditorModal';

const MOOD_MAP: Record<StudentMood, { label: string; emoji: string; badgeClass: string }> = {
  HAPPY: {
    label: 'Mutlu',
    emoji: '😄',
    badgeClass: 'bg-green-100 text-green-800 border-green-200',
  },
  CALM: { label: 'Sakin', emoji: '😌', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  ENERGETIC: {
    label: 'Enerjik',
    emoji: '⚡',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  TIRED: {
    label: 'Yorgun',
    emoji: '🥱',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  CRANKY: {
    label: 'Huysuz',
    emoji: '😣',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  SAD: { label: 'Üzgün', emoji: '😢', badgeClass: 'bg-red-100 text-red-800 border-red-200' },
};

const MEAL_LABEL_MAP: Record<string, string> = {
  ALL: 'Tam',
  HALF: 'Yarım',
  LITTLE: 'Az',
  NONE: 'Yemedi',
};

export function DailyTrackingPage(): React.ReactElement {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<Record<string, DailyReport>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Page Header & Date Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>🌟</span> Günlük Yaşam & Aktivite Takibi
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Öğrencilerin beslenme, uyku, tuvalet, ruh hali ve günlük öğretmen notlarını yönetin.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 p-1.5 rounded-lg shadow-2xs">
          <button
            type="button"
            onClick={() => changeDay(-1)}
            className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
            title="Önceki Gün"
          >
            ◀
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-semibold text-gray-800 bg-transparent px-2 py-1 outline-hidden"
          />
          <button
            type="button"
            onClick={() => changeDay(1)}
            className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
            title="Sonraki Gün"
          >
            ▶
          </button>
          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md ml-1"
            >
              Bugün
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-sm text-gray-500">
          Öğrenci günlük raporları yükleniyor…
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-500">
          Kayıtlı öğrenci bulunamadı. Önce Öğrenciler sekmesinden öğrenci ekleyin.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => {
            const report = reports[student.id];
            const moodInfo = report?.mood ? MOOD_MAP[report.mood] : null;

            return (
              <div
                key={student.id}
                className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Student Title & Mood */}
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {student.dateOfBirth} · {student.gender ?? '—'}
                      </p>
                    </div>

                    {moodInfo ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${moodInfo.badgeClass}`}
                      >
                        <span>{moodInfo.emoji}</span>
                        <span>{moodInfo.label}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
                        Mod girilmedi
                      </span>
                    )}
                  </div>

                  {/* Tracking Highlights */}
                  <div className="py-3 space-y-2 text-xs">
                    {/* Meals */}
                    <div className="flex items-center justify-between text-gray-600 bg-gray-50/60 px-2.5 py-1.5 rounded-md">
                      <span className="font-medium flex items-center gap-1.5">
                        <span>🍽️</span> Yemek:
                      </span>
                      <span className="text-gray-800 font-semibold">
                        {report?.meals?.breakfast ||
                        report?.meals?.lunch ||
                        report?.meals?.afternoonSnack ? (
                          <>
                            K: {MEAL_LABEL_MAP[report.meals.breakfast ?? ''] ?? '—'} · Ö:{' '}
                            {MEAL_LABEL_MAP[report.meals.lunch ?? ''] ?? '—'} · İ:{' '}
                            {MEAL_LABEL_MAP[report.meals.afternoonSnack ?? ''] ?? '—'}
                          </>
                        ) : (
                          <span className="text-gray-400 font-normal">Girilmedi</span>
                        )}
                      </span>
                    </div>

                    {/* Nap */}
                    <div className="flex items-center justify-between text-gray-600 bg-gray-50/60 px-2.5 py-1.5 rounded-md">
                      <span className="font-medium flex items-center gap-1.5">
                        <span>😴</span> Uyku:
                      </span>
                      <span className="text-gray-800 font-semibold">
                        {report?.naps?.startTime && report?.naps?.endTime ? (
                          `${report.naps.startTime} - ${report.naps.endTime}`
                        ) : report?.naps?.quality === 'NONE' ? (
                          'Uyumadı'
                        ) : (
                          <span className="text-gray-400 font-normal">Girilmedi</span>
                        )}
                      </span>
                    </div>

                    {/* Potty & Activities */}
                    <div className="flex items-center justify-between text-gray-600 bg-gray-50/60 px-2.5 py-1.5 rounded-md">
                      <span className="font-medium flex items-center gap-1.5">
                        <span>🚻</span> Tuvalet / Bez:
                      </span>
                      <span className="text-gray-800 font-semibold">
                        {report?.potty && report.potty.length > 0 ? (
                          `${report.potty.length} kayıt`
                        ) : (
                          <span className="text-gray-400 font-normal">Kayıt yok</span>
                        )}
                      </span>
                    </div>

                    {/* Teacher Note preview */}
                    {report?.teacherNote && (
                      <div className="mt-2 rounded-md bg-amber-50/60 p-2 border border-amber-100 text-amber-900 line-clamp-2 italic">
                        "{report.teacherNote}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="border-t border-gray-100 pt-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setActiveStudent(student)}
                    className="w-full rounded-lg bg-blue-50 border border-blue-200 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>✏️</span> {report ? 'Raporu Düzenle' : 'Günlük Rapor Gir'}
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
        }}
      />
    </div>
  );
}
