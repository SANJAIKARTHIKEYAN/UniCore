import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const DEPARTMENTS = ['BCA', 'BSCS', 'BCOM', 'BBA', 'BSM'];

export default function AdminFaculty() {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    department: 'BCA',
    facultyId: '',
  });
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFaculty, setEditFaculty] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    department: '',
    status: 'ACTIVE',
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async (query = search) => {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await api.getAdminFaculty(query);
      setFacultyList(res || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load faculty members.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadFaculty(search);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingAdd(true);
      setFeedback(null);
      const res = await api.createAdminFaculty(addForm);
      setFacultyList((prev) => [res, ...prev]);
      setShowAddModal(false);
      setAddForm({
        name: '',
        email: '',
        password: '',
        department: 'BCA',
        facultyId: '',
      });
      setFeedback({ type: 'success', message: `Faculty member "${res.name}" created with ID ${res.facultyId}.` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create faculty member.' });
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleEditClick = (faculty) => {
    setEditFaculty(faculty);
    setEditForm({
      name: faculty.name || '',
      department: faculty.department || 'BCA',
      status: faculty.status || 'ACTIVE',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFaculty) return;
    try {
      setSubmittingEdit(true);
      setFeedback(null);
      const res = await api.updateAdminFaculty(editFaculty.id, editForm);
      setFacultyList((prev) => prev.map((f) => (f.id === editFaculty.id ? res : f)));
      setShowEditModal(false);
      setEditFaculty(null);
      setFeedback({ type: 'success', message: `Faculty member "${res.name}" updated successfully.` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update faculty member.' });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeactivate = async (faculty) => {
    const isDeactivating = faculty.status === 'ACTIVE';
    const confirmMessage = isDeactivating
      ? `Are you sure you want to deactivate faculty member ${faculty.name} (${faculty.facultyId})? They will no longer be able to log in.`
      : `Reactivate faculty member ${faculty.name}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setFeedback(null);
      if (isDeactivating) {
        await api.deleteAdminFaculty(faculty.id);
        setFacultyList((prev) =>
          prev.map((f) => (f.id === faculty.id ? { ...f, status: 'INACTIVE' } : f))
        );
        setFeedback({ type: 'success', message: `Faculty ${faculty.name} has been deactivated.` });
      } else {
        const res = await api.updateAdminFaculty(faculty.id, { status: 'ACTIVE' });
        setFacultyList((prev) => prev.map((f) => (f.id === faculty.id ? res : f)));
        setFeedback({ type: 'success', message: `Faculty ${faculty.name} has been reactivated.` });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Action failed.' });
    }
  };

  const filteredFaculty = facultyList.filter((f) => {
    if (selectedDept && f.department !== selectedDept) return false;
    return true;
  });

  return (
    <div className="student-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Faculty Member Management</h1>
          <p className="student-page-subtitle">
            Register teaching staff, assign departmental affiliations, and manage instructor access.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          + Add New Faculty
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible`} role="alert">
          <span>{feedback.message}</span>
          <button type="button" className="alert-close-btn" onClick={() => setFeedback(null)}>
            &times;
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="card attendance-filter-card" style={{ marginBottom: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} className="admin-filter-bar">
          <div className="filter-group" style={{ flex: '1 1 300px' }}>
            <label className="form-label" htmlFor="faculty-search-input">
              Search by Name, Email, or Faculty ID:
            </label>
            <div className="date-input-wrapper">
              <input
                type="text"
                id="faculty-search-input"
                className="form-control"
                placeholder="e.g. Sharma, bca.fac001, BCA-FAC-001..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-sm">
                🔍 Search
              </button>
              {search && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSearch('');
                    loadFaculty('');
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="filter-group" style={{ minWidth: '180px' }}>
            <label className="form-label" htmlFor="faculty-dept-select">
              Filter by Department:
            </label>
            <select
              id="faculty-dept-select"
              className="form-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments ({facultyList.length})</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Faculty Table */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading faculty members...</p>
        </div>
      ) : filteredFaculty.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">👨‍🏫</span>
          <h3>No Faculty Members Found</h3>
          <p>No faculty accounts match your filter criteria.</p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="unicore-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Faculty ID</th>
                  <th>Faculty Name</th>
                  <th>Email Address</th>
                  <th>Department</th>
                  <th>Assigned Courses</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', width: '160px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.map((f, idx) => (
                  <tr key={f.id}>
                    <td className="text-secondary">{idx + 1}</td>
                    <td>
                      <span className="reg-number-pill">{f.facultyId}</span>
                    </td>
                    <td>
                      <strong>{f.name}</strong>
                    </td>
                    <td className="text-secondary">{f.email}</td>
                    <td>
                      <span className="badge badge-secondary">{f.department}</span>
                    </td>
                    <td>
                      <span className="badge badge-FACULTY">
                        {f.assignedCoursesCount} Course{f.assignedCoursesCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          f.status === 'ACTIVE'
                            ? 'badge-attendance-present'
                            : 'badge-attendance-absent'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-action-btn-group">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEditClick(f)}
                          title="Edit Faculty Information"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            f.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'
                          }`}
                          onClick={() => handleDeactivate(f)}
                          title={f.status === 'ACTIVE' ? 'Deactivate Faculty Account' : 'Reactivate Faculty Account'}
                        >
                          {f.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer-strip">
            <span>Showing {filteredFaculty.length} of {facultyList.length} total faculty members</span>
          </div>
        </div>
      )}

      {/* Add Faculty Modal */}
      {showAddModal && (
        <div className="card assessment-modal-card">
          <div className="modal-header">
            <h3>Register New Faculty Member</h3>
            <button type="button" className="alert-close-btn" onClick={() => setShowAddModal(false)}>
              &times;
            </button>
          </div>
          <form onSubmit={handleAddSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="add-fac-name">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="add-fac-name"
                  className="form-control"
                  placeholder="e.g. Dr. Jane Smith"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="add-fac-email">
                  University Email *
                </label>
                <input
                  type="email"
                  id="add-fac-email"
                  className="form-control"
                  placeholder="e.g. jane.smith@unicore.edu"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="add-fac-id">
                  Faculty ID *
                </label>
                <input
                  type="text"
                  id="add-fac-id"
                  className="form-control"
                  placeholder="e.g. BCA-FAC-010"
                  value={addForm.facultyId}
                  onChange={(e) => setAddForm({ ...addForm, facultyId: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="add-fac-dept">
                  Department *
                </label>
                <select
                  id="add-fac-dept"
                  className="form-control"
                  value={addForm.department}
                  onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="add-fac-pwd">
                  Initial Password (Optional)
                </label>
                <input
                  type="password"
                  id="add-fac-pwd"
                  className="form-control"
                  placeholder="Defaults to UniCore@2026"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                />
              </div>
            </div>

            <div className="form-actions-row">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
                disabled={submittingAdd}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submittingAdd}>
                {submittingAdd ? 'Creating Faculty...' : 'Create Faculty Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Faculty Modal */}
      {showEditModal && editFaculty && (
        <div className="card assessment-modal-card">
          <div className="modal-header">
            <h3>Edit Faculty &mdash; {editFaculty.name} ({editFaculty.facultyId})</h3>
            <button type="button" className="alert-close-btn" onClick={() => setShowEditModal(false)}>
              &times;
            </button>
          </div>
          <form onSubmit={handleEditSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-fac-name">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="edit-fac-name"
                  className="form-control"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-fac-dept">
                  Department *
                </label>
                <select
                  id="edit-fac-dept"
                  className="form-control"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-fac-status">
                  Account Status *
                </label>
                <select
                  id="edit-fac-status"
                  className="form-control"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <div className="form-actions-row">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
                disabled={submittingEdit}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submittingEdit}>
                {submittingEdit ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
