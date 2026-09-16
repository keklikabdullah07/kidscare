import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { SignupPage } from './SignupPage';

function renderSignup(initialPath = '/signup'): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

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

describe('SignupPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders all four fields', () => {
    mockFetchByUrl({
      '/auth/me': () => new Response(JSON.stringify({ message: 'no token' }), { status: 401 }),
    });
    renderSignup();
    expect(screen.getByLabelText(/kreş adı/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kreş slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/admin e-posta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre/i)).toBeInTheDocument();
  });

  it('submits signup and stores token', async () => {
    const fetchSpy = mockFetchByUrl({
      '/auth/me': () => new Response(JSON.stringify({ message: 'no token' }), { status: 401 }),
      '/auth/signup': () =>
        new Response(
          JSON.stringify({
            token: 'new-jwt',
            user: {
              id: 'u-2',
              tenantId: 't-2',
              email: 'admin@yeni.com',
              role: 'ADMIN',
            },
          }),
          { status: 201 },
        ),
    });

    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByLabelText(/kreş adı/i), 'Yeni Kreş');
    await user.type(screen.getByLabelText(/kreş slug/i), 'yeni-kres');
    await user.type(screen.getByLabelText(/admin e-posta/i), 'admin@yeni.com');
    await user.type(screen.getByLabelText(/şifre/i), 'strongpass1');
    await user.click(screen.getByRole('button', { name: /kayıt ol/i }));

    await waitFor(() => {
      expect(localStorage.getItem('kidscare.token')).toBe('new-jwt');
    });
    const signupCall = fetchSpy.mock.calls.find(
      ([url]) => new URL(url as string, 'http://localhost').pathname === '/auth/signup',
    );
    expect(signupCall?.[1]?.method).toBe('POST');
    expect(JSON.parse(signupCall?.[1]?.body as string)).toEqual({
      tenantSlug: 'yeni-kres',
      tenantName: 'Yeni Kreş',
      email: 'admin@yeni.com',
      password: 'strongpass1',
    });
  });

  it('shows the slug-taken message on 409', async () => {
    mockFetchByUrl({
      '/auth/me': () => new Response(JSON.stringify({ message: 'no token' }), { status: 401 }),
      '/auth/signup': () => new Response(JSON.stringify({ message: 'Conflict' }), { status: 409 }),
    });

    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByLabelText(/kreş adı/i), 'Tekrar');
    await user.type(screen.getByLabelText(/kreş slug/i), 'ikinci-kres');
    await user.type(screen.getByLabelText(/admin e-posta/i), 'a@b.com');
    await user.type(screen.getByLabelText(/şifre/i), 'strongpass1');
    await user.click(screen.getByRole('button', { name: /kayıt ol/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/slug/i);
  });

  it('navigates to /login when the login link is clicked', async () => {
    mockFetchByUrl({
      '/auth/me': () => new Response(JSON.stringify({ message: 'no token' }), { status: 401 }),
    });
    const user = userEvent.setup();
    renderSignup();

    await user.click(screen.getByRole('link', { name: /giriş yap/i }));
    expect(await screen.findByText(/login page/i)).toBeInTheDocument();
  });
});
