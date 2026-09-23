import { useEffect, useState, useMemo, type JSX } from 'react';
import type { Attendance, AttendanceStatus, Student } from '@kidscare/shared-types';
import {
  CheckCheck,
  Search,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import { checkInStudent, getAttendanceByDate, updateStudentAttendance } from '../../api/attendance';
import { listStudents } from '../../api/students';
import { CheckOutModal } from './CheckOutModal';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ui/PromptModal';

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; emoji: string; badgeClass: string; lightBg: string; textClass: string }
> = {
  PRESENT: {
    label: 'Giriş Yaptı (Mevcut)',
    emoji: '🟢',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    lightBg: 'bg-emerald-50/70 border-emerald-200/80',
    textClass: 'text-emerald-700',
  },
  LEFT: {
    label: 'Teslim Edildi (Ayrıldı)',
    emoji: '🔵',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    lightBg: 'bg-blue-50/70 border-blue-200/80',
    textClass: 'text-blue-700',
  },
  EXCUSED: {
    label: 'İzinli / Raporlu',
    emoji: '🟡',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    lightBg: 'bg-amber-50/70 border-amber-200/80',
    textClass: 'text-amber-700',
  },
  ABSENT: {
    label: 'Gelmedi',
    emoji: '⚪',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    lightBg: 'bg-slate-50 border-slate-200',
    textClass: 'text-slate-600',
  },
};

type ViewMode = 'table' | 'grid';
type StatusFilter = 'all' | AttendanceStatus;

