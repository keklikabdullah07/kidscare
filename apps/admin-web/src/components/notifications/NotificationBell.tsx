import { useState, type JSX } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from './useNotifications';
import { NotificationPopover } from './NotificationPopover';

export function NotificationBell(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, requestPermission } =
    useNotifications();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Bildirimler${unreadCount > 0 ? ` (${unreadCount} okunmamış)` : ''}`}
        aria-expanded={isOpen}
        title="Bildirimler"
        className="relative group p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 rounded-full transition-all duration-150 border-[1.5px] border-transparent hover:border-[#DCD4C6] dark:hover:border-slate-700 active:translate-y-[2px] active:scale-95 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
      >
        <Bell className="w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-105" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-white bg-rose-600 dark:bg-rose-500 rounded-full border-2 border-[#F6F3EC] dark:border-[#090D16] shadow-xs animate-in zoom-in-75 duration-150">
            {unreadCount > 9 ? '9+' : unreadCount}
            <span className="absolute inset-0 rounded-full bg-rose-400 opacity-60 animate-ping -z-10" />
          </span>
        )}
      </button>

      <NotificationPopover
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onMarkAsRead={(id) => {
          void markAsRead(id);
        }}
        onMarkAllAsRead={() => {
          void markAllAsRead();
        }}
        onRequestPermission={requestPermission}
      />
    </div>
  );
}
