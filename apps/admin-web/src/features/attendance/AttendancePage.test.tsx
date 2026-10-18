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

const fakeClassrooms = [
  {
    id: 'cls-arilar',
    name: 'Arılar Sınıfı',
    ageGroup: '3-4 Yaş',
    capacity: 15,
    isActive: true,
  },
  {
    id: 'cls-kelebekler',
    name: 'Kelebekler Sınıfı',
    ageGroup: '4-5 Yaş',
    capacity: 15,
    isActive: true,
  },
];

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    state: {
      status: 'authenticated',
      user: {
        id: 'admin-1',
        tenantId: 't-1',
        email: 'admin@demo.test',
        role: 'ADMIN',
      },
      token: 'test-jwt',
    },
    login: async () => {},
    signup: async () => {},
    logout: () => {},
  }),
}));

function mockFetchByUrl(handlers: Record<string, (init?: RequestInit) => Response>) {
  return vi.spyOn(global, 'fetch').mockImplementation((...args: unknown[]) => {
    const [input, init] = args as [string | URL | Request, RequestInit | undefined];
    const url = input instanceof globalThis.Request ? input.url : String(input);
    const rawPath = new URL(url, 'http://localhost').pathname;
    const path = rawPath.replace(/^\/api/, '');
    // First try exact path, then any pattern handler (key starts with '*')
    const exact = handlers[path] ?? handlers[rawPath];
    if (exact) return Promise.resolve(exact(init));
    const patternKey = Object.keys(handlers).find(
      (k) => k.startsWith('*') && (path.includes(k.slice(1)) || rawPath.includes(k.slice(1))),
    );
    if (patternKey) return Promise.resolve(handlers[patternKey]!(init));
    if (path === '/classrooms' || path === '/users') {
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    }
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
      expect(screen.getAllByText('Zeynep Yılmaz').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays allergy badge with tooltip in table view and in grid view', async () => {
    mockFetchByUrl({
      '/students': () => new Response(JSON.stringify(fakeStudents), { status: 200 }),
      '/attendance': () => new Response(JSON.stringify(fakeAttendance), { status: 200 }),
    });

    const user = userEvent.setup();
    render(<AttendancePage />);

    await waitFor(() => {
      expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
    });

    // In table view, Ada should have an allergy badge with tooltip 'Fıstık'
    const allergyBadge = screen.getByTitle('Fıstık');
    expect(allergyBadge).toBeInTheDocument();
    expect(allergyBadge).toHaveTextContent('1 Alerji');

    // Switch to Grid view
    const gridBtn = screen.getByTitle('Kart Görünümü');
    await user.click(gridBtn);

    // In grid view, allergy badge should still be present with tooltip 'Fıstık'
    const gridAllergyBadge = screen.getByTitle('Fıstık');
    expect(gridAllergyBadge).toBeInTheDocument();
  });

  it('renders classroom breakdown cards for admin showing live attendance metrics', async () => {
    const fakeClassrooms = [
      {
        id: 'cls-1',
        name: 'Papatyalar Sınıfı',
        ageGroup: '4-5 Yaş',
        capacity: 15,
        isActive: true,
        teachers: [{ classroomId: 'cls-1', teacherId: 't-1' }],
      },
    ];

    const fakeTeachers = [
      {
        id: 't-1',
        email: 'ayse.ogretmen@demo.test',
        role: 'TEACHER',
      },
    ];

    const studentsWithClass = [
      { ...fakeStudents[0], classroomId: 'cls-1' },
      { ...fakeStudents[1], classroomId: 'cls-1' },
    ];

    mockFetchByUrl({
      '/students': () => new Response(JSON.stringify(studentsWithClass), { status: 200 }),
      '/attendance': () => new Response(JSON.stringify(fakeAttendance), { status: 200 }),
      '/classrooms': () => new Response(JSON.stringify(fakeClassrooms), { status: 200 }),
      '/users': () => new Response(JSON.stringify(fakeTeachers), { status: 200 }),
    });

    render(<AttendancePage />);

    await waitFor(() => {
      expect(
        screen.getByText('Sınıflara Göre Canlı Katılım & Yoklama Dağılımı'),
      ).toBeInTheDocument();
      expect(screen.getAllByText('Papatyalar Sınıfı').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('1 Geldi').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('1 Gelmedi').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('%50 Katılım')).toBeInTheDocument();
    });
  });

  it('updates lower stats cards dynamically when a specific classroom card is clicked', async () => {
    const studentArilar = {
      ...fakeStudents[0],
      id: 's-arilar',
      firstName: 'Ali',
      classroomId: 'cls-arilar',
    };
    const studentKelebekler = {
      ...fakeStudents[1],
      id: 's-kelebekler',
      firstName: 'Ayşe',
      classroomId: 'cls-kelebekler',
    };

    const multiAttendance = [
      {
        id: 'att-1',
        tenantId: 't-1',
        studentId: 's-arilar',
        date: '2026-09-15',
        status: 'EXCUSED',
      },
      {
        id: 'att-2',
        tenantId: 't-1',
        studentId: 's-kelebekler',
        date: '2026-09-15',
        status: 'PRESENT',
      },
    ];

    mockFetchByUrl({
      '/students': () =>
        new Response(JSON.stringify([studentArilar, studentKelebekler]), { status: 200 }),
      '/attendance': () => new Response(JSON.stringify(multiAttendance), { status: 200 }),
      '/classrooms': () => new Response(JSON.stringify(fakeClassrooms), { status: 200 }),
      '/users': () => new Response(JSON.stringify([]), { status: 200 }),
    });

    const user = userEvent.setup();
    render(<AttendancePage />);

    // Başlangıçta Tüm Kreş seçilidir: Toplam 2 öğrenci
    await waitFor(() => {
      expect(screen.getAllByText('Arılar Sınıfı').length).toBeGreaterThanOrEqual(1);
    });

    // Arılar Sınıfı kartına tıkla
    const arilarBtn = screen.getByTitle('Arılar Sınıfı').closest('button')!;
    await user.click(arilarBtn);

    // Arılar sınıfında 1 öğrenci var ve o da İZİNLİ
    await waitFor(() => {
      expect(screen.getAllByText(/Arılar Sınıfı/).length).toBeGreaterThanOrEqual(2);
    });

    const excusedBtn = screen.getAllByText('İzinli / Raporlu')[0]!.closest('button')!;
    expect(excusedBtn).toHaveTextContent('1');
  });

  it('opens MEB official attendance sheet modal with classroom filter and monthly data', async () => {
    mockFetchByUrl({
      '/students': () => new Response(JSON.stringify(fakeStudents), { status: 200 }),
      '/attendance': () => new Response(JSON.stringify(fakeAttendance), { status: 200 }),
      '/classrooms': () => new Response(JSON.stringify(fakeClassrooms), { status: 200 }),
      '/users': () => new Response(JSON.stringify([]), { status: 200 }),
    });

    const user = userEvent.setup();
    render(<AttendancePage />);

    await waitFor(() => {
      expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
    });

    const mebPrintBtn = screen.getByText(/MEB Çizelgesi Yazdır/i).closest('button')!;
    await user.click(mebPrintBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/T\.C\. MİLLÎ EĞİTİM BAKANLIĞI RESMÎ TEFTİŞ & ARŞİV FORMATI/i),
      ).toBeInTheDocument();
      expect(screen.getByText('Kütük No')).toBeInTheDocument();
      expect(screen.getByText('D.Yılı (Yaş)')).toBeInTheDocument();
    });
  });
});
