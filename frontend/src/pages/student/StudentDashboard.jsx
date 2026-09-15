import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function StudentDashboard({ onNavigate, currentUser }) {
  const [data, setData] = useState(null);
  const [mlRisk, setMlRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, riskRes] = await Promise.all([
        api.getStudentDashboard(),
        api.getMyRisk().catch((err) => {
          console.warn('ML risk prediction fetch failed:', err);
          return null;
        }),
      ]);
      setData(res);
      setMlRisk(riskRes);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading student dashboard...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p><strong>Error loading dashboard:</strong> {error}</p>
        <button className="btn btn-secondary" onClick={loadDashboard} style={{ marginTop: '0.75rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  const attendancePercent = data?.overallAttendancePercent ?? 0;
  const attendanceStatusClass =
    attendancePercent >= 75 ? 'status-good' : attendancePercent >= 65 ? 'status-warning' : 'status-danger';

  return (
    <div className="student-page">
      {/* Welcome Banner */}
      <div className="student-welcome-banner">
        <div>
          <h1 className="student-page-title">Welcome back, {data?.studentName || currentUser?.name}!</h1>
          <p className="student-page-subtitle">
            Roll No: <strong>{data?.studentId}</strong> &bull; Department: <strong>{data?.department}</strong> &bull; Semester {data?.semester} ({data?.derivedYear})
          </p>
        </div>
        <div className="academic-badge">
          <span>Active Session</span>
          <strong>2024-2025</strong>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="student-stats-grid">
        <div className="stat-card" onClick={() => onNavigate('attendance')}>
          <div className="stat-header">
            <span className="stat-icon">📅</span>
            <span className={`stat-badge ${attendanceStatusClass}`}>
              {attendancePercent >= 75 ? 'Eligible' : 'Warning'}
            </span>
          </div>
          <div className="stat-value">{data?.overallAttendancePercent !== null ? `${data.overallAttendancePercent}%` : 'N/A'}</div>
          <div className="stat-label">Overall Attendance</div>
          <div className="stat-progress-bar">
            <div
              className={`stat-progress-fill ${attendanceStatusClass}`}
              style={{ width: `${Math.min(attendancePercent, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('academic')}>
          <div className="stat-header">
            <span className="stat-icon">📚</span>
            <span className="stat-badge status-info">Enrolled</span>
          </div>
          <div className="stat-value">{data?.enrolledCoursesCount || 0}</div>
          <div className="stat-label">Active Courses</div>
          <span className="stat-subtext">Semester {data?.semester}</span>
        </div>

        <div className="stat-card" onClick={() => onNavigate('fees')}>
          <div className="stat-header">
            <span className="stat-icon">💳</span>
            <span className={`stat-badge ${data?.pendingFeesCount > 0 ? 'status-warning' : 'status-good'}`}>
              {data?.pendingFeesCount > 0 ? 'Action Needed' : 'Settled'}
            </span>
          </div>
          <div className="stat-value">{data?.pendingFeesCount || 0}</div>
          <div className="stat-label">Pending Fee Items</div>
          <span className="stat-subtext">{data?.pendingFeesCount > 0 ? 'Due soon' : 'All cleared'}</span>
        </div>

        <div className="stat-card" onClick={() => onNavigate('notifications')}>
          <div className="stat-header">
            <span className="stat-icon">🔔</span>
            <span className="stat-badge status-info">Announcements</span>
          </div>
          <div className="stat-value">{data?.unreadNotificationsCount || 0}</div>
          <div className="stat-label">Active Notices</div>
          <span className="stat-subtext">Department & General</span>
        </div>
      </div>

      {/* Real ML Risk Early Warning Card */}
      <div className="card student-risk-banner">
        <div className="risk-banner-content">
          <div className="risk-banner-icon">🧠</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
              <h3 style={{ margin: 0 }}>Academic Early Warning Advisory</h3>
              {mlRisk ? (
                <span
                  className={`badge ${
                    mlRisk.riskCategory === 'Low Risk'
                      ? 'badge-risk-low'
                      : mlRisk.riskCategory === 'Medium Risk'
                      ? 'badge-risk-medium'
                      : 'badge-risk-high'
                  }`}
                >
                  {mlRisk.riskCategory} ({Math.round(mlRisk.confidence * 100)}% Confidence)
                </span>
              ) : (
                <span className="badge badge-secondary">Evaluating Standing...</span>
              )}
            </div>
            <p className="risk-notice" style={{ marginBottom: '0.5rem' }}>
              {mlRisk?.recommendation ||
                'Academic advisory prediction generated by UniCore ML Early Warning System to provide timely academic support; not a final evaluation.'}
            </p>
            {mlRisk?.features && (
              <div className="risk-factors-strip">
                <span className="risk-factor-item">
                  Attendance: <strong>{mlRisk.features['Attendance (%)']}%</strong>
                </span>
                <span className="risk-factor-item">
                  Midterm: <strong>{mlRisk.features['Midterm_Score']}%</strong>
                </span>
                <span className="risk-factor-item">
                  Assignments: <strong>{mlRisk.features['Assignments_Avg']}%</strong>
                </span>
                <span className="risk-factor-item">
                  Quizzes: <strong>{mlRisk.features['Quizzes_Avg']}%</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="dashboard-sections-grid">
        <div className="card dashboard-action-box">
          <h4>Academic Records</h4>
          <p>Review enrolled courses, assessment grades, and archived semester examinations.</p>
          <div className="btn-group-row">
            <button className="btn btn-primary" onClick={() => onNavigate('academic')}>
              Course Performance
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('results')}>
              Semester Results
            </button>
          </div>
        </div>

        <div className="card dashboard-action-box">
          <h4>Administrative Services</h4>
          <p>Manage semester fee payments, download digital ID and examination hall tickets.</p>
          <div className="btn-group-row">
            <button className="btn btn-primary" onClick={() => onNavigate('fees')}>
              View Fee Details
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('documents')}>
              Available Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
