import { Link } from 'react-router-dom';

// Карточка товара - самостоятельный блок, поэтому <article>
function ProductCard({ product, onAdd, onDelete, featured }) {
  return (
    <article className={featured ? 'card card--featured' : 'card'} data-testid="product-card">
      {featured && <span className="badge">Товар недели</span>}
      <img src={product.image} alt={product.name} />
      <h3>
        <Link to={`/products/${product.id}`}>{product.name}</Link>
      </h3>
      {product.category && <span className="product-category">{product.category}</span>}
      {/* NUMERIC из PostgreSQL приходит строкой - приводим к числу */}
      <p>{Number(product.price)} тг / {product.unit}</p>
      <button onClick={() => onAdd(product)}>В корзину</button>
      {onDelete && (
        <button className="card-delete" onClick={() => onDelete(product)}>Удалить</button>
      )}
    </article>
  );
}

export default ProductCard;
