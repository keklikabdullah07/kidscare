import type { Meta, StoryObj } from '@storybook/react';
import { Plus, Check, Trash2, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { TactileButton } from './TactileButton';

const meta: Meta<typeof TactileButton> = {
  title: 'Design System / TactileButton',
  component: TactileButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['teal', 'amber', 'secondary', 'danger', 'peach'],
      description: '3D dokunsal renk teması ve ekstrüzyon gölgesi',
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'Buton boyutu ve iç boşluklar',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TactileButton>;

export const Default: Story = {
  args: {
    children: 'Dokunsal Buton',
    variant: 'teal',
    size: 'md',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-[#FAF9F6] dark:bg-[#090D16] rounded-2xl">
      <TactileButton variant="teal">
        <Sparkles className="w-4 h-4" />
        <span>Teal / Birincil</span>
      </TactileButton>

      <TactileButton variant="amber">
        <Plus className="w-4 h-4" />
        <span>Amber / Kreş Vurgusu</span>
      </TactileButton>

      <TactileButton variant="secondary">
        <Check className="w-4 h-4" />
        <span>Secondary / Keten Beyazı</span>
      </TactileButton>

      <TactileButton variant="peach">
        <Heart className="w-4 h-4" />
        <span>Peach / Şeftali Terracotta</span>
      </TactileButton>

      <TactileButton variant="danger">
        <Trash2 className="w-4 h-4" />
        <span>Danger / Tehlike</span>
      </TactileButton>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-[#FAF9F6] dark:bg-[#090D16] rounded-2xl">
      <TactileButton size="sm" variant="teal">
        <span>Küçük (sm)</span>
      </TactileButton>
      <TactileButton size="md" variant="teal">
        <span>Orta Standart (md)</span>
      </TactileButton>
      <TactileButton size="lg" variant="teal">
        <span>Büyük / Hero (lg)</span>
        <ArrowRight className="w-4 h-4 ml-1" />
      </TactileButton>
    </div>
  ),
};

export const PressedFeedbackDemo: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-6 bg-[#FAF9F6] dark:bg-[#090D16] rounded-3xl border border-[#DDD4C4] dark:border-slate-800 max-w-md">
      <h4 className="text-sm font-black text-slate-800 dark:text-white">
        Fiziksel Basma Hissi (Tactile Feedback)
      </h4>
      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
        Aşağıdaki butonlara tıklayarak (active state) 3D alt dudağın sıkışmasını ve düğmenin
        fiziksel olarak içeri gömülmesini test edebilirsiniz:
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <TactileButton variant="amber" size="md">
          <span>Tıkla & Basılı Tut</span>
        </TactileButton>
        <TactileButton variant="secondary" size="md">
          <span>İptal Et</span>
        </TactileButton>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    children: 'Devre Dışı Buton',
    variant: 'teal',
    size: 'md',
    disabled: true,
  },
};
