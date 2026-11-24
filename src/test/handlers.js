import { http, HttpResponse } from 'msw';

// Данные в том же формате, что отдаёт agromarket-server:
// цена NUMERIC приходит строкой, у товара есть unit и category
export const products = [
  { id: 1, name: 'Мёд гречишный', category: 'Мёд', price: '3500.00', unit: 'л', image: null },
  { id: 2, name: 'Картофель молодой', category: 'Овощи', price: '250.00', unit: 'кг', image: null },
];

export const buyer = { id: 7, name: 'Айгерим', email: 'farmer@agro.kz', role: 'user' };
export const admin = { id: 1, name: 'Администратор', email: 'admin@agromarket.kz', role: 'admin' };

// Какому токену какой пользователь соответствует
const usersByToken = { 'test-token': buyer, 'admin-token': admin };
const userFromRequest = (request) =>
  usersByToken[(request.headers.get('Authorization') || '').replace('Bearer ', '')];

const unauthorized = () => HttpResponse.json({ error: 'Требуется авторизация' }, { status: 401 });

// '*' в начале - подходит любой адрес API (localhost:3000, Render ...)
export const handlers = [
  http.get('*/api/products', () => HttpResponse.json(products)),

  http.get('*/api/products/:id', ({ params }) => {
    const product = products.find((p) => p.id === Number(params.id));
    return product
      ? HttpResponse.json(product)
      : HttpResponse.json({ error: 'Товар не найден' }, { status: 404 });
  }),

  http.post('*/api/products', async ({ request }) => {
    if (userFromRequest(request)?.role !== 'admin') return unauthorized();
    const body = await request.json();
    if (!(Number(body.price) > 0)) {
      return HttpResponse.json({
        error: 'Ошибка валидации',
        details: [{ field: 'price', message: 'Цена должна быть больше 0' }],
      }, { status: 400 });
    }
    return HttpResponse.json({ id: 99, ...body, price: Number(body.price).toFixed(2) }, { status: 201 });
  }),

  http.delete('*/api/products/:id', ({ request }) =>
    userFromRequest(request)?.role === 'admin' ? new HttpResponse(null, { status: 204 }) : unauthorized()),

  http.post('*/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    if (password === 'secret123') {
      return HttpResponse.json({ token: 'test-token', user: { ...buyer, email } });
    }
    return HttpResponse.json({ error: 'Неверный e-mail или пароль' }, { status: 401 });
  }),

  http.post('*/api/auth/register', async ({ request }) => {
    const { name, email } = await request.json();
    return HttpResponse.json({ token: 'test-token', user: { id: 8, name, email, role: 'user' } }, { status: 201 });
  }),

  http.get('*/api/auth/me', ({ request }) => {
    const user = userFromRequest(request);
    return user ? HttpResponse.json(user) : unauthorized();
  }),

  http.get('*/api/orders', ({ request }) =>
    userFromRequest(request)?.role === 'admin' ? HttpResponse.json([]) : unauthorized()),

  http.post('*/api/orders', async ({ request }) =>
    HttpResponse.json({ id: 1, ...(await request.json()), status: 'new' }, { status: 201 })),
];
