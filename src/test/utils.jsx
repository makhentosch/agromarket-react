import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

// Компоненты используют роутер (Link, useNavigate) и контекст авторизации:
// без них в тесте они упадут, поэтому рендерим внутри тех же провайдеров, что в main.jsx
export function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
}

// Пользователь «уже входил»: токен и данные лежат в localStorage, как после входа
export function loginAs(user, token) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}
