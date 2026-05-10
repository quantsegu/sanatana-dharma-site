import { Link } from 'react-router-dom';
import { categories } from '../data/content';

const historyCategory = categories.find((category) => category.id === 'history');

export default function TimelinePage() {
  return (
    <section className="page-body wide">
      <div className="toolbox">
        <h1>Civilizational Timeline</h1>
        <p>Follow historical arcs and open each phase for detailed narrative and references.</p>
      </div>

      <div className="timeline">
        {historyCategory?.items.map((item, index) => (
          <Link key={item.id} to={`/topic/${item.id}`} className="timeline-item">
            <div className="timeline-dot">{index + 1}</div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.tag}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
