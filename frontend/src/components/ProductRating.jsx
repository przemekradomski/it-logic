function ProductRating({ averageRating = 0, reviewCount = 0 }) {
  const rating = Number(averageRating) || 0;
  const count = Number(reviewCount) || 0;
  const formattedRating = rating.toLocaleString('pl-PL', { maximumFractionDigits: 1 });

  return (
    <div
      className="product-rating"
      role="img"
      aria-label={rating > 0
        ? `Średnia ocena: ${formattedRating} na 5, ${count} opinii`
        : `Produkt nie ma jeszcze ocen, ${count} opinii`}
    >
      <span className="rating-stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = rating - index;
          const icon = starValue >= 0.75
            ? 'bi-star-fill'
            : starValue >= 0.25
              ? 'bi-star-half'
              : 'bi-star';

          return <i className={`bi ${icon}`} key={index} />;
        })}
      </span>
      <span className="rating-value">{rating > 0 ? `${formattedRating}/5` : 'Brak ocen'}</span>
      <small className="rating-count">({count} opinii)</small>
    </div>
  );
}

export default ProductRating;
