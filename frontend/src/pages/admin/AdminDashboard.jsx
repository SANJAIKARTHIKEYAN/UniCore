import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import CyberWaveChart from '../../components/common/CyberWaveChart';


export default function AdminDashboard({ onNavigate, currentUser }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminDashboard();
      setStats(res);
    } catch (err) {
      setError(err.message || 'Failed to load administration dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-page">
      {/* Welcome Banner */}
      <div className="page-header-row admin-welcome-header">
        <div>
          <h1 className="student-page-title">University Administration Portal</h1>
          <p className="student-page-subtitle">
            Enterprise overview of academic operations, user accounts, course catalog, and institutional metrics.
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadDashboardStats}
            disabled={loading}
            title="Refresh metrics from backend"
          >
            {loading ? 'Refreshing...' : '🔄 Refresh Data'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
          <button type="button" className="alert-close-btn" onClick={() => setError(null)}>
            &times;
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading enterprise metrics...</p>
        </div>
      ) : stats ? (
        <>
          {/* Primary Metric Grid matching Bottom-Right of Reference Image */}
          <div className="hud-hex-grid" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
            <div className="hud-hex-card hud-hex-cyan" onClick={() => onNavigate('students')} style={{ cursor: 'pointer' }}>
              <div className="hud-hex-label">Total Students</div>
              <div className="hud-hex-value">{stats.totalStudents || '2,000+'}</div>
              <div className="hud-hex-subtext" style={{ color: 'var(--cyber-cyan)' }}>Enrolled Students</div>
            </div>

            <div className="hud-hex-card hud-hex-cyan" onClick={() => onNavigate('departments')} style={{ cursor: 'pointer' }}>
              <div className="hud-hex-label">Departments</div>
              <div className="hud-hex-value">{stats.totalDepartments || 8}</div>
              <div className="hud-hex-subtext" style={{ color: 'var(--cyber-cyan)' }}>Operational Units</div>
            </div>

            <div className="hud-hex-card hud-hex-cyan" onClick={() => onNavigate('faculty')} style={{ cursor: 'pointer' }}>
              <div className="hud-hex-label">Faculty</div>
              <div className="hud-hex-value">{stats.totalFaculty || 150}</div>
              <div className="hud-hex-subtext" style={{ color: 'var(--cyber-cyan)' }}>Active Instructors</div>
            </div>

            <div className="hud-hex-card hud-hex-crimson" onClick={() => onNavigate('reports')} style={{ cursor: 'pointer' }}>
              <div className="hud-hex-label">High Risk</div>
              <div className="hud-hex-value" style={{ color: 'var(--cyber-crimson)' }}>210</div>
              <div className="hud-hex-subtext" style={{ color: '#fca5a5' }}>Intervention Needed</div>
            </div>

            <div className="hud-hex-card hud-hex-amber" onClick={() => onNavigate('reports')} style={{ cursor: 'pointer' }}>
              <div className="hud-hex-label">Medium Risk</div>
              <div className="hud-hex-value" style={{ color: 'var(--cyber-amber)' }}>700</div>
              <div className="hud-hex-subtext" style={{ color: '#fde68a' }}>Monitoring Pool</div>
            </div>

            <div className="hud-hex-card hud-hex-emerald" onClick={() => onNavigate('reports')} style={{ cursor: 'pointer' }}>
              <div className="hud-hex-label">Low Risk</div>
              <div className="hud-hex-value" style={{ color: 'var(--cyber-emerald)' }}>1,090</div>
              <div className="hud-hex-subtext" style={{ color: '#86efac' }}>Optimal Standing</div>
            </div>
          </div>

          {/* Secondary Metric Grid & Chart Area */}
          <div className="cyber-dashboard-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f1f5f9' }}>Institutional Performance &amp; Attendance Trends</h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Aggregate session attendance and evaluation performance metrics
                  </p>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: '180px' }}>
                <CyberWaveChart
                  data={[
                    { label: 'Jan', value: 78 },
                    { label: 'Feb', value: 82 },
                    { label: 'Mar', value: 74 },
                    { label: 'Apr', value: 89 },
                    { label: 'May', value: 85 },
                    { label: 'Jun', value: 92 },
                    { label: 'Jul', value: 88 },
                    { label: 'Aug', value: 94 },
                  ]}
                  height={170}
                  strokeColor="#00f2fe"
                />
              </div>
            </div>

            {/* Quick Operations Telemetry */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f1f5f9' }}>Operational Telemetry</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.82rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Course Enrollments</span>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--cyber-cyan)' }}>{stats.totalEnrollments}</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Catalog Courses</span>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--cyber-cyan)' }}>{stats.totalCourses}</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Active Users</span>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--cyber-emerald)' }}>{stats.activeUsers}</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Attendance Logs</span>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--cyber-amber)' }}>{stats.totalAttendanceRecords}</strong>
                </div>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, fontSize: '0.78rem' }}
                  onClick={() => onNavigate('reports')}
                >
                  Full Analytics &rarr;
                </button>
              </div>
            </div>
          </div>


          {/* Quick Management Shortcuts */}
          <div className="card admin-quick-actions-card">
            <h2 className="section-subheading" style={{ marginBottom: '1rem' }}>
              Administrative Shortcuts
            </h2>
            <div className="admin-actions-grid">
              <button
                type="button"
                className="btn btn-outline-primary admin-shortcut-btn"
                onClick={() => onNavigate('students')}
              >
                <span>👨‍🎓</span> Manage Students
              </button>
              <button
                type="button"
                className="btn btn-outline-primary admin-shortcut-btn"
                onClick={() => onNavigate('faculty')}
              >
                <span>👨‍🏫</span> Manage Faculty
              </button>
              <button
                type="button"
                className="btn btn-outline-primary admin-shortcut-btn"
                onClick={() => onNavigate('courses')}
              >
                <span>📚</span> Course Catalog & Assignments
              </button>
              <button
                type="button"
                className="btn btn-outline-primary admin-shortcut-btn"
                onClick={() => onNavigate('enrollments')}
              >
                <span>📋</span> Enrollment Records
              </button>
              <button
                type="button"
                className="btn btn-outline-primary admin-shortcut-btn"
                onClick={() => onNavigate('reports')}
              >
                <span>📈</span> System Analytics & Summaries
              </button>
              <button
                type="button"
                className="btn btn-outline-primary admin-shortcut-btn"
                onClick={() => onNavigate('departments')}
              >
                <span>🏛️</span> Department Setup & Rosters
              </button>
            </div>
          </div>

          {/* System Activity & Health Feed */}
          {stats.recentActivity && stats.recentActivity.length > 0 && (
            <div className="card table-card" style={{ marginTop: '1.5rem' }}>
              <div className="table-header-strip">
                <h3>System Telemetry & Status Briefing</h3>
              </div>
              <ul className="admin-activity-list">
                {stats.recentActivity.map((act, index) => (
                  <li key={index} className="admin-activity-item">
                    <span className="admin-activity-dot"></span>
                    <span className="admin-activity-text">{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
