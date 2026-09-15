import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import DashboardPreview from './pages/DashboardPreview';
import StudentLayout from './components/student/StudentLayout';
import FacultyLayout from './components/faculty/FacultyLayout';
import { api } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('unicore_token');
    if (token) {
      api.getCurrentUser()
        .then((user) => {
          setCurrentUser(user);
        })
        .catch(() => {
          localStorage.removeItem('unicore_token');
          setCurrentUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('unicore_token');
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading UniCore Portal...</p>
      </div>
    );
  }

  const isStudent = currentUser?.role === 'STUDENT';
  const isFaculty = currentUser?.role === 'FACULTY';
  const isWideLayout = isStudent || isFaculty;

  return (
    <div className={isWideLayout ? 'app-container-wide' : 'app-container'}>
      <Navbar currentUser={currentUser} onLogout={handleLogout} />

      <main>
        {!currentUser ? (
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        ) : isStudent ? (
          <StudentLayout currentUser={currentUser} onLogout={handleLogout} />
        ) : isFaculty ? (
          <FacultyLayout currentUser={currentUser} onLogout={handleLogout} />
        ) : (
          <DashboardPreview currentUser={currentUser} onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
}
