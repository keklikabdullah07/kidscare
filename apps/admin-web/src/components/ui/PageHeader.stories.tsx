import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './PageHeader';
import { Users, Plus, Download, Filter } from 'lucide-react';

const meta: Meta<typeof PageHeader> = {
  title: 'UI/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: 'Öğrenci Yönetimi',
    description: 'Kreş bünyesindeki tüm öğrencileri listeleyin, yeni kayıt oluşturun ve sınıflara atayın.',
    icon: Users,
    actions: (
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl hover:bg-slate-50 transition-all"
        >
          <Filter className="w-3.5 h-3.5" />
          Filtrele
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl hover:bg-slate-50 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Dışa Aktar
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Yeni Öğrenci
        </button>
      </div>
    ),
  },
};

export const WithoutActions: Story = {
  args: {
    title: 'Günlük Karne ve Gelişim Takibi',
    description: 'Sınıf öğretmenlerinin doldurduğu günlük karnelerin özet görünümü ve pedagojik analizler.',
  },
};
