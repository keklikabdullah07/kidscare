import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const API_TARGET = process.env.VITE_API_URL || 'http://localhost:3000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/auth': { target: API_TARGET, changeOrigin: true },
      '/tenants': { target: API_TARGET, changeOrigin: true },
      '/health': { target: API_TARGET, changeOrigin: true },
      '/students': { target: API_TARGET, changeOrigin: true },
      '/attendance': { target: API_TARGET, changeOrigin: true },
      '/daily-reports': { target: API_TARGET, changeOrigin: true },
      '/daily-menus': { target: API_TARGET, changeOrigin: true },
      '/parent': { target: API_TARGET, changeOrigin: true },
      '/activities': { target: API_TARGET, changeOrigin: true },
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
    include: [/src\/.*\.tsx?$/],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
