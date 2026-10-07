import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` keeps asset paths relative, so the build works on GitHub Pages,
// Vercel or any static host without extra configuration.
export default defineConfig({
  plugins: [react()],
  base: './',
});
