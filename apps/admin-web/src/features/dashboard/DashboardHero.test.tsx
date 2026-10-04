import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardHero } from './DashboardHero';

const defaultProps = {
  userName: 'Demo',
  timeGreeting: { text: 'İyi günler', emoji: '🌤️', note: 'Öğrenme ve oyun dolu bir gün akışı.' },
  totalStudents: 24,
  presentCount: 18,
  targetReportCount: 18,
  filledReportsCount: 18,
  todayFormatted: '4 Ekim 2026 Pazar',
};

function renderHero(props = defaultProps) {
  return render(
    <MemoryRouter>
      <DashboardHero {...props} />
    </MemoryRouter>,
  );
}

describe('DashboardHero', () => {
  it('renders greeting with user name and emoji', () => {
    renderHero();
    expect(screen.getByText(/İyi günler, Demo/)).toBeInTheDocument();
    expect(screen.getByText('🌤️')).toBeInTheDocument();
  });

  it('renders attendance and report summary', () => {
    renderHero();
    expect(screen.getByText(/24 kayıtlı öğrenciden 18 tanesi/)).toBeInTheDocument();
    expect(
      screen.getByText(/Günün tüm karne ve bülten kayıtları eksiksiz tamamlandı/),
    ).toBeInTheDocument();
  });

  it('shows pending report count when filledReportsCount < targetReportCount', () => {
    renderHero({ ...defaultProps, filledReportsCount: 15 });
    expect(screen.getByText(/Tamamlanmayı bekleyen 3 öğrenci bülteni/)).toBeInTheDocument();
  });

  it('renders date chip and greeting note', () => {
    renderHero();
    expect(screen.getByText('4 Ekim 2026 Pazar')).toBeInTheDocument();
    expect(screen.getByText(/Öğrenme ve oyun dolu bir gün akışı/)).toBeInTheDocument();
  });

  it('renders both CTA links', () => {
    renderHero();
    expect(screen.getByRole('link', { name: /Yoklama Al/i })).toHaveAttribute(
      'href',
      '/attendance',
    );
    expect(screen.getByRole('link', { name: /Günlük Takip/i })).toHaveAttribute(
      'href',
      '/tracking',
    );
  });
});
