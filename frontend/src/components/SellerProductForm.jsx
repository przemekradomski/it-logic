const categories = [
  'Laptopy',
  'Komputery',
  'Podzespoły',
  'Monitory',
  'Gaming',
  'Akcesoria',
  'Start home',
];

function SellerProductForm({ onSubmit, onCancel, loading, error }) {
  return (
    <form className="login-form seller-product-form" onSubmit={onSubmit}>
      <label>
        Nazwa produktu
        <input name="name" maxLength={120} required />
      </label>

      <label>
        Kategoria
        <select name="category" required defaultValue="">
          <option value="" disabled>Wybierz kategorię</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </label>

      <label>
        Cena (zł)
        <input name="price" type="number" min="0.01" max="99999999.99" step="0.01" required />
      </label>

      <label>
        Opis produktu
        <textarea name="description" maxLength={5000} rows={6} placeholder="Opis, parametry i najważniejsze informacje o produkcie" />
      </label>

      <label>
        Promocja (%)
        <input name="discount_percent" type="number" min="0" max="100" step="1" defaultValue="0" />
      </label>

      <label>
        Zdjęcie produktu (JPG, PNG, GIF lub WebP; maks. 5 MB)
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          required
        />
      </label>

      {error && <p className="text-danger mb-0" role="alert">{error}</p>}
      <div className="d-flex gap-2">
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Dodawanie...' : 'Dodaj produkt'}
        </button>
        <button type="button" className="secondary-button" onClick={onCancel} disabled={loading}>
          Anuluj
        </button>
      </div>
    </form>
  );
}

export default SellerProductForm;
