import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { pageContent } from '../data/content';
import { getCategoryForTopic, getPrevNextInCategory } from '../utils/content';
import { getTopicProgress, isBookmarked, setTopicProgress, toggleBookmark } from '../utils/readingState';

const VOICE_KEY = 'sanatana.narration.voice';
const RATE_KEY = 'sanatana.narration.rate';

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function TopicPage() {
  const { topicId } = useParams();
  const page = pageContent[topicId];
  const articleRef = useRef(null);

  const [progress, setProgress] = useState(() => getTopicProgress(topicId));
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(topicId));
  const [isNarrating, setIsNarrating] = useState(false);
  const [voices, setVoices] = useState([]);
  const [voiceURI, setVoiceURI] = useState(() => window.localStorage.getItem(VOICE_KEY) ?? '');
  const [narrationRate, setNarrationRate] = useState(() => Number(window.localStorage.getItem(RATE_KEY) ?? '0.95'));

  useEffect(() => {
    if (!topicId) return;

    const syncTopicState = () => {
      setProgress(getTopicProgress(topicId));
      setBookmarked(isBookmarked(topicId));
    };
    const rafId = window.requestAnimationFrame(syncTopicState);

    const onScroll = () => {
      if (!articleRef.current) return;
      const rect = articleRef.current.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const total = rect.height + viewport;
      const viewed = Math.max(0, Math.min(total, viewport - rect.top));
      const percent = (viewed / total) * 100;
      const stored = setTopicProgress(topicId, percent);
      setProgress(stored);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [topicId]);

  useEffect(() => {
    const syncVoices = () => {
      const available = window.speechSynthesis?.getVoices?.() ?? [];
      setVoices(available);
      if (!voiceURI && available.length > 0) {
        setVoiceURI(available[0].voiceURI);
      }
    };

    syncVoices();
    window.speechSynthesis?.addEventListener?.('voiceschanged', syncVoices);

    return () => {
      window.speechSynthesis?.removeEventListener?.('voiceschanged', syncVoices);
      window.speechSynthesis?.cancel?.();
    };
  }, [voiceURI]);

  useEffect(() => {
    window.localStorage.setItem(VOICE_KEY, voiceURI);
  }, [voiceURI]);

  useEffect(() => {
    window.localStorage.setItem(RATE_KEY, String(narrationRate));
  }, [narrationRate]);

  const narrationText = useMemo(() => {
    if (!page) return '';
    const pieces = [page.title, page.period ?? '', ...(page.body ?? []).map(stripHtml)];
    return pieces.filter(Boolean).join('. ');
  }, [page]);

  if (!page) {
    return (
      <section className="page-body">
        <p>Topic not found.</p>
        <Link className="back-btn" to="/">← Back to Home</Link>
      </section>
    );
  }

  const { prev, next } = getPrevNextInCategory(topicId);
  const category = getCategoryForTopic(topicId);

  const onToggleBookmark = () => {
    const nextBookmarks = toggleBookmark(topicId);
    setBookmarked(nextBookmarks.includes(topicId));
  };

  const onToggleNarration = () => {
    if (!window.speechSynthesis) return;

    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = narrationRate;
    utterance.pitch = 1;
    if (voiceURI) {
      const selectedVoice = voices.find((voice) => voice.voiceURI === voiceURI);
      if (selectedVoice) utterance.voice = selectedVoice;
    }
    utterance.onend = () => setIsNarrating(false);
    utterance.onerror = () => setIsNarrating(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsNarrating(true);
  };

  return (
    <section className="page-body">
      <Link className="back-btn" to="/explore">← Back to Explore</Link>
      <header className="page-header">
        {category && <span className="page-category">{category.icon} {category.label}</span>}
        {page.sanskrit && <span className="page-sanskrit">{page.sanskrit}</span>}
        <h1 className="page-title">{page.title}</h1>
        {page.period && <span className="page-period">{page.period}</span>}

        <div className="topic-controls">
          <button className={`filter-pill ${bookmarked ? 'active' : ''}`} onClick={onToggleBookmark}>
            {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>
          <Link className="filter-pill" to={`/topic/${topicId}/summary`}>
            Story Summary Page
          </Link>
          <button className={`filter-pill ${isNarrating ? 'active' : ''}`} onClick={onToggleNarration}>
            {isNarrating ? 'Stop Narration' : 'Play Narration'}
          </button>
        </div>

        <div className="narration-config">
          <label>
            Voice
            <select value={voiceURI} onChange={(e) => setVoiceURI(e.target.value)}>
              {voices.length === 0 ? <option value="">System default</option> : null}
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </label>
          <label>
            Speed ({narrationRate.toFixed(2)}x)
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={narrationRate}
              onChange={(e) => setNarrationRate(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="reading-progress-wrap" aria-label="Reading progress">
          <div className="reading-progress-track">
            <div className="reading-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}% read</span>
        </div>
      </header>

      <article className="page-content" ref={articleRef}>
        {page.body.map((paragraph, index) => (
          <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
        ))}
      </article>

      {page.references?.length ? (
        <section className="references">
          <h3>References & Further Reading</h3>
          {page.references.map((reference, index) => (
            <div key={index} className="ref-item">{reference}</div>
          ))}
        </section>
      ) : null}

      <div className="page-nav">
        {prev ? <Link className="pn-btn" to={`/topic/${prev.id}`}>← {prev.title}</Link> : <span />}
        {next ? <Link className="pn-btn pn-next" to={`/topic/${next.id}`}>{next.title} →</Link> : null}
      </div>
    </section>
  );
}
