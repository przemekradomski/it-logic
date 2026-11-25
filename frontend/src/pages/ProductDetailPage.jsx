import ProductRating from '../components/ProductRating';
import ProductReviewForm from '../components/ProductReviewForm';

function ProductDetailPage({
  product,
  user,
  isUserLoading,
  onBack,
  onRequireLogin,
  onAddToCart,
  onLoadReview,
  onSubmitReview,
}) {
  const isDiscounted = product.discountPercent > 0;

  return (
    <main className="container py-5">
      <button type="button" className="secondary-button mb-4" onClick={onBack}>
        <i className="bi bi-arrow-left me-2" aria-hidden="true" />
        Wróć do sklepu
      </button>

      <article className="product-detail">
        <div className="product-detail-image-wrap">
          {isDiscounted && <span className="badge-sale">-{product.discountPercent}%</span>}
          <img className="product-detail-image" src={product.image} alt={product.name} />
        </div>

        <div className="product-detail-content">
          <p className="eyebrow mb-2">{product.category}</p>
          <h1>{product.name}</h1>
          <ProductRating
            averageRating={product.averageRating}
            reviewCount={product.reviewCount}
          />
          <div className="product-prices product-detail-prices">
            {isDiscounted && <del>{product.price}</del>}
            <h2>{isDiscounted ? product.discountPrice : product.price}</h2>
          </div>
          <p className="text-success">Dostępny • wysyłka w 24 h</p>
          <button
            type="button"
            className="primary-button"
            onClick={() => onAddToCart?.(product)}
          >
            <i className="bi bi-cart3 me-2" aria-hidden="true" />
            Dodaj do koszyka
          </button>

          <section className="product-detail-review">
            <h2 className="h5">Twoja opinia</h2>
            <ProductReviewForm
              product={product}
              user={user}
              isUserLoading={isUserLoading}
              onRequireLogin={onRequireLogin}
              onLoadReview={onLoadReview}
              onSubmitReview={onSubmitReview}
            />
          </section>
        </div>
      </article>
    </main>
  );
}

export default ProductDetailPage;
