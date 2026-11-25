function SellerProducts({ products, loading, error, onDelete, onEdit }) {
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
                    <span>{product.category} · {product.price}</span>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button type="button" className="secondary-button" onClick={() => onEdit(product)}>Edytuj</button>
                  <button type="button" className="danger-button" onClick={() => onDelete(product)}>Usuń produkt</button>
                </div>
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
