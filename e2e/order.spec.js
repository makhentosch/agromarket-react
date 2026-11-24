import { test, expect } from '@playwright/test';

test('покупатель кладёт товар в корзину и отправляет оптовую заявку', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('product-card').first().getByRole('button', { name: 'В корзину' }).click();
  await expect(page.locator('header').getByText('Корзина: 1')).toBeVisible();

  const order = page.locator('#contact');
  await order.getByLabel('Имя / организация').fill('E2E Покупатель');
  await order.getByLabel('Email').fill(`e2e${Date.now()}@test.kz`);
  await order.getByLabel('Объём заказа, кг').fill('20');
  await order.getByLabel('Комментарий').fill('Автотест Playwright');
  await order.getByRole('button', { name: 'Отправить заявку' }).click();

  await expect(order.getByText('Заявка отправлена! Мы свяжемся с вами.')).toBeVisible();
});