export function AttendancePage(): JSX.Element {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Attendance>>({});
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [checkoutStudent, setCheckoutStudent] = useState<Student | null>(null);

  const { showToast } = useToast();

  function loadData(): void {
    setLoading(true);
    setError(null);

    Promise.all([listStudents(), getAttendanceByDate(selectedDate)])
      .then(([studentsList, attList]) => {
        setStudents(studentsList);
        const map: Record<string, Attendance> = {};
        for (const a of attList) {
          map[a.studentId] = a;
        }
        setAttendanceMap(map);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Yoklama verileri yüklenemedi');
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

  async function handleQuickCheckIn(student: Student): Promise<void> {
    try {
      const saved = await checkInStudent(student.id, selectedDate);
      setAttendanceMap((prev) => ({ ...prev, [student.id]: saved }));
      showToast(
        `${student.firstName} ${student.lastName} giriş yaptı olarak işaretlendi.`,
        'success',
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Giriş yapılamadı';
      setError(msg);
      showToast(msg, 'error');
    }
  }

  async function handleSetStatus(student: Student, status: AttendanceStatus): Promise<void> {
    try {
      const saved = await updateStudentAttendance(student.id, selectedDate, {
        status,
        ...(status === 'ABSENT' || status === 'EXCUSED'
          ? { checkInTime: null, checkOutTime: null }
          : {}),
      });
      setAttendanceMap((prev) => ({ ...prev, [student.id]: saved }));
      showToast(`${student.firstName} durumu: ${STATUS_CONFIG[status].label}`, 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Durum güncellenemedi';
      setError(msg);
      showToast(msg, 'error');
    }
  }

  const [showBulkPresentConfirm, setShowBulkPresentConfirm] = useState(false);

  // Bulk Check-in (Mark All Present)
  function handleMarkAllPresent(): void {
    const absentCount = students.filter((s) => {
      const att = attendanceMap[s.id];
      const st = att?.status ?? 'ABSENT';
      return st === 'ABSENT';
    }).length;

    if (absentCount === 0) {
      showToast('Sınıftaki tüm öğrenciler zaten mevcut veya işlem görmüş.', 'info');
      return;
    }

    setShowBulkPresentConfirm(true);
  }

  async function executeBulkMarkPresent(): Promise<void> {
    setShowBulkPresentConfirm(false);
    const absentStudents = students.filter((s) => {
      const att = attendanceMap[s.id];
      const st = att?.status ?? 'ABSENT';
      return st === 'ABSENT';
    });

    setBulkLoading(true);
    try {
      const results = await Promise.all(
        absentStudents.map((s) => checkInStudent(s.id, selectedDate)),
      );

      setAttendanceMap((prev) => {
        const next = { ...prev };
        for (const res of results) {
          next[res.studentId] = res;
        }
        return next;
      });

      showToast(`Harika! ${results.length} öğrenci tek tıkla sınıfa alındı. 🎉`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Toplu yoklama alınamadı';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setBulkLoading(false);
    }
  }

  // Statistics
  const totalStudents = students.length;
  let presentCount = 0;
  let leftCount = 0;
  let excusedCount = 0;
  let absentCount = 0;

  for (const s of students) {
    const att = attendanceMap[s.id];
    const st = att?.status ?? 'ABSENT';
    if (st === 'PRESENT') presentCount++;
    else if (st === 'LEFT') leftCount++;
    else if (st === 'EXCUSED') excusedCount++;
    else absentCount++;
  }

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        const contactMatch = s.passport?.emergencyContacts?.some((c) =>
          c.name.toLowerCase().includes(q),
        );
        if (!fullName.includes(q) && !contactMatch) return false;
      }

      if (statusFilter !== 'all') {
        const att = attendanceMap[s.id];
        const st = att?.status ?? 'ABSENT';
        if (st !== statusFilter) return false;
      }

      return true;
    });
  }, [students, attendanceMap, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Date Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Giriş-Çıkış, Güvenlik & Yoklama
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Öğrenci yoklama durumlarını kaydedin, pasaport yetkilisi doğrulamasıyla güvenli
                teslimatı sağlayın.
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector & Fast Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Picker Control */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
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

          {/* Quick Action: Mark All Present */}
          <button
            type="button"
            disabled={bulkLoading || absentCount === 0}
            onClick={() => void handleMarkAllPresent()}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sınıftaki henüz gelmedi durumundaki tüm öğrencileri tek tıkla sınıfa al"
          >
            <CheckCheck className="w-4 h-4" />
            <span>{bulkLoading ? 'İşleniyor…' : 'Tüm Sınıfı Geldi İşaretle'}</span>
          </button>
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

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`rounded-2xl border text-left p-4 transition-all shadow-xs ${
            statusFilter === 'all'
              ? 'border-slate-800 bg-slate-900 text-white ring-2 ring-slate-800'
              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-900'
          }`}
        >
          <p
            className={`text-xs font-medium ${statusFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}
          >
            Toplam Öğrenci
          </p>
          <p className="text-2xl font-bold mt-1 tracking-tight">{totalStudents}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('PRESENT')}
          className={`rounded-2xl border text-left p-4 transition-all shadow-xs ${
            statusFilter === 'PRESENT'
              ? 'border-emerald-600 bg-emerald-700 text-white ring-2 ring-emerald-600'
              : 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900'
          }`}
        >
          <p
            className={`text-xs font-semibold ${statusFilter === 'PRESENT' ? 'text-emerald-100' : 'text-emerald-700'}`}
          >
            🟢 Mevcut (İçeride)
          </p>
          <p className="text-2xl font-bold mt-1 tracking-tight">{presentCount}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('LEFT')}
          className={`rounded-2xl border text-left p-4 transition-all shadow-xs ${
            statusFilter === 'LEFT'
              ? 'border-blue-600 bg-blue-700 text-white ring-2 ring-blue-600'
              : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-900'
          }`}
        >
          <p
            className={`text-xs font-semibold ${statusFilter === 'LEFT' ? 'text-blue-100' : 'text-blue-700'}`}
          >
            🔵 Teslim Edildi
          </p>
          <p className="text-2xl font-bold mt-1 tracking-tight">{leftCount}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('EXCUSED')}
          className={`rounded-2xl border text-left p-4 transition-all shadow-xs ${
            statusFilter === 'EXCUSED'
              ? 'border-amber-600 bg-amber-700 text-white ring-2 ring-amber-600'
              : 'border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-900'
          }`}
        >
          <p
            className={`text-xs font-semibold ${statusFilter === 'EXCUSED' ? 'text-amber-100' : 'text-amber-700'}`}
          >
            🟡 İzinli / Raporlu
          </p>
          <p className="text-2xl font-bold mt-1 tracking-tight">{excusedCount}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('ABSENT')}
          className={`rounded-2xl border text-left p-4 transition-all shadow-xs ${
            statusFilter === 'ABSENT'
              ? 'border-slate-600 bg-slate-700 text-white ring-2 ring-slate-600'
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
          }`}
        >
          <p
            className={`text-xs font-semibold ${statusFilter === 'ABSENT' ? 'text-slate-200' : 'text-slate-600'}`}
          >
            ⚪ Gelmedi
          </p>
          <p className="text-2xl font-bold mt-1 tracking-tight">{absentCount}</p>
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
            placeholder="Öğrenci veya veli adı ara..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-slate-500 font-medium">
            Gösterilen: <strong className="text-slate-800">{filteredStudents.length}</strong> /{' '}
            {students.length}
          </span>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/60">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'table'
                  ? 'bg-white shadow-xs text-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tablo Görünümü"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'grid'
                  ? 'bg-white shadow-xs text-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Kart Görünümü"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Student Attendance List */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <div className="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-500 text-sm font-medium">Yoklama listesi yükleniyor…</p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Kayıtlı öğrenci bulunamadı.</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
          <p className="text-slate-500 text-sm">Filtrelere uygun öğrenci bulunamadı.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600">
                  <th className="py-3.5 px-4">Öğrenci</th>
                  <th className="py-3.5 px-4">Durum</th>
                  <th className="py-3.5 px-4">Giriş Saati</th>
                  <th className="py-3.5 px-4">Çıkış / Teslim Alan</th>
                  <th className="py-3.5 px-4 text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((student) => {
                  const att = attendanceMap[student.id];
                  const status = att?.status ?? 'ABSENT';
                  const statusInfo = STATUS_CONFIG[status];

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {student.firstName.charAt(0)}
                            {student.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-slate-400 text-[11px]">
                                {student.dateOfBirth}
                              </span>
                              {student.passport?.bloodType &&
                                student.passport.bloodType !== 'UNKNOWN' && (
                                  <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-rose-200">
                                    🩸 {student.passport.bloodType}
                                  </span>
                                )}
                              {student.passport?.allergies &&
                                student.passport.allergies.length > 0 && (
                                  <span className="bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                    ⚠️ {student.passport.allergies.length} Alerji
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold border text-xs ${statusInfo.badgeClass}`}
                        >
                          <span>{statusInfo.emoji}</span>
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* Check In Info */}
                      <td className="py-3.5 px-4">
                        {att?.checkInTime ? (
                          <div>
                            <span className="font-bold text-slate-900">{att.checkInTime}</span>
                            {att.checkInBy && (
                              <span className="text-slate-500 block text-[11px]">
                                Getiren: {att.checkInBy}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Check Out / Pickup Info */}
                      <td className="py-3.5 px-4">
                        {att?.checkOutTime ? (
                          <div>
                            <div className="font-bold text-slate-900">
                              {att.checkOutTime} ·{' '}
                              <span className="text-blue-700">{att.checkOutBy}</span>
                            </div>
                            {att.pickupNote && (
                              <span className="text-amber-700 italic block text-[11px]">
                                Not: {att.pickupNote}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {status !== 'PRESENT' && status !== 'LEFT' && (
                            <button
                              type="button"
                              onClick={() => void handleQuickCheckIn(student)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1 transition"
                            >
                              <span>🟢</span> Giriş Yap
                            </button>
                          )}

                          {status === 'PRESENT' && (
                            <button
                              type="button"
                              onClick={() => setCheckoutStudent(student)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1 transition"
                            >
                              <span>🛡️</span> Teslim Et
                            </button>
                          )}

                          {status === 'LEFT' && (
                            <button
                              type="button"
                              onClick={() => setCheckoutStudent(student)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-medium text-xs transition"
                            >
                              Düzenle
                            </button>
                          )}

                          {/* Status Switch buttons */}
                          {status !== 'EXCUSED' && (
                            <button
                              type="button"
                              onClick={() => void handleSetStatus(student, 'EXCUSED')}
                              className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1.5 rounded-lg font-medium text-xs transition"
                              title="İzinli Olarak İşaretle"
                            >
                              İzinli
                            </button>
                          )}

                          {status !== 'ABSENT' && (
                            <button
                              type="button"
                              onClick={() => void handleSetStatus(student, 'ABSENT')}
                              className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1.5 rounded-lg font-medium text-xs transition"
                              title="Gelmedi Olarak İşaretle"
                            >
                              Gelmedi
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Mode (Touch & Tablet Optimized) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const att = attendanceMap[student.id];
            const status = att?.status ?? 'ABSENT';
            const statusInfo = STATUS_CONFIG[status];

            return (
              <div
                key={student.id}
                className={`p-4 rounded-2xl border transition shadow-xs flex flex-col justify-between ${statusInfo.lightBg}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white text-slate-800 font-bold text-sm flex items-center justify-center shadow-xs border border-slate-100">
                        {student.firstName.charAt(0)}
                        {student.lastName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {student.firstName} {student.lastName}
                        </h4>
                        <p className="text-[11px] text-slate-500">{student.dateOfBirth}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.badgeClass}`}
                    >
                      {statusInfo.emoji} {statusInfo.label}
                    </span>
                  </div>

                  {/* Timing & pickup note */}
                  <div className="mt-3 text-xs space-y-1 bg-white/70 p-2.5 rounded-xl border border-slate-200/50">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Giriş:</span>
                      <strong className="text-slate-900">{att?.checkInTime || '—'}</strong>
                    </div>
                    {att?.checkOutTime && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Çıkış:</span>
                        <strong className="text-blue-700">
                          {att.checkOutTime} ({att.checkOutBy})
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grid Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  {status !== 'PRESENT' && status !== 'LEFT' && (
                    <button
                      type="button"
                      onClick={() => void handleQuickCheckIn(student)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1 transition"
                    >
                      <span>🟢</span> Giriş Yap
                    </button>
                  )}

                  {status === 'PRESENT' && (
                    <button
                      type="button"
                      onClick={() => setCheckoutStudent(student)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1 transition"
                    >
                      <span>🛡️</span> Teslim Et
                    </button>
                  )}

                  {status === 'LEFT' && (
                    <button
                      type="button"
                      onClick={() => setCheckoutStudent(student)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-xl text-xs font-medium transition"
                    >
                      Düzenle
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleSetStatus(student, 'EXCUSED')}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium transition"
                    title="İzinli"
                  >
                    İzinli
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleSetStatus(student, 'ABSENT')}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium transition"
                    title="Gelmedi"
                  >
                    Gelmedi
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CheckOut Modal */}
      <CheckOutModal
        student={checkoutStudent}
        date={selectedDate}
        onClose={() => setCheckoutStudent(null)}
        onSaved={(updated) => {
          setAttendanceMap((prev) => ({ ...prev, [updated.studentId]: updated }));
          showToast('Güvenli teslimat başarıyla kaydedildi.', 'success');
        }}
      />

      {showBulkPresentConfirm && (
        <ConfirmModal
          isOpen={true}
          title="Toplu Sınıf Girişi"
          description="Sınıftaki tüm gelmemiş öğrencilerin durumu 'Giriş Yaptı (Mevcut)' olarak güncellenecek. Onaylıyor musunuz?"
          confirmText="Evet, Tümünü Mevcut Yap"
          cancelText="Vazgeç"
          variant="success"
          onConfirm={() => void executeBulkMarkPresent()}
          onCancel={() => setShowBulkPresentConfirm(false)}
        />
      )}
    </div>
  );
}
