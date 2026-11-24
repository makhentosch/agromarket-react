import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../api';

const AuthContext = createContext(null);

// Пользователь из прошлого входа (токен лежит рядом в localStorage)
function loadSavedUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSavedUser);

  function login({ token, user: loggedIn }) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedIn));
    setUser(loggedIn);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  // Проверяем сохранённый токен: если он истёк или недействителен, выходим
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      return;
    }
    apiFetch('/auth/me')
      .then((me) => setUser(me))
      .catch(() => logout());
  }, []);

  const value = { user, isAdmin: user?.role === 'admin', login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
