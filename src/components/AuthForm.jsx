import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import ErrorMessage from './ErrorMessage';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

// Проверка полей до отправки: понятный текст ошибки вместо подсказок браузера
function validate({ name, email, password }, isRegister) {
  if (!email || !password || (isRegister && !name)) {
    return isRegister ? 'Заполните имя, e-mail и пароль' : 'Заполните e-mail и пароль';
  }
  if (!EMAIL_RE.test(email)) {
    return 'Некорректный e-mail';
  }
  if (isRegister && password.length < MIN_PASSWORD_LENGTH) {
    return `Пароль: не меньше ${MIN_PASSWORD_LENGTH} символов`;
  }
  return null;
}

// Форма входа (mode="login") и регистрации (mode="register").
// Поле «Имя» есть только при регистрации
function AuthForm({ mode, onSuccess }) {
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const isRegister = mode === 'register';

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const body = {
      email: form.get('email').trim(),
      password: form.get('password'),
    };
    if (isRegister) {
      body.name = form.get('name').trim();
    }

    const validationError = validate(body, isRegister);
    if (validationError) {
      setError({ message: validationError });
      return;
    }

    setError(null);
    setSending(true);
    try {
      const data = await apiFetch(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      onSuccess(data);
    } catch (err) {
      // 400 с details, 401, 409, 429: текст берётся из ответа сервера
      setError(err);
      setSending(false);
    }
  }

  return (
    <section className="auth">
      <h1>{isRegister ? 'Регистрация' : 'Вход'}</h1>
      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        {isRegister && (
          <>
            <label htmlFor="auth-name">Имя</label>
            <input id="auth-name" name="name" type="text" required autoComplete="name" />
          </>
        )}

        <label htmlFor="auth-email">E-mail</label>
        <input id="auth-email" name="email" type="email" required autoComplete="email" />

        <label htmlFor="auth-password">Пароль</label>
        <input
          id="auth-password"
          name="password"
          type="password"
          required
          minLength={isRegister ? MIN_PASSWORD_LENGTH : undefined}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
        />

        <ErrorMessage error={error} />

        <button type="submit" disabled={sending}>
          {isRegister ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </form>
      <p>
        {isRegister ? (
          <Link to="/login">Уже есть аккаунт? Войти</Link>
        ) : (
          <Link to="/register">Нет аккаунта? Зарегистрироваться</Link>
        )}
      </p>
    </section>
  );
}

export default AuthForm;
