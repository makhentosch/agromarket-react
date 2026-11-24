import { useState } from 'react';
import { apiFetch } from '../api';
import ErrorMessage from './ErrorMessage';

// Добавление товара (только admin). Данные проверяет сервер (zod),
// его ошибки по полям показываются под формой
function ProductForm({ onCreated }) {
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const formElement = e.target;
    const form = new FormData(formElement);

    setError(null);
    setSending(true);
    try {
      const product = await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: form.get('name'),
          category: form.get('category'),
          price: form.get('price'), // строка из поля: сервер приведёт её к числу
          unit: form.get('unit'),
        }),
      });
      formElement.reset();
      onCreated(product);
    } catch (err) {
      setError(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="auth" aria-labelledby="product-form-title">
      <h3 id="product-form-title">Добавить товар</h3>
      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="product-name">Название</label>
        <input id="product-name" name="name" type="text" />

        <label htmlFor="product-category">Категория</label>
        <input id="product-category" name="category" type="text" />

        <label htmlFor="product-price">Цена, тг</label>
        <input id="product-price" name="price" type="number" step="0.01" />

        <label htmlFor="product-unit">Единица</label>
        <input id="product-unit" name="unit" type="text" defaultValue="кг" />

        <ErrorMessage error={error} />

        <button type="submit" disabled={sending}>Добавить</button>
      </form>
    </section>
  );
}

export default ProductForm;
