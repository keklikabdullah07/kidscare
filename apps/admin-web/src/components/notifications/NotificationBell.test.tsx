import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationBell } from './NotificationBell';
import * as useNotificationsModule from './useNotifications';

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders bell button without badge when unreadCount is 0', () => {
    vi.spyOn(useNotificationsModule, 'useNotifications').mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      refresh: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      requestPermission: vi.fn(),
    });

    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>,
    );

    const btn = screen.getByRole('button', { name: /bildirimler/i });
    expect(btn).toBeDefined();
    expect(screen.queryByText('9+')).toBeNull();
  });

  it('renders badge with count when unreadCount > 0', () => {
    vi.spyOn(useNotificationsModule, 'useNotifications').mockReturnValue({
      notifications: [
        {
          id: '1',
          tenantId: 't-1',
          userId: 'u-1',
          title: 'Yeni Bildirim',
          body: 'Detay',
          type: 'SYSTEM',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      unreadCount: 3,
      loading: false,
      error: null,
      refresh: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      requestPermission: vi.fn(),
    });

    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>,
    );

    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByRole('button', { name: /3 okunmamış/i })).toBeDefined();
  });

  it('toggles popover when clicked', () => {
    vi.spyOn(useNotificationsModule, 'useNotifications').mockReturnValue({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      refresh: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      requestPermission: vi.fn(),
    });

    render(
      <MemoryRouter>
        <NotificationBell />
      </MemoryRouter>,
    );

    const btn = screen.getByRole('button', { name: /bildirimler/i });

    // Başlangıçta popover kapalı
    expect(screen.queryByText('Bildirim Merkezi')).toBeNull();

    // Tıklanınca açılır
    fireEvent.click(btn);
    expect(screen.getByText('Bildirim Merkezi')).toBeDefined();

    // Tekrar tıklanınca kapanır
    fireEvent.click(btn);
    expect(screen.queryByText('Bildirim Merkezi')).toBeNull();
  });
});
