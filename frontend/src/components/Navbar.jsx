import React from 'react';

export default function Navbar({ currentUser, onLogout }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-badge">UNICORE</div>
        <div>
          <div className="brand-title">UniCore ERP Portal</div>
          <div className="brand-subtitle">Step 2: Authentication &amp; RBAC Foundation</div>
        </div>
      </div>

      {currentUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className={`badge badge-${currentUser.role}`}>{currentUser.role}</span>
          <span style={{ fontSize: '0.875rem' }}>{currentUser.name}</span>
          <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
