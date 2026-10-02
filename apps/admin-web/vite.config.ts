import type { IncomingMessage } from 'node:http';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const API_TARGET = process.env.VITE_API_URL || 'http://localhost:3000';

const proxyConfig = {
  target: API_TARGET,
  changeOrigin: true,
  bypass: (req: IncomingMessage) => {
    if (req.headers.accept?.includes('text/html')) {
      return '/index.html';
    }
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/auth': proxyConfig,
      '/tenants': proxyConfig,
      '/health': proxyConfig,
      '/students': proxyConfig,
      '/attendance': proxyConfig,
      '/daily-reports': proxyConfig,
      '/daily-menus': proxyConfig,
      '/parent': proxyConfig,
      '/activities': proxyConfig,
      '/users': proxyConfig,
      '/classrooms': proxyConfig,
      '/pickup': proxyConfig,
      '/medication': proxyConfig,
      '/messaging': proxyConfig,
      '/incidents': proxyConfig,
      '/development': proxyConfig,
    },
  },
  // Workspace deps expose TS source as `main`. Exclude them from the
  // dep pre-bundler so the React plugin processes them on demand
  // instead of esbuild dropping JSX while scanning.
  optimizeDeps: {
    exclude: ['@kidscare/shared-types', '@kidscare/shared-schemas'],
  },
  esbuild: {
    loader: 'tsx',
    include: [/(src|\.storybook)\/.*\.tsx?$/],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
