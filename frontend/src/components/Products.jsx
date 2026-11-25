function Products({
  products = [],
  selectedCategory,
  searchQuery = '',
  fallbackMessage = 'Brak na magazynie',
  onAddToCart,
  onOpenProduct,
}) {
  const hasProducts = products.length > 0;

  return (
    <section className="products-section py-5" id="products">
      <div className="container">
        <p className="text-muted mb-1">
          Sprawdzone przez graczy. Wybrane dla Ciebie.
        </p>

        <h2>
          {searchQuery.trim()
            ? `Wyniki wyszukiwania: ${searchQuery.trim()}`
            : selectedCategory || 'Bestsellery'}
        </h2>

        {!hasProducts ? (
          <div className="mt-4 p-4 border rounded bg-white text-center text-muted">
            <strong>{fallbackMessage}</strong>
          </div>
        ) : (
          <div className="row g-3 mt-3">
            {products.map((product, index) => (
              <div className="col-12 col-sm-6 col-lg-3" key={product.id ?? index}>
                <div className="product-card" role="button" tabIndex={0} onClick={() => onOpenProduct?.(product)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpenProduct?.(product); } }}>

                  <span className="badge-sale">OKAZJA</span>

                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-img"
                  />

                  <small>{product.category}</small>

                  <h5>{product.name}</h5>

                  <h4>{product.price}</h4>

                  <div className="d-flex justify-content-between">
                    <small className="text-success">
                      Dostępny • wysyłka w 24 h
                    </small>

                    <button
                      type="button"
                      className="cart-btn"
                      onClick={(event) => { event.stopPropagation(); onAddToCart?.(product); }}
                      aria-label={`Dodaj ${product.name} do koszyka`}
                    >
                      <i className="bi bi-cart3"></i>
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Products;
