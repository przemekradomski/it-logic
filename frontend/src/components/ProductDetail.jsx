function ProductDetail({ product, onClose, onAddToCart, canEdit, onEdit }) {
  if (!product) return null;

  return (
    <section className="product-detail-section">
      <div className="container">
        <button type="button" className="text-button mb-4" onClick={onClose}>← Wróć do produktów</button>
        <div className="product-detail-panel">
          <div className="product-detail-image-wrap">
            <img src={product.image} alt={product.name} className="product-detail-image" />
          </div>
          <div className="product-detail-content">
            <p className="eyebrow">{product.category}</p>
            <h1>{product.name}</h1>
            {product.seller && <p className="seller-name">Sprzedawca: <strong>{product.seller}</strong></p>}
            <h2 className="product-detail-price">{product.price}</h2>
            <p className="product-description">
              {product.description || 'Sprzedawca nie dodał jeszcze opisu tego produktu.'}
            </p>
            <div className="product-detail-actions">
              <button type="button" className="primary-button" onClick={() => onAddToCart(product)}>Dodaj do koszyka</button>
              {canEdit && <button type="button" className="secondary-button" onClick={() => onEdit(product)}>Edytuj produkt</button>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetail;
