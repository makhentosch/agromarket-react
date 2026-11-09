import { useState } from 'react';
import { apiFetch } from '../api';

function ContactForm({ onSent }) {
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault(); // не перезагружать страницу
    const formElement = e.target;
    const form = new FormData(formElement);

    setMessage(null);
    setError(null);
    try {
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          volume: Number(form.get('volume')),
          date: form.get('date'),
          comment: form.get('comment'),
        }),
      });
      setMessage('Заявка отправлена! Мы свяжемся с вами.');
      formElement.reset(); // очистить поля
      onSent?.();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section id="contact" className="contact">
      <h2>Оптовая заявка</h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Имя / организация</label>
        <input id="name" name="name" type="text" required />

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required placeholder="farmer@mail.kz" />

        <label htmlFor="phone">Телефон</label>
        <input id="phone" name="phone" type="tel" placeholder="+7 7XX XXX XX XX" />

        <label htmlFor="volume">Объём заказа, кг</label>
        <input id="volume" name="volume" type="number" min="10" required />

        <label htmlFor="date">Желаемая дата доставки</label>
        <input id="date" name="date" type="date" />

        <label htmlFor="comment">Комментарий</label>
        <textarea id="comment" name="comment" rows="4" />

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        <button type="submit">Отправить заявку</button>
      </form>
    </section>
  );
}

export default ContactForm;
