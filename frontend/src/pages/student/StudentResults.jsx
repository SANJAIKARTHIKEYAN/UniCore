import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudentResults();
      setResults(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load semester results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="student-loading">Loading semester results...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p><strong>Error loading results:</strong> {error}</p>
        <button className="btn btn-secondary" onClick={loadResults} style={{ marginTop: '0.75rem', width: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  const displayedResults =
    selectedSemester === 'ALL'
      ? results
      : results.filter((r) => String(r.semester) === selectedSemester);

  return (
    <div className="student-page">
      <div className="page-header-row">
        <div>
          <h1 className="student-page-title">Semester-wise Results</h1>
          <p className="student-page-subtitle">Historical examination scorecards and active semester result records.</p>
        </div>

        <div className="filter-dropdown-wrapper">
          <label className="form-label" style={{ marginBottom: '0.2rem' }}>Filter Semester:</label>
          <select
            className="form-input form-select"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            style={{ width: 'auto', display: 'inline-block' }}
          >
            <option value="ALL">All Semesters ({results.length})</option>
            {results.map((r) => (
              <option key={r.semester} value={String(r.semester)}>
                Semester {r.semester} {r.isCurrentSemester ? '(Current Active)' : '(Archived)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {displayedResults.length === 0 ? (
        <div className="card">
          <p style={{ color: 'var(--text-secondary)' }}>No semester result records available at this time.</p>
        </div>
      ) : (
        displayedResults.map((semResult) => (
          <div key={semResult.semester} className="card semester-result-card">
            <div className="semester-result-header">
              <div>
                <div className="sem-header-tags">
                  <span className="sem-number-badge">Semester {semResult.semester}</span>
                  {semResult.isCurrentSemester ? (
                    <span className="badge badge-STUDENT">Active Current Semester</span>
                  ) : (
                    <span className="badge badge-secondary">Archived Historical Record</span>
                  )}
                </div>
                <span className="sem-year-text">Academic Session: {semResult.academicYear} &bull; Total Credits: {semResult.totalCredits}</span>
              </div>

              <div className="sgpa-badge-box">
                <span className="sgpa-label">Semester SGPA</span>
                <span className="sgpa-value highlight">
                  {semResult.sgpa !== null ? semResult.sgpa.toFixed(2) : 'Pending Evaluation'}
                </span>
              </div>
            </div>

            <div className="table-responsive" style={{ marginTop: '1rem' }}>
              <table className="unicore-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th>Credits</th>
                    <th>Grade</th>
                    <th>Grade Points</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {semResult.courses.map((course) => (
                    <tr key={course.courseCode}>
                      <td><strong className="code-badge">{course.courseCode}</strong></td>
                      <td>{course.courseName}</td>
                      <td>{course.credits}</td>
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
                          <span className="status-badge status-good">Pass</span>
                        ) : (
                          <span className="status-badge status-warning">In Evaluation</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
