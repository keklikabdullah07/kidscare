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

    // Check Health & Allergy Passport Card
    expect(screen.getByText('Gelişim & Sağlık Pasaportu')).toBeInTheDocument();
    expect(screen.getByText('Kan Grubu: A+')).toBeInTheDocument();
    expect(screen.getByText('Bilinen Alerjiler')).toBeInTheDocument();
    expect(screen.getAllByText('Fıstık').length).toBeGreaterThanOrEqual(1);
  });

  it('renders "Kayıtlı alerji bulunmuyor" when child has no allergies', async () => {
    const fakeOverviewNoAllergy = [
      {
        ...fakeOverview[0],
        student: {
          ...fakeOverview[0]!.student,
          passport: {
            bloodType: '0+',
            allergies: [],
            dietaryRestrictions: [],
            chronicConditions: [],
            regularMedications: [],
            emergencyContacts: [],
          },
        },
      },
    ];

    mockFetchByUrl({
      '/parent/children': () =>
        new Response(JSON.stringify({ data: fakeOverviewNoAllergy }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      '/daily-menus': () =>
        new Response(JSON.stringify({ menu: null, allergenWarnings: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    });

    render(<ParentDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
    });

    expect(screen.getByText('Gelişim & Sağlık Pasaportu')).toBeInTheDocument();
    expect(screen.getByText('Kan Grubu: 0+')).toBeInTheDocument();
    expect(screen.getByText('Kayıtlı alerji bulunmuyor.')).toBeInTheDocument();
  });

  it('allows parent to open medication modal, submit medication request, and see it in the list', async () => {
    const fakeMedications = [
      {
        id: 'med-rec-1',
        tenantId: 't-1',
        studentId: 's-1',
        medicationName: 'Calpol',
        dosage: '1 Ölçek (5ml)',
        instructions: 'Öğle yemeğinden sonra tok karnına',
        scheduledAt: '2026-09-15T12:30:00.000Z',
        givenAt: null,
        status: 'REQUESTED',
        requestedById: 'u-parent',
        createdAt: '2026-09-15T08:00:00.000Z',
        updatedAt: '2026-09-15T08:00:00.000Z',
      },
    ];

    let postCalled = false;
    let postBody: Record<string, unknown> | null = null;

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
      '/medication/records': (init) => {
        if (init?.method === 'POST') {
          postCalled = true;
          if (init?.body) {
            postBody = JSON.parse(init.body as string);
          }
          return new Response(
            JSON.stringify({
              id: 'med-rec-2',
              tenantId: 't-1',
              studentId: 's-1',
              medicationName: 'Ventolin',
              dosage: '1 Fıs',
              instructions: 'Öksürük olursa',
              scheduledAt: '2026-09-15T14:00:00.000Z',
              givenAt: null,
              status: 'REQUESTED',
              requestedById: 'u-parent',
              createdAt: '2026-09-15T09:00:00.000Z',
              updatedAt: '2026-09-15T09:00:00.000Z',
            }),
            { status: 201, headers: { 'Content-Type': 'application/json' } },
          );
        }
        return new Response(JSON.stringify(fakeMedications), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      },
    });

    render(<ParentDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
    });

    // İlaç takip bölümü ve mevcut ilaç listesi
    expect(screen.getByText('İlaç & Tedavi Talepleri')).toBeInTheDocument();
    expect(screen.getByText('Calpol')).toBeInTheDocument();
    expect(screen.getByText('1 Ölçek (5ml)')).toBeInTheDocument();
    expect(screen.getByText(/Onay Bekliyor/i)).toBeInTheDocument();

    // + İlaç Talebi Ekle butonuna tıkla
    const addBtn = screen.getByRole('button', { name: /\+ İlaç Talebi Ekle/i });
    expect(addBtn).toBeInTheDocument();
    addBtn.click();

    // Modalın açıldığını doğrula
    await waitFor(() => {
      expect(screen.getByText('Yeni İlaç Verme Talebi')).toBeInTheDocument();
    });

    // Form alanlarını doldur
    const nameInput = screen.getByLabelText(/İlaç Adı/i);
    const dosageInput = screen.getByLabelText(/Dozaj/i);
    const instructionsInput = screen.getByLabelText(/Kullanım Talimatı/i);

    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(nameInput, { target: { value: 'Ventolin' } });
    fireEvent.change(dosageInput, { target: { value: '1 Fıs' } });
    fireEvent.change(instructionsInput, { target: { value: 'Öksürük olursa' } });

    // Gönder butonuna tıkla
    const submitBtn = screen.getByRole('button', { name: /Talebi Kaydet ve İlet/i });
    submitBtn.click();

    await waitFor(() => {
      expect(postCalled).toBe(true);
    });

    expect(postBody).toMatchObject({
      studentId: 's-1',
      medicationName: 'Ventolin',
      dosage: '1 Fıs',
      instructions: 'Öksürük olursa',
    });
  });

  it('allows parent to view authorized pickup contacts and add a new authorized person', async () => {
    const fakeAuthorizations = [
      {
        id: 'auth-1',
        tenantId: 't-1',
        studentId: 's-1',
        pickupContactId: 'cnt-1',
        pickupContact: {
          id: 'cnt-1',
          tenantId: 't-1',
          studentId: 's-1',
          fullName: 'Ahmet Yılmaz',
          relation: 'Dede',
          phone: '0555 111 2233',
          identityNote: null,
          isActive: true,
          createdAt: '2026-09-15T08:00:00.000Z',
          updatedAt: '2026-09-15T08:00:00.000Z',
        },
        requestedById: 'u-parent',
        reviewedById: null,
        status: 'APPROVED',
        validFrom: null,
        validUntil: null,
        note: null,
        createdAt: '2026-09-15T08:00:00.000Z',
        updatedAt: '2026-09-15T08:00:00.000Z',
      },
    ];

    let contactCreated = false;

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
      '/pickup/authorizations': () =>
        new Response(JSON.stringify(fakeAuthorizations), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      '/pickup/contacts': () => {
        contactCreated = true;
        return new Response(
          JSON.stringify({
            id: 'cnt-2',
            tenantId: 't-1',
            studentId: 's-1',
            fullName: 'Ayşe Demir',
            relation: 'Teyze',
            phone: '0555 123 4567',
            identityNote: null,
            isActive: true,
            createdAt: '2026-09-15T10:00:00.000Z',
            updatedAt: '2026-09-15T10:00:00.000Z',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        );
      },
    });

    render(<ParentDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
    });

    // Yetkili Teslim Alıcılar kartı ve mevcut kişi
    expect(screen.getByText('Yetkili Teslim Alıcılar')).toBeInTheDocument();
    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    expect(screen.getByText('Dede')).toBeInTheDocument();

    // + Teslim Alıcı Ekle butonuna tıkla
    const addBtn = screen.getByRole('button', { name: /\+ Teslim Alıcı Ekle/i });
    expect(addBtn).toBeInTheDocument();
    addBtn.click();

    // Modal açıldığını doğrula
    await waitFor(() => {
      expect(screen.getByText('Yeni Teslim Yetkilisi Ekle')).toBeInTheDocument();
    });

    // Formu doldur
    const { fireEvent } = await import('@testing-library/react');
    const nameInput = screen.getByLabelText(/Ad Soyad/i);
    const phoneInput = screen.getByLabelText(/Telefon Numarası/i);
    const relationSelect = screen.getByLabelText(/Yakınlık Derecesi/i);

    fireEvent.change(nameInput, { target: { value: 'Ayşe Demir' } });
    fireEvent.change(phoneInput, { target: { value: '0555 123 4567' } });
    fireEvent.change(relationSelect, { target: { value: 'Teyze' } });

    // Kaydet ve Yetkilendir butonuna tıkla
    const submitBtn = screen.getByRole('button', { name: /Yetkilendir ve Kaydet/i });
    submitBtn.click();

    await waitFor(() => {
      expect(contactCreated).toBe(true);
    });
  });

  it('allows parent to submit attendance excuse', async () => {
    let excuseCreated = false;
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
      '/events/consents': () =>
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      '/attendance/excuses': (init) => {
        if (init?.method === 'POST') {
          excuseCreated = true;
          return new Response(JSON.stringify({ id: 'exc-1', status: 'PENDING' }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      },
    });

    render(<ParentDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
    });

    const excuseBtn = screen.getByRole('button', { name: /Gelemeyeceğimizi Bildir/i });
    expect(excuseBtn).toBeInTheDocument();
    excuseBtn.click();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Gelemeyeceğimizi Bildir' })).toBeInTheDocument();
    });

    const { fireEvent } = await import('@testing-library/react');
    const submitBtn = screen.getByRole('button', { name: /Bildirimi Gönder/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(excuseCreated).toBe(true);
    });
  });

  it('renders active event consents and allows parent to respond', async () => {
    let consentResponded = false;
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
      '/events/consents': () =>
        new Response(
          JSON.stringify([
            {
              id: 'consent-1',
              title: 'AKM Çocuk Tiyatrosu',
              eventDate: '2026-10-25T10:00:00Z',
              location: 'AKM Büyük Salon',
              price: 150,
              description: 'Kırmızı Başlıklı Kız oyunu',
              status: 'ACTIVE',
              myResponse: null,
            },
          ]),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      '/events/consents/consent-1/respond': (init) => {
        if (init?.method === 'POST') {
          consentResponded = true;
          return new Response(JSON.stringify({ id: 'resp-1', decision: 'APPROVED' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ message: 'ok' }), { status: 200 });
      },
    });

    render(<ParentDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('AKM Çocuk Tiyatrosu')).toBeInTheDocument();
    });

    expect(screen.getByText('AKM Büyük Salon')).toBeInTheDocument();
    expect(screen.getByText('150 TL')).toBeInTheDocument();

    const approveBtn = screen.getByRole('button', { name: /İzin Veriyorum/i });
    expect(approveBtn).toBeInTheDocument();
    approveBtn.click();

    await waitFor(() => {
      expect(consentResponded).toBe(true);
    });
  });

  it('renders rich daily report with exact sleep status (NONE / Uyumadı), sleep note, meals note and potty entries', async () => {
    const fakeOverviewRichReport = [
      {
        ...fakeOverview[0],
        todayDailyReport: {
          id: 'rep-rich',
          tenantId: 't-1',
          studentId: 's-1',
          date: '2026-09-15',
          mood: 'CALM',
          meals: {
            breakfast: 'ALL',
            lunch: 'HALF',
            afternoonSnack: 'NONE',
            notes: 'Öğle çorbasını çok sevdi, ikindi kekini yemek istemedi.',
          },
          naps: {
            quality: 'NONE',
            notes: 'Bugün uyumak istemedi, yerine sessizce resim yaptı.',
          },
          potty: [
            { id: 'p-1', time: '10:15', type: 'WET' },
            { id: 'p-2', time: '13:45', type: 'DIRTY', notes: 'Normal kıvamda' },
          ],
          activities: ['Müzik & Ritim'],
          teacherNote: 'Günü sakin ve huzurlu tamamladı.',
          medications: [],
          createdAt: '2026-09-15T12:00:00.000Z',
          updatedAt: '2026-09-15T12:00:00.000Z',
        },
      },
    ];

    mockFetchByUrl({
      '/parent/children': () =>
        new Response(JSON.stringify({ data: fakeOverviewRichReport }), {
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

    await waitFor(() => {
      expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
    });

    // 1. Explicit Sleep Status: "Uyumadı" (NOT "Uyumadı / Belirtilmedi")
    expect(screen.getByText('Uyumadı')).toBeInTheDocument();
    expect(screen.queryByText('Uyumadı / Belirtilmedi')).not.toBeInTheDocument();
    expect(
      screen.getByText('"Bugün uyumak istemedi, yerine sessizce resim yaptı."'),
    ).toBeInTheDocument();

    // 2. Meals Note
    expect(screen.getByText('Öğretmenin Beslenme Notu')).toBeInTheDocument();
    expect(
      screen.getByText('"Öğle çorbasını çok sevdi, ikindi kekini yemek istemedi."'),
    ).toBeInTheDocument();

    // 3. Potty Timeline Chips & Notes
    expect(screen.getByText('2 Giriş')).toBeInTheDocument();
    expect(screen.getByText('Çişli Bez')).toBeInTheDocument();
    expect(screen.getByText('10:15')).toBeInTheDocument();
    expect(screen.getByText('Kaka / Kirli Bez')).toBeInTheDocument();
    expect(screen.getByText('13:45')).toBeInTheDocument();
    expect(screen.getByText('Normal kıvamda')).toBeInTheDocument();
  });

  it('renders INTERRUPTED sleep quality badge correctly', async () => {
    const fakeOverviewInterrupted = [
      {
        ...fakeOverview[0],
        todayDailyReport: {
          id: 'rep-interrupted',
          tenantId: 't-1',
          studentId: 's-1',
          date: '2026-09-15',
          mood: 'TIRED',
          meals: { breakfast: 'ALL', lunch: 'ALL', afternoonSnack: 'ALL' },
          naps: {
            startTime: '13:15',
            endTime: '14:00',
            quality: 'INTERRUPTED',
            notes: 'Huzursuz uyandı.',
          },
          potty: [],
          activities: [],
          teacherNote: null,
          medications: [],
          createdAt: '2026-09-15T12:00:00.000Z',
          updatedAt: '2026-09-15T12:00:00.000Z',
        },
      },
    ];

    mockFetchByUrl({
      '/parent/children': () =>
        new Response(JSON.stringify({ data: fakeOverviewInterrupted }), {
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

    await waitFor(() => {
      expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
    });

    expect(screen.getByText('Bölünmüş / Huzursuz Uyku')).toBeInTheDocument();
    expect(screen.getByText('13:15 - 14:00')).toBeInTheDocument();
    expect(screen.getByText('"Huzursuz uyandı."')).toBeInTheDocument();
  });
});
