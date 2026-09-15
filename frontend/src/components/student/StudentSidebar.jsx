import React from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'profile', label: 'My Profile', icon: '👤' },
  { id: 'attendance', label: 'Attendance', icon: '📅' },
  { id: 'academic', label: 'Academic Performance', icon: '📚' },
  { id: 'results', label: 'Semester Results', icon: '📝' },
  { id: 'advisor', label: 'AI Advisor', icon: '🤖' },
  { id: 'fees', label: 'Fees & Dues', icon: '💳' },
  { id: 'documents', label: 'Documents', icon: '📁' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
];

export default function StudentSidebar({ activeTab, onTabChange, currentUser }) {
  const studentProfile = currentUser?.studentProfile;

  return (
    <aside className="student-sidebar">
      <div className="cyber-sidebar-brand">
        <span className="cyber-menu-icon">☰</span>
        <span className="cyber-brand-text">UNICORE</span>
      </div>

      <div className="student-user-card">
        <div className="student-avatar">
          {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
        </div>
        <div className="student-user-info">
          <h3 className="student-user-name">{currentUser?.name}</h3>
          <span className="student-user-id">{studentProfile?.studentId || 'Student'}</span>
          <div className="student-meta-tags">
            <span className="badge badge-STUDENT">{currentUser?.department}</span>
            {studentProfile?.currentSemester && (
              <span className="badge badge-sem">Sem {studentProfile.currentSemester}</span>
            )}
          </div>
        </div>
      </div>

      <nav className="student-nav">
        <div className="nav-section-label">STUDENT PORTAL</div>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`student-nav-item ${isActive ? 'active' : ''}`}
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
