import React, { useState, useEffect } from 'react';
import { adminFetch } from '../context/AdminContext';

const ICONS = ['🏠','🚿','🍳','🛋️','🪟','✨','🛏️','🧹','🪣','🧴','🚪','🛁','🪑','🖥️','🌿'];

const emptyForm = { name: '', price: '', icon: '🏠', desc: '', duration: '', popular: false, active: true, order: 0 };

export default function Services() {
  const [services, setServices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editService, setEditService] = useState(null); // null = add new
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState({ text: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { ok, data } = await adminFetch('/services/all');
      if (ok) setServices(data.services || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const openAdd = () => {
    setEditService(null);
    setForm(emptyForm);
    setMsg({ text: '', type: '' });
    setShowForm(true);
  };

  const openEdit = (svc) => {
    setEditService(svc);
    setForm({
      name:     svc.name,
      price:    svc.price,
      icon:     svc.icon,
      desc:     svc.desc,
      duration: svc.duration,
      popular:  svc.popular,
      active:   svc.active,
      order:    svc.order || 0,
    });
    setMsg({ text: '', type: '' });
    setShowForm(true);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.desc.trim() || !form.duration.trim()) {
      setMsg({ text: 'Name, price, description and duration are required.', type: 'error' });
      return;
    }
    setSaving(true);
    setMsg({ text: '', type: '' });

    const payload = {
      ...form,
      price: Number(form.price),
      order: Number(form.order) || 0,
    };

    try {
      let res;
      if (editService) {
        res = await adminFetch(`/services/${editService._id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        res = await adminFetch('/services', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setMsg({ text: editService ? '✅ Service updated!' : '✅ Service added!', type: 'success' });
        await fetchServices();
        setTimeout(() => {
          setShowForm(false);
          setMsg({ text: '', type: '' });
        }, 1200);
      } else {
        setMsg({ text: res.data?.message || 'Something went wrong.', type: 'error' });
      }
    } catch {
      setMsg({ text: 'Network error.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { ok, data } = await adminFetch(`/services/${id}`, { method: 'DELETE' });
      if (ok) {
        setDeleteConfirm(null);
        await fetchServices();
      } else {
        alert(data?.message || 'Could not delete service.');
      }
    } catch {
      alert('Network error.');
    }
  };

  const toggleActive = async (svc) => {
    try {
      await adminFetch(`/services/${svc._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !svc.active }),
      });
      await fetchServices();
    } catch {}
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Services</h1>
          <p className="page-sub">{services.length} services configured</p>
        </div>
        <button className="btn-add" onClick={openAdd}>+ Add Service</button>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editService ? 'Edit Service' : 'Add New Service'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="service-form">
              <div className="sf-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Service Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Full Home Cleaning" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Price (₹) *</label>
                  <input name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="999" />
                </div>
              </div>

              <div className="sf-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Duration *</label>
                  <input name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 2-3 hrs" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Display Order</label>
                  <input name="order" type="number" min="0" value={form.order} onChange={handleChange} placeholder="0" />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea name="desc" value={form.desc} onChange={handleChange} placeholder="Short description of the service" rows={2} />
              </div>

              <div className="form-group">
                <label>Icon</label>
                <div className="icon-picker">
                  {ICONS.map(ic => (
                    <button
                      key={ic} type="button"
                      className={`icon-opt ${form.icon === ic ? 'icon-selected' : ''}`}
                      onClick={() => setForm(p => ({ ...p, icon: ic }))}
                    >{ic}</button>
                  ))}
                </div>
              </div>

              <div className="sf-row sf-checks">
                <label className="check-label">
                  <input type="checkbox" name="popular" checked={form.popular} onChange={handleChange} />
                  ⭐ Mark as Popular
                </label>
                <label className="check-label">
                  <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
                  ✅ Active (visible to users)
                </label>
              </div>

              {msg.text && (
                <div className={msg.type === 'success' ? 'alert-success' : 'alert-error'}>{msg.text}</div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Saving...' : (editService ? 'Update Service' : 'Add Service')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box modal-small" onClick={e => e.stopPropagation()}>
            <h2>Delete Service?</h2>
            <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-delete" onClick={() => handleDelete(deleteConfirm._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="page-loading"><div className="loader"></div><p>Loading services...</p></div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧹</div>
          <h3>No services yet</h3>
          <p>Click "Add Service" to create your first service.</p>
        </div>
      ) : (
        <div className="services-admin-grid">
          {services.map(svc => (
            <div key={svc._id} className={`svc-card ${!svc.active ? 'svc-inactive' : ''}`}>
              <div className="svc-card-top">
                <span className="svc-card-icon">{svc.icon}</span>
                <div className="svc-card-badges">
                  {svc.popular && <span className="badge-popular">⭐ Popular</span>}
                  <span className={svc.active ? 'badge-active' : 'badge-inactive'}>
                    {svc.active ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>
              <div className="svc-card-name">{svc.name}</div>
              <div className="svc-card-desc">{svc.desc}</div>
              <div className="svc-card-meta">
                <span>⏱ {svc.duration}</span>
                <span className="svc-price">₹{svc.price?.toLocaleString('en-IN')}</span>
              </div>
              <div className="svc-card-actions">
                <button className="btn-toggle" onClick={() => toggleActive(svc)}>
                  {svc.active ? '🔒 Hide' : '👁 Show'}
                </button>
                <button className="btn-edit-sm" onClick={() => openEdit(svc)}>✏️ Edit</button>
                <button className="btn-del-sm" onClick={() => setDeleteConfirm(svc)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
