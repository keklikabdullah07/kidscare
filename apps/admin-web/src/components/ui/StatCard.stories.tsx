import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './StatCard';
import { Users, GraduationCap, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from './Badge';

const meta: Meta<typeof StatCard> = {
  title: 'UI/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['blue', 'amber', 'emerald', 'rose', 'indigo'],
    },
    progressPercent: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    title: 'Kayıtlı Öğrenci',
    value: 124,
    subtitle: 'Aktif sınıflarda',
    icon: Users,
    variant: 'blue',
    badge: <Badge variant="success" size="sm" dot>+12%</Badge>,
    progressPercent: 78,
  },
};

export const Attendance: Story = {
  args: {
    title: 'Bugünkü Katılım Oranı',
    value: '%92',
    subtitle: '114 / 124 Öğrenci',
    icon: Clock,
    variant: 'emerald',
    badge: <Badge variant="brand" size="sm">Yüksek</Badge>,
    progressPercent: 92,
  },
};

export const WarningCard: Story = {
  args: {
    title: 'İlaç Takibi Gerekenler',
    value: 3,
    subtitle: 'Öğleden sonra verilecek',
    icon: AlertTriangle,
    variant: 'amber',
    badge: <Badge variant="warning" size="sm" dot>Acil</Badge>,
  },
};

export const LongTextEdgeCase: Story = {
  args: {
    title: 'Çok Uzun Başlık ve Olağandışı Metin Alanı Taşma Kontrolü Testi',
    value: '999,999 ₺',
    subtitle: 'Dönemsel Tahakkuk Eden Toplam Eğitim Ücreti Bakiyesi',
    icon: GraduationCap,
    variant: 'indigo',
    badge: <Badge variant="neutral" size="sm">Yıllık</Badge>,
    progressPercent: 65,
  },
};

export const GridPreview: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Toplam Öğrenci"
        value={128}
        subtitle="12 yeni kayıt"
        icon={Users}
        variant="blue"
        badge={<Badge variant="success" size="sm" dot>+8%</Badge>}
        progressPercent={85}
      />
      <StatCard
        title="Yoklama Tamamlanma"
        value="%95"
        subtitle="6 sınıf teslim etti"
        icon={Clock}
        variant="emerald"
        badge={<Badge variant="brand" size="sm">İyi</Badge>}
        progressPercent={95}
      />
      <StatCard
        title="Geciken Teslimler"
        value={2}
        subtitle="Bekleyen veliler"
        icon={AlertTriangle}
        variant="amber"
        badge={<Badge variant="warning" size="sm" dot>Dikkat</Badge>}
      />
      <StatCard
        title="Eksik Bildirimler"
        value={0}
        subtitle="Tümü senkronize"
        icon={GraduationCap}
        variant="indigo"
        badge={<Badge variant="success" size="sm">Temiz</Badge>}
      />
    </div>
  ),
};
