import type { JSX } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CheckCircle2,
  BookOpenCheck,
  Pill,
  ShieldCheck,
  MessageSquare,
  Home,
  Menu,
  type LucideIcon,
} from 'lucide-react';

interface BottomNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface MobileBottomNavProps {
  role: string;
  onOpenMenu: () => void;
}

function getTabsForRole(role: string): BottomNavItem[] {
  if (role === 'PARENT') {
    return [
      { to: '/portal', label: 'Portal', icon: Home },
      { to: '/medication', label: 'İlaç', icon: Pill },
      { to: '/pickup', label: 'Teslimat', icon: ShieldCheck },
      { to: '/messages', label: 'Mesajlar', icon: MessageSquare },
    ];
  }

  if (role === 'TEACHER') {
    return [
      { to: '/dashboard', label: 'Akış', icon: LayoutDashboard },
      { to: '/attendance', label: 'Yoklama', icon: CheckCircle2 },
      { to: '/tracking', label: 'Karne', icon: BookOpenCheck },
      { to: '/medication', label: 'İlaç', icon: Pill },
    ];
  }

  // ADMIN / SUPER_ADMIN
  return [
    { to: '/dashboard', label: 'Gösterge', icon: LayoutDashboard },
    { to: '/students', label: 'Öğrenciler', icon: Users },
    { to: '/attendance', label: 'Yoklama', icon: CheckCircle2 },
    { to: '/medication', label: 'İlaç', icon: Pill },
  ];
}

export function MobileBottomNav({ role, onOpenMenu }: MobileBottomNavProps): JSX.Element {
  const tabs = getTabsForRole(role);

  return (
    <nav
      aria-label="Mobil Alt Menü"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FCFAF7]/95 dark:bg-[#0D1524]/95 backdrop-blur-xl border-t border-[#E8E2D5] dark:border-slate-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 min-w-[56px] min-h-[48px] py-1 rounded-2xl transition-all duration-150 ${
                  isActive
                    ? 'text-teal-900 dark:text-teal-300 font-bold scale-105'
                    : 'text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1 rounded-xl transition-all ${
                      isActive ? 'bg-teal-100/80 dark:bg-teal-950/60 shadow-2xs' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] leading-tight tracking-tight mt-0.5">
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Tüm Menüyü Aç"
          className="flex flex-col items-center justify-center flex-1 min-w-[56px] min-h-[48px] py-1 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium transition-all cursor-pointer"
        >
          <div className="p-1 rounded-xl">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[11px] leading-tight tracking-tight mt-0.5">Menü</span>
        </button>
      </div>
    </nav>
  );
}
