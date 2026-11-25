function SellerProducts({ products, loading, error, onDelete }) {
  return (
    <section className="container py-4">
      <div className="admin-panel">
        <h3>Twoje produkty</h3>
        {loading ? (
          <p className="text-muted">Ładowanie produktów...</p>
        ) : error ? (
          <p className="text-danger" role="alert">{error}</p>
        ) : products.length > 0 ? (
          <div className="seller-list">
            {products.map((product) => (
              <div className="seller-row" key={product.id}>
                <div className="seller-product-details">
                  <img src={product.image} alt="" />
                  <div>
                    <strong>{product.name}</strong>
                    <span>
                      {product.category} · {product.price}
                      {product.discountPercent > 0
                        ? ` · Promocja ${product.discountPercent}% — ${product.discountPrice}`
                        : ''}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => onDelete(product)}
                >
                  Usuń produkt
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted mb-0">Nie masz jeszcze dodanych produktów.</p>
        )}
      </div>
    </section>
  );
}

export default SellerProducts;
