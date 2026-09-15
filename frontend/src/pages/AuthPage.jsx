import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AuthPage({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'student' | 'faculty'

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Student registration form state
  const [studentId, setStudentId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Faculty registration form state
  const [facultyId, setFacultyId] = useState('');
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyPassword, setFacultyPassword] = useState('');

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    api.getDepartments()
      .then((data) => setDepartments(data || []))
      .catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.login(loginEmail, loginPassword);
      localStorage.setItem('unicore_token', data.token);
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.registerStudent(studentId, studentEmail, studentPassword);
      localStorage.setItem('unicore_token', data.token);
      setSuccessMsg(`Welcome, ${data.user.name}! Student account activated under ${data.user.department}.`);
      setTimeout(() => {
        onAuthSuccess(data.user);
      }, 1200);
    } catch (err) {
      setError(err.message || 'Student registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.registerFaculty(facultyId, facultyEmail, facultyPassword);
      localStorage.setItem('unicore_token', data.token);
      setSuccessMsg(`Welcome, ${data.user.name}! Faculty account activated under ${data.user.department}.`);
      setTimeout(() => {
        onAuthSuccess(data.user);
      }, 1200);
    } catch (err) {
      setError(err.message || 'Faculty registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Navigation Tabs */}
      <div className="tab-group">
        <button
          className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => { setActiveTab('login'); setError(null); setSuccessMsg(null); }}
        >
          Portal Login
        </button>
        <button
          className={`tab-button ${activeTab === 'student' ? 'active' : ''}`}
          onClick={() => { setActiveTab('student'); setError(null); setSuccessMsg(null); }}
        >
          Student Register
        </button>
        <button
          className={`tab-button ${activeTab === 'faculty' ? 'active' : ''}`}
          onClick={() => { setActiveTab('faculty'); setError(null); setSuccessMsg(null); }}
        >
          Faculty Register
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* LOGIN TAB */}
      {activeTab === 'login' && (
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">College Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. admin@unicore.edu or bca.stu001@unicore.edu"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Account Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to UniCore'}
          </button>
        </form>
      )}

      {/* STUDENT REGISTRATION TAB */}
      {activeTab === 'student' && (
        <form onSubmit={handleStudentRegister}>
          <div className="alert alert-info">
            <strong>Controlled Student Self-Registration:</strong> Enter your Institutional Student ID and official College Email. Role, Department, and Academic Year are verified against university admission records and cannot be tampered with.
          </div>

          <div className="form-group">
            <label className="form-label">Student ID (Institutional Roll Number)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. BCA-STU-001"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Official College Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. bca.stu001@unicore.edu"
              required
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Choose Password (min 6 characters)</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
              minLength={6}
              value={studentPassword}
              onChange={(e) => setStudentPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Verifying & Registering...' : 'Register Student Account'}
          </button>
        </form>
      )}

      {/* FACULTY REGISTRATION TAB */}
      {activeTab === 'faculty' && (
        <form onSubmit={handleFacultyRegister}>
          <div className="alert alert-info">
            <strong>Controlled Faculty Self-Registration:</strong> Enter your Faculty ID and official College Email. Department and role assignment are established automatically by the institutional database.
          </div>

          <div className="form-group">
            <label className="form-label">Faculty ID</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. BCA-FAC-001"
              required
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Official College Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. bca.fac001@unicore.edu"
              required
              value={facultyEmail}
              onChange={(e) => setFacultyEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Choose Password (min 6 characters)</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
              minLength={6}
              value={facultyPassword}
              onChange={(e) => setFacultyPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Verifying & Registering...' : 'Register Faculty Account'}
          </button>
        </form>
      )}

      {/* ACTIVE DEPARTMENTS STRIP */}
      {departments.length > 0 && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
            🏛️ Configured Institutional Departments (5):
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {departments.map((dept) => (
              <span
                key={dept.shortCode}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <strong>{dept.shortCode}</strong>: {dept.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* QUICK PRE-SEEDED TEST DATA HELPER */}
      <div className="seed-roster">
        <h4>⚡ Demo Test Roster (Click to Auto-Fill)</h4>
        <div className="roster-grid">
          <div
            className="roster-pill"
            onClick={() => {
              setActiveTab('login');
              setLoginEmail('admin@unicore.edu');
              setLoginPassword('Admin@UniCore2026');
            }}
          >
            <strong>👑 Admin Account</strong>
            admin@unicore.edu / Admin@UniCore2026
          </div>

          <div
            className="roster-pill"
            onClick={() => {
              setActiveTab('student');
              setStudentId('BCA-STU-001');
              setStudentEmail('bca.stu001@unicore.edu');
              setStudentPassword('Password@123');
            }}
          >
            <strong>🎓 BCA Student (Sem 2)</strong>
            BCA-STU-001 (1st Year)
          </div>

          <div
            className="roster-pill"
            onClick={() => {
              setActiveTab('student');
              setStudentId('BSCS-STU-001');
              setStudentEmail('bscs.stu001@unicore.edu');
              setStudentPassword('Password@123');
            }}
          >
            <strong>🎓 BSCS Student (Sem 2)</strong>
            BSCS-STU-001 (1st Year)
          </div>

          <div
            className="roster-pill"
            onClick={() => {
              setActiveTab('student');
              setStudentId('BCOM-STU-003');
              setStudentEmail('bcom.stu003@unicore.edu');
              setStudentPassword('Password@123');
            }}
          >
            <strong>🎓 B.Com Student (Sem 4)</strong>
            BCOM-STU-003 (2nd Year)
          </div>

          <div
            className="roster-pill"
            onClick={() => {
              setActiveTab('student');
              setStudentId('BBA-STU-004');
              setStudentEmail('bba.stu004@unicore.edu');
              setStudentPassword('Password@123');
            }}
          >
            <strong>🎓 BBA Student (Sem 3)</strong>
            BBA-STU-004 (2nd Year)
          </div>

          <div
            className="roster-pill"
            onClick={() => {
              setActiveTab('student');
              setStudentId('BSM-STU-005');
              setStudentEmail('bsm.stu005@unicore.edu');
              setStudentPassword('Password@123');
            }}
          >
            <strong>🎓 BSM Student (Sem 6)</strong>
            BSM-STU-005 (3rd Year)
          </div>

          <div
            className="roster-pill"
            onClick={() => {
              setActiveTab('faculty');
              setFacultyId('BCA-FAC-001');
              setFacultyEmail('bca.fac001@unicore.edu');
              setFacultyPassword('FacultyPass@123');
            }}
          >
            <strong>👨‍🏫 BCA Faculty</strong>
            BCA-FAC-001 (Dr. K. Sharma)
          </div>

          <div
            className="roster-pill"
            onClick={() => {
              setActiveTab('faculty');
              setFacultyId('BSCS-FAC-001');
              setFacultyEmail('bscs.fac001@unicore.edu');
              setFacultyPassword('FacultyPass@123');
            }}
          >
            <strong>👨‍🏫 BSCS Faculty</strong>
            BSCS-FAC-001 (Dr. Anita Desai)
          </div>

          <div
            className="roster-pill"
            onClick={() => {
              setActiveTab('faculty');
              setFacultyId('BCOM-FAC-001');
              setFacultyEmail('bcom.fac001@unicore.edu');
              setFacultyPassword('FacultyPass@123');
            }}
          >
            <strong>👨‍🏫 B.Com Faculty</strong>
            BCOM-FAC-001 (Dr. P. Venkatraman)
          </div>

          <div
            className="roster-pill"
            onClick={() => {
              setActiveTab('faculty');
              setFacultyId('BBA-FAC-001');
              setFacultyEmail('bba.fac001@unicore.edu');
              setFacultyPassword('FacultyPass@123');
            }}
          >
            <strong>👨‍🏫 BBA Faculty</strong>
            BBA-FAC-001 (Dr. Rajiv Singhania)
          </div>

          <div
            className="roster-pill"
            onClick={() => {
              setActiveTab('faculty');
              setFacultyId('BSM-FAC-001');
              setFacultyEmail('bsm.fac001@unicore.edu');
              setFacultyPassword('FacultyPass@123');
            }}
          >
            <strong>👨‍🏫 BSM Faculty</strong>
            BSM-FAC-001 (Dr. T. S. Narayanan)
          </div>
        </div>
      </div>
    </div>
  );
}
