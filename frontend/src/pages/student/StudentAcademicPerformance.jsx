import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function StudentAcademicPerformance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPerformance();
  }, []);

  const loadPerformance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudentAcademicPerformance();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load academic performance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading academic performance...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p><strong>Error loading academic performance:</strong> {error}</p>
        <button className="btn btn-secondary" onClick={loadPerformance} style={{ marginTop: '0.75rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  const courses = data?.courses || [];
  const totalCredits = courses.reduce((acc, c) => acc + (c.credits || 0), 0);

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Academic Performance</h1>
          <p className="student-page-subtitle">Current semester registered courses, credits, and evaluation progress.</p>
        </div>
        <div className="academic-badge">
          <span>Active Enrollment</span>
          <strong>Semester {data?.semester} ({data?.academicYear})</strong>
        </div>
      </div>

      <div className="card performance-summary-card">
        <div className="perf-summary-item">
          <span className="summary-label">Current Semester</span>
          <span className="summary-value">Semester {data?.semester}</span>
        </div>
        <div className="perf-summary-item">
          <span className="summary-label">Enrolled Courses</span>
          <span className="summary-value">{courses.length}</span>
        </div>
        <div className="perf-summary-item">
          <span className="summary-label">Total Credit Hours</span>
          <span className="summary-value">{totalCredits} Credits</span>
        </div>
        <div className="perf-summary-item">
          <span className="summary-label">Evaluation Phase</span>
          <span className="summary-value highlight">In Progress</span>
        </div>
      </div>

      {/* Courses Table */}
      <div className="card table-card">
        <div className="table-header-title">
          <h3>Registered Courses & Evaluation Status</h3>
        </div>
        <div className="table-responsive">
          <table className="unicore-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Credits</th>
                <th>Awarded Grade</th>
                <th>Grade Points</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No registered courses found for current semester.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.courseCode}>
                    <td><strong className="code-badge">{course.courseCode}</strong></td>
                    <td>{course.courseName}</td>
                    <td>{course.credits} Credits</td>
                    <td>
                      {course.grade ? (
                        <span className="grade-badge">{course.grade}</span>
                      ) : (
                        <span className="badge badge-pending">Not Yet Graded</span>
                      )}
                    </td>
                    <td>{course.gradePoints !== null ? course.gradePoints.toFixed(1) : '—'}</td>
                    <td>
                      {course.grade ? (
                        <span className="status-badge status-good">Finalized</span>
                      ) : (
                        <span className="status-badge status-warning">In Progress</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card info-box">
        <h4>Grading Policy & Evaluation Notice</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          Actual grades and grade points are published only upon completion of internal continuous assessment and end-semester examinations by authorized faculty evaluators. Uncomputed or in-progress courses display as "Not Yet Graded" in compliance with university policy.
        </p>
      </div>
    </div>
  );
}
