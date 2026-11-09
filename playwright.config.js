import { defineConfig, devices } from '@playwright/test';

const PRODUCTION_URL = 'https://agromarket-makhentosch.vercel.app';

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000, // сервер Free может «просыпаться» до минуты
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure', // при падении: «запись» каждого шага
    screenshot: 'only-on-failure',
  },
  // Адрес сайта можно переопределить переменной E2E_BASE_URL (так делает CI)
  projects: [
    {
      name: 'local',
      use: { ...devices['Desktop Chrome'], baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173' },
    },
    {
      name: 'production',
      use: { ...devices['Desktop Chrome'], baseURL: process.env.E2E_BASE_URL || PRODUCTION_URL },
    },
  ],
});
