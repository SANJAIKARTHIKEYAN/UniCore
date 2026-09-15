import React from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'students', label: 'Students', icon: '👨‍🎓' },
  { id: 'faculty', label: 'Faculty Members', icon: '👨‍🏫' },
  { id: 'courses', label: 'Course Catalog', icon: '📚' },
  { id: 'enrollments', label: 'Enrollments', icon: '📋' },
  { id: 'reports', label: 'Analytics & Reports', icon: '📈' },
  { id: 'departments', label: 'Departments & Setup', icon: '🏛️' },
];

export default function AdminSidebar({ activeTab, onTabChange, currentUser }) {
  return (
    <aside className="faculty-sidebar admin-sidebar">
      <div className="cyber-sidebar-brand">
        <span className="cyber-menu-icon">☰</span>
        <span className="cyber-brand-text">UNICORE</span>
      </div>

      <div className="faculty-user-card admin-user-card">
        <div className="faculty-avatar admin-avatar">
          {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
        </div>
        <div className="faculty-user-info">
          <h3 className="faculty-user-name">{currentUser?.name || 'Administrator'}</h3>
          <span className="faculty-user-id">{currentUser?.email || 'admin@unicore.edu'}</span>
          <div className="student-meta-tags">
            <span className="badge badge-ADMIN">SYSTEM ADMIN</span>
          </div>
        </div>
      </div>

      <nav className="faculty-nav">
        <div className="nav-section-label">ADMINISTRATION</div>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`faculty-nav-item ${isActive ? 'active admin-nav-active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-version">UniCore Admin v1.0</span>
        <span className="sidebar-status-dot online" title="Admin Engine Online"></span>
      </div>
    </aside>
  );
}
