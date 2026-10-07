import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// BASE_PATH permite servir a app num subcaminho (ex.: /aprovacoes/ no projeto Vercel
// com vários serviços). Os ficheiros vão para dist/<subcaminho>/ para que os URLs
// pedidos (/aprovacoes/assets/...) correspondam aos ficheiros gerados.
const base = process.env.BASE_PATH || '/';

// `npm run build:demo` gera um único HTML autónomo (modo demonstração, rotas com #),
// para mostrar a app sem servidor.
export default defineConfig(({ mode }) => ({
  base: mode === 'demo' ? '/' : base,
  plugins: mode === 'demo' ? [react(), viteSingleFile()] : [react()],
  build: mode === 'demo' ? { outDir: 'dist-demo' } : { outDir: base === '/' ? 'dist' : `dist${base}` },
}));
