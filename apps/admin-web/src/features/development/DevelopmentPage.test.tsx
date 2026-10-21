import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { DevelopmentPage } from './DevelopmentPage';

const mockUseAuth = vi.fn();
vi.mock('../auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

beforeEach(() => {
  mockUseAuth.mockReturnValue({
    state: {
      status: 'authenticated',
      user: {
        id: 'usr-1',
        email: 'teacher@demo.test',
        role: 'TEACHER',
        tenantId: 'demo',
      },
    },
  });
});

vi.mock('../../api/media', () => ({
  listMediaFiles: vi.fn().mockResolvedValue([
    {
      id: 'med-1',
      url: 'https://images.unsplash.com/photo-archive-1.jpg',
      fileName: 'arsiv-calisma-1.jpg',
      category: 'PORTFOLIO',
    },
  ]),
  uploadMediaFile: vi.fn().mockResolvedValue({
    url: 'https://images.unsplash.com/photo-uploaded-1.jpg',
  }),
}));

vi.mock('../../api/students', () => ({
  listStudents: vi.fn().mockResolvedValue([
    {
      id: 'st-1',
      firstName: 'Ali',
      lastName: 'Yılmaz',
      classroomId: 'cls-1',
      parentId: 'parent-1',
      passport: { motherName: 'Zeynep Yılmaz' },
    },
  ]),
}));

vi.mock('../../api/classrooms', () => ({
  listClassrooms: vi.fn().mockResolvedValue([
    {
      id: 'cls-1',
      name: 'Yunuslar Sınıfı',
      teachers: [{ teacherId: 'usr-1' }],
    },
  ]),
}));

vi.mock('../../api/users', () => ({
  listUsers: vi.fn().mockImplementation((role?: string) => {
    if (role === 'TEACHER') {
      return Promise.resolve([
        { id: 'usr-1', firstName: 'Ayşe', lastName: 'Demir', email: 'teacher@demo.test' },
      ]);
    }
    if (role === 'PARENT') {
      return Promise.resolve([
        { id: 'parent-1', firstName: 'Fatma', lastName: 'Yılmaz', email: 'parent@demo.test' },
      ]);
    }
    return Promise.resolve([]);
  }),
}));

vi.mock('../../api/development', () => ({
  listObservations: vi.fn().mockResolvedValue([
    {
      id: 'obs-1',
      tenantId: 'demo',
      studentId: 'st-1',
      teacherId: 'usr-1',
      domain: 'DIL',
      skillName: 'Cümle kurma',
      observation: '3-4 kelimelik tam cümleler kurabiliyor.',
      observedAt: new Date().toISOString(),
      isParentVisible: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      student: { id: 'st-1', firstName: 'Ali', lastName: 'Yılmaz' },
      teacher: { id: 'usr-1', email: 'teacher@demo.test' },
    },
  ]),
  createObservation: vi.fn().mockResolvedValue({}),
  listPortfolio: vi.fn().mockResolvedValue([]),
  createPortfolioItem: vi.fn().mockResolvedValue({}),
  listHomeActivities: vi.fn().mockResolvedValue([]),
  createHomeActivity: vi.fn().mockResolvedValue({}),
}));

describe('DevelopmentPage', () => {
  it('renders development page with observation data and tactile tabs', async () => {
    render(
      <BrowserRouter>
        <DevelopmentPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Gelişim Hikâyesi & Öğrenci Portfolyosu/i)).toBeInTheDocument();
      expect(screen.getByText(/Cümle kurma/i)).toBeInTheDocument();
      expect(screen.getByText(/3-4 kelimelik tam cümleler kurabiliyor/i)).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Pedagojik Gözlemler/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Öğrenci Portfolyosu/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Ev Etkinlik Havuzu/i })).toBeInTheDocument();
    });
  });

  it('switches between tactile tabs', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <DevelopmentPage />
      </BrowserRouter>,
    );

    const portfolioTab = screen.getByRole('tab', { name: /Öğrenci Portfolyosu/i });
    await user.click(portfolioTab);

    await waitFor(() => {
      expect(
        screen.getByText(/Henüz portfolyoya eklenmiş çalışma bulunmuyor/i),
      ).toBeInTheDocument();
    });
  });

  it('opens portfolio modal and displays harmonized photo selection and tenant archive sections', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <DevelopmentPage />
      </BrowserRouter>,
    );

    const portfolioTab = screen.getByRole('tab', { name: /Öğrenci Portfolyosu/i });
    await user.click(portfolioTab);

    const addBtn = await screen.findByRole('button', { name: /Çalışma Ekle/i });
    await user.click(addBtn);

    expect(await screen.findByText('Portfolyoya Yeni Eser Ekle')).toBeInTheDocument();
    expect(screen.getByText("Veya Doğrudan Görsel URL'si Ekle")).toBeInTheDocument();
    expect(screen.getByText('Paylaşılacak Fotoğraflar')).toBeInTheDocument();
    expect(screen.getByText(/Henüz fotoğraf seçilmedi/i)).toBeInTheDocument();
    expect(screen.queryByText(/Hazır Örnek/i)).not.toBeInTheDocument();

    // Select photo from tenant archive
    expect(await screen.findByText(/Kreş Arşivinden Seçin/i)).toBeInTheDocument();
    const archiveImg = await screen.findByAltText('arsiv-calisma-1.jpg');
    await user.click(archiveImg);

    expect(await screen.findByText('1 seçildi')).toBeInTheDocument();
    expect(screen.getByText('Tümünü Temizle')).toBeInTheDocument();
    expect(screen.getByText('Yüklenen Foto')).toBeInTheDocument();
  });

  it('displays classroom, teacher and parent context badges on observation cards', async () => {
    render(
      <BrowserRouter>
        <DevelopmentPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText('Yunuslar Sınıfı').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Ayşe Demir/i)).toBeInTheDocument();
      expect(screen.getByText(/Fatma Yılmaz/i)).toBeInTheDocument();
    });
  });

  it('does not render Sınıf dropdown for PARENT and hides Gözlem Ekle button', async () => {
    mockUseAuth.mockReturnValue({
      state: {
        status: 'authenticated',
        user: {
          id: 'parent-1',
          email: 'parent@demo.test',
          role: 'PARENT',
          tenantId: 'demo',
        },
      },
    });

    render(
      <BrowserRouter>
        <DevelopmentPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Gelişim Hikâyesi & Öğrenci Portfolyosu/i)).toBeInTheDocument();
    });

    expect(screen.queryByLabelText('Sınıf Seç')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Gözlem Ekle/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Çalışma Ekle/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Etkinlik Önerisi/i })).not.toBeInTheDocument();
  });

  it('replaces Sınıf select with AdaptiveScopeBadge for TEACHER with 1 classroom (Spec 0062)', async () => {
    // teacher-1 zaten tek sınıfa (Yunuslar) atanmış — mevcut top-level mock yeterli
    render(
      <BrowserRouter>
        <DevelopmentPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Gelişim Hikâyesi & Öğrenci Portfolyosu/i)).toBeInTheDocument();
    });

    // Tek sınıflı öğretmen için select yok, scope-badge var
    expect(screen.queryByLabelText('Sınıf Seç')).not.toBeInTheDocument();
    expect(await screen.findByTestId('scope-badge-classroom')).toBeInTheDocument();
  });
});
