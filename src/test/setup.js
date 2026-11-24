import '@testing-library/jest-dom/vitest'; // матчеры toBeInTheDocument, toBeDisabled...
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './server.js';

// Запрос без обработчика - ошибка теста: так не пропустим опечатку в адресе API
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers(); // сбросить подмены, сделанные внутри теста
  cleanup(); // убираем отрисованное после каждого теста
  vi.restoreAllMocks();
  localStorage.clear(); // токен из одного теста не должен попасть в другой
});

afterAll(() => server.close());
