import { useState } from 'react';

function ProductReviewForm({
  product,
  user,
  isUserLoading,
  onRequireLogin,
  onLoadReview,
  onSubmitReview,
}) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleToggleReview = async () => {
    if (!user) {
      onRequireLogin?.();
      return;
    }

    if (isReviewOpen) {
      setIsReviewOpen(false);
      return;
    }

    setReviewError('');
    setReviewSuccess('');
    setReviewLoading(true);
    try {
      const data = await onLoadReview(product);
      setRating(data.review?.rating ?? 5);
      setComment(data.review?.comment ?? '');
      setIsReviewOpen(true);
    } catch (error) {
      setReviewError(error.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setReviewLoading(true);
    try {
      const data = await onSubmitReview(product, { rating, comment });
      setReviewSuccess(data.message);
    } catch (error) {
      setReviewError(error.message);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="product-review">
      <button
        type="button"
        className="review-toggle"
        onClick={handleToggleReview}
        disabled={isUserLoading || reviewLoading}
      >
        {isUserLoading
          ? 'Sprawdzanie konta...'
          : user
            ? 'Dodaj lub zmień opinię'
            : 'Zaloguj się, aby dodać opinię'}
      </button>

      {reviewError && <p className="review-feedback review-error" role="alert">{reviewError}</p>}
      {reviewSuccess && <p className="review-feedback review-success" role="status">{reviewSuccess}</p>}

      {isReviewOpen && (
        <form className="review-form" onSubmit={handleReviewSubmit}>
          <label htmlFor={`review-rating-${product.id}`}>Ocena</label>
          <select
            id={`review-rating-${product.id}`}
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option value={value} key={value}>{value} {value === 1 ? 'gwiazdka' : 'gwiazdek'}</option>
            ))}
          </select>

          <label htmlFor={`review-comment-${product.id}`}>Twoja opinia</label>
          <textarea
            id={`review-comment-${product.id}`}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={1000}
            rows={3}
            required
          />
          <small>{comment.length}/1000 znaków</small>

          <button type="submit" className="primary-button" disabled={reviewLoading}>
            {reviewLoading ? 'Zapisywanie...' : 'Zapisz opinię'}
          </button>
        </form>
      )}
    </div>
  );
}

export default ProductReviewForm;
