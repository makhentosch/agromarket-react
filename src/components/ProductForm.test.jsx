import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductForm from './ProductForm';
import { mockFetch } from '../test/mockFetch';

async function fillProduct(user, { name, category, price }) {
  await user.type(screen.getByLabelText('Название'), name);
  await user.type(screen.getByLabelText('Категория'), category);
  await user.type(screen.getByLabelText(/цена/i), price);
  await user.click(screen.getByRole('button', { name: 'Добавить' }));
}

describe('ProductForm', () => {
  test('цена -500: показывает ошибку сервера «Цена должна быть больше 0»', async () => {
    const user = userEvent.setup();
    mockFetch({
      error: 'Ошибка валидации',
      details: [{ field: 'price', message: 'Цена должна быть больше 0' }],
    }, 400);
    const onCreated = vi.fn();
    render(<ProductForm onCreated={onCreated} />);

    await fillProduct(user, { name: 'Мёд', category: 'Мёд', price: '-500' });

    expect(await screen.findByRole('alert')).toHaveTextContent('Цена должна быть больше 0');
    expect(onCreated).not.toHaveBeenCalled();
  });

  test('успешное добавление: запрос с токеном и onCreated с новым товаром', async () => {
    const user = userEvent.setup();
    localStorage.setItem('token', 'admin-token');
    const created = { id: 13, name: 'Мёд липовый', category: 'Мёд', price: '3500.00', unit: 'кг' };
    const spy = mockFetch(created, 201);
    const onCreated = vi.fn();
    render(<ProductForm onCreated={onCreated} />);

    await fillProduct(user, { name: 'Мёд липовый', category: 'Мёд', price: '3500' });

    await vi.waitFor(() => expect(onCreated).toHaveBeenCalledWith(created));
    const [url, options] = spy.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/products$/);
    expect(options.headers.Authorization).toBe('Bearer admin-token');
    expect(JSON.parse(options.body)).toEqual({ name: 'Мёд липовый', category: 'Мёд', price: '3500', unit: 'кг' });
  });
});
