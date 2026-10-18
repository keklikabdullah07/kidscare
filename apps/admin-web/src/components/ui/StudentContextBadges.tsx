import type { JSX } from 'react';
import { School, GraduationCap, User } from 'lucide-react';

export interface StudentContextBadgesProps {
  classroomName?: string | null | undefined;
  teacherName?: string | null | undefined;
  parentName?: string | null | undefined;
  className?: string | undefined;
  size?: 'xs' | 'sm' | undefined;
  showIcons?: boolean | undefined;
}

export function StudentContextBadges({
  classroomName,
  teacherName,
  parentName,
  className = '',
  size = 'xs',
  showIcons = true,
}: StudentContextBadgesProps): JSX.Element | null {
  if (!classroomName && !teacherName && !parentName) return null;

  const textCls = size === 'xs' ? 'text-[11px] leading-tight py-0.5 px-2' : 'text-xs py-1 px-2.5';
  const iconSize = size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {classroomName && (
        <span
          className={`inline-flex items-center gap-1 rounded-md font-semibold bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border border-teal-200/90 dark:border-teal-800/60 ${textCls}`}
          title={`Sınıf: ${classroomName}`}
        >
          {showIcons && (
            <School className={`${iconSize} text-teal-600 dark:text-teal-400 shrink-0`} />
          )}
          <span className="truncate max-w-[130px]">{classroomName}</span>
        </span>
      )}

      {teacherName && (
        <span
          className={`inline-flex items-center gap-1 rounded-md font-medium bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-200/90 dark:border-purple-800/60 ${textCls}`}
          title={`Öğretmen: ${teacherName}`}
        >
          {showIcons && (
            <GraduationCap
              className={`${iconSize} text-purple-600 dark:text-purple-400 shrink-0`}
            />
          )}
          <span className="truncate max-w-[140px]">{teacherName}</span>
        </span>
      )}

      {parentName && (
        <span
          className={`inline-flex items-center gap-1 rounded-md font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/90 dark:border-amber-800/60 ${textCls}`}
          title={`Veli: ${parentName}`}
        >
          {showIcons && (
            <User className={`${iconSize} text-amber-600 dark:text-amber-400 shrink-0`} />
          )}
          <span className="truncate max-w-[130px]">{parentName}</span>
        </span>
      )}
    </div>
  );
}
