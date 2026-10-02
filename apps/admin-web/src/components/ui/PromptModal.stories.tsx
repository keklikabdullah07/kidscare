import type { Meta, StoryObj } from '@storybook/react';
import { PromptModal } from './PromptModal';

const meta: Meta<typeof PromptModal> = {
  title: 'UI/PromptModal',
  component: PromptModal,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'danger', 'warning', 'success'],
    },
    isOpen: {
      control: 'boolean',
    },
    requireInput: {
      control: 'boolean',
    },
    isTextarea: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PromptModal>;

export const ConfirmDialog: Story = {
  args: {
    isOpen: true,
    title: 'Öğrenci Kaydını Arşivle',
    description: 'Bu öğrenciyi pasif duruma almak istediğinizden emin misiniz? Arşivlenen öğrencilerin geçmiş karneleri korunur.',
    variant: 'warning',
    confirmText: 'Evet, Arşivle',
    cancelText: 'Vazgeç',
    requireInput: false,
    onConfirm: (val) => console.log('Confirmed:', val),
    onCancel: () => console.log('Cancelled'),
  },
};

export const DangerDeleteModal: Story = {
  args: {
    isOpen: true,
    title: 'Sınıfı Kalıcı Olarak Sil',
    description: 'Bu işlem geri alınamaz. Onaylamak için lütfen aşağıdaki alana silme gerekçesini yazınız.',
    variant: 'danger',
    confirmText: 'Kalıcı Olarak Sil',
    cancelText: 'Vazgeç',
    inputLabel: 'Silme Gerekçesi',
    placeholder: 'Örn: Sınıf birleştirildi...',
    requireInput: true,
    onConfirm: (val) => console.log('Delete confirmed with reason:', val),
    onCancel: () => console.log('Cancelled'),
  },
};

export const TextAreaFeedbackModal: Story = {
  args: {
    isOpen: true,
    title: 'Öğretmen Notu Ekle',
    description: 'Öğrencinin bugünkü gelişimi ile ilgili veliye iletilecek özel notunuzu giriniz.',
    variant: 'primary',
    confirmText: 'Notu Kaydet',
    cancelText: 'Kapat',
    inputLabel: 'Özel Not',
    placeholder: 'Öğrenci bugün arkadaşlarıyla çok iyi iş birliği yaptı...',
    isTextarea: true,
    requireInput: true,
    onConfirm: (val) => console.log('Note saved:', val),
    onCancel: () => console.log('Cancelled'),
  },
};
