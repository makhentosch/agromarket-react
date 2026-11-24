import { test, expect } from '@playwright/test';

// Тесты с меткой @smoke только читают данные: их можно запускать на продакшене

test('@smoke главная открывается, каталог показывает товары', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/АгроМаркет/);
  await expect(page.getByTestId('product-card').first()).toBeVisible();
});

test('@smoke страница товара открывается из каталога', async ({ page }) => {
  await page.goto('/');
  const first = page.getByTestId('product-card').first();
  const name = await first.getByRole('link').first().innerText();

  await first.getByRole('link').first().click();

  await expect(page).toHaveURL(/\/products\/\d+/);
  await expect(page.getByRole('heading', { name })).toBeVisible();
});

test('@smoke прямая ссылка на внутреннюю страницу открывается (rewrites из ЛР9)', async ({ page }) => {
  const response = await page.goto('/login');

  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
});
