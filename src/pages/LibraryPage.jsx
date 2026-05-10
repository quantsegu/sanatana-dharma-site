import { Link } from 'react-router-dom';
import { categories } from '../data/content';

export default function LibraryPage() {
  return (
    <section className="page-body wide">
      <div className="toolbox">
        <h1>Topic Library</h1>
        <p>Browse the full structured catalog of categories and topic pages.</p>
      </div>

      {categories.map((category) => (
        <section key={category.id} className="cat-section" id={category.id}>
          <h2 className="cat-title"><span className="cat-icon">{category.icon}</span> {category.label}</h2>
          <div className="card-grid">
            {category.items.map((item) => (
              <Link key={item.id} className="card" to={`/topic/${item.id}`}>
                <span className="card-tag">{item.tag}</span>
                <span className="card-title">{item.title}</span>
                <span className="card-arrow">→</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
