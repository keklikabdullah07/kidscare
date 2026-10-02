import type { Meta, StoryObj } from '@storybook/react';
import { KidsCareLogo } from './KidsCareLogo';

const meta: Meta<typeof KidsCareLogo> = {
  title: 'Brand/KidsCareLogo',
  component: KidsCareLogo,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    variant: {
      control: 'select',
      options: ['standard', 'icon', 'horizontal', 'full'],
    },
    showText: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof KidsCareLogo>;

export const Standard: Story = {
  args: {
    size: 'md',
    variant: 'standard',
    showText: true,
  },
};

export const IconOnly: Story = {
  args: {
    size: 'md',
    variant: 'icon',
    showText: false,
  },
};

export const Horizontal: Story = {
  args: {
    size: 'md',
    variant: 'horizontal',
  },
};

export const FullLockup: Story = {
  args: {
    size: 'lg',
    variant: 'full',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 items-start">
      <KidsCareLogo size="sm" />
      <KidsCareLogo size="md" />
      <KidsCareLogo size="lg" />
      <KidsCareLogo size="xl" />
    </div>
  ),
};
