import { Link, useParams } from 'react-router-dom';
import { pageContent } from '../data/content';
import { getCategoryForTopic, getPrevNextInCategory } from '../utils/content';
import { buildTopicSummary } from '../utils/topicSummary';

export default function TopicSummaryPage() {
  const { topicId } = useParams();
  const page = pageContent[topicId];

  if (!page) {
    return (
      <section className="page-body">
        <p>Summary not found.</p>
        <Link className="back-btn" to="/library">← Back to Library</Link>
      </section>
    );
  }

  const category = getCategoryForTopic(topicId);
  const { prev, next } = getPrevNextInCategory(topicId);
  const summary = buildTopicSummary({ page, category });

  return (
    <section className="page-body wide summary-page">
      <Link className="back-btn" to={`/topic/${topicId}`}>← Back to Source Topic</Link>

      <header className="page-header">
        {category ? <span className="page-category">{category.icon} {category.label}</span> : null}
        <h1 className="page-title">{page.title} — Story Summary</h1>
        {page.period ? <span className="page-period">{page.period}</span> : null}
        <p className="summary-lens">Interpretive Lens: {summary.lens}</p>
      </header>

      <div className="summary-grid">
        <section className="summary-card">
          <h3>Detailed Overview</h3>
          {summary.overview.map((line) => <p key={line}>{line}</p>)}
        </section>

        <section className="summary-card">
          <h3>Storyline</h3>
          {summary.storyline.map((line) => <p key={line}>{line}</p>)}
        </section>

        <section className="summary-card">
          <h3>Narrative Beats</h3>
          <ul>
            {summary.arc.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </section>

        <section className="summary-card">
          <h3>Key Messages</h3>
          <ul>
            {summary.keyMessages.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </section>

        <section className="summary-card">
          <h3>Theme Signals</h3>
          <div className="theme-tags">
            {summary.themes.map((theme) => <span key={theme}>{theme}</span>)}
          </div>
        </section>

        <section className="summary-card">
          <h3>Reflection Prompts</h3>
          <ul>
            {summary.reflectionPrompts.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </section>
      </div>

      <div className="page-nav">
        {prev ? <Link className="pn-btn" to={`/topic/${prev.id}/summary`}>← {prev.title}</Link> : <span />}
        {next ? <Link className="pn-btn pn-next" to={`/topic/${next.id}/summary`}>{next.title} →</Link> : null}
      </div>
    </section>
  );
}
