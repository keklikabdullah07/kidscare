import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { NotificationPopover } from './NotificationPopover';
import type { NotificationItem } from '@kidscare/shared-types';

const mockNotifications: NotificationItem[] = [
  {
    id: 'n-1',
    tenantId: 't-1',
    userId: 'u-1',
    title: 'Yoklama Girişi Yapıldı',
    body: 'Ada Yılmaz sınıfa giriş yaptı.',
    type: 'ATTENDANCE_CHECK_IN',
    isRead: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'n-2',
    tenantId: 't-1',
    userId: 'u-1',
    title: 'Günlük Karne Paylaşıldı',
    body: 'Ada Yılmaz için günlük rapor hazırlandı.',
    type: 'DAILY_REPORT_SAVED',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

describe('NotificationPopover', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <MemoryRouter>
        <NotificationPopover
          notifications={mockNotifications}
          unreadCount={1}
          loading={false}
          isOpen={false}
          onClose={vi.fn()}
          onMarkAsRead={vi.fn()}
          onMarkAllAsRead={vi.fn()}
          onRequestPermission={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders notifications list and unread count when open', () => {
    render(
      <MemoryRouter>
        <NotificationPopover
          notifications={mockNotifications}
          unreadCount={1}
          loading={false}
          isOpen={true}
          onClose={vi.fn()}
          onMarkAsRead={vi.fn()}
          onMarkAllAsRead={vi.fn()}
          onRequestPermission={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Bildirim Merkezi')).toBeDefined();
    expect(screen.getByText('1 yeni bildirim')).toBeDefined();
    expect(screen.getByText('Yoklama Girişi Yapıldı')).toBeDefined();
    expect(screen.getByText('Günlük Karne Paylaşıldı')).toBeDefined();
    expect(screen.getByText('Tümünü Oku')).toBeDefined();
  });

  it('calls onMarkAsRead and closes when an unread item is clicked', () => {
    const onMarkAsRead = vi.fn();
    const onClose = vi.fn();

    render(
      <MemoryRouter>
        <NotificationPopover
          notifications={mockNotifications}
          unreadCount={1}
          loading={false}
          isOpen={true}
          onClose={onClose}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={vi.fn()}
          onRequestPermission={vi.fn()}
        />
      </MemoryRouter>,
    );

    const item = screen.getByText('Yoklama Girişi Yapıldı');
    fireEvent.click(item);

    expect(onMarkAsRead).toHaveBeenCalledWith('n-1');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onMarkAllAsRead when "Tümünü Oku" button is clicked', () => {
    const onMarkAllAsRead = vi.fn();

    render(
      <MemoryRouter>
        <NotificationPopover
          notifications={mockNotifications}
          unreadCount={1}
          loading={false}
          isOpen={true}
          onClose={vi.fn()}
          onMarkAsRead={vi.fn()}
          onMarkAllAsRead={onMarkAllAsRead}
          onRequestPermission={vi.fn()}
        />
      </MemoryRouter>,
    );

    const btn = screen.getByText('Tümünü Oku');
    fireEvent.click(btn);

    expect(onMarkAllAsRead).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when there are no notifications', () => {
    render(
      <MemoryRouter>
        <NotificationPopover
          notifications={[]}
          unreadCount={0}
          loading={false}
          isOpen={true}
          onClose={vi.fn()}
          onMarkAsRead={vi.fn()}
          onMarkAllAsRead={vi.fn()}
          onRequestPermission={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Henüz bildiriminiz yok')).toBeDefined();
    expect(screen.getByText('Tümü okundu')).toBeDefined();
  });
});
