import { Link } from 'react-router-dom';
import { getResumeTopicId } from '../utils/readingState';
import { categories } from '../data/content';

const MAP_POSITIONS = [
  { x: 50, y: 8 },
  { x: 74, y: 16 },
  { x: 90, y: 33 },
  { x: 88, y: 57 },
  { x: 74, y: 75 },
  { x: 50, y: 84 },
  { x: 26, y: 75 },
  { x: 12, y: 57 },
  { x: 10, y: 33 },
  { x: 26, y: 16 },
];

export default function HomePage() {
  const resumeTopicId = getResumeTopicId();

  return (
    <div>
      <section className="home-hero">
        <h1>A Living Map of Sanātana Dharma</h1>
        <p>
          Navigate this tradition as a connected landscape. Start at the center and explore each knowledge region
          through an interactive map.
        </p>
        <div className="hero-actions">
          <Link to="/living-guide" className="cta-button">Start with Living Guide</Link>
          <Link to="/library" className="cta-button">Open Topic Library</Link>
          {resumeTopicId ? <Link to={`/topic/${resumeTopicId}`} className="cta-button">Resume Reading</Link> : <Link to="/bookmarks" className="cta-button">Open Bookmarks</Link>}
          <Link to="/videos" className="cta-button ghost">Videos</Link>
          <Link to="/pages" className="cta-button ghost">Ashram & Farm</Link>
          <Link to="/blog" className="cta-button ghost">Blog</Link>
          <Link to="/knowledge-graph" className="cta-button ghost">Open Knowledge Graph</Link>
        </div>
      </section>

      <section className="home-intro">
        <p>
          This project is designed as a way to learn and apply Sanātana Dharma in real life - not just collect information.
          Start from the Living Guide for practical principles, then use the map to deepen each area.
        </p>
        <p style={{ opacity: 0.8, marginTop: 10 }}>
          {categories.length} regions · 60+ topic pages · references included
        </p>
      </section>

      <section className="dharma-map-section">
        <div className="dharma-map">
          <div className="map-core">
            <h3>Sanātana Dharma</h3>
            <p>Learn • Live • Serve</p>
            <Link to="/living-guide" className="map-core-link">Open Living Guide</Link>
          </div>

          {categories.map((category, index) => {
            const pos = MAP_POSITIONS[index % MAP_POSITIONS.length];
            return (
              <Link
                key={category.id}
                className="map-node"
                to={`/library#${category.id}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <span>{category.icon}</span>
                <small>{category.label}</small>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
