
const categories = [
  { icon: 'bi-laptop', name: 'Laptopy' },
  { icon: 'bi-pc-display', name: 'Komputery' },
  { icon: 'bi-gpu-card', name: 'Podzespoły' },
  { icon: 'bi-display', name: 'Monitory' },
  { icon: 'bi-keyboard', name: 'Akcesoria' },
  { icon: 'bi-headphones', name: 'Strefa gracza' }
];

function Categories() {
  return (
    <section className="container py-4">
      <h2>Czego potrzebujesz?</h2>

      <div className="row g-3 mt-2">
        {categories.map((item, index) => (
          <div className="col-6 col-md-4 col-lg-2" key={index}>
            <div className="category-card text-center">
              <i className={`bi ${item.icon}`}></i>
              <p>{item.name}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;
