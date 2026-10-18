import { useState, useEffect, type JSX } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  BookOpenCheck,
  Utensils,
  Camera,
  Settings,
  Home,
  LogOut,
  Menu,
  X,
  Calendar,
  LayoutDashboard,
  Moon,
  Sun,
  UserCog,
  ShieldCheck,
  Pill,
  MessageSquare,
  ClipboardList,
  AlertTriangle,
  Award,
  Search,
  Ticket,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
  Megaphone,
  Vote,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { useTheme } from './ThemeContext';
import { KidsCareLogo } from './KidsCareLogo';
import type { BadgeVariant } from './ui/Badge';
import { MobileBottomNav } from './navigation/MobileBottomNav';
import { NotificationBell } from './notifications/NotificationBell';
import { ProfileEditModal } from './ProfileEditModal';

type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
  description?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

function getNavGroupsForRole(role: string): NavGroup[] {
  if (role === 'PARENT') {
    return [
      {
        title: 'Öğrenci Durumu',
        items: [
          { to: '/portal', label: 'Veli Portalı', icon: Home, description: 'Öğrenci genel durumu' },
          {
            to: '/development',
            label: 'Gelişim & Portfolyo',
            icon: Award,
            description: 'Gelişim raporları',
          },
          {
            to: '/finance',
            label: 'Aidat & Ödemeler',
            icon: CreditCard,
            description: 'Aylık aidat ve ödemeler',
          },
        ],
      },
      {
        title: 'Güvenlik & Sağlık',
        items: [
          {
            to: '/pickup',
            label: 'Teslim Yetkileri',
            icon: ShieldCheck,
            description: 'Teslim alabilecek kişiler',
          },
          {
            to: '/medication',
            label: 'İlaç Takibi',
            icon: Pill,
            description: 'İlaç kullanım talepleri',
          },
        ],
      },
      {
        title: 'İletişim & Günlük',
        items: [
          {
            to: '/messages',
            label: 'Mesajlar',
            icon: MessageSquare,
            description: 'Öğretmenle mesajlaşma',
          },
          {
            to: '/requests',
            label: 'Veli Talepleri',
            icon: ClipboardList,
            description: 'İzin ve bildirimler',
          },
          {
            to: '/surveys',
            label: 'Anketler & Oylama',
            icon: Vote,
            description: 'Yemek ve etkinlik oylamaları',
          },
          {
            to: '/menus',
            label: 'Yemek Menüsü',
            icon: Utensils,
            description: 'Haftalık yemek planı',
          },
          {
            to: '/events',
            label: 'Etkinlikler & İzinler',
            icon: Ticket,
            description: 'Dış geziler, okul etkinlikleri ve izinler',
          },
          {
            to: '/gallery',
            label: 'Etkinlik Galerisi',
            icon: Camera,
            description: 'Sınıf fotoğrafları',
          },
        ],
      },
    ];
  }

  if (role === 'SERVICE_STAFF') {
    return [
      {
        title: 'Servis & Teslimat',
        items: [
          {
            to: '/pickup',
            label: 'Servis & Teslimat',
            icon: ShieldCheck,
            description: 'Yolcu listesi ve biniş/iniş kontrolü',
          },
        ],
      },
      {
        title: 'İletişim & Talepler',
        items: [
          {
            to: '/messages',
            label: 'Mesajlar',
            icon: MessageSquare,
            description: 'Veli ve okul iletişimi',
          },
          {
            to: '/requests',
            label: 'Servis Talepleri',
            icon: ClipboardList,
            description: 'Servis bildirimleri ve izinler',
          },
        ],
      },
    ];
  }

  const isTeacher = role === 'TEACHER';

  const groups: NavGroup[] = [
    {
      title: 'Günlük Akış',
      items: [
        {
          to: '/dashboard',
          label: 'Ana Panel',
          icon: LayoutDashboard,
          description: 'Günün özeti ve metrikler',
        },
        {
          to: '/students',
          label: 'Öğrenciler',
          icon: Users,
          description: 'Öğrenci ve sınıf listesi',
        },
        {
          to: '/attendance',
          label: 'Yoklama',
          icon: CheckCircle2,
          description: 'Hızlı katılım takibi',
        },
        {
          to: '/tracking',
          label: 'Günlük Takip',
          icon: BookOpenCheck,
          description: 'Yemek, uyku & karne',
        },
      ],
    },
    {
      title: 'Güvenlik & Sağlık',
      items: [
        {
          to: '/pickup',
          label: 'Teslimat Kontrolü',
          icon: ShieldCheck,
          description: 'Yetkili teslimatçılar',
        },
        {
          to: '/medication',
          label: 'İlaç Takibi',
          icon: Pill,
          description: 'İlaç saatleri ve onaylar',
        },
        {
          to: '/incidents',
          label: 'Olay Kayıtları',
          icon: AlertTriangle,
          description: 'Kaza ve revir kayıtları',
        },
        {
          to: '/development',
          label: 'Gelişim & Portfolyo',
          icon: Award,
          description: 'Gözlem ve kazanımlar',
        },
      ],
    },
    {
      title: 'İletişim & Rutinler',
      items: [
        {
          to: '/messages',
          label: 'Mesajlaşma',
          icon: MessageSquare,
          description: 'Veli ve ekip yazışmaları',
        },
        {
          to: '/requests',
          label: 'Veli Talepleri',
          icon: ClipboardList,
          description: 'İzin ve bilgi talepleri',
        },
        {
          to: '/broadcast',
          label: 'Duyuru & Bildirim',
          icon: Megaphone,
          description: 'Toplu duyuru ve acil push iletimi',
        },
        {
          to: '/surveys',
          label: 'Anketler & Oylama',
          icon: Vote,
          description: 'Memnuniyet ve etkinlik oylamaları',
        },
        {
          to: '/menus',
          label: 'Yemek Listesi',
          icon: Utensils,
          description: 'Öğünler ve alerjenler',
        },
        {
          to: '/events',
          label: 'Etkinlikler & İzinler',
          icon: Ticket,
          description: 'Dış geziler, etkinlikler ve izin yönetimi',
        },
        {
          to: '/gallery',
          label: 'Etkinlik Galerisi',
          icon: Camera,
          description: 'Fotoğraf ve albümler',
        },
      ],
    },
  ];

  if (!isTeacher) {
    groups.push({
      title: 'Yönetim',
      items: [
        {
          to: '/finance',
          label: 'Aidat & Finans',
          icon: CreditCard,
          description: 'Tahsilat ve borç takibi',
        },
        {
          to: '/team',
          label: 'Ekip & Roller',
          icon: UserCog,
          description: 'Personel ve veli hesapları',
        },
        {
          to: '/settings',
          label: 'Kreş Ayarları',
          icon: Settings,
          description: 'Kurum profili ve lisans',
        },
      ],
    });
  }

  return groups;
}

