import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './api';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
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
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(loadSavedUser);
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState(null);

  const isAdmin = user?.role === 'admin';

  // Загрузка товаров один раз при первом появлении компонента
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await apiFetch('/products');
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить товары');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

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

  async function handleDelete(product) {
    if (!confirm(`Удалить «${product.name}»?`)) {
      return;
    }
    try {
      await apiFetch(`/products/${product.id}`, { method: 'DELETE' });
      setProducts(products.filter((p) => p.id !== product.id));
    } catch (err) {
      alert(err.message);
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header cartCount={cartCount} user={user} onLogout={handleLogout} />

      <main className="page">
        <section id="catalog" className="catalog">
          <div className="catalog-toolbar">
            <h2>Каталог</h2>
            <input
              type="search"
              placeholder="Поиск товара..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading && <p className="status">Загрузка...</p>}
          {error && <div className="error">{error}</div>}

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={handleAddToCart}
                onDelete={isAdmin ? handleDelete : undefined}
                featured={product.id === 1}
              />
            ))}
          </div>
        </section>

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
