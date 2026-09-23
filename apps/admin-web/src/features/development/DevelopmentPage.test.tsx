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
  it('renders development page with observation data', async () => {
    render(
      <BrowserRouter>
        <DevelopmentPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Gelişim Hikâyesi & Öğrenci Portfolyosu/i)).toBeInTheDocument();
      expect(screen.getByText(/Cümle kurma/i)).toBeInTheDocument();
      expect(screen.getByText(/3-4 kelimelik tam cümleler kurabiliyor/i)).toBeInTheDocument();
    });
  });

  it('switches between tabs', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <DevelopmentPage />
      </BrowserRouter>,
    );

    const portfolioTab = screen.getByRole('button', { name: /Öğrenci Portfolyosu/i });
    await user.click(portfolioTab);

    await waitFor(() => {
      expect(
        screen.getByText(/Henüz portfolyoya eklenmiş çalışma bulunmuyor/i),
      ).toBeInTheDocument();
    });
  });
});
