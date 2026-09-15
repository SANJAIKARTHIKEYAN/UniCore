import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudentNotifications();
      setNotifications(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading announcements...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p><strong>Error loading notifications:</strong> {error}</p>
        <button className="btn btn-secondary" onClick={loadNotifications} style={{ marginTop: '0.75rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  const displayedNotifs =
    filterType === 'ALL'
      ? notifications
      : notifications.filter((n) => n.type === filterType);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'EXAM':
        return <span className="status-badge status-danger">Examination</span>;
      case 'FEE':
        return <span className="status-badge status-warning">Fee Notice</span>;
      case 'DEPARTMENT':
        return <span className="status-badge status-STUDENT">Department</span>;
      case 'ACADEMIC':
        return <span className="status-badge status-info">Academic</span>;
      default:
        return <span className="status-badge status-secondary">General</span>;
    }
  };

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Notifications & Bulletins</h1>
          <p className="student-page-subtitle">Official announcements, examination notices, and departmental alerts.</p>
        </div>

        <div className="tab-group" style={{ marginBottom: 0, padding: '0.2rem' }}>
          {['ALL', 'EXAM', 'FEE', 'DEPARTMENT', 'GENERAL'].map((type) => (
            <button
              key={type}
              className={`tab-button ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              {type === 'ALL' ? 'All Bulletins' : type}
            </button>
          ))}
        </div>
      </div>

      <div className="notifications-list">
        {displayedNotifs.length === 0 ? (
          <div className="card">
            <p style={{ color: 'var(--text-secondary)' }}>No notifications match the selected category.</p>
          </div>
        ) : (
          displayedNotifs.map((item) => (
            <div key={item.id} className="card notif-card">
              <div className="notif-header-row">
                <div className="notif-title-group">
                  {getTypeBadge(item.type)}
                  <h3 className="notif-title">{item.title}</h3>
                </div>
                <span className="notif-date">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>
              <p className="notif-body">{item.message}</p>
              {item.expiresAt && (
                <div className="notif-footer">
                  <span>Expires: {new Date(item.expiresAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
