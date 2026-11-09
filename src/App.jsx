import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './api';
import Header from './components/Header';
import Footer from './components/Footer';
import Catalog from './components/Catalog';
import ContactForm from './components/ContactForm';
import LoginForm from './components/LoginForm';
import OrdersList from './components/OrdersList';

// Пользователь из прошлого входа (токен лежит рядом в localStorage)
function loadSavedUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(loadSavedUser);
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState(null);

  const isAdmin = user?.role === 'admin';

  // Проверяем сохранённый токен: если он истёк или недействителен - выходим
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      return;
    }
    apiFetch('/auth/me')
      .then((me) => setUser(me))
      .catch(() => handleLogout());
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setOrdersError(null);
      setOrders(await apiFetch('/orders'));
    } catch (err) {
      setOrdersError(err.message);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadOrders();
    } else {
      setOrders([]);
    }
  }, [isAdmin, loadOrders]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  function handleAddToCart() {
    setCartCount(cartCount + 1);
  }

  return (
    <>
      <Header cartCount={cartCount} user={user} onLogout={handleLogout} />

      <main className="page">
        <Catalog isAdmin={isAdmin} onAdd={handleAddToCart} />

        <aside id="delivery" className="sidebar">
          <h3>Доставка</h3>
          <ul>
            <li>Астана - на следующий день</li>
            <li>Акмолинская область - 2-3 дня</li>
            <li>Бесплатно от 20 000 тг</li>
          </ul>
        </aside>

        {!user && <LoginForm onLogin={setUser} />}

        <ContactForm onSent={isAdmin ? loadOrders : undefined} />

        {isAdmin && <OrdersList orders={orders} error={ordersError} />}
      </main>

      <Footer />
    </>
  );
}

export default App;
