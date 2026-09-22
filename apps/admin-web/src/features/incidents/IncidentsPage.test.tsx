import { render, screen, waitFor } from '@testing-library/react';
import { IncidentsPage } from './IncidentsPage';
import { ToastProvider } from '../../components/Toast';

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    state: {
      status: 'authenticated',
      user: { id: 'admin-1', tenantId: 't-1', email: 'a@x', role: 'ADMIN' },
      token: 'jwt',
    },
    login: async () => {},
    signup: async () => {},
    logout: () => {},
  }),
}));

function mockFetchByUrl(handlers: Record<string, () => Response>) {
  return vi.spyOn(global, 'fetch').mockImplementation((...args: unknown[]) => {
    const [input] = args as [string | URL | Request];
    const url = input instanceof globalThis.Request ? input.url : String(input);
    const path = new URL(url, 'http://localhost').pathname;
    const handler = handlers[path];
    if (handler) return Promise.resolve(handler());
    return Promise.resolve(new Response(JSON.stringify({ message: 'unhandled' }), { status: 500 }));
  });
}

const fakeIncidents = [
  {
    id: 'i-1',
    tenantId: 't-1',
    studentId: 's-1',
    category: 'DUSME',
    occurredAt: '2026-09-15T10:00:00.000Z',
    description: 'Bahçede düştü',
    actionTaken: 'Buz konuldu',
    parentNotified: false,
    parentNotifiedAt: null,
    parentNotifiedById: null,
    reportedById: 'admin-1',
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
  },
];

describe('IncidentsPage', () => {
  beforeEach(() => localStorage.setItem('kidscare.token', 'jwt'));
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders incident records', async () => {
    mockFetchByUrl({
      '/incidents': () => new Response(JSON.stringify(fakeIncidents), { status: 200 }),
      '/students': () => new Response(JSON.stringify([]), { status: 200 }),
    });
    render(
      <ToastProvider>
        <IncidentsPage />
      </ToastProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText('Bahçede düştü')).toBeInTheDocument();
    });
    expect(screen.getByText('Olay Kayıtları')).toBeInTheDocument();
  });
});
