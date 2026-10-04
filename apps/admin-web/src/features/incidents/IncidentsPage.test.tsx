import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { IncidentsPage } from './IncidentsPage';
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

const fakeStudents = [
  {
    id: 's-1',
    tenantId: 't-1',
    firstName: 'Ada',
    lastName: 'Yılmaz',
    dateOfBirth: '2021-05-10',
    gender: 'FEMALE',
    enrollmentStatus: 'ACTIVE',
    enrollmentDate: '2023-09-01',
    bloodType: 'A_POSITIVE',
    allergies: [],
    dietaryRestrictions: null,
    emergencyNotes: null,
    classroomId: null,
    createdAt: '2023-09-01T00:00:00.000Z',
    updatedAt: '2023-09-01T00:00:00.000Z',
  },
];

const fakeIncidents = [
  {
    id: 'i-1',
    tenantId: 't-1',
    studentId: 's-1',
    category: 'DUSME',
    occurredAt: '2026-09-15T10:00:00.000Z',
    description: 'Bahçede koşarken kayıp düştü',
    actionTaken: 'Dizine soğuk kompres ve yara bandı uygulandı',
    parentNotified: false,
    parentNotifiedAt: null,
    parentNotifiedById: null,
    reportedById: 'admin-1',
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
  },
  {
    id: 'i-2',
    tenantId: 't-1',
    studentId: 's-1',
    category: 'HASTALIK',
    occurredAt: '2026-09-15T11:30:00.000Z',
    description: 'Ateş 38.2 ölçüldü, revire alındı',
    actionTaken: 'Ilık uygulama yapıldı, dinlendirildi',
    parentNotified: true,
    parentNotifiedAt: '2026-09-15T11:45:00.000Z',
    parentNotifiedById: 'admin-1',
    reportedById: 'admin-1',
    createdAt: '2026-09-15T11:30:00.000Z',
    updatedAt: '2026-09-15T11:45:00.000Z',
  },
];

describe('IncidentsPage', () => {
  beforeEach(() => localStorage.setItem('kidscare.token', 'jwt'));
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders incident records with category badges, student names, and notification buttons', async () => {
    mockFetchByUrl({
      '/incidents': () => new Response(JSON.stringify(fakeIncidents), { status: 200 }),
      '/students': () => new Response(JSON.stringify(fakeStudents), { status: 200 }),
    });

    render(
      <ToastProvider>
        <IncidentsPage />
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Bahçede koşarken kayıp düştü')).toBeInTheDocument();
    });

    expect(screen.getByText(/Olay Kayıtları & Revir Takibi/i)).toBeInTheDocument();
    expect(screen.getAllByText('Ada Yılmaz').length).toBeGreaterThan(0);
    expect(screen.getByText('Düşme')).toBeInTheDocument();
    expect(screen.getByText('Hastalık / Ateş')).toBeInTheDocument();
    expect(screen.getByText('Veliye Bildirildi Olarak İşaretle')).toBeInTheDocument();
  });

  it('filters incident records via search input', async () => {
    mockFetchByUrl({
      '/incidents': () => new Response(JSON.stringify(fakeIncidents), { status: 200 }),
      '/students': () => new Response(JSON.stringify(fakeStudents), { status: 200 }),
    });

    render(
      <ToastProvider>
        <IncidentsPage />
      </ToastProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Bahçede koşarken kayıp düştü')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Olay açıklaması, ilk yardım notu veya öğrenci ara...',
    );
    fireEvent.change(searchInput, { target: { value: 'Ateş' } });

    expect(screen.getByText('Ateş 38.2 ölçüldü, revire alındı')).toBeInTheDocument();
    expect(screen.queryByText('Bahçede koşarken kayıp düştü')).not.toBeInTheDocument();
  });
});
