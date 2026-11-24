import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';
import { mockFetch } from '../test/mockFetch';

const user = { id: 5, name: 'Айгерим', email: 'farmer@agromarket.kz', role: 'user' };

describe('LoginForm', () => {
  test('отправляет введённые e-mail и пароль и сохраняет токен', async () => {
    const userEv = userEvent.setup();
    const spy = mockFetch({ token: 'jwt-token', user });
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);

    await userEv.type(screen.getByLabelText(/e-?mail|почта/i), 'farmer@agromarket.kz');
    await userEv.type(screen.getByLabelText(/пароль/i), 'secret123');
    await userEv.click(screen.getByRole('button', { name: /^войти$/i }));

    const [url, options] = spy.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/auth\/login$/);
    expect(JSON.parse(options.body)).toEqual({ email: 'farmer@agromarket.kz', password: 'secret123' });
    expect(onLogin).toHaveBeenCalledWith(user);
    expect(localStorage.getItem('token')).toBe('jwt-token');
  });

  test('с пустыми полями не отправляет и показывает ошибку', async () => {
    const userEv = userEvent.setup();
    const spy = mockFetch({});
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);

    await userEv.click(screen.getByRole('button', { name: /^войти$/i }));

    expect(spy).not.toHaveBeenCalled();
    expect(onLogin).not.toHaveBeenCalled();
    expect(screen.getByText(/заполните/i)).toBeInTheDocument();
  });

  test('некорректный e-mail (без @) не отправляется', async () => {
    const userEv = userEvent.setup();
    const spy = mockFetch({});
    render(<LoginForm onLogin={vi.fn()} />);

    await userEv.type(screen.getByLabelText(/e-?mail|почта/i), 'farmer.agromarket.kz');
    await userEv.type(screen.getByLabelText(/пароль/i), 'secret123');
    await userEv.click(screen.getByRole('button', { name: /^войти$/i }));

    expect(spy).not.toHaveBeenCalled();
    expect(screen.getByText(/некорректный e-mail/i)).toBeInTheDocument();
  });

  test('показывает ошибку сервера при неверном пароле', async () => {
    const userEv = userEvent.setup();
    mockFetch({ error: 'Неверный e-mail или пароль' }, 401);
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);

    await userEv.type(screen.getByLabelText(/e-?mail|почта/i), 'farmer@agromarket.kz');
    await userEv.type(screen.getByLabelText(/пароль/i), 'wrong-pass');
    await userEv.click(screen.getByRole('button', { name: /^войти$/i }));

    expect(await screen.findByText('Неверный e-mail или пароль')).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  test('слишком много попыток (429): показывает текст из ответа сервера', async () => {
    const userEv = userEvent.setup();
    mockFetch({ error: 'Слишком много попыток. Попробуйте через 15 минут' }, 429);
    render(<LoginForm onLogin={vi.fn()} />);

    await userEv.type(screen.getByLabelText(/e-?mail|почта/i), 'farmer@agromarket.kz');
    await userEv.type(screen.getByLabelText(/пароль/i), 'secret123');
    await userEv.click(screen.getByRole('button', { name: /^войти$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Слишком много попыток. Попробуйте через 15 минут');
  });

  test('регистрация: ошибки полей из details показываются списком', async () => {
    const userEv = userEvent.setup();
    mockFetch({
      error: 'Ошибка валидации',
      details: [
        { field: 'email', message: 'Некорректный e-mail' },
        { field: 'password', message: 'Пароль: не длиннее 72 символов' },
      ],
    }, 400);
    render(<LoginForm onLogin={vi.fn()} />);

    await userEv.click(screen.getByRole('button', { name: /зарегистрироваться/i }));
    await userEv.type(screen.getByLabelText(/^имя$/i), 'Айгерим');
    await userEv.type(screen.getByLabelText(/e-?mail|почта/i), 'farmer@agromarket.kz');
    await userEv.type(screen.getByLabelText(/пароль/i), 'secret123');
    await userEv.click(screen.getByRole('button', { name: /^зарегистрироваться$/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Некорректный e-mail');
    expect(alert).toHaveTextContent('Пароль: не длиннее 72 символов');
  });

  test('поле «Имя» есть только в режиме регистрации', async () => {
    const userEv = userEvent.setup();
    render(<LoginForm onLogin={vi.fn()} />);

    expect(screen.queryByLabelText(/^имя$/i)).not.toBeInTheDocument();

    await userEv.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    expect(screen.getByLabelText(/^имя$/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Регистрация' })).toBeInTheDocument();
  });
});
