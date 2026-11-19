function LoginForm({ form, onChange, onSubmit, onSwitch, loading, error, success }) {
  return (
    <form onSubmit={onSubmit} className="login-form">
      <label>
        Email
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="name@domain.pl"
          autoComplete="email"
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
          placeholder="Podaj hasło"
          autoComplete="current-password"
          required
        />
      </label>

      {error && <p className="text-danger mb-0" role="alert">{error}</p>}
      {success && <p className="text-success mb-0" role="status">{success}</p>}
      <button type="submit" className="primary-button full-width" disabled={loading}>
        {loading ? 'Logowanie...' : 'Zaloguj się'}
      </button>
      <button type="button" className="text-button" onClick={onSwitch}>
        Nie masz konta? Zarejestruj się
      </button>
    </form>
  );
}

export default LoginForm;
