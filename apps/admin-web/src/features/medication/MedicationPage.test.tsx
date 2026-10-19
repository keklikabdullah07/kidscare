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
    if (path === '/classrooms' || path === '/users') {
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    }
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

  it('displays allergy warning in modal when selecting an allergic student, and shows allergy badge on medication card', async () => {
    const studentWithAllergy = {
      ...fakeStudents[0],
      id: 's-allergy',
      firstName: 'Barış',
      lastName: 'Demir',
      passport: {
        bloodType: '0_POSITIVE',
        allergies: ['Fıstık', 'Laktoz'],
      },
    };

    const allergyRecord = {
      ...fakeRecords[0],
      id: 'med-allergy',
      studentId: 's-allergy',
      medicationName: 'Ventolin Şurup',
    };

    mockFetchByUrl({
      '/medication/records': () => new Response(JSON.stringify([allergyRecord]), { status: 200 }),
      '/students': () => new Response(JSON.stringify([studentWithAllergy]), { status: 200 }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Ventolin Şurup')).toBeInTheDocument();
    });

    // Check card renders allergy badge for student with allergy
    expect(screen.getByText('Fıstık, Laktoz')).toBeInTheDocument();

    // Open new medication modal
    const addBtn = screen.getByRole('button', { name: /Yeni İlaç/i });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Yeni İlaç Kullanım Talebi' }),
      ).toBeInTheDocument();
    });

    // Select the student with allergy in modal
    const select = screen.getByTestId('modal-student-select');
    fireEvent.change(select, { target: { value: 's-allergy' } });

    // Expect allergy warning alert to appear
    await waitFor(() => {
      const alert = screen.getByTestId('medication-allergy-alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(/Bu öğrencinin kayıtlı alerjisi bulunmaktadır/i);
      expect(alert).toHaveTextContent(/Fıstık, Laktoz/i);
    });
  });

  it('allows teacher or admin to administer medication and mark as given', async () => {
    let givenCalled = false;
    let givenPayload: Record<string, unknown> | null = null;

    mockFetchByUrl({
      '/medication/records': () => {
        return new Response(JSON.stringify(fakeRecords), { status: 200 });
      },
      '/students': () => new Response(JSON.stringify(fakeStudents), { status: 200 }),
      '/medication/records/med-2/given': (init) => {
        givenCalled = true;
        if (init?.body) {
          givenPayload = JSON.parse(init.body as string);
        }
        return new Response(
          JSON.stringify({
            ...fakeRecords[1],
            status: 'GIVEN',
            givenAt: '2026-09-15T14:05:00.000Z',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Ventolin İnhaler')).toBeInTheDocument();
    });

    // İlacı Ver butonuna tıkla
    const giveBtn = screen.getByRole('button', { name: /İlacı Ver/i });
    expect(giveBtn).toBeInTheDocument();
    fireEvent.click(giveBtn);

    // Uygulama modalının açıldığını doğrula
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /İlaç Uygulamasını Kaydet/i }),
      ).toBeInTheDocument();
    });

    // İsteğe bağlı not alanını doldur
    const noteInput = screen.getByPlaceholderText(/Örn: Tok karnına 5 ml verildi/i);
    fireEvent.change(noteInput, { target: { value: 'Öğle arası 2 fıs verildi.' } });

    // Verildi Olarak Kaydet butonuna tıkla
    const submitBtn = screen.getByRole('button', { name: /Verildi Olarak Kaydet/i });
    fireEvent.click(submitBtn);

    // API çağrısının yapıldığını ve modalın kapandığını doğrula
    await waitFor(() => {
      expect(givenCalled).toBe(true);
      expect(
        screen.queryByRole('heading', { name: /İlaç Uygulamasını Kaydet/i }),
      ).not.toBeInTheDocument();
    });

    expect(givenPayload).toMatchObject({
      note: 'Öğle arası 2 fıs verildi.',
    });
  });

  it('renders regular medication badge, expired warning, and opens medication history modal', async () => {
    mockFetchByUrl({
      '/medication/records': () => new Response(JSON.stringify(fakeRecords), { status: 200 }),
      '/students': () =>
        new Response(
          JSON.stringify([
            {
              ...fakeStudents[0],
              passport: {
                regularMedications: ['Ventolin İnhaler'],
                chronicConditions: ['Astım'],
                bloodType: 'A_POSITIVE',
                allergies: ['Fıstık'],
              },
            },
          ]),
          { status: 200 },
        ),
      '/classrooms': () =>
        new Response(JSON.stringify([{ id: 'c-1', name: 'Papatyalar Sınıfı' }]), { status: 200 }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Calpol Şurup')).toBeInTheDocument();
    });

    // Süresi geçti / gecikmiş doz uyarısının varlığını kontrol et
    expect(screen.getAllByText(/Süresi Geçti \/ Gecikmiş Doz/i).length).toBeGreaterThan(0);

    // Düzenli / Kronik ilaç rozetini doğrula
    expect(screen.getByText(/Düzenli \/ Kronik İlaç/i)).toBeInTheDocument();

    // İlaç Geçmişi butonuna tıkla
    const historyButtons = screen.getAllByRole('button', { name: /İlaç Geçmişi/i });
    expect(historyButtons.length).toBeGreaterThan(0);
    fireEvent.click(historyButtons[0]!);

    // Modalın açıldığını ve detayları gösterdiğini doğrula
    await waitFor(() => {
      expect(screen.getByText('İlaç Geçmişi & Doz Kütüğü')).toBeInTheDocument();
      expect(screen.getByText(/Geçmiş & Aktif İlaç Kayıtları/i)).toBeInTheDocument();
      expect(screen.getByText('Astım')).toBeInTheDocument();
    });
  });
});
