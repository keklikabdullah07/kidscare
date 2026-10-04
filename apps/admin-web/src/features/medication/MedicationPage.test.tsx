import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MedicationPage } from './MedicationPage';
import { ToastProvider } from '../../components/Toast';

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
    const path = new URL(url, 'http://localhost').pathname;
    const handler = handlers[path];
    if (handler) return Promise.resolve(handler(init));
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

const fakeRecords = [
  {
    id: 'med-1',
    tenantId: 't-1',
    studentId: 's-1',
    medicationName: 'Calpol Şurup',
    dosage: '5ml',
    instructions: 'Yemekten sonra tok karnına',
    scheduledAt: '2026-09-15T13:00:00.000Z',
    givenAt: null,
    status: 'REQUESTED',
    requestedById: 'parent-1',
    approvedById: null,
    administeredById: null,
    parentApprovalNote: null,
    rejectionReason: null,
    skipReason: null,
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
  },
  {
    id: 'med-2',
    tenantId: 't-1',
    studentId: 's-1',
    medicationName: 'Ventolin İnhaler',
    dosage: '2 fıs',
    instructions: 'Nefes darlığı durumunda',
    scheduledAt: '2026-09-15T14:00:00.000Z',
    givenAt: null,
    status: 'APPROVED',
    requestedById: 'parent-1',
    approvedById: 'admin-1',
    administeredById: null,
    parentApprovalNote: null,
    rejectionReason: null,
    skipReason: null,
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
  },
];

function renderPage() {
  return render(
    <ToastProvider>
      <MedicationPage />
    </ToastProvider>,
  );
}

describe('MedicationPage', () => {
  beforeEach(() => {
    localStorage.setItem('kidscare.token', 'test-jwt');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders records with approve/reject buttons for admin', async () => {
    mockFetchByUrl({
      '/medication/records': () => new Response(JSON.stringify(fakeRecords), { status: 200 }),
      '/students': () => new Response(JSON.stringify(fakeStudents), { status: 200 }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/İlaç Takibi & Sağlık Kütüğü/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Calpol Şurup')).toBeInTheDocument();
    expect(screen.getByText('Ventolin İnhaler')).toBeInTheDocument();
    expect(screen.getByText('Onayla')).toBeInTheDocument();
    expect(screen.getByText('Reddet')).toBeInTheDocument();
    expect(screen.getByText('İlacı Ver')).toBeInTheDocument();
  });

  it('renders KPI cards and search filter', async () => {
    mockFetchByUrl({
      '/medication/records': () => new Response(JSON.stringify(fakeRecords), { status: 200 }),
      '/students': () => new Response(JSON.stringify(fakeStudents), { status: 200 }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Onay Bekleyenler').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('Günün Planları')).toBeInTheDocument();
    expect(screen.getByText('Tamamlanan / Verilen')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('İlaç adı, talimat veya öğrenci ara...');
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Ventolin' } });
    expect(screen.getByText('Ventolin İnhaler')).toBeInTheDocument();
    expect(screen.queryByText('Calpol Şurup')).not.toBeInTheDocument();
  });

  it('opens delete confirmation modal and deletes record when confirmed', async () => {
    let deletedId: string | null = null;
    let listCallCount = 0;

    mockFetchByUrl({
      '/medication/records': () => {
        listCallCount++;
        return new Response(JSON.stringify(listCallCount === 1 ? fakeRecords : [fakeRecords[1]]), {
          status: 200,
        });
      },
      '/students': () => new Response(JSON.stringify(fakeStudents), { status: 200 }),
      '/medication/records/med-1': (init) => {
        if (init?.method === 'DELETE') {
          deletedId = 'med-1';
          return new Response(null, { status: 204 });
        }
        return new Response(null, { status: 404 });
      },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Calpol Şurup')).toBeInTheDocument();
    });

    // Her iki kayıt için de "Sil" butonu bulunmalıdır (Admin rolünde)
    const deleteButtons = screen.getAllByRole('button', { name: /Sil/i });
    expect(deleteButtons.length).toBeGreaterThan(0);

    // İlk kaydın Sil butonuna tıkla
    const firstDeleteBtn = deleteButtons[0];
    expect(firstDeleteBtn).toBeDefined();
    fireEvent.click(firstDeleteBtn!);

    // Silme onay modalının açıldığını doğrula
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'İlaç Kaydını Sil' })).toBeInTheDocument();
      expect(
        screen.getByText(/isimli ilaç kaydını sistemden silmek istediğinize emin misiniz/i),
      ).toBeInTheDocument();
    });

    // "Evet, Sil" butonuna tıkla
    const confirmButton = screen.getByRole('button', { name: 'Evet, Sil' });
    fireEvent.click(confirmButton);

    // DELETE API çağrısının yapıldığını ve modalın kapandığını doğrula
    await waitFor(() => {
      expect(deletedId).toBe('med-1');
      expect(screen.queryByRole('heading', { name: 'İlaç Kaydını Sil' })).not.toBeInTheDocument();
    });
  });
});
