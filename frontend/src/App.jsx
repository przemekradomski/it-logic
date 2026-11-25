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
import SellerProducts from './components/SellerProducts';
import AdminPanel from './pages/AdminPanel';
import ProductDetail from './components/ProductDetail';
import SellerProductEditModal from './components/SellerProductEditModal';
import CheckoutPage from './pages/CheckoutPage';

const navItems = ['Laptopy', 'Komputery', 'Podzespoły', 'Monitory', 'Gaming', 'Akcesoria', 'Start home'];

const roleLabels = {
  customer: 'Klient',
  buyer: 'Klient',
  seller: 'Sprzedawca',
  admin: 'Administrator',
};

function App() {
  const [showCheckout, setShowCheckout] = useState(/^\/kasa\/?$/.test(window.location.pathname));
  const [selectedCategory, setSelectedCategory] = useState('Laptopy');
  const [products, setProducts] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellerProductsLoading, setSellerProductsLoading] = useState(true);
  const [sellerProductsError, setSellerProductsError] = useState('');
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    const detailMatch = window.location.pathname.match(/^\/produkt\/(\d+)\/?$/);
    if (detailMatch) {
      apiRequest(`/api/products/${detailMatch[1]}/`)
        .then((data) => setSelectedProduct(data.product))
        .catch((error) => console.error('Błąd pobierania szczegółów:', error));
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setShowCheckout(/^\/kasa\/?$/.test(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  useEffect(() => {
    if (user?.role !== 'seller') return;

    apiRequest('/api/seller/products/')
      .then((data) => setSellerProducts(data.products || []))
      .catch((error) => setSellerProductsError(error.message))
      .finally(() => setSellerProductsLoading(false));
  }, [user?.role]);

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
          setSellerProductsLoading(account.role === 'seller');
          setSellerProductsError('');
        }
      })
      .catch(() => setUser(null));

    apiRequest('/api/cart/')
      .then((data) => setCart(data.items || []))
      .catch((error) => console.error('Nie udało się wczytać koszyka:', error));
  }, []);

  const normalizedSearchQuery = searchQuery
    .trim()
    .toLocaleLowerCase('pl-PL')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  const visibleProducts = products.filter((product) => {
    if (!product.inStock) return false;
    if (!normalizedSearchQuery) return product.category === selectedCategory;

    const searchableText = `${product.name} ${product.category}`
      .toLocaleLowerCase('pl-PL')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');
    return searchableText.includes(normalizedSearchQuery);
  });

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

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
      setSellerProductsLoading(account.role === 'seller');
      setSellerProductsError('');
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
      setSellerProducts((previous) => [data.product, ...previous]);
      setShowSellerProductForm(false);
    } catch (error) {
      setProductFormError(error.message);
    } finally {
      setProductFormLoading(false);
    }
  };

  const handleOpenProduct = async (product) => {
    try {
      const data = await apiRequest(`/api/products/${product.id}/`);
      setSelectedProduct(data.product);
      window.history.pushState({}, '', `/produkt/${product.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCloseProduct = () => {
    setSelectedProduct(null);
    window.history.pushState({}, '', '/');
  };

  const handleEditProduct = async (productId, formData) => {
    setEditLoading(true);
    setEditError('');
    try {
      const data = await apiRequest(`/api/seller/products/${productId}/update/`, { method: 'POST', body: formData });
      setProducts((previous) => previous.map((item) => item.id === productId ? data.product : item));
      setSellerProducts((previous) => previous.map((item) => item.id === productId ? data.product : item));
      setSelectedProduct((previous) => previous?.id === productId ? data.product : previous);
      setEditingProduct(null);
    } catch (error) {
      setEditError(error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Czy na pewno usunąć produkt „${product.name}”?`)) return;

    try {
      await apiRequest(`/api/seller/products/${product.id}/`, { method: 'DELETE' });
      setProducts((previous) => previous.filter((item) => item.id !== product.id));
      setSellerProducts((previous) => previous.filter((item) => item.id !== product.id));
      setCart((previous) => previous.filter((item) => item.id !== product.id));
      setSellerProductsError('');
    } catch (error) {
      setSellerProductsError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout/', { method: 'POST', body: JSON.stringify({}) });
      setUser(null);
      setCart([]);
      setSellerProducts([]);
      setSellerProductsLoading(false);
      setSellerProductsError('');
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

  const handleGoToCheckout = () => {
    setShowCartPanel(false);
    setSelectedProduct(null);
    setShowCheckout(true);
    window.history.pushState({}, '', '/kasa/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromCheckout = () => {
    setShowCheckout(false);
    window.history.pushState({}, '', '/');
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
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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

          <button type="button" className="primary-button full-width" onClick={handleGoToCheckout}>
            Przejdź do kasy
          </button>
        </div>
      )}

      {user?.role === 'seller' && (
        <>
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
          <SellerProducts
            products={sellerProducts}
            loading={sellerProductsLoading}
            error={sellerProductsError}
            onDelete={handleDeleteProduct}
            onEdit={(product) => { setEditError(''); setEditingProduct(product); }}
          />
        </>
      )}


      {showCheckout ? (
        <CheckoutPage
          cart={cart}
          cartTotal={cartTotal}
          onBack={handleBackFromCheckout}
        />
      ) : selectedProduct ? (
        <ProductDetail
          product={selectedProduct}
          onClose={handleCloseProduct}
          onAddToCart={handleAddToCart}
          canEdit={user?.role === 'seller' && sellerProducts.some((item) => item.id === selectedProduct.id)}
          onEdit={setEditingProduct}
        />
      ) : (
        <><Hero />
      <Categories onSelectCategory={handleSelectCategory} />

      {loading ? (
        <div className="container py-5 text-center text-muted">Ładowanie produktów...</div>
      ) : (
        <Products
          products={visibleProducts}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          fallbackMessage={searchQuery.trim()
            ? 'Nie znaleziono produktów pasujących do wyszukiwania.'
            : 'Brak na magazynie'}
          onAddToCart={handleAddToCart}
          onOpenProduct={handleOpenProduct}
        />
      )}


      </> )}

      <Foother />
      {editingProduct && (
        <SellerProductEditModal
          product={editingProduct}
          onSubmit={handleEditProduct}
          onCancel={() => { setEditingProduct(null); setEditError(''); }}
          loading={editLoading}
          error={editError}
        />
      )}
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
