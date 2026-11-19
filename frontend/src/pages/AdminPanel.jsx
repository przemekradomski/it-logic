import { useEffect, useState } from 'react';
import { apiRequest } from '../api';

const emptySellerForm = {
  username: '',
  email: '',
  phone: '',
  password: '',
  confirm_password: '',
};

function AdminPanel({ onClose }) {
  const [sellers, setSellers] = useState([]);
  const [sellerForm, setSellerForm] = useState(emptySellerForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/api/admin/sellers/')
      .then((data) => setSellers(data.sellers || []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setSellerForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleCreateSeller = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await apiRequest('/api/admin/sellers/create/', {
        method: 'POST',
        body: JSON.stringify(sellerForm),
      });
      setSellers((previous) => (
        [...previous, data.seller].sort((first, second) => first.username.localeCompare(second.username))
      ));
      setSellerForm(emptySellerForm);
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeller = async (seller) => {
    if (!window.confirm(`Czy na pewno usunąć konto sprzedawcy ${seller.username}?`)) return;

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await apiRequest(`/api/admin/sellers/${seller.id}/delete/`, {
        method: 'DELETE',
      });
      setSellers((previous) => previous.filter((item) => item.id !== seller.id));
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container py-4">
      <div className="admin-panel">
        <div className="admin-panel-header d-flex justify-content-between align-items-start gap-3">
          <div>
            <p className="eyebrow">Zarządzanie sklepem</p>
            <h2>Panel administratora</h2>
            <p className="text-muted mb-0">Dodawaj i usuwaj konta sprzedawców.</p>
          </div>
          <button type="button" className="secondary-button" onClick={onClose}>
            Zamknij
          </button>
        </div>

        <form className="login-form admin-seller-form mb-4" onSubmit={handleCreateSeller}>
          <label>
            Nazwa użytkownika
            <input name="username" value={sellerForm.username} onChange={handleFormChange} maxLength={50} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={sellerForm.email} onChange={handleFormChange} maxLength={100} required />
          </label>
          <label>
            Numer telefonu
            <input type="tel" name="phone" value={sellerForm.phone} onChange={handleFormChange} maxLength={20} />
          </label>
          <label>
            Hasło (min. 8 znaków)
            <input type="password" name="password" value={sellerForm.password} onChange={handleFormChange} minLength={8} required />
          </label>
          <label>
            Powtórz hasło
            <input type="password" name="confirm_password" value={sellerForm.confirm_password} onChange={handleFormChange} minLength={8} required />
          </label>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <button type="submit" className="primary-button" disabled={loading}>
              Dodaj sprzedawcę
            </button>
            {message && <span className="text-success">{message}</span>}
            {error && <span className="text-danger" role="alert">{error}</span>}
          </div>
        </form>

        <div className="admin-panel-header">
          <h3>Sprzedawcy</h3>
        </div>
        {loading && sellers.length === 0 ? (
          <p className="text-muted">Ładowanie sprzedawców...</p>
        ) : sellers.length > 0 ? (
          <div className="seller-list">
            {sellers.map((seller) => (
              <div className="seller-row" key={seller.id}>
                <div>
                  <strong>{seller.username}</strong>
                  <span>{seller.email}</span>
                  {seller.phone && <small>{seller.phone}</small>}
                </div>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleDeleteSeller(seller)}
                  disabled={loading}
                >
                  Usuń sprzedawcę
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">{error || 'Nie ma jeszcze żadnych sprzedawców.'}</p>
        )}
      </div>
    </section>
  );
}

export default AdminPanel;