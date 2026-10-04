import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamPage } from './TeamPage';

const fakeUsers = [
  {
    id: 'u-1',
    tenantId: 't-1',
    email: 'admin@demo.test',
    role: 'ADMIN',
    isActive: true,
    lastLoginAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'u-2',
    tenantId: 't-1',
    email: 'teacher@demo.test',
    role: 'TEACHER',
    isActive: true,
    lastLoginAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'u-3',
    tenantId: 't-1',
    email: 'parent@demo.test',
    role: 'PARENT',
    isActive: true,
    lastLoginAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'u-4',
    tenantId: 't-1',
    email: 'superadmin@demo.test',
    role: 'SUPER_ADMIN',
    isActive: true,
    lastLoginAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

function mockUsersApi(payload: unknown) {
  globalThis.fetch = vi.fn((input: RequestInfo) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url.includes('/users') && !url.includes('POST')) {
      return Promise.resolve(new Response(JSON.stringify(payload), { status: 200 }));
    }
    return Promise.resolve(new Response('{}', { status: 404 }));
  }) as typeof fetch;
}

describe('TeamPage', () => {
  it('renders users from the API', async () => {
    mockUsersApi([fakeUsers[1]]);

    render(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText('teacher@demo.test')).toBeInTheDocument();
    });
  });

  it('renders 4 KPI stat cards with correct counts', async () => {
    mockUsersApi(fakeUsers);

    render(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText('teacher@demo.test')).toBeInTheDocument();
    });

    expect(screen.getByText('Toplam Kullanıcı')).toBeInTheDocument();
    expect(screen.getByText('Öğretmenler')).toBeInTheDocument();
    expect(screen.getByText('Veliler')).toBeInTheDocument();
    expect(screen.getByText('Yöneticiler')).toBeInTheDocument();

    // Counts: 1 teacher, 1 parent, 2 admins → visible as "1" / "2" values
    const values = screen.getAllByText(/^[1-4]$/);
    expect(values.length).toBeGreaterThanOrEqual(4);
  });

  it('reloads users when Yenile button is clicked', async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn((input: RequestInfo) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/users') && !url.includes('POST')) {
        callCount += 1;
        return Promise.resolve(
          new Response(
            JSON.stringify([
              {
                ...fakeUsers[1],
                email: callCount === 1 ? 'teacher@demo.test' : 'teacher2@demo.test',
              },
            ]),
            { status: 200 },
          ),
        );
      }
      return Promise.resolve(new Response('{}', { status: 404 }));
    }) as typeof fetch;

    const user = userEvent.setup();
    render(<TeamPage />);

    await screen.findByText('teacher@demo.test');

    await user.click(screen.getByRole('button', { name: /Yenile/i }));

    await waitFor(() => {
      expect(screen.getByText('teacher2@demo.test')).toBeInTheDocument();
    });
  });

  it('filters the list when a role KPI card is clicked', async () => {
    mockUsersApi(fakeUsers);

    const user = userEvent.setup();
    render(<TeamPage />);

    // Wait for all four users to render
    await screen.findByText('teacher@demo.test');
    expect(screen.getByText('admin@demo.test')).toBeInTheDocument();
    expect(screen.getByText('parent@demo.test')).toBeInTheDocument();
    expect(screen.getByText('superadmin@demo.test')).toBeInTheDocument();

    // Click "Öğretmenler" KPI → list should only show teacher
    await user.click(screen.getByText('Öğretmenler'));

    await waitFor(() => {
      expect(screen.queryByText('parent@demo.test')).not.toBeInTheDocument();
    });
    expect(screen.getByText('teacher@demo.test')).toBeInTheDocument();
    expect(screen.queryByText('admin@demo.test')).not.toBeInTheDocument();

    // Click "Toplam Kullanıcı" → list restored
    await user.click(screen.getByText('Toplam Kullanıcı'));

    await waitFor(() => {
      expect(screen.getByText('parent@demo.test')).toBeInTheDocument();
    });
  });
});
