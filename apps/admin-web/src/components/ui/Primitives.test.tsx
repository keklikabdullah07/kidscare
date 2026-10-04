import { render, screen } from '@testing-library/react';
import { PageHeader, EmptyState, StatCard, TactileTabs } from './index';
import { Sparkles, Inbox, Users } from 'lucide-react';

describe('UI Primitives', () => {
  describe('PageHeader', () => {
    it('renders title, description and actions correctly', () => {
      render(
        <PageHeader
          title="Öğrenci Yönetimi"
          description="Kayıtlı öğrencileri listeleyin ve düzenleyin"
          icon={Sparkles}
          actions={<button type="button">Yeni Ekle</button>}
        />,
      );

      expect(screen.getByText('Öğrenci Yönetimi')).toBeInTheDocument();
      expect(screen.getByText('Kayıtlı öğrencileri listeleyin ve düzenleyin')).toBeInTheDocument();
      expect(screen.getByText('Yeni Ekle')).toBeInTheDocument();
    });
  });

  describe('EmptyState', () => {
    it('renders icon, title, description and call-to-action', () => {
      render(
        <EmptyState
          title="Henüz Kayıt Yok"
          description="İlk kaydı oluşturmak için butona tıklayın."
          icon={Inbox}
          action={<button type="button">Kayıt Oluştur</button>}
        />,
      );

      expect(screen.getByText('Henüz Kayıt Yok')).toBeInTheDocument();
      expect(screen.getByText('İlk kaydı oluşturmak için butona tıklayın.')).toBeInTheDocument();
      expect(screen.getByText('Kayıt Oluştur')).toBeInTheDocument();
    });
  });

  describe('StatCard', () => {
    it('renders KPI metric, subtitle and progress bar', () => {
      render(
        <StatCard
          title="Toplam Öğrenci"
          value={42}
          subtitle="/ 50 Kontenjan"
          icon={Users}
          progressPercent={84}
          variant="amber"
        />,
      );

      expect(screen.getByText('Toplam Öğrenci')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('/ 50 Kontenjan')).toBeInTheDocument();
    });
  });

  describe('TactileTabs', () => {
    it('renders tabs with active/inactive affordance and fires onChange', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <TactileTabs
          tabs={[
            { id: 'tab1', label: 'Tüm Tutanaklar', count: 12 },
            { id: 'tab2', label: 'Bildirim Bekleyenler', count: 3, activeVariant: 'amber' },
          ]}
          activeId="tab1"
          onChange={onChange}
        />,
      );

      const tab1 = screen.getByRole('tab', { name: /Tüm Tutanaklar/i });
      const tab2 = screen.getByRole('tab', { name: /Bildirim Bekleyenler/i });

      expect(tab1).toHaveAttribute('aria-selected', 'true');
      expect(tab2).toHaveAttribute('aria-selected', 'false');
      expect(tab1).toHaveClass('tactile-tab-btn-active-teal');
      expect(tab2).toHaveClass('tactile-tab-btn-inactive');

      tab2.click();
      expect(onChange).toHaveBeenCalledWith('tab2');

      rerender(
        <TactileTabs
          tabs={[
            { id: 'tab1', label: 'Tüm Tutanaklar', count: 12 },
            { id: 'tab2', label: 'Bildirim Bekleyenler', count: 3, activeVariant: 'amber' },
          ]}
          activeId="tab2"
          onChange={onChange}
        />,
      );

      expect(screen.getByRole('tab', { name: /Bildirim Bekleyenler/i })).toHaveClass(
        'tactile-tab-btn-active-amber',
      );
      expect(screen.getByRole('tab', { name: /Tüm Tutanaklar/i })).toHaveClass(
        'tactile-tab-btn-inactive',
      );
    });
  });
});
