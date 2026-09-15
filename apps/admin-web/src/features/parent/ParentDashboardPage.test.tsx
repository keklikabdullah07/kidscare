import { render, screen, waitFor } from '@testing-library/react';
import { ParentDashboardPage } from './ParentDashboardPage';

const fakeOverview = [
  {
    student: {
      id: 's-1',
      tenantId: 't-1',
      parentId: 'u-parent',
      firstName: 'Ada',
      lastName: 'Yılmaz',
      dateOfBirth: '2020-05-12',
      gender: 'Kız',
      notes: null,
      passport: {
        bloodType: 'A+',
        allergies: ['Fıstık'],
        dietaryRestrictions: [],
        chronicConditions: [],
        regularMedications: [],
        emergencyContacts: [],
      },
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      deletedAt: null,
    },
    todayAttendance: {
      id: 'att-1',
      tenantId: 't-1',
      studentId: 's-1',
      date: '2026-09-15',
      status: 'PRESENT',
      checkInTime: '08:30',
      checkOutTime: null,
      note: null,
      createdAt: '2026-09-15T08:30:00.000Z',
      updatedAt: '2026-09-15T08:30:00.000Z',
    },
    todayDailyReport: {
      id: 'rep-1',
      tenantId: 't-1',
      studentId: 's-1',
      date: '2026-09-15',
      mood: 'HAPPY',
      meals: {
        breakfast: 'ALL',
        lunch: 'HALF',
        afternoonSnack: 'ALL',
      },
      naps: {
        startTime: '13:00',
        endTime: '14:30',
        quality: 'GOOD',
      },
      potty: [{ id: 'p-1', time: '10:00', type: 'POTTY' }],
      activities: ['Resim', 'Oyun'],
      teacherNote: 'Bugün çok neşeliydi.',
      medications: [],
      createdAt: '2026-09-15T12:00:00.000Z',
      updatedAt: '2026-09-15T12:00:00.000Z',
    },
  },
];

const fakeMenu = {
  menu: {
    id: 'm-1',
    tenantId: 't-1',
    date: '2026-09-15',
    breakfast: ['Yumurta', 'Peynir'],
    lunch: ['Çorba', 'Köfte'],
    snack: ['Fıstıklı Kurabiye'],
    allergens: ['Fıstık'],
    calories: 850,
    notes: null,
    createdAt: '2026-09-15T00:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z',
  },
  allergenWarnings: [],
};

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

describe('ParentDashboardPage', () => {
  beforeEach(() => {
    localStorage.setItem('kidscare.token', 'test-jwt');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders student live status, daily report and allergy warnings', async () => {
    mockFetchByUrl({
      '/parent/children': () =>
        new Response(JSON.stringify({ data: fakeOverview }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      '/daily-menus': () =>
        new Response(JSON.stringify(fakeMenu), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    });

    render(<ParentDashboardPage />);

    expect(screen.getByText('Bilgiler yükleniyor, lütfen bekleyin...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
    });

    // Check Live status
    expect(screen.getByText(/Okulda/i)).toBeInTheDocument();

    // Check Allergy alert
    expect(screen.getByText('Önemli Alerji Uyarısı!')).toBeInTheDocument();
    expect(screen.getByText(/Bugünkü yemek menüsünde Ada'in alerjisi olan/i)).toBeInTheDocument();

    // Check Daily report details
    expect(screen.getByText('😊 Çok Mutlu')).toBeInTheDocument();
    expect(screen.getByText('"Bugün çok neşeliydi."')).toBeInTheDocument();
    expect(screen.getByText('13:00 - 14:30')).toBeInTheDocument();

    // Check Menu
    expect(screen.getByText(/Fıstıklı Kurabiye/i)).toBeInTheDocument();
  });
});
