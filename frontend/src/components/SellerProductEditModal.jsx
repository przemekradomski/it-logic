const categories = ['Laptopy','Komputery','Podzespoły','Monitory','Gaming','Akcesoria','Start home'];

function SellerProductEditModal({ product, onSubmit, onCancel, loading, error }) {
  if (!product) return null;
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit(product.id, formData);
  };
  const price = String(product.priceValue ?? '').replace('.', ',');

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Edytuj produkt">
      <div className="login-modal">
        <div className="login-header">
          <h3>Edytuj produkt</h3>
          <button type="button" className="close-button" onClick={onCancel} aria-label="Zamknij">×</button>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>Nazwa produktu<input name="name" defaultValue={product.name} maxLength={120} required /></label>
          <label>Kategoria<select name="category" defaultValue={product.category} required>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
          <label>Cena (zł)<input name="price" type="number" min="0.01" max="99999999.99" step="0.01" defaultValue={price} required /></label>
          <label>Opis produktu<textarea name="description" maxLength={5000} rows={6} defaultValue={product.description || ''} placeholder="Opis, parametry i najważniejsze informacje o produkcie" /></label>
          <label>Nowe zdjęcie (opcjonalnie)<input name="image" type="file" accept="image/jpeg,image/png,image/gif,image/webp" /></label>
          {error && <p className="text-danger mb-0" role="alert">{error}</p>}
          <div className="d-flex gap-2">
            <button type="submit" className="primary-button" disabled={loading}>{loading ? 'Zapisywanie...' : 'Zapisz zmiany'}</button>
            <button type="button" className="secondary-button" onClick={onCancel} disabled={loading}>Anuluj</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SellerProductEditModal;
