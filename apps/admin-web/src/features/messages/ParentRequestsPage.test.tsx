import { render, screen, waitFor } from '@testing-library/react';
import { ParentRequestsPage } from './ParentRequestsPage';
import { ToastProvider } from '../../components/Toast';

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    state: {
      status: 'authenticated',
      user: { id: 'parent-1', tenantId: 't-1', email: 'p@x', role: 'PARENT' },
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

describe('ParentRequestsPage', () => {
  beforeEach(() => localStorage.setItem('kidscare.token', 'jwt'));
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders empty state for parent with no requests', async () => {
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
      expect(screen.getByText('Talep yok.')).toBeInTheDocument();
    });
    expect(screen.getByText('Veli Talepleri')).toBeInTheDocument();
  });
});
