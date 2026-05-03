import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: { transformer: 'postcss' },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:10001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // keep the /api prefix
      },
    },
  },
});
