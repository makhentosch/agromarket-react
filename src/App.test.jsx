import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { mockFetchRoutes } from './test/mockFetch';

const admin = { id: 1, name: 'Администратор', email: 'admin@agromarket.kz', role: 'admin' };

// Пользователь «уже входил»: токен и данные лежат в localStorage, как после LoginForm
function loginAs(user) {
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('user', JSON.stringify(user));
}

describe('App: запросы с токеном', () => {
  test('проверка входа и заявки запрашиваются с заголовком Authorization', async () => {
    loginAs(admin);
    const spy = mockFetchRoutes({
      '/products': [[]],
      '/auth/me': [admin],
      '/orders': [[]],
    });
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Заявки' })).toBeInTheDocument();

    const calls = spy.mock.calls.map(([url, options]) => ({ url: String(url), options }));
    const me = calls.find((c) => c.url.endsWith('/api/auth/me'));
    const orders = calls.find((c) => c.url.endsWith('/api/orders'));
    expect(me.options.headers.Authorization).toBe('Bearer test-token');
    expect(orders.options.headers.Authorization).toBe('Bearer test-token');
  });

  test('сервер ответил 401: токен удаляется и показывается форма входа', async () => {
    loginAs({ ...admin, role: 'user', name: 'Айгерим' });
    mockFetchRoutes({
      '/products': [[]],
      '/auth/me': [{ error: 'Срок действия токена истёк, войдите снова' }, 401],
    });
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Вход' })).toBeInTheDocument();
    await waitFor(() => expect(localStorage.getItem('token')).toBeNull());
    expect(screen.queryByRole('button', { name: /выйти/i })).not.toBeInTheDocument();
  });

  test('гость не видит заявки и кнопки «Удалить»', async () => {
    const spy = mockFetchRoutes({ '/products': [[{ id: 1, name: 'Гречка', price: '700.00', unit: 'кг' }]] });
    render(<App />);

    expect(await screen.findByText('Гречка')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Заявки' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /удалить/i })).not.toBeInTheDocument();
    expect(spy.mock.calls.some(([url]) => String(url).endsWith('/api/orders'))).toBe(false);
  });
});
