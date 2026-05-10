import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { pageContent } from '../data/content';
import { flattenItems } from '../utils/content';
import { getBookmarks, getTopicProgress, setBookmarks } from '../utils/readingState';

export default function BookmarksPage() {
  const [bookmarks, setBookmarksState] = useState(() => getBookmarks());
  const allTopics = useMemo(() => flattenItems(), []);

  useEffect(() => {
    const onFocus = () => setBookmarksState(getBookmarks());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const bookmarkedTopics = useMemo(() => {
    const bookmarkSet = new Set(bookmarks);
    return allTopics
      .filter((topic) => bookmarkSet.has(topic.id))
      .map((topic) => ({ ...topic, progress: getTopicProgress(topic.id) }))
      .sort((a, b) => b.progress - a.progress);
  }, [allTopics, bookmarks]);

  const averageProgress = bookmarkedTopics.length
    ? Math.round(bookmarkedTopics.reduce((sum, topic) => sum + topic.progress, 0) / bookmarkedTopics.length)
    : 0;

  const removeBookmark = (topicId) => {
    const next = bookmarks.filter((id) => id !== topicId);
    setBookmarks(next);
    setBookmarksState(next);
  };

  const clearAll = () => {
    setBookmarks([]);
    setBookmarksState([]);
  };

  return (
    <section className="page-body wide">
      <div className="toolbox">
        <h1>Bookmarked Topics</h1>
        <p>Track your saved reading path and continue from where you left off.</p>
        <div className="bookmark-stats">
          <span>{bookmarkedTopics.length} saved topics</span>
          <span>Average progress: {averageProgress}%</span>
          {bookmarkedTopics.length ? <button className="filter-pill" onClick={clearAll}>Clear All</button> : null}
        </div>
      </div>

      {bookmarkedTopics.length === 0 ? (
        <div className="toolbox">
          <p>No bookmarks yet. Open any topic and click the bookmark button to build your personal study list.</p>
          <Link to="/explore" className="cta-button">Explore Topics</Link>
        </div>
      ) : (
        <div className="results-grid">
          {bookmarkedTopics.map((topic) => (
            <div key={topic.id} className="result-card bookmark-card">
              <Link to={`/topic/${topic.id}`}>
                <div className="result-meta">{topic.categoryIcon} {topic.categoryLabel}</div>
                <h3>{topic.title}</h3>
                <p>{pageContent[topic.id]?.period ?? topic.tag}</p>
              </Link>
              <div className="mini-progress-track">
                <div className="mini-progress-fill" style={{ width: `${topic.progress}%` }} />
              </div>
              <span className="mini-progress-label">Progress: {topic.progress}%</span>
              <button className="bookmark-remove" onClick={() => removeBookmark(topic.id)}>Remove Bookmark</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
