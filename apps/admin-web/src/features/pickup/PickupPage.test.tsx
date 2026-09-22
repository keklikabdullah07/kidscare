import { render, screen, waitFor } from '@testing-library/react';
import { PickupPage } from './PickupPage';
import { ToastProvider } from '../../components/Toast';

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    state: {
      status: 'authenticated',
      user: {
        id: 'admin-1',
        tenantId: 't-1',
        email: 'admin@demo.test',
        role: 'ADMIN',
      },
      token: 'test-jwt',
    },
    login: async () => {},
    signup: async () => {},
    logout: () => {},
  }),
}));

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

const fakeAuthorizations = [
  {
    id: 'pa-1',
    tenantId: 't-1',
    studentId: 's-1',
    pickupContactId: null,
    requestedById: 'parent-1',
    reviewedById: null,
    status: 'PENDING',
    validFrom: null,
    validUntil: null,
    note: 'Geçici yetki',
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
  },
];

function renderPage() {
  return render(
    <ToastProvider>
      <PickupPage />
    </ToastProvider>,
  );
}

describe('PickupPage', () => {
  beforeEach(() => {
    localStorage.setItem('kidscare.token', 'test-jwt');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders pending authorizations with approve/reject buttons for admin', async () => {
    mockFetchByUrl({
      '/pickup/authorizations': () =>
        new Response(JSON.stringify(fakeAuthorizations), { status: 200 }),
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Teslim Yetkileri')).toBeInTheDocument();
    });
    expect(screen.getByText('Onayla')).toBeInTheDocument();
    expect(screen.getByText('Reddet')).toBeInTheDocument();
    expect(screen.getByText('"Geçici yetki"')).toBeInTheDocument();
  });

  it('shows empty state when no authorizations', async () => {
    mockFetchByUrl({
      '/pickup/authorizations': () => new Response(JSON.stringify([]), { status: 200 }),
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/bu kategoride kayıt yok/i)).toBeInTheDocument();
    });
  });
});
