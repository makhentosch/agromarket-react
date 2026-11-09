// Карточка товара - самостоятельный блок, поэтому <article>
function ProductCard({ product, onAdd, onDelete, featured }) {
  return (
    <article className={featured ? 'card card--featured' : 'card'} data-testid="product-card">
      {featured && <span className="badge">Товар недели</span>}
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      {/* NUMERIC из PostgreSQL приходит строкой - приводим к числу */}
      <p>{Number(product.price)} тг / {product.unit}</p>
      <button onClick={() => {}}>В корзину</button>
      {onDelete && (
        <button className="card-delete" onClick={() => onDelete(product)}>Удалить</button>
      )}
    </article>
  );
}

export default ProductCard;
