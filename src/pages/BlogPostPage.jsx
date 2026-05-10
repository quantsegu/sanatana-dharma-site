import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { fetchPublicBlogPost } from '../api/cms';

marked.setOptions({ breaks: true, gfm: true });

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPublicBlogPost(slug);
        if (!cancelled) setPost(data);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <section className="page-body wide cms-page">
        <p>Loading…</p>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="page-body wide cms-page">
        <Link className="back-btn" to="/blog">← Blog</Link>
        <p className="assistant-warning">{error || 'Post not found.'}</p>
      </section>
    );
  }

  const html = marked.parse(post.body || '');

  return (
    <article className="page-body wide cms-page blog-post">
      <Link className="back-btn" to="/blog">← All posts</Link>
      <header className="page-header">
        <h1 className="page-title">{post.title}</h1>
        <span className="page-period">
          {new Date(post.updatedAt || post.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </header>
      <div className="blog-body markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
