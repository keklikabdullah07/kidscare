import { render, screen, waitFor } from '@testing-library/react';
import { MessagesPage } from './MessagesPage';
import { ToastProvider } from '../../components/Toast';

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    state: {
      status: 'authenticated',
      user: { id: 'u-1', tenantId: 't-1', email: 'a@x', role: 'ADMIN' },
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

const fakeConvos = [
  {
    id: 'c-1',
    tenantId: 't-1',
    subject: 'Yemek bildirimi',
    category: 'GUNLUK_BILGI',
    status: 'OPEN',
    isCritical: false,
    studentId: null,
    createdById: 'u-2',
    participantIds: ['u-1', 'u-2'],
    lastMessageAt: '2026-09-15T10:00:00.000Z',
    unreadCount: 0,
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
  },
];

describe('MessagesPage', () => {
  beforeEach(() => localStorage.setItem('kidscare.token', 'jwt'));
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders conversation list', async () => {
    mockFetchByUrl({
      '/messaging/conversations': () => new Response(JSON.stringify(fakeConvos), { status: 200 }),
      '/students': () => new Response(JSON.stringify([]), { status: 200 }),
    });
    render(
      <ToastProvider>
        <MessagesPage />
      </ToastProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText('Yemek bildirimi')).toBeInTheDocument();
    });
    expect(screen.getByText('Mesajlar')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    mockFetchByUrl({
      '/messaging/conversations': () => new Response(JSON.stringify([]), { status: 200 }),
      '/students': () => new Response(JSON.stringify([]), { status: 200 }),
    });
    render(
      <ToastProvider>
        <MessagesPage />
      </ToastProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText(/henüz sohbet yok/i)).toBeInTheDocument();
    });
  });
});
