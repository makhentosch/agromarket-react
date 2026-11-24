import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { renderWithProviders, loginAs } from '../test/utils';
import { admin } from '../test/handlers';
import ProductForm from './ProductForm';

async function fillProduct(user, { name, category, price }) {
  await user.type(screen.getByLabelText('Название'), name);
  await user.type(screen.getByLabelText('Категория'), category);
  await user.type(screen.getByLabelText(/цена/i), price);
  await user.click(screen.getByRole('button', { name: 'Добавить' }));
}

describe('ProductForm', () => {
  test('цена -500: сервер отвечает 400, видно «Цена должна быть больше 0»', async () => {
    loginAs(admin, 'admin-token');
    const onCreated = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<ProductForm onCreated={onCreated} />);

    await fillProduct(user, { name: 'Мёд', category: 'Мёд', price: '-500' });

    expect(await screen.findByRole('alert')).toHaveTextContent('Цена должна быть больше 0');
    expect(onCreated).not.toHaveBeenCalled();
  });

  test('успешное добавление: запрос с токеном админа, onCreated с новым товаром', async () => {
    loginAs(admin, 'admin-token');
    let authHeader;
    server.use(http.post('*/api/products', async ({ request }) => {
      authHeader = request.headers.get('Authorization');
      return HttpResponse.json({ id: 99, ...(await request.json()), price: '3500.00' }, { status: 201 });
    }));
    const onCreated = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<ProductForm onCreated={onCreated} />);

    await fillProduct(user, { name: 'Мёд липовый', category: 'Мёд', price: '3500' });

    await vi.waitFor(() => expect(onCreated).toHaveBeenCalled());
    expect(onCreated.mock.calls[0][0]).toMatchObject({ id: 99, name: 'Мёд липовый', category: 'Мёд' });
    expect(authHeader).toBe('Bearer admin-token');
  });
});
