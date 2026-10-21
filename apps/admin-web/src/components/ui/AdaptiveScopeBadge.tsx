import type { JSX } from 'react';
import { School, User } from 'lucide-react';

export interface AdaptiveScopeBadgeProps {
  type: 'classroom' | 'student';
  label: string;
  subLabel?: string;
  className?: string;
}

export function AdaptiveScopeBadge({
  type,
  label,
  subLabel,
  className = '',
}: AdaptiveScopeBadgeProps): JSX.Element {
  const isClassroom = type === 'classroom';
  const Icon = isClassroom ? School : User;

  return (
    <div
      data-testid={`scope-badge-${type}`}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-2xl border-2 border-[#DDD4C4] dark:border-slate-700/80 bg-[#FCFAF7] dark:bg-slate-900 shadow-2xs font-bold text-xs select-none transition ${
        isClassroom ? 'text-teal-950 dark:text-teal-200' : 'text-amber-950 dark:text-amber-200'
      } ${className}`}
      title={subLabel || (isClassroom ? 'Sorumlu olduğunuz sınıf' : 'Öğrenciniz')}
    >
      <Icon
        className={`w-3.5 h-3.5 shrink-0 ${
          isClassroom ? 'text-teal-700 dark:text-teal-400' : 'text-amber-700 dark:text-amber-400'
        }`}
      />
      <span className="truncate max-w-[180px]">{label}</span>
      {subLabel && (
        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
          ({subLabel})
        </span>
      )}
    </div>
  );
}
