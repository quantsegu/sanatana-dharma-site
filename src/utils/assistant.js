import { pageContent } from '../data/content';
import { flattenItems } from './content';

const DEFAULT_LOCAL_ENDPOINT = 'http://127.0.0.1:11434/api/generate';
const DEFAULT_MODEL = 'llama3.2:3b';

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function scoreTopic(queryTokens, topic, text) {
  const haystack = `${topic.title} ${topic.tag} ${text}`.toLowerCase();
  return queryTokens.reduce((score, token) => (haystack.includes(token) ? score + 1 : score), 0);
}

function getRelevantTopics(query, maxItems = 4) {
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);

  const topics = flattenItems()
    .map((topic) => {
      const page = pageContent[topic.id];
      const text = (page?.body ?? []).map(stripHtml).join(' ');
      return {
        ...topic,
        page,
        score: scoreTopic(tokens, topic, text),
        text,
      };
    })
    .filter((topic) => topic.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems);

  return topics;
}

function fallbackAnswer(query, topics) {
  if (!topics.length) {
    return {
      answer: `I could not find a strong direct match for "${query}" inside the knowledge base yet. Try asking with specific keywords like a text name, school, period, or concept.`,
      sources: [],
      mode: 'zero-cost-fallback',
    };
  }

  const lines = [];
  lines.push(`Based on the closest topics in this site, here is a concise answer to: "${query}".`);

  topics.forEach((topic, index) => {
    const highlights = (topic.page?.body ?? []).slice(0, 2).map(stripHtml).join(' ');
    lines.push(
      `${index + 1}) ${topic.title}: ${highlights.slice(0, 300)}${highlights.length > 300 ? '...' : ''}`
    );
  });

  lines.push('Use the linked source topics to verify nuance and context.');

  return {
    answer: lines.join('\n\n'),
    sources: topics.map((topic) => ({ id: topic.id, title: topic.title })),
    mode: 'zero-cost-fallback',
  };
}

async function localLlmAnswer({ query, topics, endpoint, model }) {
  const context = topics
    .map((topic) => {
      const body = (topic.page?.body ?? []).slice(0, 3).map(stripHtml).join(' ');
      return `- ${topic.title}: ${body}`;
    })
    .join('\n');

  const prompt = [
    'You are an educational guide for Sanatana Dharma content.',
    'Answer in clear, detailed prose with 3 sections: Story, Key Messages, Practical Takeaway.',
    'Stay grounded in provided context. If uncertain, state uncertainty.',
    '',
    `Question: ${query}`,
    '',
    'Context:',
    context || 'No direct context found.'
  ].join('\n');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false }),
  });

  if (!response.ok) {
    throw new Error(`Local model request failed (${response.status})`);
  }

  const payload = await response.json();
  const text = payload?.response?.trim();
  if (!text) {
    throw new Error('Local model returned an empty response');
  }

  return {
    answer: text,
    sources: topics.map((topic) => ({ id: topic.id, title: topic.title })),
    mode: 'local-llm',
  };
}

export async function askKnowledgeAssistant({ query, useLocalModel, endpoint, model }) {
  const relevant = getRelevantTopics(query);

  if (useLocalModel) {
    try {
      return await localLlmAnswer({
        query,
        topics: relevant,
        endpoint: endpoint || DEFAULT_LOCAL_ENDPOINT,
        model: model || DEFAULT_MODEL,
      });
    } catch (error) {
      const fallback = fallbackAnswer(query, relevant);
      return {
        ...fallback,
        mode: 'zero-cost-fallback',
        warning: `${error.message}. Showing fallback answer from local site data instead.`,
      };
    }
  }

  return fallbackAnswer(query, relevant);
}

export const assistantDefaults = {
  endpoint: DEFAULT_LOCAL_ENDPOINT,
  model: DEFAULT_MODEL,
};
