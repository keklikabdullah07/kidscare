import { render, screen, waitFor } from '@testing-library/react';
import { vi, beforeEach } from 'vitest';
import { MessagesPage } from './MessagesPage';
import { ToastProvider } from '../../components/Toast';

const { mockUseAuth } = vi.hoisted(() => {
  const state: { userRole: 'PARENT' | 'TEACHER' | 'ADMIN'; userId: string } = {
    userRole: 'ADMIN',
    userId: 'admin-1',
  };
  return { mockUseAuth: state };
});

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    state: {
      status: 'authenticated',
      user: {
        id: mockUseAuth.userId,
        tenantId: 't-1',
        email: `${mockUseAuth.userRole.toLowerCase()}@demo.test`,
        role: mockUseAuth.userRole,
      },
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

function renderPage() {
  return render(
    <ToastProvider>
      <MessagesPage />
    </ToastProvider>,
  );
}

describe('MessagesPage (Adaptive)', () => {
  beforeEach(() => {
    localStorage.setItem('kidscare.token', 'jwt');
    mockUseAuth.userRole = 'ADMIN';
    mockUseAuth.userId = 'admin-1';
  });
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('PARENT view does not render any Sınıf filter dropdown', async () => {
    mockUseAuth.userRole = 'PARENT';
    mockUseAuth.userId = 'parent-1';

    mockFetchByUrl({
      '/messaging/conversations': () => new Response(JSON.stringify([]), { status: 200 }),
      '/students': () => new Response(JSON.stringify([]), { status: 200 }),
      '/classrooms': () => new Response(JSON.stringify([]), { status: 200 }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText(/Mesajlaşma/i).length).toBeGreaterThan(0);
    });

    // Mesajlaşma sayfasında Sınıf filtresi YOK — Spec 0062 AC-5 zaten sağlanmış
    expect(screen.queryByLabelText('Sınıf Filtresi')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Sınıf Seç')).not.toBeInTheDocument();
  });
});
