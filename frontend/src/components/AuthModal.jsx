import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

function AuthModal({
  mode,
  onClose,
  onSwitchMode,
  loginForm,
  onLoginChange,
  onLoginSubmit,
  registerForm,
  onRegisterChange,
  onRegisterSubmit,
  loading,
  error,
  success,
}) {
  const isLogin = mode === 'login';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="login-modal" onClick={(event) => event.stopPropagation()}>
        <div className="login-header">
          <h3>{isLogin ? 'Zaloguj się' : 'Utwórz konto klienta'}</h3>
          <button type="button" className="close-button" onClick={onClose} aria-label="Zamknij">
            ×
          </button>
        </div>

        {isLogin ? (
          <LoginForm
            form={loginForm}
            onChange={onLoginChange}
            onSubmit={onLoginSubmit}
            onSwitch={onSwitchMode}
            loading={loading}
            error={error}
            success={success}
          />
        ) : (
          <RegisterForm
            form={registerForm}
            onChange={onRegisterChange}
            onSubmit={onRegisterSubmit}
            onSwitch={onSwitchMode}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}

export default AuthModal;
