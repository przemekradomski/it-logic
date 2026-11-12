import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import Products from './components/Products';

const navItems = ['Laptopy', 'Komputery', 'Podzespoły', 'Monitory', 'Gaming', 'Akcesoria', 'Start home'];

const products = [
  { id: 1, name: 'ASUS TUF Gaming A15', category: 'Laptopy', price: '4 299,00 zł', image: '/images/laptop.jpg', inStock: true },
  { id: 2, name: 'Gigabyte GeForce RTX 4070', category: 'Podzespoły', price: '2 699,00 zł', image: '/images/gpu.jpg', inStock: true },
  { id: 3, name: 'Samsung Odyssey G5 27"', category: 'Monitory', price: '999,00 zł', image: '/images/monitor.jpg', inStock: true },
  { id: 4, name: 'Keychron K8 Pro', category: 'Akcesoria', price: '449,00 zł', image: '/images/keyboard.jpg', inStock: true },
  { id: 5, name: 'MSI Katana', category: 'Gaming', price: '5 199,00 zł', image: '/images/gaming.jpg', inStock: false },
  { id: 6, name: 'PC Workstation X9', category: 'Komputery', price: '7 899,00 zł', image: '/images/pc.jpg', inStock: true },
];

function App() {
  const [selectedCategory, setSelectedCategory] = useState('Laptopy');

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
      <Products
        products={visibleProducts}
        selectedCategory={selectedCategory}
        fallbackMessage="Brak na magazynie"
      />
    </>
  );
}

export default App;