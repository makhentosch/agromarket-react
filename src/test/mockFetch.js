import { vi } from 'vitest';

// Ответ «сервера»: Response - стандартный класс, как в настоящем fetch
export function jsonResponse(body, status = 200) {
  // У ответа 204 No Content тела быть не может, как и у настоящего сервера
  if (status === 204) {
    return new Response(null, { status });
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Каждый вызов fetch получает новый ответ с одним и тем же телом
export function mockFetch(body, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async () => jsonResponse(body, status));
}

// Разные ответы для разных адресов: { '/auth/me': [body, status], '/products': [body] }
export function mockFetchRoutes(routes) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    const path = Object.keys(routes).find((p) => String(url).endsWith(p));
    if (!path) {
      return jsonResponse({ error: 'Маршрут не найден' }, 404);
    }
    const [body, status = 200] = routes[path];
    return jsonResponse(body, status);
  });
}
