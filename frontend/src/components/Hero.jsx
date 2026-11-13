const styles = {
  hero: {
    background: '#10131e',
    color: 'white',
    overflow: 'hidden',
  },
  containerFluid: {
    padding: 0,
  },
  heroContent: {
    padding: '65px',
  },
  textPurple: {
    color: '#a5a0ff',
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '0.08em',
  },
  heroTitle: {
    fontSize: '50px',
    fontWeight: 700,
    marginBottom: '80px',
    lineHeight: 1.1,
    color: '#fff',
  },
  description: {
    color: '#b5bac9',
    lineHeight: 1.6,
    marginTop: '1rem',
  },
  subText: {
    color: '#e6e6e6',
  },
  button: {
    background: '#6058f5',
    color: 'white',
    border: 'none',
    borderRadius: '7px',
    padding: '14px 22px',
    fontWeight: 600,
    marginTop: '1rem',
  },
  heroVisual: {
    position: 'relative',
    width: '100%',
    minHeight: '500px',
    height: '100%',
    background: 'radial-gradient(circle at 20% 25%, rgba(127, 100, 255, 0.8), transparent 18%), radial-gradient(circle at 75% 30%, rgba(54, 214, 255, 0.25), transparent 22%), linear-gradient(135deg, #1d2233 0%, #10131e 60%, #0b0d15 100%)',
    borderRadius: '24px 0 0 24px',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
  },
  heroVisualBefore: {
    content: '""',
    position: 'absolute',
    inset: '10% 12% 12% 18%',
    borderRadius: '18px',
    background: 'linear-gradient(145deg, #2a2f40 0%, #171b2a 100%)',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.38)',
  },
  heroVisualAfter: {
    content: '""',
    position: 'absolute',
    width: '72%',
    height: '18%',
    left: '20%',
    bottom: '12%',
    borderRadius: '12px',
    background: 'linear-gradient(90deg, #4761ff 0%, #8a6bff 50%, #b7a4ff 100%)',
    boxShadow: '0 20px 40px rgba(96, 88, 245, 0.5)',
  },
};

function Hero() {
  return (
    <section style={styles.hero}>
      <div style={styles.containerFluid}>
        <div className="row align-items-center">
          <div className="col-md-6" style={styles.heroContent}>
            <p style={styles.textPurple}>
              WIĘCEJ MOCY. WIĘCEJ MOŻLIWOŚCI.
            </p>

            <h1 style={styles.heroTitle}>IT-Logic</h1>
            <small style={styles.subText}>Technologia po twojemu</small>
            <p style={styles.description}>
              Odkryj sprzęt, który dotrzyma Ci kroku.
              <br />
              Komputery i podzespoły dla wymagających.
            </p>

            <button style={styles.button}>
              Odkryj strefę gamingu →
            </button>

            <div className="mt-4">01 / 03</div>
          </div>

          <div className="col-md-6 p-0">
            <div style={styles.heroVisual} aria-label="Komputer gamingowy">
              <div style={styles.heroVisualBefore} />
              <div style={styles.heroVisualAfter} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
