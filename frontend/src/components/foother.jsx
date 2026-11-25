function Foother() {
  return (
    <footer
      style={{
        background: '#111827',
        color: '#f9fafb',
        marginTop: 'auto',
        padding: '32px 24px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 12px', fontSize: '20px' }}>IT Logic</h3>
          <p style={{ margin: 0, lineHeight: 1.6, color: '#d1d5db' }}>
            Sklep komputerowy z nowoczesnym sprzętem i akcesoriami do pracy, gry i codowania.
          </p>
        </div>

        <div>
          <h4 style={{ margin: '0 0 12px', fontSize: '18px' }}>Kontakt</h4>
          <p style={{ margin: '0 0 8px', color: '#d1d5db' }}>Telefon: 22 786 75 15</p>
          <p style={{ margin: 0, color: '#d1d5db' }}>Adres: Radzymin Stary Rynek 18</p>
        </div>

        <div>
          <h4 style={{ margin: '0 0 12px', fontSize: '18px' }}>Informacje</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
            <li>
              <a href="#polityka-prywatnosci" style={{ color: '#f9fafb', textDecoration: 'none' }}>
                Polityka prywatności
              </a>
            </li>
            <li>
              <a href="#polityka-cookies" style={{ color: '#f9fafb', textDecoration: 'none' }}>
                Polityka cookies
              </a>
            </li>
            <li>
              <a href="#regulamin" style={{ color: '#f9fafb', textDecoration: 'none' }}>
                Regulamin
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '24px auto 0',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          paddingTop: '16px',
          textAlign: 'center',
          color: '#d1d5db',
          fontSize: '14px',
        }}
      >
        © 2026 IT Logic. Wszelkie prawa zastrzeżone.
      </div>
    </footer>
  );
}

export default Foother;
