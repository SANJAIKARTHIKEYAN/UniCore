import React, { useState } from 'react';
import FacultySidebar from './FacultySidebar';
import FacultyDashboard from '../../pages/faculty/FacultyDashboard';
import FacultyCourses from '../../pages/faculty/FacultyCourses';
import FacultyCourseRoster from '../../pages/faculty/FacultyCourseRoster';
import FacultyAttendance from '../../pages/faculty/FacultyAttendance';
import FacultyProfile from '../../pages/faculty/FacultyProfile';

export default function FacultyLayout({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId);
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <FacultyDashboard
            onNavigate={setActiveTab}
            onSelectCourse={handleSelectCourse}
            currentUser={currentUser}
          />
        );
      case 'courses':
        return (
          <FacultyCourses
            onNavigate={setActiveTab}
            onSelectCourse={handleSelectCourse}
          />
        );
      case 'roster':
        return (
          <FacultyCourseRoster
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
          />
        );
      case 'attendance':
        return (
          <FacultyAttendance
            selectedCourseId={selectedCourseId}
            onSelectCourse={handleSelectCourse}
          />
        );
      case 'profile':
        return <FacultyProfile currentUser={currentUser} />;
      default:
        return (
          <FacultyDashboard
            onNavigate={setActiveTab}
            onSelectCourse={handleSelectCourse}
            currentUser={currentUser}
          />
        );
    }
  };

  return (
    <div className="faculty-portal-layout">
      <FacultySidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
      />
      <main className="student-portal-content">
        {renderPage()}
      </main>
    </div>
  );
}
