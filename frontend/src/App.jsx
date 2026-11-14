import { useEffect, useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Products from './components/Products';

const navItems = ['Laptopy', 'Komputery', 'Podzespoły', 'Monitory', 'Gaming', 'Akcesoria', 'Start home'];

const initialCart = [
  { id: 1, name: 'Laptop gamingowy ASUS', price: 4299, quantity: 1 },
  { id: 2, name: 'Monitor Samsung 27"', price: 999, quantity: 1 },
];

const initialUsers = [
  { email: 'admin@itlogic.pl', password: 'admin123', role: 'admin', label: 'Administrator' },
  { email: 'seller@itlogic.pl', password: 'seller123', role: 'seller', label: 'Sprzedawca' },
  { email: 'klient@itlogic.pl', password: 'client123', role: 'buyer', label: 'Klient' },
];

function App() {
  const [selectedCategory, setSelectedCategory] = useState('Laptopy');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAccountPanel, setShowAccountPanel] = useState(false);
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(initialCart);
  const [users, setUsers] = useState(initialUsers);
  const [authMode, setAuthMode] = useState('login');
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seller',
  });
  const [sellerList, setSellerList] = useState([
    { id: 1, name: 'Anna Kowalska', status: 'aktywny' },
    { id: 2, name: 'Piotr Nowak', status: 'zablokowany' },
    { id: 3, name: 'Marta Wiśniewska', status: 'aktywny' },
  ]);

  useEffect(() => {
    fetch('/api/products/')
      .then((response) => response.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Błąd pobierania danych:', error);
        setLoading(false);
      });
  }, []);

  const visibleProducts = products.filter(
    (product) => product.category === selectedCategory && product.inStock
  );

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();

    if (!loginForm.email || !loginForm.password) {
      return;
    }

    const matchedUser = users.find(
      (account) =>
        account.email.toLowerCase() === loginForm.email.toLowerCase() &&
        account.password === loginForm.password
    );

    if (!matchedUser) {
      alert('Nieprawidłowy email lub hasło.');
      return;
    }

    setUser({
      email: matchedUser.email,
      role: matchedUser.role,
      label: matchedUser.label,
    });

    setShowLoginModal(false);
    setShowAccountPanel(true);
    setLoginForm({ email: '', password: '' });
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();

    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      return;
    }

    const emailExists = users.some(
      (account) => account.email.toLowerCase() === registerForm.email.toLowerCase()
    );

    if (emailExists) {
      alert('Użytkownik z tym adresem email już istnieje.');
      return;
    }

    const newSeller = {
      email: registerForm.email,
      password: registerForm.password,
      role: 'seller',
      label: 'Sprzedawca',
      name: registerForm.name,
    };

    setUsers((previous) => [newSeller, ...previous]);
    setLoginForm({ email: registerForm.email, password: registerForm.password });
    setAuthMode('login');
    setRegisterForm({ name: '', email: '', password: '', role: 'seller' });
    setShowLoginModal(true);
  };

  const handleLogout = () => {
    setUser(null);
    setShowAccountPanel(false);
  };

  const toggleAccountPanel = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setShowAccountPanel((previous) => !previous);
    setShowCartPanel(false);
  };

  const toggleCartPanel = () => {
    setShowCartPanel((previous) => !previous);
    setShowAccountPanel(false);
  };

  const toggleSellerStatus = (id) => {
    setSellerList((previous) =>
      previous.map((seller) =>
        seller.id === id
          ? {
              ...seller,
              status: seller.status === 'aktywny' ? 'zablokowany' : 'aktywny',
            }
          : seller
      )
    );
  };

  const registerSeller = () => {
    setSellerList((previous) => [
      {
        id: Date.now(),
        name: `Nowy sprzedawca ${previous.length + 1}`,
        status: 'aktywny',
      },
      ...previous,
    ]);
  };

  return (
    <>
      <Navbar
        items={navItems}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        user={user}
        cartCount={cart.length}
        onOpenLogin={() => setShowLoginModal(true)}
        onToggleAccount={toggleAccountPanel}
        onToggleCart={toggleCartPanel}
        onLogout={handleLogout}
        isCartOpen={showCartPanel}
        isAccountOpen={showAccountPanel}
      />

      {showAccountPanel && user && (
        <div className="floating-panel account-panel">
          <div className="panel-header">
            <strong>Twoje konto</strong>
            <button type="button" className="close-panel" onClick={() => setShowAccountPanel(false)}>
              ×
            </button>
          </div>

          <div className="panel-content">
            <p className="panel-label">Zalogowano jako</p>
            <strong>{user.email}</strong>
            <span className="panel-role">{user.label}</span>
          </div>

          <button type="button" className="primary-button full-width" onClick={handleLogout}>
            Wyloguj się
          </button>
        </div>
      )}

      {showCartPanel && (
        <div className="floating-panel cart-panel">
          <div className="panel-header">
            <strong>Mój koszyk</strong>
            <button type="button" className="close-panel" onClick={() => setShowCartPanel(false)}>
              ×
            </button>
          </div>

          <div className="panel-content cart-items">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <span>{item.name}</span>
                  <strong>{item.price.toLocaleString('pl-PL')} zł</strong>
                </div>
              ))
            ) : (
              <p className="empty-copy">Twój koszyk jest pusty.</p>
            )}
          </div>

          <div className="cart-summary">
            <span>Łącznie</span>
            <strong>{cartTotal.toLocaleString('pl-PL')} zł</strong>
          </div>

          <button type="button" className="primary-button full-width">
            Przejdź do kasy
          </button>
        </div>
      )}

      {user?.role === 'seller' && (
        <div className="seller-banner">
          <div className="container d-flex justify-content-between align-items-center gap-3 flex-wrap py-3">
            <span>Jesteś zalogowany jako sprzedawca.</span>
            <button type="button" className="primary-button">
              Wystaw na sprzedaż
            </button>
          </div>
        </div>
      )}

      {user?.role === 'admin' && (
        <section className="admin-panel container my-4">
          <div className="admin-panel-header d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <p className="eyebrow">Panel administratora</p>
              <h3>Zarządzanie sprzedawcami</h3>
            </div>
            <button type="button" className="primary-button" onClick={registerSeller}>
              Zarejestruj sprzedawcę
            </button>
          </div>

          <div className="seller-list">
            {sellerList.map((seller) => (
              <div key={seller.id} className="seller-row">
                <div>
                  <strong>{seller.name}</strong>
                  <small>{seller.status === 'aktywny' ? 'Aktywny' : 'Zablokowany'}</small>
                </div>
                <button
                  type="button"
                  className={seller.status === 'aktywny' ? 'danger-button' : 'secondary-button'}
                  onClick={() => toggleSellerStatus(seller.id)}
                >
                  {seller.status === 'aktywny' ? 'Zablokuj' : 'Odblokuj'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <Hero />
      <Categories />

      {loading ? (
        <div className="container py-5 text-center text-muted">Ładowanie produktów...</div>
      ) : (
        <Products
          products={visibleProducts}
          selectedCategory={selectedCategory}
          fallbackMessage="Brak na magazynie"
        />
      )}

      {showLoginModal && (
        <div className="modal-backdrop" onClick={() => setShowLoginModal(false)}>
          <div className="login-modal" onClick={(event) => event.stopPropagation()}>
            <div className="login-header">
              <h3>{authMode === 'login' ? 'Zaloguj się' : 'Zarejestruj sprzedawcę'}</h3>
              <button type="button" className="close-button" onClick={() => setShowLoginModal(false)}>
                ×
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="login-form">
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    placeholder="name@domain.pl"
                    required
                  />
                </label>

                <label>
                  Hasło
                  <input
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    placeholder="Podaj hasło"
                    required
                  />
                </label>

                <button type="submit" className="primary-button full-width">
                  Zaloguj się
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setAuthMode('register')}
                >
                  Nie masz konta? Zarejestruj się
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="login-form">
                <label>
                  Imię i nazwisko
                  <input
                    type="text"
                    name="name"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    placeholder="Jan Kowalski"
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    placeholder="name@domain.pl"
                    required
                  />
                </label>

                <label>
                  Hasło
                  <input
                    type="password"
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    placeholder="Podaj hasło"
                    required
                  />
                </label>

                <button type="submit" className="primary-button full-width">
                  Zarejestruj się
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setAuthMode('login')}
                >
                  Masz już konto? Zaloguj się
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
