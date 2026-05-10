import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { createAuthToken, verifyAdminPassword, verifyAuthToken } from './auth.mjs';
import { readVideos, writeVideos, readBlogs, writeBlogs } from './store.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3001;
const distPath = path.join(__dirname, '..', 'dist');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'sanatana-cms', time: new Date().toISOString() });
});

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!verifyAuthToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function randomId() {
  return crypto.randomBytes(8).toString('hex');
}

function toYouTubeEmbed(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed.split('&')[0];
  }
  try {
    const u = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
  } catch {
    return trimmed;
  }
  return trimmed;
}

// --- Auth ---
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body || {};
  if (!verifyAdminPassword(password)) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  res.json({ token: createAuthToken() });
});

// --- Public: videos ---
app.get('/api/videos', async (_req, res) => {
  try {
    const list = await readVideos();
    const published = list
      .filter((v) => v.published !== false)
      .sort(
        (a, b) =>
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    res.json(published);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Public: blogs ---
app.get('/api/blogs', async (_req, res) => {
  try {
    const list = await readBlogs();
    const published = list
      .filter((b) => b.published)
      .map(({ body, ...rest }) => rest)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    res.json(published);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/blogs/post/:slug', async (req, res) => {
  try {
    const list = await readBlogs();
    const post = list.find((b) => b.slug === req.params.slug && b.published);
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Admin: videos ---
app.get('/api/admin/videos', authMiddleware, async (_req, res) => {
  try {
    const list = await readVideos();
    res.json(list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/videos', authMiddleware, async (req, res) => {
  try {
    const { title, description, videoUrl, sortOrder, published } = req.body || {};
    if (!title || !videoUrl) {
      return res.status(400).json({ error: 'title and videoUrl are required' });
    }
    const list = await readVideos();
    const item = {
      id: randomId(),
      title: String(title).trim(),
      description: String(description || '').trim(),
      videoUrl: String(videoUrl).trim(),
      embedUrl: toYouTubeEmbed(String(videoUrl).trim()),
      sortOrder: Number(sortOrder) || 0,
      published: published !== false,
      createdAt: new Date().toISOString(),
    };
    list.push(item);
    await writeVideos(list);
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/admin/videos/:id', authMiddleware, async (req, res) => {
  try {
    const list = await readVideos();
    const index = list.findIndex((v) => v.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    const prev = list[index];
    const { title, description, videoUrl, sortOrder, published } = req.body || {};
    const next = {
      ...prev,
      title: title != null ? String(title).trim() : prev.title,
      description: description != null ? String(description).trim() : prev.description,
      videoUrl: videoUrl != null ? String(videoUrl).trim() : prev.videoUrl,
      embedUrl: videoUrl != null ? toYouTubeEmbed(String(videoUrl).trim()) : prev.embedUrl,
      sortOrder: sortOrder != null ? Number(sortOrder) : prev.sortOrder,
      published: published != null ? Boolean(published) : prev.published,
      updatedAt: new Date().toISOString(),
    };
    list[index] = next;
    await writeVideos(list);
    res.json(next);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/admin/videos/:id', authMiddleware, async (req, res) => {
  try {
    const list = await readVideos();
    const next = list.filter((v) => v.id !== req.params.id);
    if (next.length === list.length) return res.status(404).json({ error: 'Not found' });
    await writeVideos(next);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Admin: blogs ---
app.get('/api/admin/blogs', authMiddleware, async (_req, res) => {
  try {
    const list = await readBlogs();
    res.json(list.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/blogs', authMiddleware, async (req, res) => {
  try {
    const { title, slug, excerpt, body, published } = req.body || {};
    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required' });
    }
    const list = await readBlogs();
    let finalSlug = slug ? slugify(slug) : slugify(title);
    if (!finalSlug) finalSlug = `post-${randomId()}`;
    if (list.some((b) => b.slug === finalSlug)) {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    const item = {
      id: randomId(),
      title: String(title).trim(),
      slug: finalSlug,
      excerpt: String(excerpt || '').trim(),
      body: String(body),
      published: Boolean(published),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(item);
    await writeBlogs(list);
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/admin/blogs/:id', authMiddleware, async (req, res) => {
  try {
    const list = await readBlogs();
    const index = list.findIndex((b) => b.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    const prev = list[index];
    const { title, slug, excerpt, body, published } = req.body || {};
    let finalSlug = slug != null ? slugify(slug) : prev.slug;
    if (!finalSlug) finalSlug = prev.slug;
    const clash = list.some((b, i) => i !== index && b.slug === finalSlug);
    if (clash) return res.status(400).json({ error: 'Slug already exists' });
    const next = {
      ...prev,
      title: title != null ? String(title).trim() : prev.title,
      slug: finalSlug,
      excerpt: excerpt != null ? String(excerpt).trim() : prev.excerpt,
      body: body != null ? String(body) : prev.body,
      published: published != null ? Boolean(published) : prev.published,
      updatedAt: new Date().toISOString(),
    };
    list[index] = next;
    await writeBlogs(list);
    res.json(next);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/admin/blogs/:id', authMiddleware, async (req, res) => {
  try {
    const list = await readBlogs();
    const next = list.filter((b) => b.id !== req.params.id);
    if (next.length === list.length) return res.status(404).json({ error: 'Not found' });
    await writeBlogs(next);
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Static + SPA (production) ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distPath));
  // Avoid path-to-regexp wildcard routes (Express 5 / different versions disagree on `*` / `{*splat}`).
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api')) return next();
    const indexHtml = path.join(distPath, 'index.html');
    res.sendFile(indexHtml, (err) => {
      if (err) next(err);
    });
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CMS API listening on http://127.0.0.1:${PORT} (and http://localhost:${PORT})`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`Serving static from ${distPath}`);
  }
});
