function RegisterForm({ form, onChange, onSubmit, onSwitch, loading, error }) {
  return (
    <form onSubmit={onSubmit} className="login-form">
      <label>
        Nazwa użytkownika
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="jan_kowalski"
          autoComplete="username"
          maxLength={50}
          required
        />
      </label>

      <label>
        Email
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="name@domain.pl"
          autoComplete="email"
          maxLength={100}
          required
        />
      </label>

      <label>
        Numer telefonu
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={onChange}
          placeholder="123-456-789"
          autoComplete="tel"
          maxLength={20}
          required
        />
      </label>

      <label>
        Hasło
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      <label>
        Powtórz hasło
        <input
          type="password"
          name="confirm_password"
          value={form.confirm_password}
          onChange={onChange}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      {error && <p className="text-danger mb-0" role="alert">{error}</p>}
      <button type="submit" className="primary-button full-width" disabled={loading}>
        {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
      </button>
      <button type="button" className="text-button" onClick={onSwitch}>
        Masz już konto? Zaloguj się
      </button>
    </form>
  );
}

export default RegisterForm;
