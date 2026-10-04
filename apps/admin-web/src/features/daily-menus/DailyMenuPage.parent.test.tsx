import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    state: {
      status: 'authenticated',
      user: {
        id: 'parent-1',
        tenantId: 't-1',
        email: 'parent@demo.test',
        role: 'PARENT',
      },
      token: 'test-jwt',
    },
    login: async () => {},
    signup: async () => {},
    logout: () => {},
  }),
}));

import { DailyMenuPage } from './DailyMenuPage';

const fakeMenuResponse = {
  menu: {
    id: 'menu-1',
    tenantId: 't-1',
    date: '2026-09-15',
    breakfast: ['Haşlanmış Yumurta', 'Beyaz Peynir'],
    lunch: ['Mercimek Çorbası', 'Köfte'],
    snack: ['Fıstıklı Kurabiye'],
    allergens: ['Yumurta', 'Fıstık'],
    calories: 900,
    notes: 'Taze',
    createdAt: '2026-09-15T00:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z',
  },
  allergenWarnings: [
    {
      studentId: 's-1',
      studentName: 'Ada Yılmaz',
      matchedAllergens: ['Fıstık'],
    },
  ],
};

function mockFetchByUrl(handlers: Record<string, (init?: RequestInit) => Response>) {
  return vi.spyOn(global, 'fetch').mockImplementation((...args: unknown[]) => {
    const [input, init] = args as [string | URL | Request, RequestInit | undefined];
    const url = input instanceof globalThis.Request ? input.url : String(input);
    const path = new URL(url, 'http://localhost').pathname;
    const handler = handlers[path];
    if (handler) return Promise.resolve(handler(init));
    return Promise.resolve(new Response(JSON.stringify({ message: 'unhandled' }), { status: 500 }));
  });
}

describe('DailyMenuPage (Parent)', () => {
  beforeEach(() => {
    localStorage.setItem('kidscare.token', 'test-jwt');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders meal tabs and filters breakfast card when LUNCH tab is active', async () => {
    mockFetchByUrl({
      '/daily-menus': () => new Response(JSON.stringify(fakeMenuResponse), { status: 200 }),
    });

    const user = userEvent.setup();
    render(<DailyMenuPage />);

    const tab = await screen.findByRole('tab', { name: /Öğle Yemeği/i });
    await user.click(tab);

    await waitFor(() => {
      // Breakfast item hidden once LUNCH tab filters it out
      expect(screen.queryByText(/Haşlanmış Yumurta/i)).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Mercimek Çorbası/i)).toBeInTheDocument();
  });
});
