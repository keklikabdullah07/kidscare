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
  Sparkles,
  School,
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
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { useTheme } from './ThemeContext';

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

function getRoleBadge(role: string): { label: string; color: string } {
  switch (role) {
    case 'SUPER_ADMIN':
      return {
        label: 'Süper Admin',
        color:
          'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
      };
    case 'ADMIN':
      return {
        label: 'Yönetici / Müdür',
        color:
          'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
      };
    case 'TEACHER':
      return {
        label: 'Öğretmen',
        color:
          'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      };
    case 'PARENT':
      return {
        label: 'Veli',
        color:
          'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      };
    default:
      return {
        label: role,
        color:
          'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      };
  }
}

export function Layout(): JSX.Element {
  const { state, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = state.status === 'authenticated' ? state.user.role : '';
  const userEmail = state.status === 'authenticated' ? state.user.email || state.user.id : '';
  const roleBadge = getRoleBadge(userRole);
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'K';
  const navGroups = getNavGroupsForRole(userRole);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="overflow-y-auto flex-1">
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5 text-teal-100" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  KidsCare
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold border border-teal-200/80 dark:border-teal-800/80">
                    V1
                  </span>
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <School className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                  Demo Kreş
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grouped Navigation Links */}
          <div className="p-3 space-y-5">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                        `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                          isActive
                            ? 'bg-teal-50 text-teal-900 font-semibold ring-1 ring-teal-200/80 shadow-xs dark:bg-teal-950/50 dark:text-teal-200 dark:ring-teal-800/70'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive
                                ? 'text-teal-700 dark:text-teal-300'
                                : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
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
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-teal-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {userInitial}
              </div>
              <div className="overflow-hidden">
                <p
                  className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate"
                  title={userEmail}
                >
                  {userEmail}
                </p>
                <span
                  className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded border mt-0.5 ${roleBadge.color}`}
                >
                  {roleBadge.label}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Çıkış Yap"
              className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-100/70 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
              <Calendar className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>{getTodayFormatted()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-800/60 px-3 py-1.5 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 animate-pulse"></span>
              Sistem Aktif & Güvenli
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Aydınlık Mod' : 'Karanlık Mod'}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
