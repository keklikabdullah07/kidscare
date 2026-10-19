import type { ReactElement } from 'react';
import type { DailyMenuResponse } from '../../api/daily-menus';

export interface WeeklyMenuPrintProps {
  tenantName?: string;
  startDate: string; // YYYY-MM-DD (Monday)
  endDate: string; // YYYY-MM-DD (Friday)
  weekDays: {
    dateStr: string;
    dayName: string;
    dayNumber: number;
    monthName: string;
  }[];
  weekData: Record<string, DailyMenuResponse>;
  dietitianName?: string;
  chefName?: string;
  directorName?: string;
}

export function WeeklyMenuPrint({
  tenantName = 'KidsCare Anaokulu & Gündüz Bakımevi',
  startDate,
  endDate,
  weekDays,
  weekData,
  dietitianName = 'Diyetisyen / Gıda Teknikeri',
  chefName = 'Aşçı / Mutfak Sorumlusu',
  directorName = 'Kurum Müdürü',
}: WeeklyMenuPrintProps): ReactElement {
  const printDate = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="w-full max-w-5xl mx-auto bg-white text-slate-900 p-8 font-sans print:p-0 print:max-w-none text-xs"
      data-testid="weekly-menu-print"
    >
      {/* MEB & Kurum Başlığı */}
      <div className="border-b-2 border-slate-900 pb-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border-2 border-slate-900 flex items-center justify-center font-bold text-center leading-none text-[9px] uppercase tracking-tighter p-1 bg-slate-50">
            T.C. <br /> MEB
          </div>
          <div>
            <h1 className="text-base font-black uppercase tracking-wider text-slate-900">
              {tenantName}
            </h1>
            <h2 className="text-sm font-bold text-slate-700">
              HAFTALIK YEMEK VE BESLENME ÇİZELGESİ
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              MEB Okul Öncesi Eğitim Kurumları Beslenme Standartları Rehberi Uyarınca
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded font-bold text-xs text-slate-800">
            Hafta: {startDate} — {endDate}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Yazdırma Tarihi: {printDate}</p>
        </div>
      </div>

      {/* 5 Günlük Tablo */}
      <table className="w-full border-collapse border border-slate-400 text-left mb-4">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-400 text-slate-900">
            <th className="border border-slate-400 p-2 font-bold w-28 text-center bg-slate-200">
              ÖĞÜNLER
            </th>
            {weekDays.map((d) => (
              <th
                key={d.dateStr}
                className="border border-slate-400 p-2 font-bold text-center text-xs"
              >
                <div className="font-extrabold text-slate-900">{d.dayName}</div>
                <div className="text-[10px] text-slate-600 font-normal">
                  {d.dayNumber} {d.monthName}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Sabah Kahvaltısı */}
          <tr className="border-b border-slate-300">
            <td className="border border-slate-400 p-2 font-bold bg-amber-50/50 text-amber-900">
              <div className="text-xs uppercase font-extrabold">Sabah Kahvaltısı</div>
              <div className="text-[10px] text-amber-700 font-normal">08:30 - 09:30</div>
            </td>
            {weekDays.map((d) => {
              const menu = weekData[d.dateStr]?.menu;
              const text = Array.isArray(menu?.breakfast)
                ? menu.breakfast.join(', ')
                : menu?.breakfast;
              return (
                <td
                  key={`b-${d.dateStr}`}
                  className="border border-slate-300 p-2.5 align-top text-[11px] leading-relaxed whitespace-pre-line"
                >
                  {text ? text : <span className="text-slate-400 italic">—</span>}
                </td>
              );
            })}
          </tr>

          {/* Öğle Yemeği */}
          <tr className="border-b border-slate-300 bg-slate-50/40">
            <td className="border border-slate-400 p-2 font-bold bg-teal-50/50 text-teal-900">
              <div className="text-xs uppercase font-extrabold">Öğle Yemeği</div>
              <div className="text-[10px] text-teal-700 font-normal">12:00 - 13:00</div>
            </td>
            {weekDays.map((d) => {
              const menu = weekData[d.dateStr]?.menu;
              const text = Array.isArray(menu?.lunch) ? menu.lunch.join('\n') : menu?.lunch;
              return (
                <td
                  key={`l-${d.dateStr}`}
                  className="border border-slate-300 p-2.5 align-top text-[11px] font-medium leading-relaxed whitespace-pre-line"
                >
                  {text ? text : <span className="text-slate-400 italic">—</span>}
                </td>
              );
            })}
          </tr>

          {/* İkindi Kahvaltısı */}
          <tr className="border-b border-slate-300">
            <td className="border border-slate-400 p-2 font-bold bg-orange-50/50 text-orange-900">
              <div className="text-xs uppercase font-extrabold">İkindi / Ara Öğün</div>
              <div className="text-[10px] text-orange-700 font-normal">15:30 - 16:15</div>
            </td>
            {weekDays.map((d) => {
              const menu = weekData[d.dateStr]?.menu;
              const text = Array.isArray(menu?.snack) ? menu.snack.join(', ') : menu?.snack;
              return (
                <td
                  key={`s-${d.dateStr}`}
                  className="border border-slate-300 p-2.5 align-top text-[11px] leading-relaxed whitespace-pre-line"
                >
                  {text ? text : <span className="text-slate-400 italic">—</span>}
                </td>
              );
            })}
          </tr>

          {/* Kalori & Besin Değerleri */}
          <tr className="border-b border-slate-300 bg-slate-100/50">
            <td className="border border-slate-400 p-2 font-bold text-slate-700">
              <div className="text-[11px]">Ort. Kalori</div>
            </td>
            {weekDays.map((d) => {
              const menu = weekData[d.dateStr]?.menu;
              return (
                <td
                  key={`cal-${d.dateStr}`}
                  className="border border-slate-300 p-2 text-center text-[11px] font-bold text-slate-700"
                >
                  {menu?.calories ? `${menu.calories} kcal` : '—'}
                </td>
              );
            })}
          </tr>

          {/* Alerjen Uyarısı */}
          <tr>
            <td className="border border-slate-400 p-2 font-bold text-rose-800 bg-rose-50/40">
              <div className="text-[10px] uppercase font-bold">Alerjenler</div>
            </td>
            {weekDays.map((d) => {
              const menu = weekData[d.dateStr]?.menu;
              const warnings = weekData[d.dateStr]?.allergenWarnings || [];
              const allergensList = Array.isArray(menu?.allergens) ? menu.allergens.join(', ') : '';
              return (
                <td
                  key={`w-${d.dateStr}`}
                  className="border border-slate-300 p-2 align-top text-[10px] text-slate-600"
                >
                  {allergensList ? (
                    <span className="font-semibold text-slate-800">{allergensList}</span>
                  ) : (
                    <span className="text-slate-400">Standart</span>
                  )}
                  {warnings.length > 0 && (
                    <div className="mt-1 text-[9px] text-rose-700 font-bold">
                      ⚠️ {warnings.length} riskli öğrenci
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>

      {/* Yasal Uyarı / Açıklama */}
      <div className="bg-slate-50 border border-slate-300 rounded p-2.5 mb-6 text-[10px] text-slate-600 leading-normal">
        <strong>Önemli Bilgilendirme:</strong> Menülerimiz yaş grubu çocukların günlük protein,
        karbonhidrat ve vitamin ihtiyaçları gözetilerek dengeli şekilde planlanmıştır. Gıda alerjisi
        veya intoleransı olan öğrencilerimize doktor raporuna istinaden alternatif menü servis
        edilmektedir. Tedarik durumuna bağlı zorunlu değişiklikler velilerimize önceden bildirilir.
      </div>

      {/* İmzalar ve Resmi Onay */}
      <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-300 text-center">
        <div>
          <p className="font-bold text-slate-900 text-xs">HAZIRLAYAN</p>
          <p className="text-[11px] text-slate-600 mt-0.5">{chefName}</p>
          <div className="h-14 flex items-end justify-center text-[10px] text-slate-400 italic">
            (İmza)
          </div>
        </div>

        <div>
          <p className="font-bold text-slate-900 text-xs">KONTROL EDEN</p>
          <p className="text-[11px] text-slate-600 mt-0.5">{dietitianName}</p>
          <div className="h-14 flex items-end justify-center text-[10px] text-slate-400 italic">
            (İmza / Kaşe)
          </div>
        </div>

        <div>
          <p className="font-bold text-slate-900 text-xs">ONAYLAYAN</p>
          <p className="text-[11px] text-slate-600 mt-0.5">{directorName}</p>
          <div className="h-14 flex items-end justify-center text-[10px] text-slate-400 italic">
            (Mühür / İmza)
          </div>
        </div>
      </div>
    </div>
  );
}
