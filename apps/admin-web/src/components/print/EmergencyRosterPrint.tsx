import type { ReactElement } from 'react';
import type { Student, StudentPassport } from '@kidscare/shared-types';
import { AlertTriangle, Phone, ShieldAlert } from 'lucide-react';

export interface EmergencyRosterPrintProps {
  classroomName: string;
  students: Student[];
  passportsMap?: Record<string, StudentPassport | null | undefined> | undefined;
  tenantName?: string | undefined;
  teacherNames?: string[] | undefined;
  emergencyPhone?: string | undefined;
  tripDestination?: string | undefined;
  date?: string | undefined;
}

export function EmergencyRosterPrint({
  classroomName,
  students,
  passportsMap = {},
  tenantName = 'KidsCare Anaokulu & Gündüz Bakımevi',
  teacherNames = ['Sınıf Öğretmeni'],
  emergencyPhone = '0 (212) 555 01 23',
  tripDestination,
  date = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
}: EmergencyRosterPrintProps): ReactElement {
  return (
    <div className="bg-white text-slate-900 font-sans p-2 sm:p-4 text-[12px] leading-snug">
      {/* Header Banner */}
      <div className="border-b-2 border-rose-700 pb-3 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-700 border border-rose-300">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-rose-800">
                GİZLİ & RESMÎ GÜVENLİK FORMU (KAPI / GEZİ ÇANTASI DOSYASI)
              </p>
              <h1 className="text-lg font-black text-stone-900 uppercase">{tenantName}</h1>
              <p className="text-xs font-bold text-teal-900">
                {classroomName} — Acil Durum, Kan Grubu, Alerjen ve Veli İrtibat Listesi
              </p>
            </div>
          </div>
          <div className="text-right text-[11px]">
            {tripDestination && (
              <div className="mb-1">
                <span className="font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Gezi Güzergahı: {tripDestination}
                </span>
              </div>
            )}
            <p className="text-stone-500 font-medium">Tarih: {date}</p>
            <p className="text-stone-700 font-semibold">Refakatçiler: {teacherNames.join(', ')}</p>
          </div>
        </div>
      </div>

      {/* Emergency Hotlines Box */}
      <div className="mb-4 rounded-lg border-2 border-rose-300 bg-rose-50/80 p-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          <span className="font-bold text-rose-950">Önemli Acil Durum Protokolü:</span>
          <span className="text-rose-900">
            Beklenmedik alerjik reaksiyon veya kaza anında derhal 112'yi arayınız ve kurum idaresine
            bildiriniz.
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0 font-bold">
          <span className="bg-rose-600 text-white px-2 py-0.5 rounded">🚨 Ambulans: 112</span>
          <span className="bg-white text-stone-800 border border-stone-300 px-2 py-0.5 rounded flex items-center gap-1">
            <Phone className="h-3 w-3 text-teal-700" />
            Kurum: {emergencyPhone}
          </span>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-stone-300 text-left text-[11px]">
          <thead>
            <tr className="bg-stone-100 text-stone-800 font-bold border-b border-stone-300">
              <th className="border border-stone-300 px-2 py-1.5 w-8 text-center">#</th>
              <th className="border border-stone-300 px-2 py-1.5 min-w-[130px]">
                Öğrenci Adı Soyadı
              </th>
              <th className="border border-stone-300 px-2 py-1.5 w-16 text-center">Kan</th>
              <th className="border border-stone-300 px-2 py-1.5 min-w-[140px]">
                Kritik Alerjenler
              </th>
              <th className="border border-stone-300 px-2 py-1.5 min-w-[120px]">Kronik / İlaç</th>
              <th className="border border-stone-300 px-2 py-1.5 min-w-[140px]">
                Birincil Veli & Tel
              </th>
              <th className="border border-stone-300 px-2 py-1.5 min-w-[140px]">
                Yetkili Teslim / 2. İrtibat
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const passport = passportsMap[student.id];
              const allergies = passport?.allergies || [];
              const hasAllergies = allergies.length > 0;
              const chronic = passport?.chronicConditions || [];
              const contacts = passport?.emergencyContacts || [];
              const primaryContact = contacts[0];
              const secondaryContact = contacts[1];

              return (
                <tr
                  key={student.id}
                  className={`border-b border-stone-300 ${
                    hasAllergies ? 'bg-amber-50/50' : idx % 2 === 1 ? 'bg-stone-50/50' : 'bg-white'
                  }`}
                >
                  <td className="border border-stone-300 text-center font-bold text-stone-500">
                    {idx + 1}
                  </td>
                  <td className="border border-stone-300 px-2 py-1.5">
                    <div className="font-bold text-stone-900">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      #{student.id.slice(-5).toUpperCase()}
                    </div>
                  </td>
                  <td className="border border-stone-300 text-center px-1 py-1.5 font-black text-rose-700 bg-rose-50/30">
                    {passport?.bloodType || '—'}
                  </td>
                  <td className="border border-stone-300 px-2 py-1.5">
                    {hasAllergies ? (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded text-[10px] border border-rose-300">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        {allergies.join(', ')}
                      </span>
                    ) : (
                      <span className="text-stone-400 text-[10px]">Tespit Yok</span>
                    )}
                  </td>
                  <td className="border border-stone-300 px-2 py-1.5 text-[10px]">
                    {chronic.length > 0 ? (
                      <span className="text-amber-900 font-semibold">{chronic.join(', ')}</span>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>
                  <td className="border border-stone-300 px-2 py-1.5">
                    {primaryContact ? (
                      <div>
                        <div className="font-bold text-stone-900">
                          {primaryContact.name} ({primaryContact.relationship})
                        </div>
                        <div className="font-mono text-teal-900 font-bold text-[10px] flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5" />
                          {primaryContact.phone}
                        </div>
                      </div>
                    ) : (
                      <span className="text-stone-400 text-[10px]">Tanımlanmadı</span>
                    )}
                  </td>
                  <td className="border border-stone-300 px-2 py-1.5">
                    {secondaryContact ? (
                      <div>
                        <div className="font-semibold text-stone-800">
                          {secondaryContact.name} ({secondaryContact.relationship})
                        </div>
                        <div className="font-mono text-stone-600 text-[10px]">
                          {secondaryContact.phone}
                        </div>
                      </div>
                    ) : (
                      <span className="text-stone-400 text-[10px]">Tanımlanmadı</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Legal & Duty Note */}
      <div className="mt-4 pt-3 border-t border-stone-300 flex items-center justify-between text-[10px] text-stone-500 avoid-break">
        <div>
          <p className="font-bold text-stone-700">
            Kişisel Verilerin Korunması (KVKK) Güvenlik Beyanı:
          </p>
          <p>
            Bu liste yalnızca acil durum müdahaleleri, sınıf kapısı arkası ve gezi refakatçilerinin
            kullanımı içindir. Üçüncü şahıslarla paylaşılamaz veya açıkta bırakılamaz.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-stone-800">KidsCare Güvenlik & Sağlık Modülü</p>
          <p>Toplam {students.length} Öğrenci Kayıtlı</p>
        </div>
      </div>
    </div>
  );
}
