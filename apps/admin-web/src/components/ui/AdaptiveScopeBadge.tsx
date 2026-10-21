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
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 shadow-2xs font-bold text-xs select-none transition ${
        isClassroom
          ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700/60 text-teal-900 dark:text-teal-200'
          : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200'
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
        <span className="text-[10px] font-medium opacity-75 hidden sm:inline">({subLabel})</span>
      )}
    </div>
  );
}
