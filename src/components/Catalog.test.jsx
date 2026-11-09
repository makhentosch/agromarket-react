import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Catalog from './Catalog';
import { mockFetch, mockFetchRoutes } from '../test/mockFetch';

const products = [
  { id: 1, name: 'Мёд гречишный', price: '3500.00', unit: 'л', category: 'Мёд' },
  { id: 2, name: 'Пшеница твёрдая', price: '150.00', unit: 'кг', category: 'Зерно' },
];

describe('Catalog', () => {
  // Ошибки загрузки компонент пишет в console.error - в выводе тестов они не нужны
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));

  test('сначала показывает загрузку, потом товары', async () => {
    mockFetch(products);
    render(<Catalog onAdd={vi.fn()} />);

    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
    // findBy ждёт, пока «придёт ответ сервера» и React перерисует экран
    expect(await screen.findByText('Мёд гречишный')).toBeInTheDocument();
    expect(screen.getByText('Пшеница твёрдая')).toBeInTheDocument();
    expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument();
  });

  test('запрашивает правильный адрес', async () => {
    const spy = mockFetch(products);
    render(<Catalog onAdd={vi.fn()} />);

    await screen.findByText('Мёд гречишный');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(String(spy.mock.calls[0][0])).toMatch(/\/api\/products$/);
  });

  test('при ошибке сервера показывает сообщение', async () => {
    mockFetch({ error: 'Внутренняя ошибка сервера' }, 500);
    render(<Catalog onAdd={vi.fn()} />);

    expect(await screen.findByText('Не удалось загрузить товары')).toBeInTheDocument();
    expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument();
  });

  test('сервер вернул пустой список: «Товаров пока нет»', async () => {
    mockFetch([]);
    render(<Catalog onAdd={vi.fn()} />);

    expect(await screen.findByText('Товаров пока нет')).toBeInTheDocument();
  });

  test('сеть недоступна: показывает ошибку загрузки', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    render(<Catalog onAdd={vi.fn()} />);

    expect(await screen.findByText('Не удалось загрузить товары')).toBeInTheDocument();
  });

  test('поиск оставляет только подходящие товары', async () => {
    const user = userEvent.setup();
    mockFetch(products);
    render(<Catalog onAdd={vi.fn()} />);
    await screen.findByText('Мёд гречишный');

    await user.type(screen.getByRole('searchbox', { name: /поиск товара/i }), 'мёд');

    expect(screen.getByText('Мёд гречишный')).toBeInTheDocument();
    expect(screen.queryByText('Пшеница твёрдая')).not.toBeInTheDocument();
  });

  test('админ удаляет товар запросом с токеном', async () => {
    const user = userEvent.setup();
    localStorage.setItem('token', 'test-token');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const spy = mockFetchRoutes({ '/products': [products], '/products/2': [null, 204] });
    render(<Catalog isAdmin onAdd={vi.fn()} />);
    await screen.findByText('Пшеница твёрдая');

    const buttons = screen.getAllByRole('button', { name: /удалить/i });
    await user.click(buttons[1]);

    const [url, options] = spy.mock.calls[1];
    expect(String(url)).toMatch(/\/api\/products\/2$/);
    expect(options.method).toBe('DELETE');
    expect(options.headers.Authorization).toBe('Bearer test-token');
    await waitFor(() => expect(screen.queryByText('Пшеница твёрдая')).not.toBeInTheDocument());
    expect(screen.getByText('Мёд гречишный')).toBeInTheDocument();
  });
});