function getTodayFormatted(): string {
  const date = new Date();
  return date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function getRoleBadge(role: string): { label: string; variant: BadgeVariant } {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'SUPERADMIN':
      return { label: 'Süper Admin', variant: 'brand' };
    case 'ADMIN':
      return { label: 'Yönetici / Müdür', variant: 'info' };
    case 'TEACHER':
      return { label: 'Öğretmen', variant: 'warning' };
    case 'PARENT':
      return { label: 'Veli', variant: 'success' };
    case 'SERVICE_STAFF':
      return { label: 'Servis Personeli', variant: 'accent' };
    default:
      return { label: role, variant: 'neutral' };
  }
}

export function Layout(): JSX.Element {
  const { state, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kidscare_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('kidscare_sidebar_collapsed', String(next));
      } catch {
        /* storage may be disabled */
      }
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'm' || e.key === 'M' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentUser = state.status === 'authenticated' ? state.user : null;
  const userRole = currentUser?.role ?? '';
  const userEmail = currentUser?.email ?? '';
  const roleBadge = getRoleBadge(userRole);

  const fullName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ').trim();
  const displayName =
    fullName ||
    (() => {
      if (userEmail && userEmail.includes('@')) {
        const prefix = userEmail.split('@')[0] ?? '';
        if (prefix) {
          return prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }
      }
      const roleLabels: Record<string, string> = {
        SUPER_ADMIN: 'Süper Admin',
        SUPERADMIN: 'Süper Admin',
        ADMIN: 'Kreş Müdürü',
        TEACHER: 'Öğretmen',
        PARENT: 'Veli',
        SERVICE_STAFF: 'Servis Personeli',
      };
      return roleLabels[userRole] || 'Kullanıcı';
    })();

  const userInitial = (displayName || 'K').charAt(0).toUpperCase();
  const userAvatar = currentUser?.avatarUrl;
  const navGroups = getNavGroupsForRole(userRole);

  return (
    <div className="min-h-screen flex bg-[#F6F3EC] text-slate-900 dark:bg-[#090D16] dark:text-slate-100 font-sans">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation: Floating Island Console (Ada Menüsü) */}
      <aside
        className={`fixed top-3 bottom-3 left-3 z-50 bg-[#115E59] dark:bg-[#0C433F] rounded-3xl shadow-[0_16px_40px_-8px_rgba(17,94,89,0.38),0_4px_16px_rgba(0,0,0,0.12)] border border-teal-500/30 dark:border-teal-700/50 flex flex-col justify-between transition-all duration-300 ease-in-out md:translate-x-0 overflow-hidden ${
          mobileOpen ? 'translate-x-0 w-72 sm:w-64' : '-translate-x-full'
        } ${collapsed ? 'md:w-[4.85rem]' : 'md:w-64'}`}
      >
        <div className="overflow-y-auto flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Brand Header with Inverted Authentic Logo */}
          <div
            className={`h-[4.5rem] px-4 flex items-center border-b border-teal-700/70 dark:border-teal-800/80 sticky top-0 bg-[#115E59]/95 dark:bg-[#0C433F]/95 backdrop-blur-md z-10 ${
              collapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            {!collapsed ? (
              <NavLink
                to="/"
                className="flex items-center group focus:outline-hidden min-w-0"
                title="KidsCare Ana Sayfa"
              >
                <KidsCareLogo size="md" showText={true} inverted={true} />
              </NavLink>
            ) : (
              <NavLink to="/" className="focus:outline-hidden" title="KidsCare Ana Sayfa">
                <KidsCareLogo size="sm" variant="icon" inverted={true} />
              </NavLink>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Menüyü Kapat"
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-teal-200 hover:text-white hover:bg-white/10 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grouped Navigation Links */}
          <div className="p-2.5 space-y-4">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                {!collapsed ? (
                  <div className="px-3 py-1 text-[11px] font-bold text-teal-200/90 uppercase tracking-wider">
                    {group.title}
                  </div>
                ) : (
                  <div className="h-px bg-teal-700/60 my-2.5 mx-2" title={group.title} />
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      title={item.label}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center transition-all duration-150 group rounded-2xl ${
                          collapsed
                            ? 'justify-center w-11 h-11 mx-auto'
                            : 'gap-3 px-3.5 py-2.5 text-xs font-semibold'
                        } ${
                          isActive
                            ? 'bg-white text-teal-900 font-bold shadow-[0_4px_14px_rgba(0,0,0,0.12)]'
                            : 'text-teal-100/85 hover:text-white hover:bg-white/12'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`shrink-0 transition-colors ${
                              collapsed ? 'w-5 h-5' : 'w-4 h-4'
                            } ${
                              isActive ? 'text-teal-800' : 'text-teal-200/80 group-hover:text-white'
                            }`}
                          />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* User Card & Collapsible Control Dock */}
        <div className="p-3 border-t border-teal-700/70 dark:border-teal-800/80 shrink-0 bg-[#0D4D49]/95 dark:bg-[#083330]/95">
          {!collapsed ? (
            <>
              <div className="p-2.5 rounded-2xl bg-white/12 border border-white/20 flex items-center justify-between gap-2 shadow-2xs backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  title="Profilimi Düzenle"
                  className="flex items-center gap-2.5 overflow-hidden text-left hover:opacity-90 transition-opacity cursor-pointer group flex-1 min-w-0"
                >
                  <div className="w-8 h-8 rounded-xl bg-white text-teal-900 font-black flex items-center justify-center text-xs shrink-0 shadow-xs overflow-hidden border border-white/40">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <div className="overflow-hidden min-w-0 flex-1">
                    <p
                      className="text-xs font-bold text-white truncate group-hover:underline"
                      title={userEmail || displayName}
                    >
                      {displayName}
                    </p>
                    <span className="inline-block text-[10px] font-semibold text-teal-200 mt-0.5">
                      {roleBadge.label}
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={logout}
                  title="Çıkış Yap"
                  className="p-1.5 text-teal-200 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Functional Sidebar Collapse Control Bar */}
              <button
                type="button"
                onClick={toggleCollapsed}
                className="w-full mt-2.5 px-3 py-2 rounded-xl bg-teal-950/40 hover:bg-white/15 border border-teal-600/30 hover:border-white/20 text-teal-100 hover:text-white flex items-center justify-between text-xs font-semibold transition-all cursor-pointer group shadow-2xs"
                title="Menüyü Daralt (Kısayol: Alt + M)"
              >
                <div className="flex items-center gap-2">
                  <PanelLeftClose className="w-4 h-4 text-teal-300 group-hover:text-white transition-colors" />
                  <span>Menüyü Daralt</span>
                </div>
                <kbd className="px-1.5 py-0.5 rounded bg-black/25 text-[10px] font-mono text-teal-300/90 border border-teal-700/40">
                  Alt+M
                </kbd>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-0.5">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="w-9 h-9 rounded-xl bg-white text-teal-900 font-black flex items-center justify-center text-xs shadow-xs cursor-pointer overflow-hidden border border-white/40 hover:scale-105 transition-transform"
                title={`${displayName} (${roleBadge.label}) - Profilimi Düzenle`}
              >
                {userAvatar ? (
                  <img src={userAvatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  userInitial
                )}
              </button>
              <button
                type="button"
                onClick={logout}
                title="Çıkış Yap"
                className="p-1.5 text-teal-200 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Functional Sidebar Expand Icon Button */}
              <button
                type="button"
                onClick={toggleCollapsed}
                className="w-10 h-10 mt-1 rounded-xl bg-white/12 hover:bg-white hover:text-teal-900 border border-white/20 text-teal-100 flex items-center justify-center transition-all cursor-pointer shadow-sm group"
                title="Menüyü Genişlet (Kısayol: Alt + M)"
              >
                <PanelLeftOpen className="w-5 h-5 text-teal-200 group-hover:text-teal-900 transition-colors" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ease-in-out ${
          collapsed ? 'md:pl-[5.85rem]' : 'md:pl-[17.5rem]'
        }`}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-[#F6F3EC]/85 dark:bg-[#090D16]/85 backdrop-blur-xl border-b border-[#E8E2D5]/70 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Menüyü Aç"
              className="p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="md:hidden">
              <NavLink to="/" className="flex items-center focus:outline-hidden">
                <KidsCareLogo size="sm" showText={true} />
              </NavLink>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white/95 dark:bg-slate-800/95 px-3.5 py-1.5 rounded-full border-[1.5px] border-[#DCD4C6] dark:border-slate-700/80 shadow-[0_2px_4px_rgba(28,25,23,0.04)]">
              <Calendar className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>{getTodayFormatted()}</span>
            </div>
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border-[1.5px] border-[#DCD4C6] dark:border-slate-700/70 text-xs text-slate-400 shadow-[0_2px_4px_rgba(28,25,23,0.04)] hover:border-teal-600/50 transition-colors">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400">Hızlı ara...</span>
              <kbd className="text-[10px] font-semibold bg-[#EFEAE0] dark:bg-slate-700/80 px-1.5 py-0.5 rounded-full text-slate-600 dark:text-slate-300 border border-[#DDD4C4]/60">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-teal-900 dark:text-teal-200 bg-teal-50/90 dark:bg-teal-950/50 border-[1.5px] border-teal-300/80 dark:border-teal-800/80 px-3.5 py-1.5 rounded-full font-semibold shadow-[0_2px_4px_rgba(15,118,110,0.08)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
              Kreş Aktif & Güvenli
            </div>
            <NotificationBell />
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Aydınlık Mod' : 'Karanlık Mod'}
              aria-label={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
              className="group p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 rounded-full transition-all duration-150 border-[1.5px] border-transparent hover:border-[#DCD4C6] dark:hover:border-slate-700 active:translate-y-[2px] active:scale-95 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            >
              {isDark ? (
                <Sun className="w-4.5 h-4.5 text-amber-400 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-teal-700 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
              )}
            </button>

            {/* Quick Profile Access Pill */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white dark:bg-slate-800 border-[1.5px] border-[#DCD4C6] dark:border-slate-700 hover:border-teal-600/60 dark:hover:border-teal-500/60 shadow-[0_2px_4px_rgba(0,0,0,0.04)] active:translate-y-[1px] transition-all cursor-pointer group"
              title="Profilimi Düzenle"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-teal-800 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-teal-600">
                {userAvatar ? (
                  <img src={userAvatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors truncate max-w-[120px]">
                  {displayName}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-none">
                  {roleBadge.label}
                </span>
              </div>
            </button>
          </div>
        </header>

        {/* Body Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav role={userRole} onOpenMenu={() => setMobileOpen(true)} />

      {/* Interactive Profile Edit Modal */}
      <ProfileEditModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
}
