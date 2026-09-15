import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function FacultyRiskOverview({ selectedCourseId, onSelectCourse }) {
  const [courses, setCourses] = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(selectedCourseId || '');
  const [riskCategoryFilter, setRiskCategoryFilter] = useState('ALL');
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadCoursesAndRisk();
  }, []);

  useEffect(() => {
    if (activeCourseId) {
      loadCourseRisk(activeCourseId);
    } else {
      loadFacultyOverview();
    }
  }, [activeCourseId]);

  const loadCoursesAndRisk = async () => {
    try {
      setLoading(true);
      const coursesRes = await api.getFacultyCourses();
      setCourses(coursesRes || []);
      if (selectedCourseId) {
        setActiveCourseId(selectedCourseId);
      } else {
        await loadFacultyOverview();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load faculty courses.' });
    } finally {
      setLoading(false);
    }
  };

  const loadFacultyOverview = async () => {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await api.getFacultyRiskOverview();
      setOverviewData(res);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load risk overview.' });
    } finally {
      setLoading(false);
    }
  };

  const loadCourseRisk = async (courseId) => {
    try {
      setLoading(true);
      setFeedback(null);
      const list = await api.getCourseRisk(courseId);
      const high = list.filter((p) => p.riskCategory === 'High Risk').length;
      const medium = list.filter((p) => p.riskCategory === 'Medium Risk').length;
      const low = list.filter((p) => p.riskCategory === 'Low Risk').length;
      setOverviewData({
        totalAnalyzed: list.length,
        highRiskCount: high,
        mediumRiskCount: medium,
        lowRiskCount: low,
        highRiskPercentage: list.length > 0 ? (high / list.length) * 100 : 0,
        studentPredictions: list,
        modelStatus: 'Online',
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load course risk.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (e) => {
    const val = e.target.value;
    setActiveCourseId(val);
    if (onSelectCourse) onSelectCourse(val ? Number(val) : null);
  };

  const getRiskBadgeClass = (category) => {
    if (category === 'High Risk') return 'badge-risk-high';
    if (category === 'Medium Risk') return 'badge-risk-medium';
    return 'badge-risk-low';
  };

  const filteredPredictions = (overviewData?.studentPredictions || []).filter((p) => {
    if (riskCategoryFilter === 'ALL') return true;
    return p.riskCategory === riskCategoryFilter;
  });

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">🧠 Student Risk Advisor</h1>
          <p className="student-page-subtitle">
            Machine Learning early-warning indicators to identify academic risk and target support interventions.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => (activeCourseId ? loadCourseRisk(activeCourseId) : loadFacultyOverview())}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : '🔄 Refresh Risk Data'}
        </button>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type} alert-dismissible`} role="alert">
          <span>{feedback.message}</span>
          <button type="button" className="alert-close-btn" onClick={() => setFeedback(null)}>
            &times;
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="card filter-card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label htmlFor="course-select" className="form-label" style={{ marginBottom: '0.25rem' }}>
              Filter by Course
            </label>
            <select
              id="course-select"
              className="form-input"
              value={activeCourseId}
              onChange={handleCourseChange}
            >
              <option value="">All Assigned Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} — {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '200px' }}>
            <label htmlFor="risk-select" className="form-label" style={{ marginBottom: '0.25rem' }}>
              Risk Level Filter
            </label>
            <select
              id="risk-select"
              className="form-input"
              value={riskCategoryFilter}
              onChange={(e) => setRiskCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="High Risk">🚨 High Risk Only</option>
              <option value="Medium Risk">⚠️ Medium Risk Only</option>
              <option value="Low Risk">✅ Low Risk Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      {overviewData && (
        <div className="metric-cards-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="card metric-card">
            <span className="metric-label">Total Analyzed</span>
            <strong className="metric-value">{overviewData.totalAnalyzed}</strong>
            <span className="metric-subtext">Students in scope</span>
          </div>
          <div className="card metric-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
            <span className="metric-label">🚨 High Risk</span>
            <strong className="metric-value text-danger">{overviewData.highRiskCount}</strong>
            <span className="metric-subtext">Immediate intervention needed</span>
          </div>
          <div className="card metric-card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
            <span className="metric-label">⚠️ Medium Risk</span>
            <strong className="metric-value text-warning">{overviewData.mediumRiskCount}</strong>
            <span className="metric-subtext">Monitor performance</span>
          </div>
          <div className="card metric-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
            <span className="metric-label">✅ Low Risk</span>
            <strong className="metric-value text-success">{overviewData.lowRiskCount}</strong>
            <span className="metric-subtext">Satisfactory pacing</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Running Random Forest inference models on student metrics...</p>
        </div>
      ) : filteredPredictions.length === 0 ? (
        <div className="empty-state-card card">
          <div className="empty-icon">🎯</div>
          <h3>No Students in this Risk Category</h3>
          <p>No students match the current course and risk filter criteria.</p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-header-strip">
            <h3>Student Risk &amp; Early-Warning Advisory Roster ({filteredPredictions.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="unicore-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Course</th>
                  <th>Risk Category</th>
                  <th>Confidence</th>
                  <th>Attendance</th>
                  <th>Midterm</th>
                  <th>Advisory Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {filteredPredictions.map((pred) => (
                  <tr key={`${pred.studentId}-${pred.courseId || 'all'}`}>
                    <td>
                      <span className="code-badge">{pred.studentRoll || `STD-${pred.studentId}`}</span>
                    </td>
                    <td>
                      <strong>{pred.studentName}</strong>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                        {pred.department}
                      </div>
                    </td>
                    <td>
                      {pred.courseCode ? (
                        <span className="badge badge-secondary">{pred.courseCode}</span>
                      ) : (
                        <span className="text-muted">Aggregate</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${getRiskBadgeClass(pred.riskCategory)}`}>
                        {pred.riskCategory}
                      </span>
                    </td>
                    <td>
                      <strong>{Math.round(pred.confidence * 100)}%</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 600,
                          color:
                            (pred.features?.['Attendance (%)'] || 0) >= 75
                              ? 'var(--color-success)'
                              : 'var(--color-danger)',
                        }}
                      >
                        {pred.features?.['Attendance (%)'] != null
                          ? `${pred.features['Attendance (%)']}%`
                          : 'N/A'}
                      </span>
                    </td>
                    <td>
                      {pred.features?.['Midterm_Score'] != null
                        ? `${pred.features['Midterm_Score']}%`
                        : '—'}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                        {pred.recommendation}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
