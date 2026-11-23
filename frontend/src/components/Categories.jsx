
const categories = [
  { icon: 'bi-laptop', name: 'Laptopy' },
  { icon: 'bi-pc-display', name: 'Komputery' },
  { icon: 'bi-gpu-card', name: 'Podzespoły' },
  { icon: 'bi-display', name: 'Monitory' },
  { icon: 'bi-keyboard', name: 'Akcesoria' },
  { icon: 'bi-headphones', name: 'Strefa gracza', category: 'Gaming' }
];

function Categories({ onSelectCategory }) {
  const handleCategoryClick = (category) => {
    onSelectCategory?.(category);
    document.getElementById('products')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <section className="container py-4">
      <h2>Czego potrzebujesz?</h2>

      <div className="row g-3 mt-2">
        {categories.map((item, index) => (
          <div className="col-6 col-md-4 col-lg-2" key={index}>
            <button
              type="button"
              className="category-card text-center"
              onClick={() => handleCategoryClick(item.category || item.name)}
            >
              <i className={`bi ${item.icon}`}></i>
              <p>{item.name}</p>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;
