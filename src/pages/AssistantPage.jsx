import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { askKnowledgeAssistant, assistantDefaults } from '../utils/assistant';

const STORAGE_KEY = 'sanatana.assistant.settings';

function loadSettings() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    return {
      useLocalModel: Boolean(parsed.useLocalModel),
      endpoint: parsed.endpoint || assistantDefaults.endpoint,
      model: parsed.model || assistantDefaults.model,
    };
  } catch {
    return {
      useLocalModel: false,
      endpoint: assistantDefaults.endpoint,
      model: assistantDefaults.model,
    };
  }
}

export default function AssistantPage() {
  const [query, setQuery] = useState('Explain the key message of the Upanishadic revolution in simple terms.');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(() => loadSettings());

  const modeLabel = useMemo(() => {
    if (!result) return null;
    return result.mode === 'local-llm' ? 'Answered by local model' : 'Answered by zero-cost fallback engine';
  }, [result]);

  const updateSettings = (next) => {
    const merged = { ...settings, ...next };
    setSettings(merged);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  };

  const onAsk = async (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const answer = await askKnowledgeAssistant({ query: trimmed, ...settings });
      setResult(answer);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-body wide assistant-page">
      <div className="toolbox">
        <h1>Ask Local AI Guide</h1>
        <p>
          Lowest-cost mode: keep local model disabled and use the built-in zero-cost answer engine. 
          For richer responses, enable a local SLM/LLM endpoint (for example Ollama).
        </p>
      </div>

      <form className="assistant-form" onSubmit={onAsk}>
        <textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={5} />
        <div className="assistant-actions">
          <button className="cta-button" type="submit" disabled={loading}>{loading ? 'Thinking...' : 'Ask Guide'}</button>
          <label className="assistant-toggle">
            <input
              type="checkbox"
              checked={settings.useLocalModel}
              onChange={(e) => updateSettings({ useLocalModel: e.target.checked })}
            />
            Use local SLM/LLM
          </label>
        </div>

        <div className="assistant-config">
          <label>
            Local endpoint
            <input value={settings.endpoint} onChange={(e) => updateSettings({ endpoint: e.target.value })} />
          </label>
          <label>
            Local model
            <input value={settings.model} onChange={(e) => updateSettings({ model: e.target.value })} />
          </label>
        </div>
      </form>

      {result ? (
        <div className="assistant-result">
          {modeLabel ? <p className="assistant-mode">{modeLabel}</p> : null}
          {result.warning ? <p className="assistant-warning">{result.warning}</p> : null}
          <pre>{result.answer}</pre>
          {result.sources?.length ? (
            <div>
              <h3>Suggested source topics</h3>
              <div className="theme-tags">
                {result.sources.map((source) => (
                  <Link key={source.id} to={`/topic/${source.id}`}>{source.title}</Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
