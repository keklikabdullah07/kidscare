import type { ReactElement } from 'react';
import type { Attendance, Student } from '@kidscare/shared-types';

export interface AttendanceSheetPrintProps {
  classroomName: string;
  year: number;
  month: number; // 1-12 (1: Ocak, ..., 10: Ekim, etc.)
  students: Student[];
  attendances?: Attendance[] | undefined;
  tenantName?: string | undefined;
  teacherName?: string | undefined;
  directorName?: string | undefined;
}

const MONTH_NAMES = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

export function AttendanceSheetPrint({
  classroomName,
  year,
  month,
  students,
  attendances = [],
  tenantName = 'KidsCare Anaokulu & Gündüz Bakımevi',
  teacherName = 'Sınıf Öğretmeni',
  directorName = 'Okul Müdürü',
}: AttendanceSheetPrintProps): ReactElement {
  const monthName = MONTH_NAMES[month - 1] || `${month}. Ay`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Helper to determine if day is weekend (Cumartesi = 6, Pazar = 0)
  const isWeekend = (day: number) => {
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  // Helper to get status code for student on a given day
  const getStatusForStudent = (
    studentId: string,
    day: number,
  ): { char: string; cls: string; type: 'WEEKEND' | 'FUTURE' | 'EMPTY' | 'PRESENT' | 'EXCUSED' | 'ABSENT' } => {
    if (isWeekend(day)) {
      return { char: '—', cls: 'bg-stone-100 text-stone-400 font-normal', type: 'WEEKEND' };
    }

    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isFuture = dateStr > todayStr;

    const record = attendances.find((a) => {
      const aDate = a.date.slice(0, 10);
      return a.studentId === studentId && aDate === dateStr;
    });

    if (record) {
      if (record.status === 'EXCUSED') {
        return { char: 'İ', cls: 'bg-amber-100/80 text-amber-900 font-bold', type: 'EXCUSED' };
      }
      if (record.status === 'ABSENT') {
        return { char: 'Y', cls: 'bg-rose-100/80 text-rose-900 font-bold', type: 'ABSENT' };
      }
      return { char: 'G', cls: 'bg-emerald-50 text-emerald-800 font-bold', type: 'PRESENT' };
    }

    // No record found
    if (isFuture) {
      return { char: '·', cls: 'text-stone-300 font-normal', type: 'FUTURE' };
    }

    // Past/today business day without explicit record: default to present if checked or neutral
    return { char: 'G', cls: 'text-emerald-800 font-semibold', type: 'PRESENT' };
  };

  // Helper for student demographics
  const getGenderLabel = (gender: string | null | undefined): string => {
    if (!gender) return '—';
    const g = gender.toUpperCase();
    if (g === 'FEMALE' || g === 'K' || g === 'GIRL') return 'K';
    if (g === 'MALE' || g === 'E' || g === 'BOY') return 'E';
    return gender.slice(0, 1).toUpperCase();
  };

  const getBirthDetails = (dobStr: string | null | undefined) => {
    if (!dobStr) return '—';
    const bDate = new Date(dobStr);
    if (isNaN(bDate.getTime())) return '—';
    const bYear = bDate.getFullYear();
    const age = Math.max(0, year - bYear);
    return `${bYear} (${age}y)`;
  };

  const getStudentRefNo = (s: Student, idx: number) => {
    if (s.id) {
      const clean = s.id.replace(/[^a-zA-Z0-9]/g, '');
      return `K-${clean.slice(-4).toUpperCase()}`;
    }
    return `K-${String(idx + 1).padStart(4, '0')}`;
  };

  // Month Statistics
  let totalWorkDays = 0;
  daysArray.forEach((d) => {
    if (!isWeekend(d)) totalWorkDays++;
  });

  const femaleCount = students.filter((s) => {
    const g = (s.gender || '').toUpperCase();
    return g === 'FEMALE' || g === 'K' || g === 'GIRL';
  }).length;
  const maleCount = students.filter((s) => {
    const g = (s.gender || '').toUpperCase();
    return g === 'MALE' || g === 'E' || g === 'BOY';
  }).length;

  // Calculate overall class attendance rate dynamically
  let grandTotalPresent = 0;
  let grandTotalPotential = 0;

  students.forEach((student) => {
    daysArray.forEach((d) => {
      if (!isWeekend(d)) {
        const s = getStatusForStudent(student.id, d);
        if (s.type === 'PRESENT') {
          grandTotalPresent++;
          grandTotalPotential++;
        } else if (s.type === 'ABSENT' || s.type === 'EXCUSED') {
          grandTotalPotential++;
        }
      }
    });
  });

  const dynamicClassAverage =
    grandTotalPotential > 0 ? Math.round((grandTotalPresent / grandTotalPotential) * 100) : 100;

  return (
    <div className="bg-white text-slate-900 font-sans p-3 text-[10px] leading-tight select-none print:p-0">
      {/* Official MEB Header */}
      <div className="border-b-2 border-stone-800 pb-2 mb-2">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-[9px] font-bold tracking-wider uppercase text-stone-600">
              T.C. MİLLÎ EĞİTİM BAKANLIĞI RESMÎ TEFTİŞ & ARŞİV FORMATI
            </p>
            <h1 className="text-sm font-extrabold text-stone-900 uppercase tracking-tight">
              {tenantName}
            </h1>
            <p className="text-xs font-bold text-teal-900">
              {classroomName} — {monthName} {year} Aylık Öğrenci Devam-Devamsızlık Çizelgesi
            </p>
          </div>
          <div className="text-right text-[9px] text-stone-600 leading-normal">
            <p className="font-bold text-stone-900">
              Mevzuat: MEB Okul Öncesi Eğitim Kurumları Yönetmeliği
            </p>
            <p>
              Sınıf Mevcudu: <strong className="text-stone-900">{students.length}</strong> (K: {femaleCount}, E: {maleCount})
            </p>
            <p>
              Resmî İş Günü: <strong className="text-stone-900">{totalWorkDays}</strong> Gün • Dönem: {year} / {monthName}
            </p>
          </div>
        </div>
      </div>

      {/* Days Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-stone-500 text-center text-[9px]">
          <thead>
            <tr className="bg-stone-200 text-stone-800 font-bold">
              <th className="border border-stone-400 px-1 py-1 w-5">Sıra</th>
              <th className="border border-stone-400 px-1 py-1 w-12 text-stone-700">Kütük No</th>
              <th className="border border-stone-400 px-2 py-1 text-left min-w-[130px]">
                Öğrenci Adı Soyadı
              </th>
              <th className="border border-stone-400 px-1 py-1 w-6 text-stone-700" title="Cinsiyet (K/E)">
                Cns
              </th>
              <th className="border border-stone-400 px-1 py-1 w-14 text-stone-700" title="Doğum Yılı ve Yaş">
                D.Yılı (Yaş)
              </th>
              {daysArray.map((day) => {
                const weekend = isWeekend(day);
                return (
                  <th
                    key={day}
                    className={`border border-stone-400 px-0.5 py-1 w-4 text-[8.5px] ${
                      weekend ? 'bg-stone-300 text-stone-700 font-normal' : ''
                    }`}
                  >
                    {day}
                  </th>
                );
              })}
              <th
                className="border border-stone-400 px-1 py-1 w-6 bg-emerald-100 text-emerald-900"
                title="Toplam Geldiği Gün"
              >
                G
              </th>
              <th
                className="border border-stone-400 px-1 py-1 w-6 bg-amber-100 text-amber-900"
                title="İzinli / Raporlu Gün"
              >
                İ
              </th>
              <th
                className="border border-stone-400 px-1 py-1 w-6 bg-rose-100 text-rose-900"
                title="Devamsız (Yok) Gün"
              >
                Y
              </th>
              <th
                className="border border-stone-400 px-1 py-1 w-8 bg-teal-100 text-teal-900"
                title="Bireysel Devam Yüzdesi"
              >
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={daysInMonth + 9} className="border border-stone-300 py-6 text-center text-stone-400 italic">
                  Bu sınıfta kayıtlı aktif öğrenci bulunmamaktadır.
                </td>
              </tr>
            ) : (
              students.map((student, idx) => {
                let presentCount = 0;
                let excusedCount = 0;
                let absentCount = 0;
                let studentPotential = 0;

                daysArray.forEach((d) => {
                  if (!isWeekend(d)) {
                    const s = getStatusForStudent(student.id, d);
                    if (s.type === 'PRESENT') {
                      presentCount++;
                      studentPotential++;
                    } else if (s.type === 'EXCUSED') {
                      excusedCount++;
                      studentPotential++;
                    } else if (s.type === 'ABSENT') {
                      absentCount++;
                      studentPotential++;
                    }
                  }
                });

                const rate =
                  studentPotential > 0 ? Math.round((presentCount / studentPotential) * 100) : 100;

                return (
                  <tr key={student.id} className="hover:bg-stone-50 text-[9px]">
                    <td className="border border-stone-300 font-semibold">{idx + 1}</td>
                    <td className="border border-stone-300 font-mono text-[8px] text-stone-600">
                      {getStudentRefNo(student, idx)}
                    </td>
                    <td className="border border-stone-300 text-left px-1.5 py-0.5 font-bold truncate">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="border border-stone-300 font-semibold text-stone-700">
                      {getGenderLabel(student.gender)}
                    </td>
                    <td className="border border-stone-300 text-stone-600 text-[8.5px]">
                      {getBirthDetails(student.dateOfBirth)}
                    </td>
                    {daysArray.map((day) => {
                      const status = getStatusForStudent(student.id, day);
                      return (
                        <td
                          key={day}
                          className={`border border-stone-300 p-0 text-[8px] ${status.cls}`}
                        >
                          {status.char}
                        </td>
                      );
                    })}
                    <td className="border border-stone-300 font-bold text-emerald-800">
                      {presentCount}
                    </td>
                    <td className="border border-stone-300 font-bold text-amber-800">
                      {excusedCount}
                    </td>
                    <td className="border border-stone-300 font-bold text-rose-800">{absentCount}</td>
                    <td className="border border-stone-300 font-bold text-teal-900">%{rate}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Legend & Summary Info */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-[9px] text-stone-600 border border-stone-200 rounded p-1.5 bg-stone-50">
        <div className="flex items-center gap-3">
          <span className="font-bold text-stone-800">Kısaltmalar:</span>
          <span className="flex items-center gap-1 font-semibold text-emerald-800">
            <span className="border border-emerald-300 bg-emerald-50 px-1 rounded">G</span> Geldi
          </span>
          <span className="flex items-center gap-1 font-semibold text-amber-800">
            <span className="border border-amber-300 bg-amber-50 px-1 rounded">İ</span> İzinli / Raporlu
          </span>
          <span className="flex items-center gap-1 font-semibold text-rose-800">
            <span className="border border-rose-300 bg-rose-50 px-1 rounded">Y</span> Devamsız (Yok)
          </span>
          <span className="flex items-center gap-1 text-stone-500">
            <span className="border border-stone-300 bg-stone-200 px-1 rounded">—</span> Hafta Sonu / Tatil
          </span>
          <span className="flex items-center gap-1 text-stone-400">
            <span className="border border-stone-200 bg-white px-1 rounded">·</span> Gelecek Gün
          </span>
        </div>
        <div className="text-right">
          <span>
            Toplam Öğrenci: <strong className="text-stone-900">{students.length}</strong> (Kız: {femaleCount}, Erkek: {maleCount}) | Resmî Devam Ortalaması:{' '}
            <strong className="text-teal-900 text-[10px]">%{dynamicClassAverage}</strong>
          </span>
        </div>
      </div>

      {/* Official Signatures */}
      <div className="mt-4 pt-3 border-t border-stone-300 grid grid-cols-2 gap-12 text-center text-[10px] avoid-break">
        <div>
          <p className="font-semibold text-stone-500 mb-6">Sınıf Öğretmeni</p>
          <p className="font-bold text-stone-900 uppercase">{teacherName}</p>
          <p className="text-[9px] text-stone-400">İmza</p>
        </div>
        <div>
          <p className="font-semibold text-stone-500 mb-6">Kurum Müdürü / Tasdik Eden</p>
          <p className="font-bold text-stone-900 uppercase">{directorName}</p>
          <p className="text-[9px] text-stone-400">İmza & Mühür</p>
        </div>
      </div>
    </div>
  );
}
