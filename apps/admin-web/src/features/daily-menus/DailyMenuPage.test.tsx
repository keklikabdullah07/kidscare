import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DailyMenuPage } from './DailyMenuPage';

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    state: {
      status: 'authenticated',
      user: { id: 'admin-1', tenantId: 't-1', email: 'admin@demo.test', role: 'ADMIN' },
      token: 'jwt-123',
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

describe('DailyMenuPage', () => {
  beforeEach(() => {
    localStorage.setItem('kidscare.token', 'test-jwt');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders current menu and allergen warning banner', async () => {
    mockFetchByUrl({
      '/daily-menus': () => new Response(JSON.stringify(fakeMenuResponse), { status: 200 }),
    });

    render(<DailyMenuPage />);

    await waitFor(() => {
      expect(screen.getByText(/Alerjen Riski Uyarısı/i)).toBeInTheDocument();
      expect(screen.getByText('Ada Yılmaz:')).toBeInTheDocument();
      expect(screen.getByText('Fıstık')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue(/Haşlanmış Yumurta/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Mercimek Çorbası/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Fıstıklı Kurabiye/i)).toBeInTheDocument();
  });

  it('submits form to update menu', async () => {
    let savedBody: unknown = null;

    mockFetchByUrl({
      '/auth/me': () =>
        new Response(JSON.stringify({ userId: 'u-1', tenantId: 't-1', role: 'ADMIN' }), {
          status: 200,
        }),
      '/daily-menus': (init) => {
        if (init?.method === 'POST') {
          savedBody = JSON.parse(init.body as string);
          return new Response(
            JSON.stringify({
              menu: {
                ...fakeMenuResponse.menu,
                breakfast: ['Yulaf Ezmesi'],
              },
              allergenWarnings: [],
            }),
            { status: 201 },
          );
        }
        return new Response(JSON.stringify(fakeMenuResponse), { status: 200 });
      },
    });

    const user = userEvent.setup();
    render(<DailyMenuPage />);

    await waitFor(() => {
      expect(screen.getByText(/Sabah Kahvaltısı/i)).toBeInTheDocument();
    });

    const saveBtn = await screen.findByRole('button', { name: /Kreş Menüsünü Kaydet/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Kreş menüsü başarıyla kaydedildi!/i)).toBeInTheDocument();
    });
    expect(savedBody).not.toBeNull();
  });
});
