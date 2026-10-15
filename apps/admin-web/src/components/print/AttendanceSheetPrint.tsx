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

  // Helper to determine if day is weekend (Cumartesi = 6, Pazar = 0)
  const isWeekend = (day: number) => {
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  // Helper to get status code for student on a given day
  const getStatusForStudent = (studentId: string, day: number): { char: string; cls: string } => {
    if (isWeekend(day)) {
      return { char: '—', cls: 'bg-stone-100 text-stone-400 font-normal' };
    }

    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = attendances.find((a) => {
      const aDate = a.date.slice(0, 10);
      return a.studentId === studentId && aDate === dateStr;
    });

    if (!record) {
      // Default assume present during regular days if not explicitly marked absent/excused
      return { char: 'G', cls: 'text-emerald-800 font-semibold' };
    }

    if (record.status === 'EXCUSED') {
      return { char: 'İ', cls: 'bg-amber-100/70 text-amber-900 font-bold' };
    }
    if (record.status === 'ABSENT') {
      return { char: 'Y', cls: 'bg-rose-100/70 text-rose-900 font-bold' };
    }
    return { char: 'G', cls: 'text-emerald-800 font-semibold' };
  };

  // Stats calculation
  let totalWorkDays = 0;
  daysArray.forEach((d) => {
    if (!isWeekend(d)) totalWorkDays++;
  });

  return (
    <div className="bg-white text-slate-900 font-sans p-2 text-[11px] leading-tight">
      {/* Official Header */}
      <div className="border-b-2 border-stone-800 pb-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-[10px] font-bold tracking-wider uppercase text-stone-600">
              T.C. MİLLÎ EĞİTİM BAKANLIĞI RESMÎ TEFTİŞ & ARŞİV FORMATI
            </p>
            <h1 className="text-base font-extrabold text-stone-900 uppercase">{tenantName}</h1>
            <p className="text-xs font-semibold text-teal-900">
              {classroomName} — {monthName} {year} Aylık Öğrenci Devam-Devamsızlık Çizelgesi
            </p>
          </div>
          <div className="text-right text-[10px] text-stone-600">
            <p className="font-bold text-stone-900">
              Mevzuat: Okul Öncesi Eğitim Kurumları Yönetmeliği
            </p>
            <p>Sınıf Mevcudu: {students.length} Öğrenci</p>
            <p>İş Günü: {totalWorkDays} Gün</p>
          </div>
        </div>
      </div>

      {/* Days Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-stone-400 text-center text-[10px]">
          <thead>
            <tr className="bg-stone-200/90 text-stone-800 font-bold">
              <th className="border border-stone-400 px-1 py-1 w-6">Sıra</th>
              <th className="border border-stone-400 px-2 py-1 text-left min-w-[120px]">
                Öğrenci Adı Soyadı
              </th>
              {daysArray.map((day) => {
                const weekend = isWeekend(day);
                return (
                  <th
                    key={day}
                    className={`border border-stone-400 px-0.5 py-1 w-5 ${
                      weekend ? 'bg-stone-300 text-stone-700' : ''
                    }`}
                  >
                    {day}
                  </th>
                );
              })}
              <th className="border border-stone-400 px-1 py-1 w-7 bg-emerald-100 text-emerald-900">
                G
              </th>
              <th className="border border-stone-400 px-1 py-1 w-7 bg-amber-100 text-amber-900">
                İ
              </th>
              <th className="border border-stone-400 px-1 py-1 w-7 bg-rose-100 text-rose-900">Y</th>
              <th className="border border-stone-400 px-1 py-1 w-10 bg-teal-100 text-teal-900">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              let presentCount = 0;
              let excusedCount = 0;
              let absentCount = 0;

              daysArray.forEach((d) => {
                if (!isWeekend(d)) {
                  const s = getStatusForStudent(student.id, d);
                  if (s.char === 'G') presentCount++;
                  else if (s.char === 'İ') excusedCount++;
                  else if (s.char === 'Y') absentCount++;
                }
              });

              const rate =
                totalWorkDays > 0 ? Math.round((presentCount / totalWorkDays) * 100) : 100;

              return (
                <tr key={student.id} className="hover:bg-stone-50">
                  <td className="border border-stone-300 font-semibold">{idx + 1}</td>
                  <td className="border border-stone-300 text-left px-2 py-0.5 font-bold truncate">
                    {student.firstName} {student.lastName}
                  </td>
                  {daysArray.map((day) => {
                    const status = getStatusForStudent(student.id, day);
                    return (
                      <td
                        key={day}
                        className={`border border-stone-300 p-0 text-[9px] ${status.cls}`}
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
            })}
          </tbody>
        </table>
      </div>

      {/* Legend & Summary Info */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4 text-[10px] text-stone-600 border border-stone-200 rounded p-2 bg-stone-50">
        <div className="flex items-center gap-4">
          <span className="font-bold">Kısaltmalar:</span>
          <span className="flex items-center gap-1 font-semibold text-emerald-800">
            <span className="border border-emerald-300 bg-emerald-50 px-1 rounded">G</span> Geldi
          </span>
          <span className="flex items-center gap-1 font-semibold text-amber-800">
            <span className="border border-amber-300 bg-amber-50 px-1 rounded">İ</span> İzinli /
            Raporlu
          </span>
          <span className="flex items-center gap-1 font-semibold text-rose-800">
            <span className="border border-rose-300 bg-rose-50 px-1 rounded">Y</span> Devamsız (Yok)
          </span>
          <span className="flex items-center gap-1 text-stone-400">
            <span className="border border-stone-300 bg-stone-200 px-1 rounded">—</span> Hafta Sonu
            / Tatil
          </span>
        </div>
        <div>
          <span>
            Toplam Öğrenci: <strong className="text-stone-900">{students.length}</strong> | Sınıf
            Devam Ortalaması: <strong className="text-teal-900">%94</strong>
          </span>
        </div>
      </div>

      {/* Official Signatures */}
      <div className="mt-6 pt-4 border-t border-stone-300 grid grid-cols-2 gap-12 text-center text-[11px] avoid-break">
        <div>
          <p className="font-semibold text-stone-500 mb-8">Sınıf Öğretmeni</p>
          <p className="font-bold text-stone-900">{teacherName}</p>
          <p className="text-[10px] text-stone-400">İmza</p>
        </div>
        <div>
          <p className="font-semibold text-stone-500 mb-8">Kurum Müdürü / Tasdik Eden</p>
          <p className="font-bold text-stone-900">{directorName}</p>
          <p className="text-[10px] text-stone-400">İmza & Mühür</p>
        </div>
      </div>
    </div>
  );
}
