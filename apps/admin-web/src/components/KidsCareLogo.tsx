import type { JSX } from 'react';

type KidsCareLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'standard' | 'icon' | 'horizontal' | 'full';
  className?: string;
  inverted?: boolean;
};

/**
 * KidsCare Official Brand Logo Component
 * Uses the authentic KidsCare brand assets (K-heart emblem & typography)
 */
export function KidsCareLogo({
  size = 'md',
  showText = true,
  variant = 'standard',
  className = '',
  inverted = false,
}: KidsCareLogoProps): JSX.Element {
  if (variant === 'horizontal') {
    const hSizes = {
      sm: 'h-8',
      md: 'h-11',
      lg: 'h-16',
      xl: 'h-20',
    };
    return (
      <div className={`inline-flex items-center ${className}`}>
        <div className="px-2.5 py-1 rounded-xl bg-transparent dark:bg-[#FAF8F5] dark:border dark:border-amber-200/30 dark:shadow-xs transition-colors">
          <img
            src="/brand/kidscare-logo-horizontal.png"
            alt="KidsCare"
            className={`${hSizes[size]} w-auto object-contain`}
          />
        </div>
      </div>
    );
  }

  if (variant === 'full') {
    const fSizes = {
      sm: 'h-16',
      md: 'h-24',
      lg: 'h-32',
      xl: 'h-40',
    };
    return (
      <div className={`inline-flex flex-col items-center ${className}`}>
        <div className="p-3 rounded-2xl bg-transparent dark:bg-[#FAF8F5] dark:border dark:border-amber-200/30 dark:shadow-xs transition-colors">
          <img
            src="/brand/kidscare-logo-full.png"
            alt="KidsCare"
            className={`${fSizes[size]} w-auto object-contain`}
          />
        </div>
      </div>
    );
  }

  const sizeMap = {
    sm: { box: 'w-9 h-9 p-0.5', text: 'text-base', sub: 'text-[10px]' },
    md: { box: 'w-11 h-11 p-1', text: 'text-xl', sub: 'text-[11px]' },
    lg: { box: 'w-16 h-16 p-1.5', text: 'text-2xl', sub: 'text-xs' },
    xl: { box: 'w-24 h-24 p-2', text: 'text-3xl', sub: 'text-sm' },
  };

  const { box, text, sub } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon Mark with Authentic Logo Image and Soft Contrast */}
      <div
        className={`${box} rounded-xl bg-white shadow-xs border border-teal-100/50 flex items-center justify-center shrink-0 overflow-hidden relative group transition-transform group-hover:scale-105`}
      >
        <img
          src="/brand/kidscare-icon.png"
          alt="KidsCare Emblem"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Brand Typography with responsive dark/light styling */}
      {showText && variant !== 'icon' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`${text} font-black tracking-tight ${
                inverted ? 'text-white' : 'text-teal-950 dark:text-white'
              }`}
            >
              Kids
              <span className={inverted ? 'text-amber-300' : 'text-teal-600 dark:text-teal-400'}>
                Care
              </span>
            </span>
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full ${
                inverted
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-300/40'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60'
              }`}
            >
              Kreş
            </span>
          </div>
          <span
            className={`${sub} font-medium tracking-normal mt-0.5 ${
              inverted ? 'text-teal-100/75' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Okul Öncesi Portalı
          </span>
        </div>
      )}
    </div>
  );
}
