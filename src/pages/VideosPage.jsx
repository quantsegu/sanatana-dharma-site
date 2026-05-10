import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicVideos } from '../api/cms';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPublicVideos();
        if (!cancelled) setVideos(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) {
          setError(
            e.message === 'Failed to fetch'
              ? 'Could not load videos. Run the site with npm run dev (starts API + client) or npm start after build.'
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
        <h1 className="page-title">Videos</h1>
        <span className="page-period">Teachings & talks</span>
      </header>

      {loading ? <p>Loading…</p> : null}
      {error ? <p className="assistant-warning">{error}</p> : null}

      {!loading && !error && videos.length === 0 ? (
        <div className="summary-card">
          <p>No videos yet. Add them in the admin under Videos.</p>
          <Link className="cta-button" to="/admin/login">Admin</Link>
        </div>
      ) : null}

      <div className="video-grid">
        {videos.map((video) => (
          <article className="summary-card video-card" key={video.id}>
            <h3>{video.title}</h3>
            {video.description ? <p>{video.description}</p> : null}
            <div className="video-embed-wrap">
              <iframe
                title={video.title}
                src={video.embedUrl || video.videoUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
