import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicBlogs } from '../api/cms';

export default function BlogIndexPage() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPublicBlogs();
        if (!cancelled) setPosts(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) {
          setError(
            e.message === 'Failed to fetch'
              ? 'Could not load blog. Run npm run dev or npm start so the API is available.'
              : e.message
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="page-body wide cms-page">
      <Link className="back-btn" to="/">← Home</Link>
      <header className="page-header">
        <h1 className="page-title">Blog</h1>
        <span className="page-period">Reflections & updates</span>
      </header>

      {loading ? <p>Loading…</p> : null}
      {error ? <p className="assistant-warning">{error}</p> : null}

      {!loading && !error && posts.length === 0 ? (
        <div className="summary-card">
          <p>No published posts yet.</p>
        </div>
      ) : null}

      <div className="blog-list">
        {posts.map((post) => (
          <Link key={post.id} className="summary-card blog-teaser" to={`/blog/${post.slug}`}>
            <h3>{post.title}</h3>
            {post.excerpt ? <p>{post.excerpt}</p> : null}
            <span className="blog-meta">
              {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
