import { useEffect, useState } from 'react';
import computerImage from '../../images/komp.png';
import consoleImage from '../../images/ps5.png';
import keyboardImage from '../../images/klawa.png';

const slides = [
  {
    eyebrow: 'NOWOŚCI',
    title: 'Nowa generacja sprzętu',
    subText: 'Najnowsze komputery i podzespoły',
    description: 'Odkryj świeże modele gotowe na wymagające aplikacje i gry.',
    button: 'Zobacz nowości',
    category: 'Komputery',
    image: computerImage,
    imageAlt: 'Komputer gamingowy',
  },
  {
    eyebrow: 'STREFA GAMING',
    title: 'Więcej FPS',
    subText: 'Płynniejsza rozgrywka',
    description: 'Wydajne zestawy gamingowe zaprojektowane do każdej rozgrywki.',
    button: 'Odkryj strefę gamingu',
    category: 'Gaming',
    image: consoleImage,
    imageAlt: 'Konsola do gier',
  },
  {
    eyebrow: 'PROMOCJE',
    title: 'Lepszy sprzęt',
    subText: 'Więcej możliwości w dobrej cenie',
    description: 'Sprawdź aktualne oferty na komputery, monitory i akcesoria.',
    button: 'Przejrzyj promocje',
    category: 'Promocje',
    image: keyboardImage,
    imageAlt: 'Klawiatura gamingowa',
  },
];

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
    marginBottom: '24px',
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
};

function Hero({ onNavigateCategory }) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  const slide = slides[activeSlide];

  return (
    <section className="hero" style={styles.hero}>
      <div style={styles.containerFluid}>
        <div className="row align-items-center">
          <div className="col-md-6" style={styles.heroContent}>
            <p style={styles.textPurple}>{slide.eyebrow}</p>

            <h1 style={styles.heroTitle}>{slide.title}</h1>
            <small style={styles.subText}>{slide.subText}</small>
            <p style={styles.description}>
              {slide.description}
            </p>

            <button
              type="button"
              style={styles.button}
              onClick={() => onNavigateCategory?.(slide.category)}
            >
              {slide.button} →
            </button>

            <div className="mt-4">{String(activeSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</div>

            <div className="hero-pagination mt-4" aria-label="Wybierz slajd">
              {slides.map((item, index) => (
                <button
                  type="button"
                  key={item.title}
                  className={index === activeSlide ? 'hero-dot active' : 'hero-dot'}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Pokaż slajd ${index + 1}: ${item.title}`}
                  aria-current={index === activeSlide ? 'true' : undefined}
                >
                  {String(index + 1).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          <div className="col-md-6 hero-image-wrap">
            <img
              key={activeSlide}
              className="hero-image"
              src={slide.image}
              alt={slide.imageAlt}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
