import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Publicado em https://marlonrodler.github.io/typing-speed/
export default defineConfig({
  base: '/typing-speed/',
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/setupTests.js'] },
});
