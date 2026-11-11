function Navbar() {
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
        <div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#111827' }}>IT-Logic</div>
          <small style={{ color: '#4b5563' }}>Technologia po twojemu</small>
        </div>

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

        <div style={{ display: 'flex', gap: '18px', fontWeight: 600, color: '#111827' }}>
          <span>Moje konto</span>
          <span>Mój koszyk</span>
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
        <span>Laptopy</span>
        <span>Komputery</span>
        <span>Podzespoły</span>
        <span>Monitory</span>
        <span>Gaming</span>
        <span>Akcesoria</span>
        <span>Start home</span>
      </div>
    </nav>
  )
}

export default Navbar