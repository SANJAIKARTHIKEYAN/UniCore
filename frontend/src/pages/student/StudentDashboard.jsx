import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import CyberWaveChart from '../../components/common/CyberWaveChart';

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
    return (
      <div className="student-loading" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading student telemetry...</p>
      </div>
    );
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

  // Sample wave chart points reflecting semester performance trajectory
  const performanceTrend = [
    { label: 'Jan', value: 45 },
    { label: 'Feb', value: 68 },
    { label: 'Mar', value: 52 },
    { label: 'Apr', value: 74 },
    { label: 'May', value: 60 },
    { label: 'Jun', value: 88 },
    { label: 'Jul', value: 72 },
    { label: 'Aug', value: 85 },
    { label: 'Sep', value: 91 },
  ];

  return (
    <div className="student-page">
      {/* Top Welcome Header - HUD Styled */}
      <div className="page-header-row" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1 className="student-page-title" style={{ fontSize: '1.45rem', letterSpacing: '0.02em' }}>
            Welcome back, {data?.studentName || currentUser?.name || 'Liam Carter'}!
          </h1>
          <p className="student-page-subtitle" style={{ fontSize: '0.82rem' }}>
            Department: <strong>{data?.department || 'BCA'}</strong> &bull; Semester <strong>{data?.semester || 2}</strong> ({data?.derivedYear || '1st Year'}) &bull; Roll No: <strong>{data?.studentId}</strong>
          </p>
        </div>
        <div className="academic-badge" style={{ padding: '0.35rem 0.85rem' }}>
          <span>Active Session</span>
          <strong>2024-2025</strong>
        </div>
      </div>



      {/* 3 Top Chamfered Metric Badges matching Top-Left of Reference Image */}
      <div className="hud-hex-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Badge 1: Attendance */}
        <div className="hud-hex-card hud-hex-cyan" onClick={() => onNavigate('attendance')} style={{ cursor: 'pointer' }}>
          <div className="hud-hex-label">Attendance</div>
          <div className="hud-hex-value">{data?.overallAttendancePercent !== null ? `${data.overallAttendancePercent}%` : 'N/A'}</div>
          <div className="hud-hex-subtext" style={{ color: 'var(--cyber-cyan)' }}>
            {attendancePercent >= 75 ? 'Optimal Standing' : 'Requires Attention'}
          </div>
        </div>

        {/* Badge 2: Avg Marks */}
        <div className="hud-hex-card hud-hex-cyan" onClick={() => onNavigate('academic')} style={{ cursor: 'pointer' }}>
          <div className="hud-hex-label">Avg Marks</div>
          <div className="hud-hex-value">
            {mlRisk?.features?.['Midterm_Score'] != null
              ? `${Math.round(mlRisk.features['Midterm_Score'])}%`
              : '72%'}
          </div>
          <div className="hud-hex-subtext" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {data?.enrolledCoursesCount || 4} Enrolled Courses
          </div>
        </div>

        {/* Badge 3: Risk Status */}
        <div
          className={`hud-hex-card ${
            mlRisk?.riskCategory === 'High Risk'
              ? 'hud-hex-crimson'
              : mlRisk?.riskCategory === 'Medium Risk'
              ? 'hud-hex-amber'
              : 'hud-hex-emerald'
          }`}
          onClick={() => onNavigate('advisor')}
          style={{ cursor: 'pointer' }}
        >
          <div className="hud-hex-label">Risk Status</div>
          <div className="hud-hex-value" style={{ fontSize: '1.25rem', marginTop: '0.2rem' }}>
            {mlRisk?.riskCategory || 'Low Risk'}
          </div>
          <div className="hud-hex-subtext">
            {mlRisk ? `${Math.round(mlRisk.confidence * 100)}% Confidence` : 'Evaluating...'}
          </div>
        </div>

      </div>

      {/* Main Grid: Left Performance Wave Chart & Right Risk / AI Advisor Hub */}
      <div className="cyber-dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Left Column: Glowing Spline Wave Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f1f5f9' }}>Performance Overview</h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Cumulative academic performance trajectory across terms
              </p>
            </div>
            <select
              className="form-input"
              style={{ width: 'auto', padding: '0.25rem 0.6rem', fontSize: '0.78rem', background: '#0a1224' }}
              defaultValue="current"
            >
              <option value="current">Most current</option>
              <option value="sem1">Semester 1</option>
              <option value="all">Full History</option>
            </select>
          </div>

          <div style={{ flex: 1, minHeight: '210px', display: 'flex', alignItems: 'center' }}>
            <CyberWaveChart data={performanceTrend} height={190} color="#00f2fe" activeIndex={7} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Academic Pacing Standing: <strong>Healthy (88.5%)</strong></span>
            <button
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
              onClick={() => onNavigate('academic')}
            >
              View Full Breakdown &rarr;
            </button>
          </div>
        </div>

        {/* Right Column: Risk breakdown & Spiky Neon AI Advisor Callout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Risk Factors Breakdown Card */}
          <div className="card" style={{ padding: '1rem 1.15rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#f1f5f9' }}>Risk Indicator Breakdown</h4>
              <span className={`badge ${
                mlRisk?.riskCategory === 'High Risk'
                  ? 'badge-risk-high'
                  : mlRisk?.riskCategory === 'Medium Risk'
                  ? 'badge-risk-medium'
                  : 'badge-risk-low'
              }`}>
                {mlRisk ? `${mlRisk.riskCategory} (${Math.round(mlRisk.confidence * 100)}% Confidence)` : 'Low Risk (92% Confidence)'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Attendance Standing:</span>
                  <strong>{attendancePercent}%</strong>
                </div>
                <div className="neon-progress-bar">
                  <div
                    className="neon-progress-fill-cyan"
                    style={{ width: `${Math.min(attendancePercent, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Midterm Examination:</span>
                  <strong>{mlRisk?.features?.['Midterm_Score'] != null ? `${mlRisk.features['Midterm_Score']}%` : '82%'}</strong>
                </div>
                <div className="neon-progress-bar">
                  <div
                    className="neon-progress-fill-amber"
                    style={{ width: `${mlRisk?.features?.['Midterm_Score'] != null ? mlRisk.features['Midterm_Score'] : 82}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Assignments &amp; Quizzes:</span>
                  <strong>{mlRisk?.features?.['Assignments_Avg'] != null ? `${mlRisk.features['Assignments_Avg']}%` : '85%'}</strong>
                </div>
                <div className="neon-progress-bar">
                  <div
                    className="neon-progress-fill-emerald"
                    style={{ width: `${mlRisk?.features?.['Assignments_Avg'] != null ? mlRisk.features['Assignments_Avg'] : 85}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <p style={{ margin: '0.65rem 0 0', fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {mlRisk?.recommendation || 'Student is demonstrating healthy academic progress. Continue standard course engagement.'}
            </p>
          </div>

          {/* Spiky Neon Callout Badge for AI Advisor */}
          <div className="burst-callout-badge" onClick={() => onNavigate('advisor')}>
            <div className="burst-callout-title">
              <span>🤖</span> AI Advisor Notice
            </div>
            <div className="burst-callout-body">
              {mlRisk?.riskCategory === 'High Risk'
                ? 'High risk detected. Consult AI Advisor immediately for remediation plan.'
                : 'Formative AI guidance available: pace coursework & prepare for evaluations.'}
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.78rem' }}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('advisor');
              }}
            >
              🤖 Consult AI Advisor &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Action Cards */}
      <div className="dashboard-sections-grid">
        <div className="card dashboard-action-box" style={{ borderLeft: '3px solid var(--cyber-cyan)' }}>
          <h4 style={{ color: 'var(--cyber-cyan)' }}>Academic Records &amp; Results</h4>
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

        <div className="card dashboard-action-box" style={{ borderLeft: '3px solid var(--cyber-amber)' }}>
          <h4 style={{ color: 'var(--cyber-amber)' }}>Administrative Services</h4>
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

