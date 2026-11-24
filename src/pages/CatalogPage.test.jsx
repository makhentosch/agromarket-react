import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import { server } from '../test/server';
import { renderWithProviders, loginAs } from '../test/utils';
import { admin } from '../test/handlers';
import CatalogPage from './CatalogPage';

describe('CatalogPage', () => {
  // Ошибки загрузки компонент пишет в console.error - в выводе тестов они не нужны
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));

  test('показывает товары из API', async () => {
    renderWithProviders(<CatalogPage />);

    expect(await screen.findByText('Мёд гречишный')).toBeInTheDocument();
    expect(screen.getByText('Картофель молодой')).toBeInTheDocument();
    expect(screen.getAllByTestId('product-card')).toHaveLength(2);
  });

  test('пока данные грузятся - индикатор загрузки', async () => {
    server.use(http.get('*/api/products', async () => {
      await delay(200);
      return HttpResponse.json([]);
    }));
    renderWithProviders(<CatalogPage />);

    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
    expect(await screen.findByText(/товаров пока нет/i)).toBeInTheDocument();
    expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument();
  });

  test('пустой каталог - понятное сообщение', async () => {
    server.use(http.get('*/api/products', () => HttpResponse.json([])));
    renderWithProviders(<CatalogPage />);

    expect(await screen.findByText(/товаров пока нет/i)).toBeInTheDocument();
  });

  test('сервер упал (500) - сообщение об ошибке, а не белый экран', async () => {
    server.use(http.get('*/api/products', () => HttpResponse.json({ error: 'Internal' }, { status: 500 })));
    renderWithProviders(<CatalogPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/не удалось загрузить/i);
  });

  test('сеть недоступна - то же сообщение об ошибке', async () => {
    server.use(http.get('*/api/products', () => HttpResponse.error()));
    renderWithProviders(<CatalogPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/не удалось загрузить/i);
  });

  test('админ удаляет товар запросом с токеном, карточка исчезает', async () => {
    loginAs(admin, 'admin-token');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    let deleted;
    server.use(http.delete('*/api/products/:id', ({ request, params }) => {
      deleted = { id: params.id, auth: request.headers.get('Authorization') };
      return new HttpResponse(null, { status: 204 });
    }));
    const user = userEvent.setup();
    renderWithProviders(<CatalogPage />);
    await screen.findByText('Картофель молодой');

    await user.click(screen.getAllByRole('button', { name: /удалить/i })[1]);

    await waitFor(() => expect(screen.queryByText('Картофель молодой')).not.toBeInTheDocument());
    expect(deleted).toEqual({ id: '2', auth: 'Bearer admin-token' });
  });

  test('поиск оставляет только подходящие товары', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CatalogPage />);
    await screen.findByText('Мёд гречишный');

    await user.type(screen.getByRole('searchbox', { name: /поиск товара/i }), 'картоф');

    expect(screen.getByText('Картофель молодой')).toBeInTheDocument();
    expect(screen.queryByText('Мёд гречишный')).not.toBeInTheDocument();
  });
});
