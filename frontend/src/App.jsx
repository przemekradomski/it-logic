import { useEffect, useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Products from './components/Products';

const navItems = ['Laptopy', 'Komputery', 'Podzespoły', 'Monitory', 'Gaming', 'Akcesoria', 'Start home'];

function App() {
  const [selectedCategory, setSelectedCategory] = useState('Laptopy');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products/')
      .then((response) => response.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Błąd pobierania danych:', error);
        setLoading(false);
      });
  }, []);

  const visibleProducts = products.filter(
    (product) => product.category === selectedCategory && product.inStock
  );

  return (
    <>
      <Navbar
        items={navItems}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <Hero />
      <Categories />
      {loading ? (
        <div className="container py-5 text-center text-muted">Ładowanie produktów...</div>
      ) : (
        <Products
          products={visibleProducts}
          selectedCategory={selectedCategory}
          fallbackMessage="Brak na magazynie"
        />
      )}
    </>
  );
}

export default App;
