import { render, screen, waitFor } from '@testing-library/react';
import { DailyTrackingPage } from './DailyTrackingPage';

const fakeStudents = [
  {
    id: 's-1',
    tenantId: 't-1',
    firstName: 'Ada',
    lastName: 'Yılmaz',
    dateOfBirth: '2020-05-12',
    gender: 'female',
    notes: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
  },
];

const fakeReports = [
  {
    id: 'dr-1',
    tenantId: 't-1',
    studentId: 's-1',
    date: new Date().toISOString().slice(0, 10),
    mood: 'HAPPY',
    meals: { breakfast: 'ALL', lunch: 'ALL', afternoonSnack: 'ALL' },
    naps: { startTime: '13:00', endTime: '14:30', quality: 'GOOD' },
    potty: [{ id: 'p-1', time: '10:30', type: 'POTTY' }],
    activities: ['Oyun'],
    teacherNote: 'Harika bir gün',
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T15:00:00.000Z',
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

const fakeClassrooms = [
  {
    id: 'c-1',
    tenantId: 't-1',
    name: 'Arılar',
    ageGroup: '3-4',
    isActive: true,
    teachers: [],
    studentCount: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const fakeDailyFlow = {
  classroom: { id: 'c-1', name: 'Arılar', ageGroup: '3-4' },
  date: new Date().toISOString().slice(0, 10),
  students: [
    {
      student: {
        id: 's-1',
        firstName: 'Ada',
        lastName: 'Yılmaz',
        isActive: true,
      },
      attendance: null,
      dailyReport: fakeReports[0] ?? null,
    },
  ],
};

describe('DailyTrackingPage', () => {
  beforeEach(() => {
    localStorage.setItem('kidscare.token', 'test-jwt');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders classroom card grid and student cards with daily tracking highlights', async () => {
    mockFetchByUrl({
      '/classrooms': () => new Response(JSON.stringify(fakeClassrooms), { status: 200 }),
      '/students': () => new Response(JSON.stringify(fakeStudents), { status: 200 }),
      '/daily-reports': () => new Response(JSON.stringify(fakeReports), { status: 200 }),
      '/classrooms/c-1/daily-flow': () =>
        new Response(JSON.stringify(fakeDailyFlow), { status: 200 }),
    });

    render(<DailyTrackingPage />);
    await waitFor(() => {
      expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
    });

    expect(screen.getByText('Arılar')).toBeInTheDocument();
    expect(screen.getByText('Mutlu')).toBeInTheDocument();
    expect(screen.getByText('13:00 - 14:30')).toBeInTheDocument();
    expect(screen.getByText('1 kayıt')).toBeInTheDocument();
    expect(screen.getByText('"Harika bir gün"')).toBeInTheDocument();
  });

  it('shows empty message when there are no classrooms', async () => {
    mockFetchByUrl({
      '/classrooms': () => new Response(JSON.stringify([]), { status: 200 }),
      '/students': () => new Response(JSON.stringify([]), { status: 200 }),
      '/daily-reports': () => new Response(JSON.stringify([]), { status: 200 }),
    });

    render(<DailyTrackingPage />);
    expect(await screen.findByText(/atanmış sınıf bulunamadı/i)).toBeInTheDocument();
  });
});
