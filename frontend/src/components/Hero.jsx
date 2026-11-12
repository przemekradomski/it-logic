
function Hero() {
  return (
    <section className="hero">
      <div className="container-fluid">
        <div className="row align-items-center">

          <div className="col-md-6 hero-content">
            <p className="text-purple">
              WIĘCEJ MOCY. WIĘCEJ MOŻLIWOŚCI.
            </p>

            <h1>IT-Logic</h1>
            <small style={{ color: '#e6e6e6' }}>Technologia po twojemu</small>
            <p className="description">
              Odkryj sprzęt, który dotrzyma Ci kroku.
              <br />
              Komputery i podzespoły dla wymagających.
            </p>

            <button className="btn btn-purple">
              Odkryj strefę gamingu →
            </button>

            <div className="mt-4">01 / 03</div>
          </div>

          <div className="col-md-6 p-0">
            <img
              src="/images/hero-pc.jpg"
              className="hero-img"
              alt="Komputer gamingowy"
            />
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;