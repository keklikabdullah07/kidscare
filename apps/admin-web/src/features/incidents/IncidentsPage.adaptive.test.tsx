import { render, screen, waitFor } from '@testing-library/react';
import { vi, beforeEach } from 'vitest';
import { IncidentsPage } from './IncidentsPage';
import { ToastProvider } from '../../components/Toast';

const { mockUseAuth } = vi.hoisted(() => {
  const state: { userRole: 'PARENT' | 'TEACHER' | 'ADMIN'; userId: string } = {
    userRole: 'ADMIN',
    userId: 'admin-1',
  };
  return { mockUseAuth: state };
});

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    state: {
      status: 'authenticated',
      user: {
        id: mockUseAuth.userId,
        tenantId: 't-1',
        email: `${mockUseAuth.userRole.toLowerCase()}@demo.test`,
        role: mockUseAuth.userRole,
      },
      token: 'jwt',
    },
    login: async () => {},
    signup: async () => {},
    logout: () => {},
  }),
}));

function mockFetchByUrl(handlers: Record<string, () => Response>) {
  return vi.spyOn(global, 'fetch').mockImplementation((...args: unknown[]) => {
    const [input] = args as [string | URL | Request];
    const url = input instanceof globalThis.Request ? input.url : String(input);
    const path = new URL(url, 'http://localhost').pathname;
    const handler = handlers[path];
    if (handler) return Promise.resolve(handler());
    return Promise.resolve(new Response(JSON.stringify({ message: 'unhandled' }), { status: 500 }));
  });
}

const today = new Date().toISOString();
const adaStudent = {
  id: 's-ada',
  firstName: 'Ada',
  lastName: 'Yılmaz',
  tenantId: 't-1',
  isActive: true,
  parentId: 'parent-1',
  classroomId: 'cls-1',
};

const papatyaClassroom = {
  id: 'cls-1',
  tenantId: 't-1',
  name: 'Papatyalar',
  ageGroup: null,
  isActive: true,
  teachers: [{ id: 'a1', teacherId: 'teacher-1', assignedAt: today }],
  studentCount: 0,
  createdAt: today,
  updatedAt: today,
};

function renderPage() {
  return render(
    <ToastProvider>
      <IncidentsPage />
    </ToastProvider>,
  );
}

describe('IncidentsPage (Adaptive)', () => {
  beforeEach(() => {
    localStorage.setItem('kidscare.token', 'jwt');
    mockUseAuth.userRole = 'ADMIN';
    mockUseAuth.userId = 'admin-1';
  });
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('TEACHER with 1 classroom — does not render Sınıf Filtresi select, shows scope-badge', async () => {
    mockUseAuth.userRole = 'TEACHER';
    mockUseAuth.userId = 'teacher-1';

    mockFetchByUrl({
      '/incidents': () => new Response(JSON.stringify([]), { status: 200 }),
      '/students': () => new Response(JSON.stringify([adaStudent]), { status: 200 }),
      '/classrooms': () => new Response(JSON.stringify([papatyaClassroom]), { status: 200 }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText(/Olay Kayıtları/i).length).toBeGreaterThan(0);
    });

    expect(screen.queryByLabelText('Sınıf Filtresi')).not.toBeInTheDocument();
    expect(await screen.findByTestId('scope-badge-classroom')).toBeInTheDocument();
  });
});
