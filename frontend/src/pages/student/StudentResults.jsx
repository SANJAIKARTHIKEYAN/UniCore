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
          <h1 className="student-page-title">Results &amp; Academic Documents</h1>
          <p className="student-page-subtitle">Historical examination scorecards, semester grade sheets, and certified marksheets.</p>
        </div>

        <div className="filter-dropdown-wrapper">
          <label className="form-label" style={{ marginBottom: '0.2rem' }}>Filter Semester:</label>
          <select
            className="form-input form-select"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            style={{ width: 'auto', display: 'inline-block', background: '#0a1224' }}
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

      {/* Hexagonal Document Badges matching Bottom-Left of Reference Image */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f1f5f9' }}>Uploaded Semester Marksheets &amp; Documents</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Verified digital marksheets signed with institutional cryptographic seal
            </span>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.8rem' }}
            onClick={() => alert('Marksheet upload portal active for authenticated student.')}
          >
            📤 Upload Marksheet
          </button>
        </div>

        {/* 3 Chamfered Hex Badges */}
        <div className="hud-hex-grid" style={{ marginBottom: '0.5rem' }}>
          <div className="hud-hex-card hud-hex-cyan" style={{ cursor: 'pointer' }}>
            <div className="hud-hex-label">Document 1</div>
            <div className="hud-hex-value" style={{ fontSize: '1.15rem' }}>Sem 2</div>
            <div className="hud-hex-subtext" style={{ color: 'var(--cyber-cyan)' }}>Active Scorecard &bull; Verified</div>
          </div>

          <div className="hud-hex-card hud-hex-amber" style={{ cursor: 'pointer' }}>
            <div className="hud-hex-label">Document 2</div>
            <div className="hud-hex-value" style={{ fontSize: '1.15rem' }}>Sem 2</div>
            <div className="hud-hex-subtext" style={{ color: 'var(--cyber-amber)' }}>Provisional Sheet &bull; Pending</div>
          </div>

          <div className="hud-hex-card hud-hex-emerald" style={{ cursor: 'pointer' }}>
            <div className="hud-hex-label">Document 3</div>
            <div className="hud-hex-value" style={{ fontSize: '1.15rem' }}>Sem 1</div>
            <div className="hud-hex-subtext" style={{ color: 'var(--cyber-emerald)' }}>Archived Record &bull; Certified</div>
          </div>
        </div>
      </div>


      {/* Results Tables */}
      {displayedResults.length === 0 ? (
        <div className="card">
          <p style={{ color: 'var(--text-secondary)' }}>No semester result records available at this time.</p>
        </div>
      ) : (
        displayedResults.map((semResult) => (
          <div key={semResult.semester} className="card semester-result-card" style={{ marginBottom: '1.5rem' }}>
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

