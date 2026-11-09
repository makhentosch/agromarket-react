import { test, expect } from '@playwright/test';

const email = `e2e+${Date.now()}@agromarket.test`; // каждый запуск: новый покупатель
const password = 'E2e-Test-Password-123';

test('каталог загружается с сервера', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/АгроМаркет/i);
  await expect(page.getByTestId('product-card').first()).toBeVisible();
});

test('прямая ссылка на внутреннюю страницу не даёт 404', async ({ page }) => {
  const response = await page.goto('/login'); // проверка rewrites в vercel.json из ЛР9

  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Каталог' })).toBeVisible();
});

test('покупатель регистрируется, входит и оформляет заявку', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('product-card').first()).toBeVisible();

  // Регистрация: после неё сервер сразу выдаёт токен, отдельный вход не нужен
  const auth = page.locator('#login');
  await auth.getByRole('button', { name: /нет аккаунта/i }).click();
  await auth.getByLabel('Имя', { exact: true }).fill('E2E Покупатель');
  await auth.getByLabel('Email').fill(email);
  await auth.getByLabel('Пароль').fill(password);
  await auth.getByRole('button', { name: 'Зарегистрироваться' }).click();

  // Пользователь вошёл: в шапке его имя и кнопка «Выйти», формы входа больше нет
  const header = page.locator('header');
  await expect(header.getByRole('button', { name: 'Выйти' })).toBeVisible();
  await expect(header.getByText('E2E Покупатель')).toBeVisible();
  await expect(page.locator('#login')).toHaveCount(0);

  // Товар в корзину
  await page.getByTestId('product-card').first().getByRole('button', { name: 'В корзину' }).click();
  await expect(header.getByText('Корзина: 1')).toBeVisible();

  // Оптовая заявка
  const order = page.locator('#contact');
  await order.getByLabel('Имя / организация').fill('E2E Покупатель');
  await order.getByLabel('Email').fill(email);
  await order.getByLabel('Объём заказа, кг').fill('20');
  await order.getByLabel('Комментарий').fill('Автотест Playwright');
  await order.getByRole('button', { name: 'Отправить заявку' }).click();

  await expect(order.getByText('Заявка отправлена! Мы свяжемся с вами.')).toBeVisible();
});

test('гость на /admin не видит заявки и кнопки «Удалить»', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByTestId('product-card').first()).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Заявки' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Удалить' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
});
