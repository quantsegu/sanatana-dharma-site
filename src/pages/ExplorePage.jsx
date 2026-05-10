import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { categories, pageContent } from '../data/content';
import { flattenItems } from '../utils/content';
import { getBookmarks, getTopicProgress } from '../utils/readingState';

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarksOnly, setBookmarksOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => getBookmarks());

  useEffect(() => {
    const onFocus = () => setBookmarks(getBookmarks());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const bookmarkSet = useMemo(() => new Set(bookmarks), [bookmarks]);
  const topics = useMemo(() => flattenItems(), []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return topics.filter((topic) => {
      const categoryMatch = selectedCategory === 'all' || topic.categoryId === selectedCategory;
      const bookmarkMatch = !bookmarksOnly || bookmarkSet.has(topic.id);
      const content = pageContent[topic.id];
      const textMatch =
        q.length === 0 ||
        topic.title.toLowerCase().includes(q) ||
        topic.tag.toLowerCase().includes(q) ||
        topic.categoryLabel.toLowerCase().includes(q) ||
        (content?.body?.join(' ') ?? '').toLowerCase().includes(q);
      return categoryMatch && textMatch && bookmarkMatch;
    });
  }, [topics, query, selectedCategory, bookmarksOnly, bookmarkSet]);

  return (
    <section className="page-body wide">
      <div className="toolbox">
        <h1>Explore Topics</h1>
        <p>Search by names, ideas, or phrases and jump directly to any topic page.</p>
        <div className="toolbox-controls">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search: Brahman, Ayurveda, Bhakti, temple..."
          />
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.label}</option>
            ))}
          </select>
          <button className={`filter-pill ${bookmarksOnly ? 'active' : ''}`} onClick={() => setBookmarksOnly((v) => !v)}>
            {bookmarksOnly ? 'Showing Bookmarks' : 'Bookmarks Only'}
          </button>
        </div>
      </div>

      <div className="results-grid">
        {filtered.map((topic) => {
          const progress = getTopicProgress(topic.id);
          return (
            <Link key={topic.id} to={`/topic/${topic.id}`} className="result-card">
              <div className="result-meta-row">
                <div className="result-meta">{topic.categoryIcon} {topic.categoryLabel}</div>
                {bookmarkSet.has(topic.id) ? <span className="bookmark-badge">★</span> : null}
              </div>
              <h3>{topic.title}</h3>
              <p>{pageContent[topic.id]?.period ?? topic.tag}</p>
              <div className="mini-progress-track">
                <div className="mini-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="mini-progress-label">Progress: {progress}%</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
