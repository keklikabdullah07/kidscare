import { useState, useEffect, type JSX } from 'react';
import {
  Utensils,
  Coffee,
  Soup,
  Cookie,
  Flame,
  AlertTriangle,
  Calendar,
  Printer,
  Edit2,
} from 'lucide-react';
import { getDailyMenuRange, type DailyMenuResponse } from '../../api/daily-menus';
import { TactileButton, TactileDateNavigator } from '../../components/ui';
import { PrintPreviewModal, WeeklyMenuPrint } from '../../components/print';

interface WeeklyMenuViewProps {
  initialDate?: string;
  onSelectDateToEdit: (date: string) => void;
}

const DAY_NAMES_TR = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

function getMondayOfCurrentWeek(dateStr: string): Date {
  const d = new Date(dateStr);
  const day = d.getDay();
  // day: 0=Sun, 1=Mon, ..., 6=Sat
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function WeeklyMenuView({
  initialDate,
  onSelectDateToEdit,
}: WeeklyMenuViewProps): JSX.Element {
  const [currentMonday, setCurrentMonday] = useState<Date>(() =>
    getMondayOfCurrentWeek(initialDate || new Date().toISOString().slice(0, 10)),
  );
  const [weekData, setWeekData] = useState<Record<string, DailyMenuResponse>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Monday through Friday dates
  const weekDays = [0, 1, 2, 3, 4].map((offset) => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() + offset);
    return {
      dateStr: formatDateString(d),
      dayName: DAY_NAMES_TR[offset] || '',
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('tr-TR', { month: 'short' }),
    };
  });

  const mondayStr = weekDays[0]!.dateStr;
  const fridayStr = weekDays[4]!.dateStr;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getDailyMenuRange(mondayStr, fridayStr)
      .then((responses) => {
        if (cancelled) return;
        const map: Record<string, DailyMenuResponse> = {};
        responses.forEach((res) => {
          if (res.menu) {
            map[res.menu.date] = res;
          }
        });
        setWeekData(map);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Haftalık menü yüklenemedi');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mondayStr, fridayStr]);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      {/* Week Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#131B2E] p-4 rounded-3xl border-2 border-[#DDD4C4] dark:border-slate-800 shadow-[0_4px_16px_-2px_rgba(20,32,54,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold border border-amber-200/80 dark:border-amber-800/40 shadow-2xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Haftalık Yemek Çizelgesi</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                {weekDays[0]?.dayNumber} {weekDays[0]?.monthName} — {weekDays[4]?.dayNumber}{' '}
                {weekDays[4]?.monthName}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pazartesi'den Cuma'ya tüm ana ve ara öğünlerin toplu görünümü
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <TactileDateNavigator
            mode="week"
            value={mondayStr}
            onChange={(newDate) => setCurrentMonday(getMondayOfCurrentWeek(newDate))}
          />

          <TactileButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowPrintModal(true)}
            className="text-slate-700 dark:text-slate-200"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Yazdır / PDF</span>
          </TactileButton>
        </div>
      </div>

      {/* Official Print / PDF Modal */}
      <PrintPreviewModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title="Haftalık Yemek ve Beslenme Çizelgesi"
        subtitle={`${mondayStr} — ${fridayStr} Haftası MEB Standart Beslenme Çıktısı`}
        orientation="landscape"
      >
        <WeeklyMenuPrint
          startDate={mondayStr}
          endDate={fridayStr}
          weekDays={weekDays}
          weekData={weekData}
        />
      </PrintPreviewModal>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* 5-Day Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {weekDays.map(({ dateStr, dayName, dayNumber, monthName }) => {
          const item = weekData[dateStr];
          const menu = item?.menu;
          const warnings = item?.allergenWarnings || [];
          const isToday = dateStr === todayStr;

          return (
            <div
              key={dateStr}
              className={`rounded-3xl border-2 flex flex-col justify-between overflow-hidden transition-all shadow-[0_4px_16px_-4px_rgba(20,32,54,0.06)] ${
                isToday
                  ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20 shadow-md ring-2 ring-amber-400/30'
                  : 'border-[#DDD4C4] dark:border-slate-800 bg-white dark:bg-[#131B2E]'
              }`}
            >
              {/* Day Header */}
              <div
                className={`p-3.5 border-b flex items-center justify-between ${
                  isToday
                    ? 'bg-amber-100/70 dark:bg-amber-950/60 border-amber-300 dark:border-amber-900/60'
                    : 'bg-[#FCFAF7] dark:bg-slate-900/50 border-[#DDD4C4]/70 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {dayName}
                    </span>
                    {isToday && (
                      <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider">
                        Bugün
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {dayNumber} {monthName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectDateToEdit(dateStr)}
                  className="p-1.5 rounded-xl text-teal-800 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Günün Menüsünü Düzenle"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Day Menu Meals Content */}
              <div className="p-3.5 flex-1 space-y-3.5 text-xs">
                {loading ? (
                  <div className="py-12 text-center text-slate-400 text-xs italic">Yükleniyor…</div>
                ) : !menu ? (
                  <div className="py-10 text-center flex flex-col items-center justify-center text-slate-400">
                    <Utensils className="w-6 h-6 stroke-1 mb-2 opacity-50" />
                    <span className="text-xs font-semibold">Menü girilmedi</span>
                    <button
                      type="button"
                      onClick={() => onSelectDateToEdit(dateStr)}
                      className="mt-2 text-[11px] text-teal-700 dark:text-teal-300 font-bold hover:underline"
                    >
                      + Menü Ekle
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Breakfast */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                        <Coffee className="w-3 h-3 text-amber-600" />
                        <span>Sabah Kahvaltısı</span>
                      </div>
                      <div className="pl-4 text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                        {menu.breakfast.length > 0 ? (
                          menu.breakfast.map((item, idx) => (
                            <div key={idx} className="truncate" title={item}>
                              • {item}
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Girilmedi</span>
                        )}
                      </div>
                    </div>

                    {/* Lunch */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-teal-800 dark:text-teal-300">
                        <Soup className="w-3 h-3 text-teal-600" />
                        <span>Öğle Yemeği</span>
                      </div>
                      <div className="pl-4 text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                        {menu.lunch.length > 0 ? (
                          menu.lunch.map((item, idx) => (
                            <div key={idx} className="truncate" title={item}>
                              • {item}
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Girilmedi</span>
                        )}
                      </div>
                    </div>

                    {/* Snack */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-purple-800 dark:text-purple-300">
                        <Cookie className="w-3 h-3 text-purple-600" />
                        <span>İkindi Ara Öğünü</span>
                      </div>
                      <div className="pl-4 text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                        {menu.snack.length > 0 ? (
                          menu.snack.map((item, idx) => (
                            <div key={idx} className="truncate" title={item}>
                              • {item}
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Girilmedi</span>
                        )}
                      </div>
                    </div>

                    {/* Calories & Notes */}
                    {menu.calories && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-500" />
                          <span>{menu.calories} kcal</span>
                        </span>
                        {warnings.length > 0 && (
                          <span
                            className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold"
                            title={`${warnings.length} risk uyarısı`}
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            <span>{warnings.length} Risk</span>
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Day Footer Button */}
              <div className="p-2.5 bg-[#FAF9F6] dark:bg-slate-900/60 border-t border-[#DDD4C4]/60 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => onSelectDateToEdit(dateStr)}
                  className="w-full py-1.5 px-2 rounded-xl text-center text-xs font-bold text-teal-900 dark:text-teal-300 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-[#DDD4C4] dark:hover:border-slate-700 transition cursor-pointer"
                >
                  {menu ? 'Detay & Düzenle →' : '+ Menü Oluştur'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
