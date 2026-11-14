function Navbar({
  items = [],
  selectedCategory,
  onSelectCategory,
  user,
  cartCount = 0,
  onOpenLogin,
  onToggleAccount,
  onToggleCart,
  onLogout,
  isCartOpen,
  isAccountOpen,
}) {
  return (
    <nav
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderBottom: '1px solid #ddd',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        width: '100%',
      }}
    >
      <div
        style={{
          background: '#f3f4f6',
          color: '#374151',
          textAlign: 'center',
          padding: '8px 12px',
          fontSize: '14px',
        }}
      >
        Darmowa dostawa od 299 zł * Zamów do 16:00, a paczka zostanie wysłana tego samego dnia
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          padding: '18px 24px',
          flexWrap: 'wrap',
        }}
      >
        <div />

        <input
          type="search"
          placeholder="Czego szukasz?"
          style={{
            flex: '1 1 300px',
            maxWidth: '700px',
            padding: '12px 16px',
            borderRadius: '999px',
            border: '1px solid #d1d5db',
            fontSize: '16px',
          }}
        />

        <div style={{ display: 'flex', gap: '18px', fontWeight: 600, color: '#111827', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onToggleAccount ?? onOpenLogin}
            style={{
              border: 'none',
              background: 'transparent',
              fontWeight: 600,
              color: isAccountOpen ? '#6058f5' : '#111827',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {user ? `Wyloguj (${user.label})` : 'Moje konto'}
          </button>

          <button
            type="button"
            onClick={onToggleCart}
            style={{
              border: 'none',
              background: 'transparent',
              fontWeight: 600,
              color: isCartOpen ? '#6058f5' : '#111827',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            Mój koszyk
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '20px',
                height: '20px',
                padding: '0 6px',
                borderRadius: '999px',
                background: '#6058f5',
                color: '#fff',
                fontSize: '11px',
                marginLeft: '8px',
              }}
            >
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '18px',
          flexWrap: 'wrap',
          padding: '0 24px 18px',
          fontWeight: 600,
          color: '#111827',
        }}
      >
        {items.map((item) => {
          const isActive = selectedCategory === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelectCategory?.(item)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isActive ? '#6058f5' : '#111827',
                borderBottom: isActive ? '2px solid #6058f5' : '2px solid transparent',
                padding: '8px 0',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              {item}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default Navbar;
