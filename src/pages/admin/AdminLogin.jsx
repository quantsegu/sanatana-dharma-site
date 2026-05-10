import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getAdminToken, loginAdmin } from '../../api/cms';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (getAdminToken()) {
    return <Navigate to="/admin/videos" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginAdmin(password);
      navigate('/admin/videos', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1>Content admin</h1>
        <p className="admin-login-hint">Sign in to manage videos and blog posts.</p>
        <form onSubmit={onSubmit}>
          <label className="admin-field">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="admin-error">{error}</p> : null}
          <button type="submit" className="cta-button admin-login-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="admin-login-footer">
          <Link to="/">← Back to site</Link>
        </p>
      </div>
    </div>
  );
}
