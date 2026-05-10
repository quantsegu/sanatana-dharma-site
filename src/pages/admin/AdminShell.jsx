import { Link, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearAdminToken, getAdminToken } from '../../api/cms';
import { BRANDING } from '../../branding';

export default function AdminShell() {
  const navigate = useNavigate();

  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace />;
  }

  const logout = () => {
    clearAdminToken();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      <header className="admin-top">
        <Link to="/" className="admin-brand">
          <img src={BRANDING.logoMark} width={36} height={36} alt="" className="admin-brand-mark" decoding="async" />
          <span>← Site</span>
        </Link>
        <nav className="admin-nav">
          <NavLink to="/admin/videos" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Videos
          </NavLink>
          <NavLink to="/admin/blogs" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Blog posts
          </NavLink>
        </nav>
        <button type="button" className="admin-logout" onClick={logout}>
          Log out
        </button>
      </header>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
