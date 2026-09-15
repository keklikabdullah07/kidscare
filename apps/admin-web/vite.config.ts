import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Proxy API + auth requests to the NestJS backend on :3000. Without
    // this the browser hits `http://localhost:5173/auth/me` (404) instead
    // of the real server.
    proxy: {
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/tenants': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
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
