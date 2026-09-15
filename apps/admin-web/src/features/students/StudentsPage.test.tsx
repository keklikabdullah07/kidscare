import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudentsPage } from './StudentsPage';

const fakeStudents = [
  {
    id: 's-1',
    tenantId: 't-1',
    firstName: 'Ada',
    lastName: 'Yılmaz',
    dateOfBirth: '2020-05-12',
    gender: 'female',
    notes: 'Fıstık alerjisi',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
  },
];

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

describe('StudentsPage', () => {
  beforeEach(() => {
    localStorage.setItem('kidscare.token', 'test-jwt');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders the students list from the API', async () => {
    mockFetchByUrl({
      '/students': () => new Response(JSON.stringify(fakeStudents), { status: 200 }),
    });

    render(<StudentsPage />);
    await waitFor(() => {
      expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
    });
    expect(screen.getByText('2020-05-12')).toBeInTheDocument();
    expect(screen.getByText('female')).toBeInTheDocument();
    expect(screen.getByText('Aktif')).toBeInTheDocument();
  });

  it('shows an empty-state message when there are no students', async () => {
    mockFetchByUrl({
      '/students': () => new Response(JSON.stringify([]), { status: 200 }),
    });

    render(<StudentsPage />);
    expect(await screen.findByText(/henüz öğrenci yok/i)).toBeInTheDocument();
  });

  it('shows an error when the API fails', async () => {
    mockFetchByUrl({
      '/students': () => new Response(JSON.stringify({ message: 'boom' }), { status: 500 }),
    });

    render(<StudentsPage />);
    expect(await screen.findByText(/yüklenemedi/i)).toBeInTheDocument();
  });

  it('opens the new-student form and submits a POST', async () => {
    const fetchSpy = mockFetchByUrl({
      '/students': (init) => {
        if (init?.method === 'POST') {
          return new Response(
            JSON.stringify({
              ...fakeStudents[0],
              id: 's-new',
              firstName: 'Can',
              lastName: 'Demir',
              dateOfBirth: '2019-08-23',
            }),
            { status: 201 },
          );
        }
        return new Response(JSON.stringify([]), { status: 200 });
      },
    });

    const user = userEvent.setup();
    render(<StudentsPage />);
    await user.click(screen.getByRole('button', { name: /yeni öğrenci/i }));

    await user.type(screen.getByLabelText(/^ad$/i), 'Can');
    await user.type(screen.getByLabelText(/^soyad$/i), 'Demir');
    await user.type(screen.getByLabelText(/doğum tarihi/i), '2019-08-23');
    await user.click(screen.getByRole('button', { name: /^ekle$/i }));

    await waitFor(() => {
      expect(screen.getByText('Can Demir')).toBeInTheDocument();
    });

    const postCall = fetchSpy.mock.calls.find(
      ([, init]) => (init)?.method === 'POST',
    );
    expect(postCall).toBeDefined();
    expect(JSON.parse((postCall?.[1] as RequestInit).body as string)).toEqual({
      firstName: 'Can',
      lastName: 'Demir',
      dateOfBirth: '2019-08-23',
      gender: undefined,
      notes: undefined,
    });
  });
});
