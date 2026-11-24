import { test, expect } from '@playwright/test';

// Роль «фермера» в нашем магазине - администратор: только он добавляет товары.
// Регистрация выдаёт роль покупателя (защита от mass assignment, ЛР11),
// поэтому вход - под готовым админом из .env.e2e
test.beforeEach(async ({ page }) => {
  test.skip(!process.env.E2E_ADMIN_EMAIL, 'нет E2E_ADMIN_EMAIL и E2E_ADMIN_PASSWORD в .env.e2e');

  await page.goto('/login');
  await page.getByLabel(/e-mail/i).fill(process.env.E2E_ADMIN_EMAIL);
  await page.getByLabel(/пароль/i).fill(process.env.E2E_ADMIN_PASSWORD);
  await page.getByRole('button', { name: /^войти$/i }).click();
  await expect(page.getByRole('button', { name: /выйти/i })).toBeVisible();
});

test('админ добавляет товар, он появляется в каталоге, затем удаляется', async ({ page }) => {
  const name = `Тестовый мёд ${Date.now()}`;

  await page.goto('/admin');
  await page.getByLabel('Название').fill(name);
  await page.getByLabel('Категория').fill('Мёд');
  await page.getByLabel(/цена/i).fill('2500');
  await page.getByRole('button', { name: 'Добавить' }).click();
  await expect(page.getByText(`Товар «${name}» добавлен.`)).toBeVisible();

  await page.getByRole('link', { name: 'Перейти в каталог' }).click();
  const card = page.getByTestId('product-card').filter({ hasText: name });
  await expect(card).toBeVisible();

  // Тест убирает за собой: удаляем товар через интерфейс
  page.once('dialog', (dialog) => dialog.accept());
  await card.getByRole('button', { name: 'Удалить' }).click();
  await expect(card).toHaveCount(0);
});

test('цена -500 не принимается', async ({ page }) => {
  await page.goto('/admin');
  await page.getByLabel('Название').fill('Мёд');
  await page.getByLabel('Категория').fill('Мёд');
  await page.getByLabel(/цена/i).fill('-500');
  await page.getByRole('button', { name: 'Добавить' }).click();

  // Форма без своей проверки цены: ошибку присылает сервер (zod)
  await expect(page.getByRole('alert')).toHaveText('Цена должна быть больше 0');
});
