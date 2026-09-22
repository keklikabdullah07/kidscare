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
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { useTheme } from './ThemeContext';

type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
  description?: string;
};

const allNavItems: NavItem[] = [
  { to: '/portal', label: 'Veli Portalı', icon: Home, description: 'Öğrenci genel durumu' },
  {
    to: '/dashboard',
    label: 'Ana Panel',
    icon: LayoutDashboard,
    description: 'Günün özeti ve durum',
  },
  { to: '/students', label: 'Öğrenciler', icon: Users, description: 'Sınıf ve öğrenci listesi' },
  { to: '/attendance', label: 'Yoklama', icon: CheckCircle2, description: 'Günlük katılım takibi' },
  {
    to: '/tracking',
    label: 'Günlük Takip',
    icon: BookOpenCheck,
    description: 'Yemek, uyku & karne',
  },
  { to: '/menus', label: 'Yemek Listesi', icon: Utensils, description: 'Öğünler ve menü planı' },
  {
    to: '/gallery',
    label: 'Etkinlik Galerisi',
    icon: Camera,
    description: 'Fotoğraf ve duyurular',
  },
  { to: '/team', label: 'Ekip & Veliler', icon: UserCog, description: 'Öğretmen ve veli hesapları' },
  { to: '/pickup', label: 'Teslim Yetkileri', icon: ShieldCheck, description: 'Veli talepleri ve olaylar' },
  { to: '/medication', label: 'İlaç Takibi', icon: Pill, description: 'İlaç talepleri ve uygulama' },
  { to: '/messages', label: 'Mesajlar', icon: MessageSquare, description: 'Veli-personel iletişim' },
  { to: '/requests', label: 'Veli Talepleri', icon: ClipboardList, description: 'İzin ve bilgi talepleri' },
  { to: '/incidents', label: 'Olay Kayıtları', icon: AlertTriangle, description: 'Güvenlik olayları' },
  { to: '/settings', label: 'Kreş Ayarları', icon: Settings, description: 'Genel yapılandırma' },
];

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
      return { label: 'Süper Admin', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    case 'ADMIN':
      return {
        label: 'Yönetici / Müdür',
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      };
    case 'TEACHER':
      return { label: 'Öğretmen', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'PARENT':
      return { label: 'Veli', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    default:
      return { label: role, color: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

export function Layout(): JSX.Element {
  const { state, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isParent = state.status === 'authenticated' && state.user.role === 'PARENT';
  const isTeacher = state.status === 'authenticated' && state.user.role === 'TEACHER';

  const items = isParent
    ? allNavItems.filter((n) => n.to === '/portal' || n.to === '/menus' || n.to === '/gallery')
    : isTeacher
      ? allNavItems.filter(
          (n) => n.to !== '/portal' && n.to !== '/settings' && n.to !== '/team',
        )
      : allNavItems.filter((n) => n.to !== '/portal');

  const userRole = state.status === 'authenticated' ? state.user.role : '';
  const userEmail = state.status === 'authenticated' ? state.user.email || state.user.id : '';
  const roleBadge = getRoleBadge(userRole);
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'K';

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  KidsCare
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                    V1
                  </span>
                </span>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <School className="w-3 h-3 text-amber-500" />
                  Demo Kreş
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Menü
            </div>
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-amber-50 text-amber-900 font-semibold shadow-xs border-l-4 border-amber-500'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                {userInitial}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-900 truncate">{userEmail}</p>
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
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>{getTodayFormatted()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Aydınlık Mod' : 'Karanlık Mod'}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistem Aktif
            </div>
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
