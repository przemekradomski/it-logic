const products = [
  {
    name: 'ASUS TUF Gaming A15',
    category: 'Laptop gamingowy',
    price: '4 299,00 zł',
    image: '/images/laptop.jpg'
  },
  {
    name: 'Gigabyte GeForce RTX 4070',
    category: 'Karta graficzna',
    price: '2 699,00 zł',
    image: '/images/gpu.jpg'
  },
  {
    name: 'Samsung Odyssey G5 27"',
    category: 'Monitor gamingowy',
    price: '999,00 zł',
    image: '/images/monitor.jpg'
  },
  {
    name: 'Keychron K8 Pro',
    category: 'Klawiatura mechaniczna',
    price: '449,00 zł',
    image: '/images/keyboard.jpg'
  }
];

function Products({ products = [], selectedCategory, fallbackMessage = 'Brak na magazynie' }) {
  const hasProducts = products.length > 0;

  return (
    <section className="products-section py-5">
      <div className="container">
        <p className="text-muted mb-1">
          Sprawdzone przez graczy. Wybrane dla Ciebie.
        </p>

        <h2>{selectedCategory || 'Bestsellery'}</h2>

        {!hasProducts ? (
          <div className="mt-4 p-4 border rounded bg-white text-center text-muted">
            <strong>{fallbackMessage}</strong>
          </div>
        ) : (
          <div className="row g-3 mt-3">
            {products.map((product, index) => (
              <div className="col-12 col-sm-6 col-lg-3" key={product.id ?? index}>
                <div className="product-card">

                  <span className="badge-sale">OKAZJA</span>

                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-img"
                  />

                  <small>{product.category}</small>

                  <h5>{product.name}</h5>

                  <div className="stars">★★★★★ (48)</div>

                  <h4>{product.price}</h4>

                  <div className="d-flex justify-content-between">
                    <small className="text-success">
                      Dostępny • wysyłka w 24 h
                    </small>

                    <button className="cart-btn">
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
