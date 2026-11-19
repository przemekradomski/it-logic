import { useEffect, useState } from 'react';
import './App.css';
import { apiRequest } from './api';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Products from './components/Products';
import Foother from './components/foother';
import AuthModal from './components/AuthModal';
import SellerProductForm from './components/SellerProductForm';
import AdminPanel from './pages/AdminPanel';

const navItems = ['Laptopy', 'Komputery', 'Podzespoły', 'Monitory', 'Gaming', 'Akcesoria', 'Start home'];

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
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showSellerProductForm, setShowSellerProductForm] = useState(false);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [productFormLoading, setProductFormLoading] = useState(false);
  const [productFormError, setProductFormError] = useState('');
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    confirm_password: '',
  });

  useEffect(() => {
    apiRequest('/api/products/')
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch((error) => {
        console.error('Błąd pobierania danych:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Restore the logged-in user and guest/user cart independently.
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

    apiRequest('/api/cart/')
      .then((data) => setCart(data.items || []))
      .catch((error) => console.error('Nie udało się wczytać koszyka:', error));
  }, []);

  const visibleProducts = products.filter(
    (product) => product.category === selectedCategory && product.inStock
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);

  const openAdminPanel = () => {
    setShowAdminPanel(true);
    setShowAccountPanel(false);
    setShowCartPanel(false);
  };

  const handleAddToCart = async (product) => {
    try {
      const data = await apiRequest('/api/cart/items/', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.id }),
      });
      setCart(data.items || []);
    } catch (error) {
      alert(error.message || 'Nie udało się dodać produktu do koszyka.');
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      const data = await apiRequest(`/api/cart/items/${productId}/`, {
        method: 'DELETE',
      });
      setCart(data.items || []);
    } catch (error) {
      alert(error.message || 'Nie udało się usunąć produktu z koszyka.');
    }
  };

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

    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');
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
      const cartData = await apiRequest('/api/cart/');
      setCart(cartData.items || []);
      setShowLoginModal(false);
      setShowAccountPanel(true);
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    if (registerForm.password.length < 8) {
      setAuthError('Hasło musi mieć co najmniej 8 znaków.');
      return;
    }
    if (registerForm.password !== registerForm.confirm_password) {
      setAuthError('Hasła się nie zgadzają.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');
    try {
      await apiRequest('/api/auth/register/', {
        method: 'POST',
        body: JSON.stringify({
          username: registerForm.name.trim(),
          email: registerForm.email.trim(),
          phone: registerForm.phone.trim(),
          password: registerForm.password,
          confirm_password: registerForm.confirm_password,
        }),
      });

      setLoginForm({ email: registerForm.email, password: '' });
      setRegisterForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: '',
      });
      setAuthMode('login');
      setAuthSuccess('Konto zostało utworzone. Możesz się zalogować.');
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setProductFormLoading(true);
    setProductFormError('');

    try {
      const data = await apiRequest('/api/seller/products/', {
        method: 'POST',
        body: formData,
      });
      setProducts((previous) => [data.product, ...previous]);
      setShowSellerProductForm(false);
    } catch (error) {
      setProductFormError(error.message);
    } finally {
      setProductFormLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout/', { method: 'POST', body: JSON.stringify({}) });
      setUser(null);
      setCart([]);
      setShowAccountPanel(false);
      setShowAdminPanel(false);
      setShowSellerProductForm(false);
    } catch (error) {
      alert(error.message || 'Nie udało się wylogować.');
    }
  };

  const toggleAccountPanel = () => {
    if (!user) {
      openLoginModal();
      return;
    }

    setShowAccountPanel((previous) => !previous);
    setShowCartPanel(false);
  };

  const toggleCartPanel = () => {
    setShowCartPanel((previous) => !previous);
    setShowAccountPanel(false);
  };

  const openLoginModal = () => {
    setAuthError('');
    setAuthSuccess('');
    setShowLoginModal(true);
  };

  return (
    <>
      <Navbar
        items={navItems}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        user={user}
        cartCount={cartCount}
        onOpenLogin={openLoginModal}
        onToggleAccount={toggleAccountPanel}
        onToggleCart={toggleCartPanel}
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

          {user.role === 'admin' && (
            <button type="button" className="secondary-button full-width mb-2" onClick={openAdminPanel}>
              Panel administratora
            </button>
          )}
          <button type="button" className="primary-button full-width" onClick={handleLogout}>
            Wyloguj się
          </button>
        </div>
      )}

      {showAdminPanel && user?.role === 'admin' && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
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
                  <div className="cart-item-details">
                    <strong>{item.name}</strong>
                    <span>{item.quantity} × {item.price}</span>
                  </div>
                  <button
                    type="button"
                    className="cart-remove-button"
                    onClick={() => handleRemoveFromCart(item.id)}
                    aria-label={`Usuń ${item.name} z koszyka`}
                  >
                    Usuń
                  </button>
                </div>
              ))
            ) : (
              <p className="empty-copy">Twój koszyk jest pusty.</p>
            )}
          </div>

          <div className="cart-summary">
            <span>Łącznie</span>
            <strong>{cartTotal.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł</strong>
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
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setProductFormError('');
                setShowSellerProductForm((previous) => !previous);
              }}
            >
              Wystaw na sprzedaż
            </button>
          </div>
          {showSellerProductForm && (
            <div className="container pb-4">
              <div className="admin-panel">
                <h3>Dodaj produkt</h3>
                <SellerProductForm
                  onSubmit={handleCreateProduct}
                  onCancel={() => setShowSellerProductForm(false)}
                  loading={productFormLoading}
                  error={productFormError}
                />
              </div>
            </div>
          )}
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
          onAddToCart={handleAddToCart}
        />
      )}


      <Foother />
      {showLoginModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowLoginModal(false)}
          onSwitchMode={() => {
            setAuthMode((previous) => previous === 'login' ? 'register' : 'login');
            setAuthError('');
            setAuthSuccess('');
          }}
          loginForm={loginForm}
          onLoginChange={handleLoginChange}
          onLoginSubmit={handleLoginSubmit}
          registerForm={registerForm}
          onRegisterChange={handleRegisterChange}
          onRegisterSubmit={handleRegisterSubmit}
          loading={authLoading}
          error={authError}
          success={authSuccess}
        />
      )}
    </>
  );
}

export default App;
