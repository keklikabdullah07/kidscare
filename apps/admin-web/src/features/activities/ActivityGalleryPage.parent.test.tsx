import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

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

import { ActivityGalleryPage } from './ActivityGalleryPage';

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

const today = new Date().toISOString().slice(0, 10);
const now = new Date().toISOString();
const fakeActivities = [
  {
    id: 'post-1',
    tenantId: 't-1',
    authorId: 'teacher-1',
    title: 'Papatyalar Boyama',
    description: 'Suluboya çalışması',
    classroom: 'Papatyalar',
    activityDate: today,
    tags: ['Sanat'],
    taggedStudentIds: [],
    mediaUrls: ['https://example.com/img1.jpg'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'post-2',
    tenantId: 't-1',
    authorId: 'teacher-2',
    title: 'Güller Bahçe Etkinliği',
    description: 'Başka sınıf',
    classroom: 'Güller',
    activityDate: today,
    tags: ['Sanat'],
    taggedStudentIds: [],
    mediaUrls: ['https://example.com/img2.jpg'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'post-3',
    tenantId: 't-1',
    authorId: 'admin-1',
    title: 'Tüm Kreş Bahar Şenliği',
    description: 'Okul genelinde',
    classroom: null,
    activityDate: today,
    tags: ['Etkinlik'],
    taggedStudentIds: [],
    mediaUrls: ['https://example.com/img3.jpg'],
    createdAt: now,
    updatedAt: now,
  },
];

const fakeStudents = [
  {
    id: 's-1',
    tenantId: 't-1',
    firstName: 'Ada',
    lastName: 'Yılmaz',
    parentId: 'parent-1',
    classroomId: 'cls-papatyalar',
    createdAt: '2023-09-01T00:00:00.000Z',
    updatedAt: '2023-09-01T00:00:00.000Z',
  },
];

const fakeClassrooms = [
  { id: 'cls-papatyalar', name: 'Papatyalar', teachers: [] },
  { id: 'cls-guller', name: 'Güller', teachers: [] },
];

describe('ActivityGalleryPage (Parent)', () => {
  beforeEach(() => {
    localStorage.setItem('kidscare.token', 'test-jwt');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('shows own child classroom and all-school posts but hides other classrooms', async () => {
    mockFetchByUrl({
      '/activities': () => new Response(JSON.stringify(fakeActivities), { status: 200 }),
      '/students': () => new Response(JSON.stringify(fakeStudents), { status: 200 }),
      '/classrooms': () => new Response(JSON.stringify(fakeClassrooms), { status: 200 }),
    });

    render(<ActivityGalleryPage />);

    await waitFor(() => {
      expect(screen.getByText(/Papatyalar Boyama/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Tüm Kreş Bahar Şenliği/i)).toBeInTheDocument();
    expect(screen.queryByText(/Güller Bahçe Etkinliği/i)).not.toBeInTheDocument();
  });
});
