import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

// Данные администратора для E2E - только в .env.e2e (в Git не попадает)
if (existsSync('.env.e2e')) {
  process.loadEnvFile('.env.e2e');
}

const PRODUCTION_URL = 'https://agromarket-makhentosch.vercel.app';
const isRemote = Boolean(process.env.BASE_URL) || process.argv.includes('--project=production');

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure', // при падении: запись каждого шага
    screenshot: 'only-on-failure',
  },
  projects: [
    // Все E2E: локальный сайт и локальный API с базой для разработки
    {
      name: 'local',
      use: { ...devices['Desktop Chrome'], baseURL: process.env.BASE_URL || 'http://localhost:5173' },
    },
    // Продакшен: только тесты с меткой @smoke, которые ничего не меняют.
    // Бесплатный Render «просыпается» до минуты, поэтому таймаут больше
    {
      name: 'production',
      grep: /@smoke/,
      timeout: 90_000,
      use: { ...devices['Desktop Chrome'], baseURL: process.env.BASE_URL || PRODUCTION_URL },
    },
  ],
  // Локально Playwright использует запущенный npm run dev, а если его нет - поднимет Vite сам;
  // для продакшена - нет. Адрес 127.0.0.1 задан и в vite.config.js
  webServer: isRemote
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://127.0.0.1:5173',
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
