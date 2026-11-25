import ProductRating from './ProductRating';
import ProductReviewForm from './ProductReviewForm';

function ProductCard({
  product,
  user,
  isUserLoading,
  onRequireLogin,
  onAddToCart,
  onLoadReview,
  onSubmitReview,
  onOpenProduct,
}) {
  const productUrl = `/produkt/${product.id}/`;
  const handleProductClick = (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !onOpenProduct) return;
    event.preventDefault();
    onOpenProduct(product);
  };

  return (
    <div className="col-12 col-sm-6 col-lg-3">
      <div className="product-card">
        <a
          className="product-card-link"
          href={productUrl}
          onClick={handleProductClick}
        >
          <div className="product-image-wrap">
            {product.discountPercent > 0 && (
              <span className="badge-sale">-{product.discountPercent}%</span>
            )}
            <img
              src={product.image}
              alt={product.name}
              className="product-img"
            />
          </div>

          <small>{product.category}</small>

          <h5>{product.name}</h5>

          <ProductRating
            averageRating={product.averageRating}
            reviewCount={product.reviewCount}
          />

          <div className="product-prices">
            {product.discountPercent > 0 && <del>{product.price}</del>}
            <h4>{product.discountPercent > 0 ? product.discountPrice : product.price}</h4>
          </div>
        </a>

        <div className="d-flex justify-content-between align-items-center">
          <small className="text-success">
            Dostępny • wysyłka w 24 h
          </small>

          <button
            type="button"
            className="cart-btn"
            onClick={() => onAddToCart?.(product)}
            aria-label={`Dodaj ${product.name} do koszyka`}
          >
            <i className="bi bi-cart3"></i>
          </button>
        </div>

        <ProductReviewForm
          product={product}
          user={user}
          isUserLoading={isUserLoading}
          onRequireLogin={onRequireLogin}
          onLoadReview={onLoadReview}
          onSubmitReview={onSubmitReview}
        />
      </div>
    </div>
  );
}

function Products({
  products = [],
  selectedCategory,
  title,
  fallbackMessage = 'Brak na magazynie',
  user,
  isUserLoading,
  onRequireLogin,
  onAddToCart,
  onLoadReview,
  onSubmitReview,
  onOpenProduct,
}) {
  const hasProducts = products.length > 0;

  return (
    <section className="products-section py-5" id="products">
      <div className="container">
        <p className="text-muted mb-1">
          Sprawdzone przez graczy. Wybrane dla Ciebie.
        </p>

        <h2>{title || selectedCategory || 'Bestsellery'}</h2>

        {!hasProducts ? (
          <div className="mt-4 p-4 border rounded bg-white text-center text-muted">
            <strong>{fallbackMessage}</strong>
          </div>
        ) : (
          <div className="row g-3 mt-3">
            {products.map((product, index) => (
              <ProductCard
                key={product.id ?? index}
                product={product}
                user={user}
                isUserLoading={isUserLoading}
                onRequireLogin={onRequireLogin}
                onAddToCart={onAddToCart}
                onLoadReview={onLoadReview}
                onSubmitReview={onSubmitReview}
                onOpenProduct={onOpenProduct}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Products;
