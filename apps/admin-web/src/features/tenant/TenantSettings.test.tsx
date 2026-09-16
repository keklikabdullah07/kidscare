import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TenantSettings } from './TenantSettings';

const fakeTenant = {
  id: 'demo-tenant-seed-001',
  slug: 'demo-kres',
  name: 'Demo Kreş',
  status: 'ACTIVE' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('TenantSettings', () => {
  beforeEach(() => {
    // apiFetch reads the Bearer token from localStorage; pre-populate so
    // the component sees an authenticated request.
    localStorage.setItem('kidscare.token', 'test-jwt');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  function mockFetchByUrl(handlers: Record<string, (init?: RequestInit) => Response>) {
    return vi.spyOn(global, 'fetch').mockImplementation((...args: unknown[]) => {
      const [input, init] = args as [string | URL | Request, RequestInit | undefined];
      const url = input instanceof globalThis.Request ? input.url : String(input);
      const path = new URL(url, 'http://localhost').pathname;
      const handler = handlers[path];
      if (handler) return Promise.resolve(handler(init));
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'unhandled' }), { status: 500 }),
      );
    });
  }

  it('renders tenant data fetched from the API', async () => {
    mockFetchByUrl({
      '/tenants/me': () => new Response(JSON.stringify(fakeTenant), { status: 200 }),
    });

    render(<TenantSettings />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('Demo Kreş')).toBeInTheDocument();
    });
    expect(screen.getByText('demo-kres')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('shows an error when the API fails', async () => {
    mockFetchByUrl({
      '/tenants/me': () => new Response(JSON.stringify({ message: 'boom' }), { status: 500 }),
    });

    render(<TenantSettings />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/boom/);
  });

  it('sends PATCH on save and shows the updated name', async () => {
    const fetchSpy = mockFetchByUrl({
      '/tenants/me': (init) => {
        if (init?.method === 'PATCH') {
          return new Response(JSON.stringify({ ...fakeTenant, name: 'Yeni Ad' }), { status: 200 });
        }
        return new Response(JSON.stringify(fakeTenant), { status: 200 });
      },
    });

    const user = userEvent.setup();
    render(<TenantSettings />);
    const input = await screen.findByDisplayValue('Demo Kreş');

    await user.clear(input);
    await user.type(input, 'Yeni Ad');
    await user.click(screen.getByRole('button', { name: /kaydet/i }));

    await waitFor(() => {
      expect(screen.getByDisplayValue('Yeni Ad')).toBeInTheDocument();
    });
    const patchCall = fetchSpy.mock.calls.find(([, init]) => init?.method === 'PATCH');
    expect(patchCall).toBeDefined();
    const patchInit = patchCall?.[1];
    expect(JSON.parse(patchInit?.body as string)).toEqual({ name: 'Yeni Ad' });
  });
});
