import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createVideo,
  deleteVideo,
  fetchAdminVideos,
  updateVideo,
} from '../../api/cms';

const emptyForm = {
  title: '',
  description: '',
  videoUrl: '',
  sortOrder: 0,
  published: true,
};

export default function AdminVideos() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await fetchAdminVideos();
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
      description: item.description || '',
      videoUrl: item.videoUrl,
      sortOrder: item.sortOrder ?? 0,
      published: item.published !== false,
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
        await updateVideo(editingId, form);
      } else {
        await createVideo(form);
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
    if (!window.confirm('Delete this video?')) return;
    setError('');
    try {
      await deleteVideo(id);
      if (editingId === id) cancelEdit();
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-panel">
      <h2>Videos</h2>
      <p className="admin-help">
        Paste a YouTube link (watch or youtu.be). Set sort order (lower appears first). Uncheck published to hide from the public page.
      </p>

      {loading ? <p>Loading…</p> : null}
      {error ? <p className="admin-error">{error}</p> : null}

      <form className="admin-form" onSubmit={onSave}>
        <h3>{editingId ? 'Edit video' : 'Add video'}</h3>
        <div className="admin-form-grid">
          <label>
            Title *
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label>
            Sort order
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </label>
        </div>
        <label>
          YouTube URL *
          <input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} required />
        </label>
        <label>
          Description
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Published (visible on /videos)
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
                {item.published === false ? 'Draft' : 'Live'} · order {item.sortOrder ?? 0}
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
