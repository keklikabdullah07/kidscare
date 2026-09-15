import { useEffect, useState } from 'react';
import type { Attendance, AttendanceStatus, Student } from '@kidscare/shared-types';
import { checkInStudent, getAttendanceByDate, updateStudentAttendance } from '../../api/attendance';
import { listStudents } from '../../api/students';
import { CheckOutModal } from './CheckOutModal';

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; emoji: string; badgeClass: string }
> = {
  PRESENT: {
    label: 'Giriş Yaptı (Mevcut)',
    emoji: '🟢',
    badgeClass: 'bg-green-100 text-green-800 border-green-200',
  },
  LEFT: {
    label: 'Teslim Edildi (Ayrıldı)',
    emoji: '🔵',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  EXCUSED: {
    label: 'İzinli / Raporlu',
    emoji: '🟡',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  ABSENT: {
    label: 'Gelmedi',
    emoji: '⚪',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

export function AttendancePage(): React.ReactElement {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Attendance>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [checkoutStudent, setCheckoutStudent] = useState<Student | null>(null);

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Giriş yapılamadı');
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Durum güncellenemedi');
    }
  }

  // Calculate statistics
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

  return (
    <div className="space-y-6">
      {/* Header & Date Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>🛡️</span> Giriş-Çıkış, Güvenlik & Yoklama
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Öğrenci yoklama durumlarını kaydedin, pasaport yetkilisi doğrulamasıyla güvenli
            teslimatı sağlayın.
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs">
          <p className="text-xs font-medium text-gray-500">Toplam Öğrenci</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalStudents}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50/50 p-3.5 shadow-2xs">
          <p className="text-xs font-semibold text-green-700">🟢 Mevcut (İçeride)</p>
          <p className="text-xl font-bold text-green-900 mt-1">{presentCount}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 shadow-2xs">
          <p className="text-xs font-semibold text-blue-700">🔵 Teslim Edildi</p>
          <p className="text-xl font-bold text-blue-900 mt-1">{leftCount}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 shadow-2xs">
          <p className="text-xs font-semibold text-amber-700">🟡 İzinli / Raporlu</p>
          <p className="text-xl font-bold text-amber-900 mt-1">{excusedCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 shadow-2xs">
          <p className="text-xs font-semibold text-gray-600">⚪ Gelmedi</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{absentCount}</p>
        </div>
      </div>

      {/* Student Attendance List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-gray-500">Yoklama listesi yükleniyor…</div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-500">Kayıtlı öğrenci bulunamadı.</div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600">
                <th className="py-3 px-4">Öğrenci</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4">Giriş Saati</th>
                <th className="py-3 px-4">Çıkış / Teslim Alan</th>
                <th className="py-3 px-4 text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {students.map((student) => {
                const att = attendanceMap[student.id];
                const status = att?.status ?? 'ABSENT';
                const statusInfo = STATUS_CONFIG[status];

                return (
                  <tr key={student.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900 text-sm">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-gray-500">{student.dateOfBirth}</span>
                        {student.passport?.bloodType &&
                          student.passport.bloodType !== 'UNKNOWN' && (
                            <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              🩸 {student.passport.bloodType}
                            </span>
                          )}
                        {student.passport?.allergies && student.passport.allergies.length > 0 && (
                          <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                            ⚠️ {student.passport.allergies.length} Alerji
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold border ${statusInfo.badgeClass}`}
                      >
                        <span>{statusInfo.emoji}</span>
                        <span>{statusInfo.label}</span>
                      </span>
                    </td>

                    {/* Check In Info */}
                    <td className="py-3 px-4">
                      {att?.checkInTime ? (
                        <div>
                          <span className="font-bold text-gray-900">{att.checkInTime}</span>
                          {att.checkInBy && (
                            <span className="text-gray-500 block text-[11px]">
                              Getiren: {att.checkInBy}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Check Out / Pickup Info */}
                    <td className="py-3 px-4">
                      {att?.checkOutTime ? (
                        <div>
                          <div className="font-bold text-gray-900">
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
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {status !== 'PRESENT' && status !== 'LEFT' && (
                          <button
                            type="button"
                            onClick={() => void handleQuickCheckIn(student)}
                            className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-md font-semibold text-xs shadow-2xs flex items-center gap-1"
                          >
                            <span>🟢</span> Giriş Yap
                          </button>
                        )}

                        {status === 'PRESENT' && (
                          <button
                            type="button"
                            onClick={() => setCheckoutStudent(student)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-semibold text-xs shadow-2xs flex items-center gap-1"
                          >
                            <span>🛡️</span> Teslim Et
                          </button>
                        )}

                        {status === 'LEFT' && (
                          <button
                            type="button"
                            onClick={() => setCheckoutStudent(student)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded-md font-medium text-xs"
                          >
                            Düzenle
                          </button>
                        )}

                        {/* Status Switch dropdown / buttons */}
                        {status !== 'EXCUSED' && (
                          <button
                            type="button"
                            onClick={() => void handleSetStatus(student, 'EXCUSED')}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1.5 rounded-md font-medium text-xs"
                            title="İzinli Olarak İşaretle"
                          >
                            İzinli
                          </button>
                        )}

                        {status !== 'ABSENT' && (
                          <button
                            type="button"
                            onClick={() => void handleSetStatus(student, 'ABSENT')}
                            className="bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 px-2 py-1.5 rounded-md font-medium text-xs"
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
      )}

      {/* CheckOut Modal */}
      <CheckOutModal
        student={checkoutStudent}
        date={selectedDate}
        onClose={() => setCheckoutStudent(null)}
        onSaved={(updated) => {
          setAttendanceMap((prev) => ({ ...prev, [updated.studentId]: updated }));
        }}
      />
    </div>
  );
}
