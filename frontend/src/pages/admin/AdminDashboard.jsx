import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

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
          {/* Primary Metric Grid */}
          <div className="metric-cards-grid admin-metrics-grid">
            <div className="card metric-card admin-card-students" onClick={() => onNavigate('students')} style={{ cursor: 'pointer' }}>
              <div className="metric-header-row">
                <span className="metric-label">Enrolled Students</span>
                <span className="metric-icon">👨‍🎓</span>
              </div>
              <strong className="metric-value">{stats.totalStudents}</strong>
              <span className="metric-subtext">Active student records</span>
            </div>

            <div className="card metric-card admin-card-faculty" onClick={() => onNavigate('faculty')} style={{ cursor: 'pointer' }}>
              <div className="metric-header-row">
                <span className="metric-label">Faculty Members</span>
                <span className="metric-icon">👨‍🏫</span>
              </div>
              <strong className="metric-value">{stats.totalFaculty}</strong>
              <span className="metric-subtext">Teaching instructors</span>
            </div>

            <div className="card metric-card admin-card-courses" onClick={() => onNavigate('courses')} style={{ cursor: 'pointer' }}>
              <div className="metric-header-row">
                <span className="metric-label">Catalog Courses</span>
                <span className="metric-icon">📚</span>
              </div>
              <strong className="metric-value">{stats.totalCourses}</strong>
              <span className="metric-subtext">Courses across 5 departments</span>
            </div>

            <div className="card metric-card admin-card-enrollments" onClick={() => onNavigate('enrollments')} style={{ cursor: 'pointer' }}>
              <div className="metric-header-row">
                <span className="metric-label">Course Enrollments</span>
                <span className="metric-icon">📋</span>
              </div>
              <strong className="metric-value">{stats.totalEnrollments}</strong>
              <span className="metric-subtext">Registered seats</span>
            </div>
          </div>

          {/* Secondary Metric Grid */}
          <div className="metric-cards-grid admin-secondary-metrics">
            <div className="card metric-card">
              <span className="metric-label">Active Users</span>
              <strong className="metric-value text-success">{stats.activeUsers}</strong>
              <span className="metric-subtext">Verified active accounts</span>
            </div>

            <div className="card metric-card">
              <span className="metric-label">Departments</span>
              <strong className="metric-value">{stats.totalDepartments}</strong>
              <span className="metric-subtext">Operational departments</span>
            </div>

            <div className="card metric-card">
              <span className="metric-label">Evaluations & Exams</span>
              <strong className="metric-value">{stats.totalAssessments}</strong>
              <span className="metric-subtext">Configured assessments</span>
            </div>

            <div className="card metric-card">
              <span className="metric-label">Attendance Records</span>
              <strong className="metric-value">{stats.totalAttendanceRecords}</strong>
              <span className="metric-subtext">Daily marked sessions</span>
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
