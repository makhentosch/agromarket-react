// Адрес API - из переменной окружения Vite.
// Локально берётся из .env.development, на хостинге (ЛР9) - из настроек сборки
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Запрос к API: JSON-заголовки, токен из localStorage, разбор ответа.
// При ошибке бросает Error с текстом из поля error ответа сервера
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `Ошибка сервера: ${response.status}`);
  }
  return data;
}
