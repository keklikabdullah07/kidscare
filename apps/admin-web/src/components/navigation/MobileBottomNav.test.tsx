import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { MobileBottomNav } from './MobileBottomNav';

describe('MobileBottomNav', () => {
  it('renders admin tabs and triggers menu toggle on click', () => {
    const onOpenMenu = vi.fn();
    render(
      <MemoryRouter>
        <MobileBottomNav role="ADMIN" onOpenMenu={onOpenMenu} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Gösterge')).toBeDefined();
    expect(screen.getByText('Öğrenciler')).toBeDefined();
    expect(screen.getByText('Yoklama')).toBeDefined();
    expect(screen.getByText('İlaç')).toBeDefined();
    const menuBtn = screen.getByText('Menü');
    menuBtn.click();
    expect(onOpenMenu).toHaveBeenCalledTimes(1);
  });

  it('renders teacher tabs for TEACHER role', () => {
    const onOpenMenu = vi.fn();
    render(
      <MemoryRouter>
        <MobileBottomNav role="TEACHER" onOpenMenu={onOpenMenu} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Akış')).toBeDefined();
    expect(screen.getByText('Yoklama')).toBeDefined();
    expect(screen.getByText('Karne')).toBeDefined();
    expect(screen.getByText('İlaç')).toBeDefined();
    expect(screen.getByText('Menü')).toBeDefined();
  });

  it('renders parent tabs for PARENT role', () => {
    const onOpenMenu = vi.fn();
    render(
      <MemoryRouter>
        <MobileBottomNav role="PARENT" onOpenMenu={onOpenMenu} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Portal')).toBeDefined();
    expect(screen.getByText('İlaç')).toBeDefined();
    expect(screen.getByText('Teslimat')).toBeDefined();
    expect(screen.getByText('Mesajlar')).toBeDefined();
    expect(screen.getByText('Menü')).toBeDefined();
  });

  it('renders service staff tabs for SERVICE_STAFF role', () => {
    const onOpenMenu = vi.fn();
    render(
      <MemoryRouter>
        <MobileBottomNav role="SERVICE_STAFF" onOpenMenu={onOpenMenu} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Servis')).toBeDefined();
    expect(screen.getByText('Mesajlar')).toBeDefined();
    expect(screen.getByText('Menü')).toBeDefined();
    expect(screen.queryByText('Yoklama')).toBeNull();
    expect(screen.queryByText('Gösterge')).toBeNull();
  });
});
