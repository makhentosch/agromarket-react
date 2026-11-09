import { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import ProductCard from './ProductCard';

// Каталог: загрузка товаров с сервера, поиск, удаление (для админа)
function Catalog({ isAdmin = false, onAdd }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const loaded = !loading && !error;

  return (
    <section id="catalog" className="catalog">
      <div className="catalog-toolbar">
        <h2>Каталог</h2>
        <input
          type="search"
          placeholder="Поиск товара..."
          aria-label="Поиск товара"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <p className="status">Загрузка...</p>}
      {error && <div className="error" role="alert">{error}</div>}
      {loaded && products.length === 0 && <p className="status">Товаров пока нет</p>}
      {loaded && products.length > 0 && filteredProducts.length === 0 && (
        <p className="status">Ничего не найдено</p>
      )}

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={onAdd}
            onDelete={isAdmin ? handleDelete : undefined}
            featured={product.id === 1}
          />
        ))}
      </div>
    </section>
  );
}

export default Catalog;
