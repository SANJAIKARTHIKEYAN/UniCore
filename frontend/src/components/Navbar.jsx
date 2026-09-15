import React from 'react';

export default function Navbar({ currentUser, onLogout }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-badge">UNICORE</div>
        <div>
          <div className="brand-title">UNICORE</div>
          <div className="brand-subtitle">University ERP System</div>
        </div>
      </div>

      {currentUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="cyber-menu-icon" title="Notifications">🔔</span>
          <span className={`badge badge-${currentUser.role}`}>{currentUser.role}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{currentUser.name}</span>
          <button
            className="btn btn-secondary"
            style={{ width: 'auto', padding: '0.4rem 0.9rem', fontSize: '0.8rem', borderColor: 'rgba(0, 240, 255, 0.3)' }}
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
