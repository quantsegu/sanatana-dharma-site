/**
 * In dev, always use same-origin `/api` so Vite's proxy works. A mis-set
 * VITE_API_URL like http://127.0.0.1:3001 breaks when you open the site from
 * another device (phone / LAN IP) — fetch would hit the wrong machine.
 */
const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL ?? '');

const TOKEN_KEY = 'cms_admin_token';

export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getAdminToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  if (response.status === 204) return null;
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text?.slice(0, 200) || 'Invalid response' };
  }
  if (!response.ok) {
    if (response.status === 401) clearAdminToken();
    const message = data?.error || response.statusText;
    const err = new Error(message);
    if (response.status === 401) err.code = 'UNAUTHORIZED';
    throw err;
  }
  return data;
}

export async function loginAdmin(password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  if (data?.token) setAdminToken(data.token);
  return data;
}

export async function fetchPublicVideos() {
  return request('/api/videos');
}

export async function fetchPublicBlogs() {
  return request('/api/blogs');
}

export async function fetchPublicBlogPost(slug) {
  return request(`/api/blogs/post/${encodeURIComponent(slug)}`);
}

export async function fetchAdminVideos() {
  return request('/api/admin/videos');
}

export async function createVideo(payload) {
  return request('/api/admin/videos', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateVideo(id, payload) {
  return request(`/api/admin/videos/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteVideo(id) {
  return request(`/api/admin/videos/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function fetchAdminBlogs() {
  return request('/api/admin/blogs');
}

export async function createBlog(payload) {
  return request('/api/admin/blogs', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateBlog(id, payload) {
  return request(`/api/admin/blogs/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteBlog(id) {
  return request(`/api/admin/blogs/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
