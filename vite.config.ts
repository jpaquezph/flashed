import { defineConfig } from 'vite';

// base relativa: el build se puede publicar en cualquier subcarpeta de un hosting estático.
export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 2000,
  },
});
