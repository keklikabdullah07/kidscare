import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { TactileButton } from './TactileButton';

export interface TactileDateNavigatorProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  mode?: 'day' | 'week';
  className?: string;
  showQuickJump?: boolean;
  minDate?: string;
  maxDate?: string;
  size?: 'sm' | 'md';
}

function parseISODate(isoStr: string): Date {
  const parts = (isoStr || '').split('-');
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return new Date(y, m, d);
  }
  const fallback = new Date();
  fallback.setHours(0, 0, 0, 0);
  return fallback;
}

function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'short',
  });
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Pazartesi = 1
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(date: Date): string {
  const mon = getMonday(date);
  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);

  const monDay = mon.getDate();
  const monMonth = mon.toLocaleDateString('tr-TR', { month: 'short' });
  const friDay = fri.getDate();
  const friMonth = fri.toLocaleDateString('tr-TR', { month: 'short' });
  const year = fri.getFullYear();

  if (monMonth === friMonth) {
    return `${monDay} - ${friDay} ${monMonth} ${year}`;
  }
  return `${monDay} ${monMonth} - ${friDay} ${friMonth} ${year}`;
}

export const TactileDateNavigator: React.FC<TactileDateNavigatorProps> = ({
  value,
  onChange,
  mode = 'day',
  className = '',
  showQuickJump = true,
  minDate,
  maxDate,
  size = 'md',
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const currentDate = parseISODate(value);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isCurrentDay = toISODateString(currentDate) === toISODateString(today);
  const isCurrentWeek =
    toISODateString(getMonday(currentDate)) === toISODateString(getMonday(today));

  const handleStep = (direction: -1 | 1) => {
    const nextDate = new Date(currentDate);
    if (mode === 'week') {
      nextDate.setDate(nextDate.getDate() + direction * 7);
    } else {
      nextDate.setDate(nextDate.getDate() + direction);
    }
    const iso = toISODateString(nextDate);
    if (minDate && iso < minDate) return;
    if (maxDate && iso > maxDate) return;
    onChange(iso);
  };

  const handleQuickJump = () => {
    onChange(toISODateString(today));
  };

  const handleNativePickerOpen = () => {
    const input = dateInputRef.current;
    if (input) {
      if ('showPicker' in input && typeof input.showPicker === 'function') {
        try {
          input.showPicker();
        } catch {
          input.focus();
        }
      } else {
        input.focus();
      }
    }
  };

  const displayText = mode === 'week' ? formatWeekLabel(currentDate) : formatDayLabel(currentDate);

  const isQuickActive = mode === 'week' ? isCurrentWeek : isCurrentDay;

  return (
    <div
      className={`inline-flex items-center gap-2 flex-wrap select-none ${className}`}
      data-testid="tactile-date-navigator"
    >
      {showQuickJump && (
        <TactileButton
          type="button"
          variant={isQuickActive ? 'teal' : 'secondary'}
          size={size === 'sm' ? 'sm' : 'md'}
          onClick={handleQuickJump}
          className={`font-bold transition-all ${
            isQuickActive
              ? 'text-white'
              : 'text-slate-700 dark:text-slate-200 hover:text-teal-800 dark:hover:text-teal-300'
          }`}
          title={mode === 'week' ? 'Bu haftaya dön' : 'Bugüne dön'}
        >
          {mode === 'week' ? 'Bu Hafta' : 'Bugün'}
        </TactileButton>
      )}

      <div className="flex items-center bg-[#FAF9F6] dark:bg-slate-900 p-0.5 rounded-2xl border border-[#DDD4C4] dark:border-slate-800 shadow-2xs">
        {/* Sol Ok */}
        <button
          type="button"
          onClick={() => handleStep(-1)}
          className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer active:scale-95"
          title={mode === 'week' ? 'Önceki Hafta' : 'Önceki Gün'}
          aria-label={mode === 'week' ? 'Önceki Hafta' : 'Önceki Gün'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Tarih Etiketi & Seçici */}
        <div className="relative">
          <button
            type="button"
            onClick={handleNativePickerOpen}
            className="flex items-center gap-2 px-3 py-1 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer text-slate-800 dark:text-slate-100 font-bold text-xs active:scale-98"
            title="Takvimden tarih seç"
          >
            <Calendar className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            <span className="whitespace-nowrap">{displayText}</span>
          </button>

          {/* Gizli native HTML5 date input */}
          <input
            ref={dateInputRef}
            type="date"
            value={value}
            min={minDate}
            max={maxDate}
            onChange={(e) => {
              if (e.target.value) {
                onChange(e.target.value);
              }
            }}
            className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        {/* Sağ Ok */}
        <button
          type="button"
          onClick={() => handleStep(1)}
          className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer active:scale-95"
          title={mode === 'week' ? 'Sonraki Hafta' : 'Sonraki Gün'}
          aria-label={mode === 'week' ? 'Sonraki Hafta' : 'Sonraki Gün'}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
