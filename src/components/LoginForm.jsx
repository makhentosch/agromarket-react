import { useState } from 'react';
import { apiFetch } from '../api';

// Форма входа и регистрации. Поле «Имя» показывается только при регистрации
function LoginForm({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const isRegister = mode === 'register';

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const body = {
      email: form.get('email'),
      password: form.get('password'),
    };
    if (isRegister) {
      body.name = form.get('name');
    }

    setError(null);
    setSending(true);
    try {
      const data = await apiFetch(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="login" className="auth">
      <h2>{isRegister ? 'Регистрация' : 'Вход'}</h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        {isRegister && (
          <>
            <label htmlFor="auth-name">Имя</label>
            <input id="auth-name" name="name" type="text" required />
          </>
        )}

        <label htmlFor="auth-email">Email</label>
        <input id="auth-email" name="email" type="email" required autoComplete="email" />

        <label htmlFor="auth-password">Пароль</label>
        <input
          id="auth-password"
          name="password"
          type="password"
          required
          minLength={isRegister ? 8 : undefined}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
        />

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={sending}>
          {isRegister ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </form>
      <button
        type="button"
        className="link-button"
        onClick={() => {
          setMode(isRegister ? 'login' : 'register');
          setError(null);
        }}
      >
        {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
      </button>
    </section>
  );
}

export default LoginForm;
