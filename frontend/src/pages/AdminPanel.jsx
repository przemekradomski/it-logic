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
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [sellerForm, setSellerForm] = useState(emptySellerForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/api/admin/users/')
      .then((data) => {
        setUsers(data.users || []);
        setCurrentUserId(data.current_user_id);
      })
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
      setUsers((previous) => (
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

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Czy na pewno usunąć konto użytkownika ${user.username}?`)) return;

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await apiRequest(`/api/admin/users/${user.id}/`, {
        method: 'DELETE',
      });
      setUsers((previous) => previous.filter((item) => item.id !== user.id));
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
            <p className="text-muted mb-0">Dodawaj sprzedawców i zarządzaj kontami użytkowników.</p>
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
          <h3>Użytkownicy</h3>
        </div>
        {loading && users.length === 0 ? (
          <p className="text-muted">Ładowanie użytkowników...</p>
        ) : users.length > 0 ? (
          <div className="seller-list">
            {users.map((user) => (
              <div className="seller-row" key={user.id}>
                <div>
                  <strong>{user.username}</strong>
                  <span>{user.email}</span>
                  <small>{user.role_label}</small>
                  {user.phone && <small>{user.phone}</small>}
                </div>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleDeleteUser(user)}
                  disabled={loading || user.id === currentUserId}
                  title={user.id === currentUserId ? 'Nie możesz usunąć własnego konta.' : undefined}
                >
                  Usuń użytkownika
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">{error || 'Brak użytkowników.'}</p>
        )}
      </div>
    </section>
  );
}

export default AdminPanel;