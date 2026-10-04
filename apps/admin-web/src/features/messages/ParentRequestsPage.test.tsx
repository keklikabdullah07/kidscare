import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParentRequestsPage } from './ParentRequestsPage';
import { ToastProvider } from '../../components/Toast';

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    state: {
      status: 'authenticated',
      user: { id: 'admin-1', tenantId: 't-1', email: 'admin@demo.test', role: 'ADMIN' },
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

const fakeRequests = [
  {
    id: 'pr-1',
    tenantId: 't-1',
    parentId: 'p-1',
    studentId: 's-1',
    type: 'IZIN',
    subject: 'Cuma Günü İzin',
    description: 'Doktor kontrolümüz var, gelemeyecek.',
    status: 'PENDING',
    createdAt: '2026-10-04T10:00:00.000Z',
    updatedAt: '2026-10-04T10:00:00.000Z',
  },
  {
    id: 'pr-2',
    tenantId: 't-1',
    parentId: 'p-2',
    studentId: null,
    type: 'BILGI_TALEP',
    subject: 'Etkinlik saati',
    description: 'Piknik saati kaçta başlayacak?',
    status: 'APPROVED',
    resolutionNote: 'Saat 10:00 da başlayacak.',
    createdAt: '2026-10-03T10:00:00.000Z',
    updatedAt: '2026-10-03T10:00:00.000Z',
  },
];

const fakeStudents = [
  {
    id: 's-1',
    firstName: 'Ada',
    lastName: 'Yılmaz',
    tenantId: 't-1',
    isActive: true,
  },
];

describe('ParentRequestsPage', () => {
  beforeEach(() => localStorage.setItem('kidscare.token', 'jwt'));
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders request list, KPI cards, and header', async () => {
    mockFetchByUrl({
      '/messaging/parent-requests': () =>
        new Response(JSON.stringify(fakeRequests), { status: 200 }),
      '/students': () => new Response(JSON.stringify(fakeStudents), { status: 200 }),
    });

    render(
      <ToastProvider>
        <ParentRequestsPage />
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Cuma Günü İzin')).toBeInTheDocument();
      expect(screen.getByText('TOPLAM TALEP')).toBeInTheDocument();
      expect(screen.getByText('BEKLEYENLER')).toBeInTheDocument();
      expect(screen.getByText('ONAYLANANLAR')).toBeInTheDocument();
      expect(screen.getByText('REDDEDİLENLER')).toBeInTheDocument();
    });

    expect(screen.getByText('Veli Talepleri')).toBeInTheDocument();
  });

  it('shows empty state when no requests are present', async () => {
    mockFetchByUrl({
      '/messaging/parent-requests': () => new Response(JSON.stringify([]), { status: 200 }),
      '/students': () => new Response(JSON.stringify([]), { status: 200 }),
    });

    render(
      <ToastProvider>
        <ParentRequestsPage />
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/kayıtlı talep bulunmuyor/i)).toBeInTheDocument();
    });
  });

  it('switches between tactile tabs', async () => {
    const user = userEvent.setup();
    mockFetchByUrl({
      '/messaging/parent-requests': () =>
        new Response(JSON.stringify(fakeRequests), { status: 200 }),
      '/students': () => new Response(JSON.stringify(fakeStudents), { status: 200 }),
    });

    render(
      <ToastProvider>
        <ParentRequestsPage />
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Cuma Günü İzin')).toBeInTheDocument();
    });

    const rejectedTab = screen.getByRole('tab', { name: /Reddedilenler/i });
    await user.click(rejectedTab);

    await waitFor(() => {
      expect(screen.getByText(/kayıtlı talep bulunmuyor/i)).toBeInTheDocument();
    });
  });
});
