import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { LoginPage } from './LoginPage';

function renderLogin(initialPath = '/login'): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<div>Signup page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

/**
 * Build a fetch spy that responds based on URL. React 18 StrictMode
 * runs effects twice, which would consume a fixed `mockResolvedValueOnce`
 * queue prematurely; a single `mockImplementation` keyed by path is
 * order-independent.
 */
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

describe('LoginPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders the login form', async () => {
    mockFetchByUrl({
      '/auth/me': () => new Response(JSON.stringify({ message: 'no token' }), { status: 401 }),
    });
    renderLogin();
    expect(await screen.findByRole('heading', { name: /giriş/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/kreş slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-posta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre/i)).toBeInTheDocument();
  });

  it('submits credentials and stores token on success', async () => {
    const fetchSpy = mockFetchByUrl({
      '/auth/me': () => new Response(JSON.stringify({ message: 'no token' }), { status: 401 }),
      '/auth/login': () =>
        new Response(
          JSON.stringify({
            token: 'jwt-abc',
            user: {
              id: 'u-1',
              tenantId: 't-1',
              email: 'a@b.com',
              role: 'ADMIN',
            },
          }),
          { status: 200 },
        ),
    });

    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/kreş slug/i), 'demo');
    await user.type(screen.getByLabelText(/e-posta/i), 'a@b.com');
    await user.type(screen.getByLabelText(/şifre/i), 'pass1234');
    await user.click(screen.getByRole('button', { name: /giriş yap/i }));

    await waitFor(() => {
      expect(localStorage.getItem('kidscare.token')).toBe('jwt-abc');
    });
    const loginCall = fetchSpy.mock.calls.find(
      ([url]) => new URL(url as string, 'http://localhost').pathname === '/auth/login',
    );
    expect(loginCall?.[1]?.method).toBe('POST');
    expect(JSON.parse(loginCall?.[1]?.body as string)).toEqual({
      tenantSlug: 'demo',
      email: 'a@b.com',
      password: 'pass1234',
    });
  });

  it('shows an error message on 401', async () => {
    mockFetchByUrl({
      '/auth/me': () => new Response(JSON.stringify({ message: 'no token' }), { status: 401 }),
      '/auth/login': () =>
        new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
        }),
    });

    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/kreş slug/i), 'demo');
    await user.type(screen.getByLabelText(/e-posta/i), 'a@b.com');
    await user.type(screen.getByLabelText(/şifre/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /giriş yap/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/yanlış/i);
  });

  it('navigates to /signup when the signup link is clicked', async () => {
    mockFetchByUrl({
      '/auth/me': () => new Response(JSON.stringify({ message: 'no token' }), { status: 401 }),
    });
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('link', { name: /kayıt ol/i }));
    expect(await screen.findByText(/signup page/i)).toBeInTheDocument();
  });
});
