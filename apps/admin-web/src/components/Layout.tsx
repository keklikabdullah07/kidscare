import { useState, type JSX } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { useTheme } from './ThemeContext';
import { KidsCareLogo } from './KidsCareLogo';
import { Badge, type BadgeVariant } from './ui/Badge';

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
            to: '/menus',
            label: 'Yemek Menüsü',
            icon: Utensils,
            description: 'Haftalık yemek planı',
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
          to: '/menus',
          label: 'Yemek Listesi',
          icon: Utensils,
          description: 'Öğünler ve alerjenler',
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
    default:
      return { label: role, variant: 'neutral' };
  }
}

export function Layout(): JSX.Element {
  const { state, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = state.status === 'authenticated' ? state.user.role : '';
  const userEmail = state.status === 'authenticated' ? state.user.email : '';
  const roleBadge = getRoleBadge(userRole);

  const displayName = (() => {
    if (userEmail && userEmail.includes('@')) {
      const prefix = userEmail.split('@')[0] ?? '';
      if (prefix) {
        return prefix.charAt(0).toUpperCase() + prefix.slice(1);
      }
    }
    const roleLabels: Record<string, string> = {
      SUPERADMIN: 'Süper Admin',
      ADMIN: 'Kreş Müdürü',
      TEACHER: 'Öğretmen',
      PARENT: 'Veli',
    };
    return roleLabels[userRole] || 'Kullanıcı';
  })();

  const userInitial = displayName.charAt(0).toUpperCase();
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

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-64 bg-[#FCFAF7]/95 dark:bg-[#0D1524]/95 backdrop-blur-xl border-r border-[#E8E2D5]/80 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="overflow-y-auto flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Brand Header with Authentic Logo */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#E8E2D5]/70 dark:border-slate-800 sticky top-0 bg-[#FCFAF7]/95 dark:bg-[#0D1524]/95 backdrop-blur-md z-10">
            <NavLink
              to="/"
              className="flex items-center group focus:outline-hidden"
              title="KidsCare Ana Sayfa"
            >
              <KidsCareLogo size="md" showText={true} />
            </NavLink>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Menüyü Kapat"
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grouped Navigation Links */}
          <div className="p-3 space-y-5">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group ${
                          isActive
                            ? 'bg-teal-800 text-white font-bold shadow-sm shadow-teal-950/20 dark:bg-teal-700 dark:text-white'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-[#EFEAE0]/80 dark:hover:bg-slate-800/80'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive
                                ? 'text-white dark:text-white'
                                : 'text-slate-400 dark:text-slate-400 group-hover:text-teal-700 dark:group-hover:text-teal-300'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-[#E8E2D5]/80 dark:border-slate-800/80 shrink-0 bg-[#FCFAF7]/95 dark:bg-[#0D1524]/95">
          <div className="p-2.5 rounded-2xl bg-[#EFEAE0]/80 dark:bg-slate-800/80 border border-[#E3DCCE]/80 dark:border-slate-700/80 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-teal-700 text-white dark:bg-teal-600 dark:text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                {userInitial}
              </div>
              <div className="overflow-hidden">
                <p
                  className="text-xs font-bold text-slate-900 dark:text-white truncate"
                  title={userEmail || displayName}
                >
                  {displayName}
                </p>
                <Badge variant={roleBadge.variant} size="sm" className="mt-0.5">
                  {roleBadge.label}
                </Badge>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Çıkış Yap"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-rose-400 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
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
          </div>
        </header>

        {/* Body Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
