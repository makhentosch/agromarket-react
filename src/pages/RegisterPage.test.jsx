import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { renderWithProviders } from '../test/utils';
import App from '../App';
import RegisterPage from './RegisterPage';

async function fillAndSubmit(user, { name, email, password }) {
  await user.type(screen.getByLabelText(/^имя$/i), name);
  await user.type(screen.getByLabelText(/e-mail/i), email);
  await user.type(screen.getByLabelText(/пароль/i), password);
  await user.click(screen.getByRole('button', { name: /^зарегистрироваться$/i }));
}

describe('RegisterPage', () => {
  test('сервер ответил 400 с details: ошибка поля email видна на странице', async () => {
    server.use(http.post('*/api/auth/register', () => HttpResponse.json({
      error: 'Ошибка валидации',
      details: [{ field: 'email', message: 'Некорректный e-mail' }],
    }, { status: 400 })));
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    await fillAndSubmit(user, { name: 'Айгерим', email: 'aigerim@agro.kz', password: 'secret123' });

    expect(await screen.findByRole('alert')).toHaveTextContent('Некорректный e-mail');
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('после регистрации имя покупателя видно в шапке', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: '/register' });

    await fillAndSubmit(user, { name: 'Новый Покупатель', email: 'new@agro.kz', password: 'secret123' });

    expect(await screen.findByText('Новый Покупатель')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Выйти' })).toBeInTheDocument();
  });

  test('у входа нет поля «Имя», ссылка ведёт на регистрацию, где оно есть', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: '/login' });
    expect(screen.queryByLabelText(/^имя$/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /нет аккаунта/i }));

    expect(screen.getByRole('heading', { name: 'Регистрация' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^имя$/i)).toBeInTheDocument();
  });
});
