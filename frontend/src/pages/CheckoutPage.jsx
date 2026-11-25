function CheckoutPage({ cart, cartTotal, onBack }) {
  return (
    <main className="container py-5 checkout-main">
      <section className="checkout-page">
        <div className="checkout-header">
          <h1>Kasa</h1>
          <button type="button" className="secondary-button" onClick={onBack}>
            Wróć do sklepu
          </button>
        </div>

        {cart.length > 0 ? (
          <>
            <div className="checkout-items">
              {cart.map((item) => (
                <div key={item.id} className="checkout-item">
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      {item.quantity} × {item.discountPercent > 0 ? item.discountPrice : item.price}
                      {item.discountPercent > 0 && <> <del>{item.price}</del></>}
                    </span>
                  </div>
                  <strong>
                    {((item.discountPriceValue ?? item.priceValue) * item.quantity).toLocaleString('pl-PL', {
                      minimumFractionDigits: 2,
                    })} zł
                  </strong>
                </div>
              ))}
            </div>
            <div className="checkout-total">
              <span>Do zapłaty</span>
              <strong>
                {cartTotal.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
              </strong>
            </div>
          </>
        ) : (
          <p className="empty-copy">Twój koszyk jest pusty.</p>
        )}
      </section>
    </main>
  );
}

export default CheckoutPage;
