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


// Django session authentication: requests use cookies and CSRF protection.
function getCookie(name) {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null;
}

async function apiRequest(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = { ...(options.headers || {}) };

  if (method !== 'GET' && method !== 'HEAD') {
    // This endpoint should be decorated with @ensure_csrf_cookie in Django.
    if (!getCookie('csrftoken')) {
      await fetch('/api/auth/csrf/', { credentials: 'include' });
    }
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) headers['X-CSRFToken'] = csrfToken;
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
  }

  const response = await fetch(url, {
    ...options,
    method,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.error || data.message || 'Wystąpił błąd. Spróbuj ponownie.');
  }
  return data;
}

const roleLabels = {
  customer: 'Klient',
  buyer: 'Klient',
  seller: 'Sprzedawca',
  admin: 'Administrator',
};

function App() {
  const [selectedCategory, setSelectedCategory] = useState('Laptopy');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAccountPanel, setShowAccountPanel] = useState(false);
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(initialCart);
  const [authMode, setAuthMode] = useState('login');
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
  });

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

  // Przy odświeżeniu strony odtwarzamy użytkownika z sesji Django.
  useEffect(() => {
    apiRequest('/api/auth/me/')
      .then((data) => {
        const account = data.user || data;
        if (account && account.email) {
          setUser({
            email: account.email,
            role: account.role,
            label: account.label || roleLabels[account.role] || 'Użytkownik',
          });
        }
      })
      .catch(() => setUser(null));
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

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    if (!loginForm.email || !loginForm.password) return;

    try {
      const data = await apiRequest('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({
          email: loginForm.email.trim(),
          password: loginForm.password,
        }),
      });

      const account = data.user || data;
      setUser({
        email: account.email,
        role: account.role,
        label: account.label || roleLabels[account.role] || 'Użytkownik',
      });
      setShowLoginModal(false);
      setShowAccountPanel(true);
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      alert(error.message || 'Nieprawidłowy email lub hasło.');
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    if (!registerForm.name || !registerForm.email || !registerForm.password) return;
    if (registerForm.password.length < 8) {
      alert('Hasło musi mieć co najmniej 8 znaków.');
      return;
    }

    try {
      await apiRequest('/api/auth/register/', {
        method: 'POST',
        body: JSON.stringify({
          username: registerForm.name.trim(),
          email: registerForm.email.trim(),
          password: registerForm.password,
        }),
      });

      alert('Konto klienta zostało utworzone. Możesz się zalogować.');
      setLoginForm({ email: registerForm.email, password: '' });
      setRegisterForm({ name: '', email: '', password: '' });
      setAuthMode('login');
    } catch (error) {
      alert(error.message || 'Nie udało się utworzyć konta.');
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout/', { method: 'POST', body: JSON.stringify({}) });
      setUser(null);
      setShowAccountPanel(false);
    } catch (error) {
      alert(error.message || 'Nie udało się wylogować.');
    }
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
              <h3>{authMode === 'login' ? 'Zaloguj się' : 'Utwórz konto klienta'}</h3>
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
                  Nazwa użytkownika
                  <input
                    type="text"
                    name="name"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    placeholder="jan_kowalski"
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
                
                <label>
                  Powtórz hasło
                  <input
                    type="password"
                    name="confirm_password"
                    onChange={handleRegisterChange}
                    placeholder="Powtórz hasło"                  
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
