import { useState } from 'react';
import Navbar from '../components/Navbar';
import Foother from '../components/foother';

const navItems = ['Laptopy', 'Komputery', 'Podzespoły', 'Monitory', 'Gaming', 'Akcesoria', 'Start home', 'Promocje'];

function NotFoundPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="not-found-layout">
      <Navbar
        items={navItems}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={0}
        onSelectCategory={(category) => {
          window.location.assign(category === 'Promocje' ? '/promocje/' : '/');
        }}
        onOpenLogin={() => window.location.assign('/')}
        onToggleAccount={() => window.location.assign('/')}
        onToggleCart={() => window.location.assign('/kasa/')}
      />
      <main className="not-found-page">
        <div>
          <h1>Błąd 404</h1>
          <p>Strona, której szukasz nie istnieje</p>
          <button
            type="button"
            className="not-found-home-button"
            onClick={() => window.location.assign('/')}
          >
            Powrót do strony głównej
          </button>
        </div>
      </main>
      <Foother />
    </div>
  );
}

export default NotFoundPage;
