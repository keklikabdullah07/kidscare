import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';
import { UserX, CalendarX, FileSpreadsheet, Plus } from 'lucide-react';

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['amber', 'blue', 'slate'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: 'Henüz Öğrenci Eklenmedi',
    description: 'Kreşinize ilk öğrenciyi kaydederek sınıf ataması ve yoklama takibine hemen başlayabilirsiniz.',
    icon: UserX,
    variant: 'amber',
    action: (
      <button
        type="button"
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-xs active:scale-95"
      >
        <Plus className="w-4 h-4" />
        Öğrenci Ekle
      </button>
    ),
  },
};

export const AttendanceEmpty: Story = {
  args: {
    title: 'Bugün İçin Yoklama Kaydı Yok',
    description: 'Seçili tarihte henüz yoklama başlatılmadı. Sınıf listesini seçip yoklamayı başlatabilirsiniz.',
    icon: CalendarX,
    variant: 'blue',
    action: (
      <button
        type="button"
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 rounded-xl hover:bg-teal-100 transition-all"
      >
        Yoklamayı Başlat
      </button>
    ),
  },
};

export const ReportsEmpty: Story = {
  args: {
    title: 'Rapor Bulunamadı',
    description: 'Arama kriterlerinize veya seçilen tarih aralığına uygun karne ya da gelişim raporu mevcut değil.',
    icon: FileSpreadsheet,
    variant: 'slate',
  },
};
