import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from './test/server';
import { renderWithProviders, loginAs } from './test/utils';
import { admin, buyer } from './test/handlers';
import App from './App';

describe('App: маршруты и права', () => {
  test('страница товара показывает товар из /api/products/:id', async () => {
    renderWithProviders(<App />, { route: '/products/1' });

    expect(await screen.findByRole('heading', { name: 'Мёд гречишный' })).toBeInTheDocument();
    expect(screen.getByText('Категория: Мёд')).toBeInTheDocument();
  });

  test('несуществующий товар - «Товар не найден»', async () => {
    renderWithProviders(<App />, { route: '/products/999' });

    expect(await screen.findByRole('alert')).toHaveTextContent('Товар не найден');
  });

  test('гость на /admin попадает на страницу входа', async () => {
    renderWithProviders(<App />, { route: '/admin' });

    expect(await screen.findByRole('heading', { name: 'Вход' })).toBeInTheDocument();
  });

  test('покупатель на /admin видит «Нет доступа»', async () => {
    loginAs(buyer, 'test-token');
    renderWithProviders(<App />, { route: '/admin' });

    expect(await screen.findByRole('alert')).toHaveTextContent(/нет доступа/i);
  });

  test('админ на /admin видит заявки; запросы идут с заголовком Authorization', async () => {
    loginAs(admin, 'admin-token');
    const headers = {};
    server.events.on('request:start', ({ request }) => {
      headers[new URL(request.url).pathname] = request.headers.get('Authorization');
    });
    renderWithProviders(<App />, { route: '/admin' });

    expect(await screen.findByRole('heading', { name: 'Заявки' })).toBeInTheDocument();
    await waitFor(() => expect(headers['/api/orders']).toBe('Bearer admin-token'));
    expect(headers['/api/auth/me']).toBe('Bearer admin-token');
    server.events.removeAllListeners();
  });

  test('сервер ответил 401 на /auth/me: токен удаляется, в шапке «Войти»', async () => {
    loginAs(buyer, 'test-token');
    server.use(http.get('*/api/auth/me', () =>
      HttpResponse.json({ error: 'Срок действия токена истёк, войдите снова' }, { status: 401 })));
    renderWithProviders(<App />);

    expect(await screen.findByRole('link', { name: 'Войти' })).toBeInTheDocument();
    await waitFor(() => expect(localStorage.getItem('token')).toBeNull());
  });

  test('неизвестный адрес - «Страница не найдена»', () => {
    renderWithProviders(<App />, { route: '/nope' });

    expect(screen.getByRole('heading', { name: 'Страница не найдена' })).toBeInTheDocument();
  });
});
