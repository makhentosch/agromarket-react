import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import { server } from '../test/server';
import { renderWithProviders } from '../test/utils';
import App from '../App';
import LoginPage from './LoginPage';

async function fillAndSubmit(user, email, password) {
  await user.type(screen.getByLabelText(/e-mail/i), email);
  await user.type(screen.getByLabelText(/пароль/i), password);
  await user.click(screen.getByRole('button', { name: /^войти$/i }));
}

describe('LoginPage', () => {
  test('поля связаны с подписями', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toHaveAttribute('type', 'password');
  });

  test('пользователь может ввести данные', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/e-mail/i), 'farmer@agro.kz');

    expect(screen.getByLabelText(/e-mail/i)).toHaveValue('farmer@agro.kz');
  });

  test('успешный вход сохраняет токен и ведёт в каталог', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: '/login' });

    await fillAndSubmit(user, 'farmer@agro.kz', 'secret123');

    await waitFor(() => expect(localStorage.getItem('token')).toBe('test-token'));
    expect(await screen.findByRole('heading', { name: 'Каталог' })).toBeInTheDocument();
    expect(screen.getByText('Айгерим')).toBeInTheDocument();
  });

  test('неверный пароль (401) - текст ошибки с сервера', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await fillAndSubmit(user, 'farmer@agro.kz', 'wrong');

    expect(await screen.findByText('Неверный e-mail или пароль')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('слишком много попыток (429) - сообщение из ответа', async () => {
    server.use(http.post('*/api/auth/login', () => HttpResponse.json(
      { error: 'Слишком много попыток. Попробуйте через 15 минут' }, { status: 429 })));
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await fillAndSubmit(user, 'farmer@agro.kz', 'secret123');

    expect(await screen.findByText(/слишком много попыток/i)).toBeInTheDocument();
  });

  test('пока запрос идёт, кнопка «Войти» disabled и второй запрос не уходит', async () => {
    let requests = 0;
    server.use(http.post('*/api/auth/login', async () => {
      requests += 1;
      await delay(200);
      return HttpResponse.json({ error: 'Неверный e-mail или пароль' }, { status: 401 });
    }));
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await fillAndSubmit(user, 'farmer@agro.kz', 'secret123');
    const button = screen.getByRole('button', { name: /^войти$/i });
    expect(button).toBeDisabled();
    await user.click(button);

    expect(await screen.findByText('Неверный e-mail или пароль')).toBeInTheDocument();
    expect(requests).toBe(1);
  });

  test('пустые поля и e-mail без @ не отправляются', async () => {
    let requests = 0;
    server.use(http.post('*/api/auth/login', () => {
      requests += 1;
      return HttpResponse.json({}, { status: 500 });
    }));
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /^войти$/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Заполните e-mail и пароль');

    await fillAndSubmit(user, 'farmer.agro.kz', 'secret123');
    expect(screen.getByRole('alert')).toHaveTextContent('Некорректный e-mail');

    expect(requests).toBe(0);
  });
});
