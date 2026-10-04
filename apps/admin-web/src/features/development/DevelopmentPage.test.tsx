import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { DevelopmentPage } from './DevelopmentPage';

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    state: {
      status: 'authenticated',
      user: {
        id: 'usr-1',
        email: 'teacher@demo.test',
        role: 'TEACHER',
        tenantId: 'demo',
      },
    },
  }),
}));

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
  listStudents: vi.fn().mockResolvedValue([{ id: 'st-1', firstName: 'Ali', lastName: 'Yılmaz' }]),
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
  it('renders development page with observation data and KPI stats', async () => {
    render(
      <BrowserRouter>
        <DevelopmentPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Gelişim Hikâyesi & Öğrenci Portfolyosu/i)).toBeInTheDocument();
      expect(screen.getByText(/Cümle kurma/i)).toBeInTheDocument();
      expect(screen.getByText(/3-4 kelimelik tam cümleler kurabiliyor/i)).toBeInTheDocument();
      expect(screen.getByText(/Toplam Gözlem/i)).toBeInTheDocument();
      expect(screen.getByText(/Portfolyo Eseri/i)).toBeInTheDocument();
      expect(screen.getByText(/Ev Etkinlikleri/i)).toBeInTheDocument();
      expect(screen.getByText(/Veli Paylaşımı/i)).toBeInTheDocument();
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

  it('opens portfolio modal and displays harmonized photo selection sections', async () => {
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
    expect(screen.getByText('Veya Hazır Örnek Eserlerden Ekleyin')).toBeInTheDocument();
    expect(screen.getByText('Sulu Boya Çalışması')).toBeInTheDocument();
    expect(screen.getByText('Parmak Boyası & Baskı')).toBeInTheDocument();

    // Select a preset photo
    const presetCard = screen.getByText('Sulu Boya Çalışması');
    await user.click(presetCard);

    expect(await screen.findByText('1 seçildi')).toBeInTheDocument();
    expect(screen.getByText('Tümünü Temizle')).toBeInTheDocument();
    expect(screen.getByText('Örnek Görsel')).toBeInTheDocument();
  });
});
