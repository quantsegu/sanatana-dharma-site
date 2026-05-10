import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

function Om() {
  return <span style={{ fontFamily: "'Noto Serif Devanagari', serif" }}>ॐ</span>;
}

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="app-shell">
      <header className="top-bar">
        <Link className="brand" to="/">
          <span className="om-logo"><Om /></span>
          <span className="site-name">
            Sanātana Dharma <small>Learning Guide</small>
          </span>
        </Link>
        <nav className="top-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
          <NavLink to="/living-guide" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Living Guide</NavLink>
          <NavLink to="/videos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Videos</NavLink>
          <NavLink to="/blog" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Blog</NavLink>
          <NavLink to="/timeline" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Timeline</NavLink>
          <NavLink to="/library" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Library</NavLink>
          <NavLink to="/knowledge-graph" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Knowledge Graph</NavLink>
          <NavLink to="/assistant" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Ask AI</NavLink>
          <NavLink to="/bookmarks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Bookmarks</NavLink>
          {!isHome && <NavLink to="/explore" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Explore</NavLink>}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="app-footer">
        <span className="fom"><Om /></span>
        <p>सर्वे भवन्तु सुखिनः · May all beings be happy</p>
        <p className="footer-credit">
          <strong>Lakshmi Narayana Segu</strong> — with everyone coming together to grow a living practice of Sanātana Dharma
          across the <strong>EU</strong> and <strong>Switzerland</strong>, grounded at the <strong>Farm House</strong> and in study, seva, and neighbourly friendship.
        </p>
        <p style={{ marginTop: 10 }}>For deeper study, consult original texts and qualified teachers (ācāryas)</p>
        <p className="footer-admin-link">
          <Link to="/admin/login">Content admin</Link>
        </p>
      </footer>
    </div>
  );
}
