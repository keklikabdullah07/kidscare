import { type JSX, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  LogOut,
  BookOpenCheck,
  Pill,
  Megaphone,
  Info,
  Check,
  Sparkles,
} from 'lucide-react';
import type { NotificationItem, NotificationType } from '@kidscare/shared-types';

interface NotificationPopoverProps {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRequestPermission: () => Promise<NotificationPermission | null>;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Az önce';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} dk önce`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} sa önce`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

function getNotificationMeta(type: NotificationType): {
  icon: typeof Bell;
  iconBg: string;
  iconColor: string;
  defaultPath?: string;
} {
  switch (type) {
    case 'ATTENDANCE_CHECK_IN':
      return {
        icon: CheckCircle2,
        iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
        iconColor: 'text-emerald-700 dark:text-emerald-400',
        defaultPath: '/attendance',
      };
    case 'ATTENDANCE_CHECK_OUT':
      return {
        icon: LogOut,
        iconBg: 'bg-amber-100 dark:bg-amber-950/60',
        iconColor: 'text-amber-700 dark:text-amber-400',
        defaultPath: '/attendance',
      };
    case 'DAILY_REPORT_SAVED':
      return {
        icon: BookOpenCheck,
        iconBg: 'bg-teal-100 dark:bg-teal-950/60',
        iconColor: 'text-teal-700 dark:text-teal-300',
        defaultPath: '/tracking',
      };
    case 'MEDICATION_GIVEN':
      return {
        icon: Pill,
        iconBg: 'bg-purple-100 dark:bg-purple-950/60',
        iconColor: 'text-purple-700 dark:text-purple-300',
        defaultPath: '/medication',
      };
    case 'ANNOUNCEMENT':
      return {
        icon: Megaphone,
        iconBg: 'bg-orange-100 dark:bg-orange-950/60',
        iconColor: 'text-orange-700 dark:text-orange-400',
        defaultPath: '/dashboard',
      };
    case 'SYSTEM':
    default:
      return {
        icon: Info,
        iconBg: 'bg-slate-100 dark:bg-slate-800',
        iconColor: 'text-slate-700 dark:text-slate-300',
        defaultPath: '/dashboard',
      };
  }
}

export function NotificationPopover({
  notifications,
  unreadCount,
  loading,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onRequestPermission,
}: NotificationPopoverProps): JSX.Element | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Dışarı tıklandığında popover'ı kapat
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showPermissionBanner =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'default';

  const handleItemClick = (item: NotificationItem) => {
    if (!item.isRead) {
      onMarkAsRead(item.id);
    }
    const meta = getNotificationMeta(item.type);
    if (meta.defaultPath) {
      void navigate(meta.defaultPath);
    }
    onClose();
  };

  return (
    <div
      ref={containerRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-[#FCFAF7] dark:bg-[#131B2E] border-2 border-[#DDD4C4] dark:border-slate-800 rounded-3xl shadow-[0_12px_36px_rgba(17,94,89,0.12),0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-[#F6F3EC] dark:bg-[#0E1524] border-b border-[#DDD4C4] dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-700/10 dark:bg-teal-400/10 flex items-center justify-center text-teal-800 dark:text-teal-300">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Bildirim Merkezi
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {unreadCount > 0 ? `${unreadCount} yeni bildirim` : 'Tümü okundu'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-teal-800 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800/80 rounded-xl transition-colors cursor-pointer active:scale-95"
          >
            <Check className="w-3 h-3" />
            <span>Tümünü Oku</span>
          </button>
        )}
      </div>

      {/* Tarayıcı İzin Banner'ı */}
      {showPermissionBanner && (
        <div className="px-3.5 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-[11px] font-medium text-amber-900 dark:text-amber-200 truncate">
              Masaüstü anlık bildirimlerini etkinleştirin
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onRequestPermission()}
            className="px-2.5 py-1 text-[10px] font-bold text-amber-900 dark:text-amber-100 bg-amber-200/80 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            İzin Ver
          </button>
        </div>
      )}

      {/* Bildirim Listesi */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#EFEAE0] dark:divide-slate-800/60 [scrollbar-width:thin]">
        {loading && notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
            Bildirimler yükleniyor...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 mx-auto flex items-center justify-center mb-2.5 border border-teal-100 dark:border-teal-900/50">
              <Bell className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Henüz bildiriminiz yok
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Yoklama, karne veya ilaç kayıtları burada görünecektir.
            </p>
          </div>
        ) : (
          notifications.map((item) => {
            const meta = getNotificationMeta(item.type);
            const Icon = meta.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3 sm:p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-left ${
                  item.isRead
                    ? 'hover:bg-[#F6F3EC]/70 dark:hover:bg-slate-800/40 opacity-75 hover:opacity-100'
                    : 'bg-white dark:bg-[#162035] hover:bg-teal-50/40 dark:hover:bg-slate-800/80 border-l-3 border-teal-600 dark:border-teal-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl ${meta.iconBg} ${meta.iconColor} flex items-center justify-center shrink-0 mt-0.5 shadow-2xs`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`text-xs truncate ${
                        item.isRead
                          ? 'font-semibold text-slate-800 dark:text-slate-200'
                          : 'font-bold text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 shrink-0 font-medium">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                    {item.body}
                  </p>
                </div>
                {!item.isRead && (
                  <span
                    className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 shrink-0 mt-2 shadow-xs"
                    title="Okunmadı"
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-3.5 py-2 bg-[#F6F3EC] dark:bg-[#0E1524] border-t border-[#DDD4C4] dark:border-slate-800 text-center">
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          KidsCare Anlık Bildirim Sistemi
        </span>
      </div>
    </div>
  );
}
