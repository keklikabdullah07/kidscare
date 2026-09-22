import { render, screen, waitFor } from '@testing-library/react';
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

const fakeRecords = [
  {
    id: 'med-1',
    tenantId: 't-1',
    studentId: 's-1',
    medicationName: 'Parol',
    dosage: '5ml',
    instructions: 'Yemekten sonra',
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
      '/medication/records': () =>
        new Response(JSON.stringify(fakeRecords), { status: 200 }),
      '/students': () => new Response(JSON.stringify([]), { status: 200 }),
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('İlaç Takibi')).toBeInTheDocument();
    });
    expect(screen.getAllByText('Parol').length).toBeGreaterThan(0);
    expect(screen.getByText('Onayla')).toBeInTheDocument();
    expect(screen.getByText('Reddet')).toBeInTheDocument();
  });
});
