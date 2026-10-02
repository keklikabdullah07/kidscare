import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['brand', 'success', 'warning', 'danger', 'info', 'neutral'],
    },
    size: {
      control: 'radio',
      options: ['sm', 'md'],
    },
    dot: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Etiket',
    variant: 'brand',
    size: 'md',
    dot: false,
  },
};

export const WithDot: Story = {
  args: {
    children: 'Aktif Öğrenci',
    variant: 'success',
    size: 'md',
    dot: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="brand">Brand / Teal</Badge>
      <Badge variant="success" dot>Success / Emerald</Badge>
      <Badge variant="warning" dot>Warning / Amber</Badge>
      <Badge variant="danger" dot>Danger / Rose</Badge>
      <Badge variant="info">Info / Sky</Badge>
      <Badge variant="neutral">Neutral / Slate</Badge>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge size="sm" variant="brand" dot>Küçük (sm)</Badge>
      <Badge size="md" variant="brand" dot>Standart (md)</Badge>
    </div>
  ),
};
