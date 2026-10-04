import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PickupPage } from './PickupPage';
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
    return Promise.resolve(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
  });
}

const fakeAuthorizations = [
  {
    id: 'pa-1',
    tenantId: 't-1',
    studentId: 's-1',
    pickupContactId: 'c-1',
    pickupContact: {
      id: 'c-1',
      tenantId: 't-1',
      studentId: 's-1',
      fullName: 'Ahmet Yılmaz',
      relation: 'Dede',
      phone: '0555 111 2233',
      identityNote: 'TC: 1234',
      isActive: true,
      createdAt: '2026-09-15T10:00:00.000Z',
      updatedAt: '2026-09-15T10:00:00.000Z',
    },
    requestedById: 'parent-1',
    reviewedById: null,
    status: 'PENDING',
    validFrom: null,
    validUntil: null,
    note: 'Geçici yetki',
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
  },
];

const fakeStudents = [
  {
    id: 's-1',
    tenantId: 't-1',
    firstName: 'Ada',
    lastName: 'Yılmaz',
    classroom: 'Papatyalar Sınıfı',
  },
];

const fakeEvents = [
  {
    id: 'pe-1',
    tenantId: 't-1',
    studentId: 's-1',
    pickupPersonName: 'Ahmet Yılmaz',
    pickupPersonPhone: '0555 111 2233',
    verificationMethod: 'ID_CHECK',
    verifiedByUserId: 'teacher-1',
    occurredAt: '2026-10-04T16:45:00.000Z',
    note: 'Güvenle teslim edildi.',
  },
];

function renderPage() {
  return render(
    <ToastProvider>
      <PickupPage />
    </ToastProvider>,
  );
}

describe('PickupPage', () => {
  beforeEach(() => {
    localStorage.setItem('kidscare.token', 'test-jwt');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders authorizations with student, contact details and action buttons', async () => {
    mockFetchByUrl({
      '/pickup/authorizations': () =>
        new Response(JSON.stringify(fakeAuthorizations), { status: 200 }),
      '/students': () => new Response(JSON.stringify(fakeStudents), { status: 200 }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Güvenlik & Teslimat Kontrolü')).toBeInTheDocument();
    });

    expect(await screen.findByText('Ada Yılmaz')).toBeInTheDocument();
    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    expect(screen.getByText('Dede')).toBeInTheDocument();
    expect(screen.getByText('0555 111 2233')).toBeInTheDocument();
    expect(screen.getByText('Onayla')).toBeInTheDocument();
    expect(screen.getByText('Reddet')).toBeInTheDocument();
    expect(screen.getByText('"Geçici yetki"')).toBeInTheDocument();
  });

  it('switches between tabs and displays handover event log', async () => {
    mockFetchByUrl({
      '/pickup/authorizations': () => new Response(JSON.stringify([]), { status: 200 }),
      '/students': () => new Response(JSON.stringify(fakeStudents), { status: 200 }),
      '/pickup/events': () => new Response(JSON.stringify(fakeEvents), { status: 200 }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Güvenlik & Teslimat Kontrolü')).toBeInTheDocument();
    });

    const eventsTab = screen.getByRole('tab', { name: /Teslimat Günlüğü & Kütük/i });
    await userEvent.click(eventsTab);

    expect(await screen.findByText('Günün Resmi Teslimat Kayıtları')).toBeInTheDocument();
    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    expect(screen.getByText('Nüfus Cüzdanı / TC Kontrolü')).toBeInTheDocument();
    expect(screen.getByText('Güvenle teslim edildi.')).toBeInTheDocument();
  });

  it('opens and closes handover modal', async () => {
    mockFetchByUrl({
      '/pickup/authorizations': () => new Response(JSON.stringify([]), { status: 200 }),
      '/students': () => new Response(JSON.stringify(fakeStudents), { status: 200 }),
    });

    renderPage();

    const handoverBtn = await screen.findByRole('button', { name: /Öğrenciyi Teslim Et/i });
    await userEvent.click(handoverBtn);

    expect(screen.getByText('Öğrenciyi Güvenle Teslim Et')).toBeInTheDocument();
    expect(screen.getByText('Teslim Edilecek Öğrenci *')).toBeInTheDocument();
    expect(screen.getByText('Doğrulama Yöntemi *')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /İptal/i });
    await userEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText('Doğrulama Yöntemi *')).not.toBeInTheDocument();
    });
  });
});
