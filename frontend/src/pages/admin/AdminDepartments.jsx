import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const EMPTY_FORM = { name: '', code: '', headOfDepartment: '', description: '' };

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmToggleId, setConfirmToggleId] = useState(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await api.getAdminDepartments();
      setDepartments(res || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load departments.' });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingDept(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditingDept(dept);
    setForm({
      name: dept.name || '',
      code: dept.code || '',
      headOfDepartment: dept.headOfDepartment || '',
      description: dept.description || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDept(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      setFeedback({ type: 'error', message: 'Department name and code are required.' });
      return;
    }
    try {
      setSaving(true);
      setFeedback(null);
      if (editingDept) {
        await api.updateDepartment(editingDept.id, form);
        setFeedback({ type: 'success', message: `Department "${form.name}" updated successfully.` });
      } else {
        await api.createDepartment(form);
        setFeedback({ type: 'success', message: `Department "${form.name}" created successfully.` });
      }
      closeModal();
      loadDepartments();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save department.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setFeedback(null);
      await api.toggleDepartmentStatus(id);
      setFeedback({ type: 'success', message: 'Department status updated.' });
      setConfirmToggleId(null);
      loadDepartments();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to toggle department status.' });
    }
  };

  const activeDepts = departments.filter((d) => d.active !== false);
  const inactiveDepts = departments.filter((d) => d.active === false);

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Departments &amp; Institutional Setup</h1>
          <p className="student-page-subtitle">
            Manage academic departments and configure institutional structure.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + New Department
        </button>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible`} role="alert">
          <span>{feedback.message}</span>
          <button type="button" className="alert-close-btn" onClick={() => setFeedback(null)}>
            &times;
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="metric-cards-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="card metric-card">
          <span className="metric-label">Total Departments</span>
          <strong className="metric-value">{departments.length}</strong>
          <span className="metric-subtext">Registered in system</span>
        </div>
        <div className="card metric-card">
          <span className="metric-label">Active</span>
          <strong className="metric-value text-success">{activeDepts.length}</strong>
          <span className="metric-subtext">Currently operational</span>
        </div>
        <div className="card metric-card">
          <span className="metric-label">Inactive</span>
          <strong className="metric-value text-danger">{inactiveDepts.length}</strong>
          <span className="metric-subtext">Decommissioned / paused</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading departments...</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="empty-state-card card">
          <div className="empty-icon">🏛️</div>
          <h3>No Departments Yet</h3>
          <p>Get started by creating the first academic department.</p>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Create First Department
          </button>
        </div>
      ) : (
        <div className="dept-grid">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className={`card dept-card ${dept.active === false ? 'dept-card-inactive' : ''}`}
            >
              <div className="dept-card-header">
                <div className="dept-code-badge">{dept.code || '—'}</div>
                <span
                  className={`badge ${dept.active === false ? 'badge-attendance-absent' : 'badge-attendance-present'}`}
                >
                  {dept.active === false ? 'Inactive' : 'Active'}
                </span>
              </div>
              <h3 className="dept-name">{dept.name}</h3>
              {dept.headOfDepartment && (
                <p className="dept-hod">
                  <span className="dept-hod-icon">👤</span>
                  {dept.headOfDepartment}
                </p>
              )}
              {dept.description && (
                <p className="dept-description">{dept.description}</p>
              )}
              <div className="dept-card-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => openEdit(dept)}
                >
                  ✏️ Edit
                </button>
                {confirmToggleId === dept.id ? (
                  <div className="confirm-inline">
                    <span className="confirm-text">
                      {dept.active === false ? 'Activate?' : 'Deactivate?'}
                    </span>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleToggleStatus(dept.id)}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setConfirmToggleId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`btn btn-sm ${dept.active === false ? 'btn-success-outline' : 'btn-danger-outline'}`}
                    onClick={() => setConfirmToggleId(dept.id)}
                  >
                    {dept.active === false ? '✅ Activate' : '⛔ Deactivate'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingDept ? 'Edit Department' : 'Create New Department'}
              </h2>
              <button type="button" className="modal-close-btn" onClick={closeModal}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSave} noValidate>
              <div className="modal-body">
                <div className="form-row-two-col">
                  <div className="form-group">
                    <label htmlFor="dept-name" className="form-label">
                      Department Name <span className="required-star">*</span>
                    </label>
                    <input
                      id="dept-name"
                      type="text"
                      name="name"
                      className="form-input"
                      value={form.name}
                      onChange={handleFormChange}
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dept-code" className="form-label">
                      Dept. Code <span className="required-star">*</span>
                    </label>
                    <input
                      id="dept-code"
                      type="text"
                      name="code"
                      className="form-input"
                      value={form.code}
                      onChange={handleFormChange}
                      placeholder="e.g., CS"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="dept-hod" className="form-label">
                    Head of Department
                  </label>
                  <input
                    id="dept-hod"
                    type="text"
                    name="headOfDepartment"
                    className="form-input"
                    value={form.headOfDepartment}
                    onChange={handleFormChange}
                    placeholder="e.g., Dr. Ramesh Kumar"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dept-desc" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="dept-desc"
                    name="description"
                    className="form-input form-textarea"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Brief description of the department's scope and offerings..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
