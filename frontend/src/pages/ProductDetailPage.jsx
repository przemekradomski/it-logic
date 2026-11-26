import { useEffect, useState } from 'react';
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
  canEdit,
  onEdit,
}) {
  const isDiscounted = product.discountPercent > 0;
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');
  const [reviewsReloadKey, setReviewsReloadKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    setReviewsLoading(true);
    setReviewsError('');

    onLoadReview(product)
      .then((data) => {
        if (isCurrent) setReviews(data.reviews || []);
      })
      .catch((error) => {
        if (isCurrent) setReviewsError(error.message || 'Nie udało się pobrać opinii.');
      })
      .finally(() => {
        if (isCurrent) setReviewsLoading(false);
      });

    return () => { isCurrent = false; };
  }, [product.id, onLoadReview, reviewsReloadKey]);

  const handleSubmitReview = async (reviewProduct, review) => {
    const data = await onSubmitReview(reviewProduct, review);
    setReviewsReloadKey((current) => current + 1);
    return data;
  };

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
          {product.seller && <p className="seller-name">Sprzedawca: <strong>{product.seller}</strong></p>}
          <ProductRating
            averageRating={product.averageRating}
            reviewCount={product.reviewCount}
          />
          <div className="product-prices product-detail-prices">
            {isDiscounted && <del>{product.price}</del>}
            <h2>{isDiscounted ? product.discountPrice : product.price}</h2>
          </div>
          <p className="text-success">Dostępny • wysyłka w 24 h</p>
          <p className="product-description">
            {product.description || 'Sprzedawca nie dodał jeszcze opisu tego produktu.'}
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() => onAddToCart?.(product)}
          >
            <i className="bi bi-cart3 me-2" aria-hidden="true" />
            Dodaj do koszyka
          </button>
          {canEdit && (
            <button type="button" className="secondary-button ms-2" onClick={() => onEdit?.(product)}>
              Edytuj produkt
            </button>
          )}

          <section className="product-detail-review">
            <h2 className="h5">Twoja opinia</h2>
            <ProductReviewForm
              product={product}
              user={user}
              isUserLoading={isUserLoading}
              onRequireLogin={onRequireLogin}
              onLoadReview={onLoadReview}
              onSubmitReview={handleSubmitReview}
            />
          </section>

          <section className="product-detail-reviews" aria-labelledby="product-reviews-heading">
            <h2 id="product-reviews-heading" className="h5">Opinie o produkcie</h2>
            {reviewsLoading ? (
              <p className="review-feedback" role="status">Ładowanie opinii...</p>
            ) : reviewsError ? (
              <p className="review-feedback review-error" role="alert">{reviewsError}</p>
            ) : reviews.length === 0 ? (
              <p className="review-feedback">Ten produkt nie ma jeszcze opinii.</p>
            ) : (
              <ul className="product-review-list">
                {reviews.map((review, index) => (
                  <li className="product-review-card" key={`${review.author}-${review.createdAt}-${index}`}>
                    <div className="product-review-card-header">
                      <strong>{review.author}</strong>
                      <time dateTime={review.createdAt}>
                        {new Date(review.createdAt).toLocaleDateString('pl-PL')}
                      </time>
                    </div>
                    <p className="product-review-stars" aria-label={`Ocena: ${review.rating} na 5`}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </p>
                    <p className="product-review-comment">{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </article>
    </main>
  );
}

export default ProductDetailPage;
