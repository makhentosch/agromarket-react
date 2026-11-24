import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // IPv4-адрес: на Windows localhost иначе может слушать только IPv6,
  // и Playwright не увидит уже запущенный npm run dev
  server: { host: '127.0.0.1', port: 5173 },
  test: {
    environment: 'jsdom', // в тестах есть document, window
    globals: true,
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.test.{js,jsx}'], // e2e-тесты Playwright сюда не попадут
    css: false,
    coverage: {
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/*.test.{js,jsx}', 'src/test/**', 'src/main.jsx'],
    },
  },
})
