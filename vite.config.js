import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* Arayüz client/ altında, dist/'e derlenir. base './': alt dizinde de çalışır.
   Geliştirmede Vite 5173'te, API istekleri 3120'deki sunucuya aktarılır. */
const API = process.env.API_ADRESI || 'http://localhost:3120';

export default defineConfig({
  root: 'client',
  base: './',
  plugins: [react()],
  build: { outDir: '../dist', emptyOutDir: true, assetsDir: 'assets' },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: API, changeOrigin: true,
        configure: p => p.on('proxyReq', r => { if (r.getHeader('origin')) r.setHeader('origin', API); }),
      },
    },
  },
});
