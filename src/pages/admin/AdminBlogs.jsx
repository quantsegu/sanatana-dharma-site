import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createBlog,
  deleteBlog,
  fetchAdminBlogs,
  updateBlog,
} from '../../api/cms';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  published: false,
};

export default function AdminBlogs() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await fetchAdminBlogs();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e.code === 'UNAUTHORIZED') {
        navigate('/admin/login', { replace: true });
        return;
      }
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      body: item.body || '',
      published: Boolean(item.published),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await updateBlog(editingId, form);
      } else {
        await createBlog(form);
      }
      cancelEdit();
      await load();
    } catch (err) {
      if (err.code === 'UNAUTHORIZED') {
        navigate('/admin/login', { replace: true });
        return;
      }
      setError(err.message);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    setError('');
    try {
      await deleteBlog(id);
      if (editingId === id) cancelEdit();
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-panel">
      <h2>Blog posts</h2>
      <p className="admin-help">
        Body uses Markdown (headings, lists, links). Slug is optional — it will be generated from the title. Check published when ready for /blog.
      </p>

      {loading ? <p>Loading…</p> : null}
      {error ? <p className="admin-error">{error}</p> : null}

      <form className="admin-form" onSubmit={onSave}>
        <h3>{editingId ? 'Edit post' : 'New post'}</h3>
        <label>
          Title *
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </label>
        <label>
          Slug (URL path)
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="auto-from-title"
          />
        </label>
        <label>
          Excerpt (short summary for list)
          <textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        </label>
        <label>
          Body (Markdown) *
          <textarea rows={14} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
        </label>
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Published (visible on /blog)
        </label>
        <div className="admin-form-actions">
          <button type="submit" className="cta-button">{editingId ? 'Update' : 'Create'}</button>
          {editingId ? (
            <button type="button" className="cta-button ghost" onClick={cancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <ul className="admin-list">
        {items.map((item) => (
          <li key={item.id} className="admin-list-item">
            <div>
              <strong>{item.title}</strong>
              <span className="admin-meta">
                /blog/{item.slug} · {item.published ? 'Live' : 'Draft'}
              </span>
            </div>
            <div className="admin-list-actions">
              <button type="button" className="filter-pill" onClick={() => startEdit(item)}>Edit</button>
              <button type="button" className="filter-pill" onClick={() => onDelete(item.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
