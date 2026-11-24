import { test, expect } from '@playwright/test';

// Регистрация пишет в базу: эти тесты только для локального API, не для продакшена

test('новый покупатель регистрируется и видит своё имя', async ({ page }) => {
  const email = `e2e${Date.now()}@test.kz`; // уникальный, тест можно повторять

  await page.goto('/register');
  await page.getByLabel('Имя').fill('E2E Тестов');
  await page.getByLabel(/e-mail/i).fill(email);
  await page.getByLabel(/пароль/i).fill('12345678');
  await page.getByRole('button', { name: /зарегистр/i }).click();

  await expect(page.locator('header').getByText('E2E Тестов')).toBeVisible(); // имя в шапке
  await expect(page).toHaveURL(/\/$/);
});

test('неверный пароль - ошибка, остаёмся на странице входа', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/e-mail/i).fill('nobody@test.kz');
  await page.getByLabel(/пароль/i).fill('wrong-password');
  await page.getByRole('button', { name: /^войти$/i }).click();

  await expect(page.getByText(/неверный/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test('гость на /admin попадает на страницу входа', async ({ page }) => {
  await page.goto('/admin');

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
});
