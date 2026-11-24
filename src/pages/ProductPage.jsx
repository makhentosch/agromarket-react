import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../api';

// Страница одного товара: /products/:id
function ProductPage({ onAdd = () => {} }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch(`/products/${id}`)
      .then(setProduct)
      .catch((err) => setError(err.status === 404 ? 'Товар не найден' : 'Не удалось загрузить товар'));
  }, [id]);

  return (
    <main className="page page--narrow">
      <p><Link to="/">Назад в каталог</Link></p>

      {!product && !error && <p className="status">Загрузка...</p>}
      {error && <div className="error" role="alert">{error}</div>}

      {product && (
        <article className="card product-page">
          <h1>{product.name}</h1>
          {product.image && <img src={product.image} alt={product.name} />}
          <p className="product-category">Категория: {product.category}</p>
          <p>{Number(product.price)} тг / {product.unit}</p>
          <button onClick={() => onAdd(product)}>В корзину</button>
        </article>
      )}
    </main>
  );
}

export default ProductPage;
