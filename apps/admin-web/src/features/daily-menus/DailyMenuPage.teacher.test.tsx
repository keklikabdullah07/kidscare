import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { DailyMenuPage } from './DailyMenuPage';

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    state: {
      status: 'authenticated',
      user: {
        id: 'teacher-1',
        tenantId: 't-1',
        email: 'teacher@demo.test',
        role: 'TEACHER',
      },
      token: 'test-jwt',
    },
    login: async () => {},
    signup: async () => {},
    logout: () => {},
  }),
}));

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
  allergenWarnings: [],
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

describe('DailyMenuPage (Teacher)', () => {
  beforeEach(() => {
    localStorage.setItem('kidscare.token', 'test-jwt');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders menu in read-only mode for teacher and does NOT show save button', async () => {
    mockFetchByUrl({
      '/daily-menus': () => new Response(JSON.stringify(fakeMenuResponse), { status: 200 }),
    });

    render(<DailyMenuPage />);

    await waitFor(() => {
      expect(screen.getByText(/Kreş Yemek Menüsü/i)).toBeInTheDocument();
    });

    // Teachers must NOT have save button
    expect(screen.queryByRole('button', { name: /Menüyü Kaydet/i })).not.toBeInTheDocument();
  });
});
