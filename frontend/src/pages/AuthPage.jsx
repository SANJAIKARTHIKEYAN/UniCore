import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AuthPage({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'student' | 'faculty'
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'faculty' | 'admin'

  // Login form state
  const [loginEmail, setLoginEmail] = useState('bca.stu001@unicore.edu');
  const [loginPassword, setLoginPassword] = useState('Student@UniCore2026');
  const [showPassword, setShowPassword] = useState(false);

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

  // Sync role tabs with email presets
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'student') {
      setLoginEmail('bca.stu001@unicore.edu');
      setLoginPassword('Student@UniCore2026');
    } else if (role === 'faculty') {
      setLoginEmail('bca.fac001@unicore.edu');
      setLoginPassword('Faculty@UniCore2026');
    } else if (role === 'admin') {
      setLoginEmail('admin@unicore.edu');
      setLoginPassword('Admin@UniCore2026');
    }
  };

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
    <div
      className="card"
      style={{
        maxWidth: '520px',
        margin: '2.5rem auto',
        padding: '2.5rem 2.25rem',
        borderRadius: '24px',
        border: '1px solid rgba(0, 240, 255, 0.35)',
        background: 'rgba(9, 18, 36, 0.88)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), 0 0 30px rgba(0, 240, 255, 0.12), inset 0 0 25px rgba(0, 240, 255, 0.04)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Cyan Waves */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '100%',
          opacity: 0.18,
          pointerEvents: 'none',
          zIndex: 0,
        }}
        viewBox="0 0 500 500"
        preserveAspectRatio="none"
      >
        <path
          d="M -50 120 C 120 40, 320 220, 550 80 L 550 500 L -50 500 Z"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="1.5"
        />
        <path
          d="M -50 200 C 150 100, 350 320, 550 180"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.2"
        />
        <path
          d="M -50 280 C 180 180, 320 380, 550 260"
          fill="none"
          stroke="#818cf8"
          strokeWidth="1"
        />
      </svg>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '2.2rem',
              fontWeight: 900,
              letterSpacing: '3px',
              color: '#ffffff',
              margin: '0 0 0.35rem 0',
              textShadow: '0 0 15px rgba(0, 240, 255, 0.75), 0 0 30px rgba(0, 240, 255, 0.35)',
            }}
          >
            UNICORE
          </h1>
          <p
            style={{
              color: 'var(--neon-blue)',
              fontSize: '0.9rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              margin: 0,
              fontWeight: 600,
            }}
          >
            University ERP System
          </p>
        </div>

        {/* Portal Mode Switcher (Login vs Register) */}
        {activeTab !== 'login' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => { setActiveTab('login'); setError(null); setSuccessMsg(null); }}
              style={{ width: 'auto', padding: '0.35rem 1rem' }}
            >
              &larr; Back to Portal Login
            </button>
          </div>
        )}

        {/* Feedback Alerts */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
            {successMsg}
          </div>
        )}

        {/* LOGIN VIEW */}
        {activeTab === 'login' && (
          <div>
            {/* Role Switcher Pill Segmented Control */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1.75rem',
              }}
            >
              <div className="cyber-segmented-tabs">
                <button
                  type="button"
                  className={`cyber-tab-pill ${selectedRole === 'student' ? 'active' : ''}`}
                  onClick={() => handleRoleSelect('student')}
                >
                  Student
                </button>
                <button
                  type="button"
                  className={`cyber-tab-pill ${selectedRole === 'faculty' ? 'active' : ''}`}
                  onClick={() => handleRoleSelect('faculty')}
                >
                  Faculty
                </button>
                <button
                  type="button"
                  className={`cyber-tab-pill ${selectedRole === 'admin' ? 'active' : ''}`}
                  onClick={() => handleRoleSelect('admin')}
                >
                  Admin
                </button>
              </div>
            </div>

            <form onSubmit={handleLogin}>
              {/* User ID / Email with icon */}
              <div className="form-group">
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      color: 'var(--text-secondary)',
                      fontSize: '1rem',
                      pointerEvents: 'none',
                    }}
                  >
                    👤
                  </span>
                  <input
                    type="email"
                    className="form-input"
                    style={{
                      paddingLeft: '2.75rem',
                      borderRadius: '10px',
                      background: 'rgba(5, 12, 26, 0.75)',
                      border: '1px solid rgba(0, 240, 255, 0.28)',
                    }}
                    placeholder="User ID / Email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password with lock and eye toggle */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      color: 'var(--text-secondary)',
                      fontSize: '1rem',
                      pointerEvents: 'none',
                    }}
                  >
                    🔒
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{
                      paddingLeft: '2.75rem',
                      paddingRight: '2.75rem',
                      borderRadius: '10px',
                      background: 'rgba(5, 12, 26, 0.75)',
                      border: '1px solid rgba(0, 240, 255, 0.28)',
                    }}
                    placeholder="Password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.85rem',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: 0,
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Radiant Login Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  padding: '0.85rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                  boxShadow: '0 4px 20px rgba(2, 132, 199, 0.45)',
                  marginBottom: '1.25rem',
                }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>

              {/* Bottom Navigation Links */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem',
                  paddingTop: '0.5rem',
                }}
              >
                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--neon-blue)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    padding: 0,
                  }}
                  onClick={() => alert('For password resets, please contact your institutional administrator at admin@unicore.edu.')}
                >
                  Forgot Password?
                </button>

                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--neon-cyan)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    padding: 0,
                  }}
                  onClick={() => setActiveTab('student')}
                >
                  Create Account &rarr;
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STUDENT REGISTRATION TAB */}
        {activeTab === 'student' && (
          <form onSubmit={handleStudentRegister}>
            <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
              <strong>Controlled Student Self-Registration:</strong> Enter your Institutional Student ID and official College Email verified by admission records.
            </div>

            <div className="form-group">
              <label className="form-label">Student ID (Roll Number)</label>
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginBottom: '1rem' }}
            >
              {loading ? 'Verifying...' : 'Register Student Account'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
                onClick={() => setActiveTab('faculty')}
              >
                Need faculty account? Switch to Faculty Registration &rarr;
              </button>
            </div>
          </form>
        )}

        {/* FACULTY REGISTRATION TAB */}
        {activeTab === 'faculty' && (
          <form onSubmit={handleFacultyRegister}>
            <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
              <strong>Controlled Faculty Self-Registration:</strong> Enter your Faculty ID and official College Email verified by department records.
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginBottom: '1rem' }}
            >
              {loading ? 'Verifying...' : 'Register Faculty Account'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
                onClick={() => setActiveTab('student')}
              >
                Registering as student? Switch to Student Registration &rarr;
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
