import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MedicationPage } from './MedicationPage';
import { ToastProvider } from '../../components/Toast';

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    state: {
      status: 'authenticated',
      user: {
        id: 'parent-1',
        tenantId: 't-1',
        email: 'parent@demo.test',
        role: 'PARENT',
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

// PARENT-1's child: Ada Yılmaz — PARENT should see her records
const adaRecord = {
  id: 'med-ada',
  tenantId: 't-1',
  studentId: 's-ada',
  medicationName: 'Ada İlacı',
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
  student: { id: 's-ada', firstName: 'Ada', lastName: 'Yılmaz' },
};

// Other parent's child: Zeynep — PARENT-1 should NOT see this record
const zeynepRecord = {
  ...adaRecord,
  id: 'med-zeynep',
  studentId: 's-zeynep',
  medicationName: 'Zeynep İlacı',
  student: { id: 's-zeynep', firstName: 'Zeynep', lastName: 'Demir' },
};

const adaStudent = {
  id: 's-ada',
  tenantId: 't-1',
  firstName: 'Ada',
  lastName: 'Yılmaz',
  dateOfBirth: '2021-05-10',
  gender: 'FEMALE',
  parentId: 'parent-1',
  classroomId: 'cls-1',
  createdAt: '2023-09-01T00:00:00.000Z',
  updatedAt: '2023-09-01T00:00:00.000Z',
};

const zeynepStudent = {
  ...adaStudent,
  id: 's-zeynep',
  firstName: 'Zeynep',
  lastName: 'Demir',
  parentId: 'parent-2',
};

function renderPage() {
  return render(
    <ToastProvider>
      <MedicationPage />
    </ToastProvider>,
  );
}

describe('MedicationPage (Parent)', () => {
  beforeEach(() => {
    localStorage.setItem('kidscare.token', 'test-jwt');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('shows only own child medication records and excludes other parents children', async () => {
    mockFetchByUrl({
      '/medication/records': () =>
        new Response(JSON.stringify([adaRecord, zeynepRecord]), { status: 200 }),
      '/students': () => new Response(JSON.stringify([adaStudent, zeynepStudent]), { status: 200 }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Ada İlacı')).toBeInTheDocument();
    });

    expect(screen.queryByText('Zeynep İlacı')).not.toBeInTheDocument();
  });

  it('restricts new medication modal student dropdown to PARENT own children only', async () => {
    mockFetchByUrl({
      '/medication/records': () => new Response(JSON.stringify([adaRecord]), { status: 200 }),
      '/students': () => new Response(JSON.stringify([adaStudent, zeynepStudent]), { status: 200 }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Ada İlacı')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /Yeni İlaç/i });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Yeni İlaç Kullanım Talebi' }),
      ).toBeInTheDocument();
    });

    const select = screen.getByTestId('modal-student-select');
    const options = Array.from(select.querySelectorAll('option'));
    const optionTexts = options.map((o) => o.textContent);

    expect(optionTexts.some((t) => t?.includes('Ada Yılmaz'))).toBe(true);
    expect(optionTexts.some((t) => t?.includes('Zeynep Demir'))).toBe(false);
  });
});
