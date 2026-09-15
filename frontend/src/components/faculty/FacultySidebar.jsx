import React from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'courses', label: 'My Courses', icon: '📚' },
  { id: 'roster', label: 'Student Roster', icon: '👥' },
  { id: 'attendance', label: 'Attendance', icon: '📝' },
  { id: 'assessments', label: 'Assessments', icon: '📋' },
  { id: 'risk', label: 'Risk Advisor (ML)', icon: '🧠' },
  { id: 'profile', label: 'Faculty Profile', icon: '👤' },
];

export default function FacultySidebar({ activeTab, onTabChange, currentUser }) {
  const facultyProfile = currentUser?.facultyProfile;

  return (
    <aside className="faculty-sidebar">
      <div className="faculty-user-card">
        <div className="faculty-avatar">
          {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'F'}
        </div>
        <div className="faculty-user-info">
          <h3 className="faculty-user-name">{currentUser?.name}</h3>
          <span className="faculty-user-id">{facultyProfile?.facultyId || 'Faculty'}</span>
          <div className="student-meta-tags">
            <span className="badge badge-FACULTY">{currentUser?.department}</span>
          </div>
        </div>
      </div>

      <nav className="faculty-nav">
        <div className="nav-section-label">FACULTY PORTAL</div>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`faculty-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-version">UniCore ERP v1.0</span>
        <span className="sidebar-status-dot online" title="Portal Connected"></span>
      </div>
    </aside>
  );
}
