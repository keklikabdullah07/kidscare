import type { Preview } from '@storybook/react';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#F6F3EC', // KidsCare Impeccable Warm Canvas
        },
        {
          name: 'dark',
          value: '#090D16', // KidsCare Impeccable Deep Obsidian background
        },
        {
          name: 'pure-white',
          value: '#FFFFFF',
        },
      ],
    },
  },
};

export default preview;
