import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AttendancePage } from './AttendancePage';

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
    passport: {
      id: 'p-1',
      tenantId: 't-1',
      studentId: 's-1',
      bloodType: 'A_POSITIVE',
      allergies: ['Fıstık'],
      chronicConditions: [],
      specialNotes: null,
      emergencyContacts: [
        {
          name: 'Zeynep Yılmaz',
          relationship: 'Anne',
          phoneNumber: '05551112233',
          isAuthorizedPickup: true,
        },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  },
  {
    id: 's-2',
    tenantId: 't-1',
    firstName: 'Can',
    lastName: 'Demir',
    dateOfBirth: '2019-08-23',
    gender: 'male',
    notes: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
  },
];

const fakeAttendance = [
  {
    id: 'att-1',
    tenantId: 't-1',
    studentId: 's-1',
    date: '2026-09-15',
    status: 'PRESENT',
    checkInTime: '08:30',
    checkInBy: 'Anne',
    checkOutTime: null,
    checkOutBy: null,
    pickupNote: null,
    createdAt: '2026-09-15T08:30:00.000Z',
    updatedAt: '2026-09-15T08:30:00.000Z',
  },
];

function mockFetchByUrl(handlers: Record<string, (init?: RequestInit) => Response>) {
  return vi.spyOn(global, 'fetch').mockImplementation((...args: unknown[]) => {
    const [input, init] = args as [string | URL | Request, RequestInit | undefined];
    const url = input instanceof globalThis.Request ? input.url : String(input);
    const path = new URL(url, 'http://localhost').pathname;
    // First try exact path, then any pattern handler (key starts with '*')
    const exact = handlers[path];
    if (exact) return Promise.resolve(exact(init));
    const patternKey = Object.keys(handlers).find((k) => k.startsWith('*') && path.includes(k.slice(1)));
    if (patternKey) return Promise.resolve(handlers[patternKey]!(init));
    return Promise.resolve(new Response(JSON.stringify({ message: 'unhandled' }), { status: 500 }));
  });
}

describe('AttendancePage', () => {
  beforeEach(() => {
    localStorage.setItem('kidscare.token', 'test-jwt');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders student list and calculates attendance stats correctly', async () => {
    mockFetchByUrl({
      '/students': () => new Response(JSON.stringify(fakeStudents), { status: 200 }),
      '/attendance': () => new Response(JSON.stringify(fakeAttendance), { status: 200 }),
    });

    render(<AttendancePage />);

    await waitFor(() => {
      expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
      expect(screen.getByText('Can Demir')).toBeInTheDocument();
    });

    // Check Ada's status (PRESENT)
    expect(screen.getByText(/Giriş Yaptı \(Mevcut\)/i)).toBeInTheDocument();
    expect(screen.getByText('08:30')).toBeInTheDocument();

    // Stats
    expect(screen.getByText('Toplam Öğrenci')).toBeInTheDocument();
  });

  it('shows empty message when no students exist', async () => {
    mockFetchByUrl({
      '/students': () => new Response(JSON.stringify([]), { status: 200 }),
      '/attendance': () => new Response(JSON.stringify([]), { status: 200 }),
    });

    render(<AttendancePage />);
    expect(await screen.findByText(/kayıtlı öğrenci bulunamadı/i)).toBeInTheDocument();
  });

  it('handles quick check-in for an absent student', async () => {
    let checkInCalled = false;
    mockFetchByUrl({
      '/students': () => new Response(JSON.stringify([fakeStudents[1]]), { status: 200 }),
      '/attendance': () => new Response(JSON.stringify([]), { status: 200 }),
      // The page uses `new Date().toISOString().slice(0,10)` for the URL,
      // which changes every calendar day. Match any YYYY-MM-DD segment.
      '*students/s-2/attendance/': (init) => {
        if (init?.method === 'POST') {
          checkInCalled = true;
          return new Response(
            JSON.stringify({
              id: 'att-2',
              tenantId: 't-1',
              studentId: 's-2',
              date: '2026-09-15',
              status: 'PRESENT',
              checkInTime: '09:00',
              checkInBy: null,
              checkOutTime: null,
              checkOutBy: null,
              pickupNote: null,
            }),
            { status: 200 },
          );
        }
        return new Response(null, { status: 400 });
      },
    });

    const user = userEvent.setup();
    render(<AttendancePage />);

    await waitFor(() => {
      expect(screen.getByText('Can Demir')).toBeInTheDocument();
    });

    const checkInBtn = screen.getByRole('button', { name: /giriş yap/i });
    await user.click(checkInBtn);

    await waitFor(() => {
      expect(checkInCalled).toBe(true);
      expect(screen.getByText('09:00')).toBeInTheDocument();
    });
  });

  it('opens checkout modal when clicking "Teslim Et" for a present student', async () => {
    mockFetchByUrl({
      '/students': () => new Response(JSON.stringify([fakeStudents[0]]), { status: 200 }),
      '/attendance': () => new Response(JSON.stringify(fakeAttendance), { status: 200 }),
    });

    const user = userEvent.setup();
    render(<AttendancePage />);

    await waitFor(() => {
      expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
    });

    const deliverBtn = screen.getByRole('button', { name: /teslim et/i });
    await user.click(deliverBtn);

    await waitFor(() => {
      expect(screen.getByText(/Güvenli Teslim & Çıkış/i)).toBeInTheDocument();
      expect(screen.getByText('Zeynep Yılmaz')).toBeInTheDocument();
    });
  });
});
