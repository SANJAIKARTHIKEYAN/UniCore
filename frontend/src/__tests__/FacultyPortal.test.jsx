import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import FacultySidebar from '../components/faculty/FacultySidebar';
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import FacultyCourses from '../pages/faculty/FacultyCourses';
import FacultyCourseRoster from '../pages/faculty/FacultyCourseRoster';
import FacultyProfile from '../pages/faculty/FacultyProfile';
import FacultyAttendance from '../pages/faculty/FacultyAttendance';
import FacultyAssessments from '../pages/faculty/FacultyAssessments';
import { api } from '../services/api';

// Mock the API service
vi.mock('../services/api', () => ({
  api: {
    getMyAssignedCourses: vi.fn(),
    getCourseRoster: vi.fn(),
    getMyFacultyProfile: vi.fn(),
    getCourseAttendance: vi.fn(),
    submitCourseAttendance: vi.fn(),
    createAssessment: vi.fn(),
    getCourseAssessments: vi.fn(),
    getAssessmentMarks: vi.fn(),
    submitMarks: vi.fn(),
    calculateGrades: vi.fn(),
  },
}));

const mockFacultyUser = {
  id: 2,
  name: 'Dr. K. Sharma',
  email: 'bca.fac001@unicore.edu',
  role: 'FACULTY',
  department: 'BCA',
  facultyProfile: {
    facultyId: 'BCA-FAC-001',
    department: 'BCA',
  },
};

const mockAssignedCourses = [
  {
    id: 1,
    courseCode: 'BCA101',
    courseName: '[DEMO] Programming in C',
    department: 'BCA',
    semester: 1,
    credits: 4,
    enrolledStudentsCount: 3,
  },
  {
    id: 4,
    courseCode: 'BCA201',
    courseName: '[DEMO] Object Oriented Programming in Java',
    department: 'BCA',
    semester: 2,
    credits: 4,
    enrolledStudentsCount: 2,
  },
];

const mockRoster = {
  courseId: 4,
  courseCode: 'BCA201',
  courseName: '[DEMO] Object Oriented Programming in Java',
  department: 'BCA',
  semester: 2,
  credits: 4,
  totalEnrolled: 1,
  students: [
    {
      enrollmentId: 10,
      studentId: 'BCA-STU-001',
      studentName: 'Sanjai Karthikeyan',
      collegeEmail: 'bca.stu001@unicore.edu',
      department: 'BCA',
      semester: 2,
      academicYear: 2024,
      grade: null,
      gradePoints: null,
      attendancePercentage: 86.7,
    },
  ],
};

const mockAttendanceEntries = [
  {
    studentUserId: 10,
    studentId: 'BCA-STU-001',
    studentName: 'Sanjai Karthikeyan',
    status: null,
  },
  {
    studentUserId: 11,
    studentId: 'BCA-STU-002',
    studentName: 'Aravind Mohan',
    status: 'PRESENT',
  },
];

describe('Faculty Portal Components & Shell (Parts 5.2 & 5.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. FacultySidebar renders navigation items and user badge', () => {
    const handleTabChange = vi.fn();
    render(
      <FacultySidebar
        activeTab="dashboard"
        onTabChange={handleTabChange}
        currentUser={mockFacultyUser}
      />
    );

    expect(screen.getByText('Dr. K. Sharma')).toBeInTheDocument();
    expect(screen.getByText('BCA-FAC-001')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Courses')).toBeInTheDocument();
    expect(screen.getByText('Student Roster')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    expect(screen.getByText('Faculty Profile')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Attendance'));
    expect(handleTabChange).toHaveBeenCalledWith('attendance');
  });

  it('2. FacultyDashboard renders metrics and course overview', async () => {
    api.getMyAssignedCourses.mockResolvedValueOnce(mockAssignedCourses);

    render(
      <FacultyDashboard
        onNavigate={vi.fn()}
        onSelectCourse={vi.fn()}
        currentUser={mockFacultyUser}
      />
    );

    expect(screen.getByText(/Loading faculty dashboard/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Welcome back, Dr. K. Sharma!')).toBeInTheDocument();
    });

    // 2 assigned courses, 3 + 2 = 5 total enrolled students
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('BCA101')).toBeInTheDocument();
    expect(screen.getByText('BCA201')).toBeInTheDocument();
  });

  it('3. FacultyCourses renders course cards and handles roster navigation', async () => {
    api.getMyAssignedCourses.mockResolvedValueOnce(mockAssignedCourses);
    const handleNavigate = vi.fn();
    const handleSelectCourse = vi.fn();

    render(
      <FacultyCourses
        onNavigate={handleNavigate}
        onSelectCourse={handleSelectCourse}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('[DEMO] Programming in C')).toBeInTheDocument();
    });

    expect(screen.getByText('[DEMO] Object Oriented Programming in Java')).toBeInTheDocument();

    const rosterButtons = screen.getAllByText(/View Enrolled Roster/i);
    expect(rosterButtons.length).toBe(2);

    fireEvent.click(rosterButtons[0]);
    expect(handleSelectCourse).toHaveBeenCalledWith(1);
    expect(handleNavigate).toHaveBeenCalledWith('roster');
  });

  it('4. FacultyCourseRoster renders student roster line items and attendance rate', async () => {
    api.getMyAssignedCourses.mockResolvedValue(mockAssignedCourses);
    api.getCourseRoster.mockResolvedValueOnce(mockRoster);

    render(
      <FacultyCourseRoster
        selectedCourseId={4}
        onSelectCourse={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Sanjai Karthikeyan')).toBeInTheDocument();
    });

    expect(screen.getByText('BCA-STU-001')).toBeInTheDocument();
    expect(screen.getByText('bca.stu001@unicore.edu')).toBeInTheDocument();
    expect(screen.getByText('86.7%')).toBeInTheDocument();
    expect(screen.getByText('Not Yet Graded')).toBeInTheDocument();
  });

  it('5. FacultyProfile renders faculty metadata and credentials', async () => {
    api.getMyFacultyProfile.mockResolvedValueOnce({
      facultyId: 'BCA-FAC-001',
      department: 'BCA',
    });

    render(<FacultyProfile currentUser={mockFacultyUser} />);

    await waitFor(() => {
      expect(screen.getByText('Faculty Profile')).toBeInTheDocument();
    });

    expect(screen.getByText('BCA-FAC-001')).toBeInTheDocument();
    expect(screen.getByText('Course Instructor & Evaluator')).toBeInTheDocument();
    expect(screen.getByText(/Verified Faculty/i)).toBeInTheDocument();
  });

  it('6. FacultyAttendance renders course selection, date picker, and enrolled student roster for attendance marking', async () => {
    api.getMyAssignedCourses.mockResolvedValueOnce(mockAssignedCourses);
    api.getCourseAttendance.mockResolvedValueOnce(mockAttendanceEntries);

    render(
      <FacultyAttendance
        selectedCourseId={4}
        onSelectCourse={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Mark Student Attendance')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Select Course:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Attendance Date:/i)).toBeInTheDocument();
    expect(screen.getByText('Sanjai Karthikeyan')).toBeInTheDocument();
    expect(screen.getByText('BCA-STU-001')).toBeInTheDocument();
    expect(screen.getByText('Aravind Mohan')).toBeInTheDocument();
    expect(screen.getByText('BCA-STU-002')).toBeInTheDocument();
    expect(screen.getByText('Unmarked')).toBeInTheDocument();
    expect(screen.getByText('✓ Recorded')).toBeInTheDocument();
  });

  it('7. FacultyAttendance allows marking individual students and calls submitCourseAttendance', async () => {
    api.getMyAssignedCourses.mockResolvedValueOnce(mockAssignedCourses);
    api.getCourseAttendance.mockResolvedValueOnce(mockAttendanceEntries);
    api.submitCourseAttendance.mockResolvedValueOnce({
      message: 'Attendance saved successfully for 2 student(s) on 2026-09-15.',
    });
    // For the refresh call after submit
    api.getCourseAttendance.mockResolvedValueOnce([
      { studentUserId: 10, studentId: 'BCA-STU-001', studentName: 'Sanjai Karthikeyan', status: 'PRESENT' },
      { studentUserId: 11, studentId: 'BCA-STU-002', studentName: 'Aravind Mohan', status: 'PRESENT' },
    ]);

    render(
      <FacultyAttendance
        selectedCourseId={4}
        onSelectCourse={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Sanjai Karthikeyan')).toBeInTheDocument();
    });

    // Mark all as Present using "✓ All Present"
    const markAllPresentBtn = screen.getByText('✓ All Present');
    fireEvent.click(markAllPresentBtn);

    // Click Save Attendance
    const saveBtn = screen.getByText(/Save Attendance/i);
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.submitCourseAttendance).toHaveBeenCalledWith(
        4,
        expect.objectContaining({
          entries: expect.arrayContaining([
            expect.objectContaining({ studentId: 10, status: 'PRESENT' }),
            expect.objectContaining({ studentId: 11, status: 'PRESENT' }),
          ]),
        })
      );
    });

    expect(await screen.findByText(/Attendance saved successfully/i)).toBeInTheDocument();
  });

  it('8. FacultyAttendance loads existing attendance when selected date changes', async () => {
    api.getMyAssignedCourses.mockResolvedValue(mockAssignedCourses);
    api.getCourseAttendance.mockResolvedValueOnce(mockAttendanceEntries);

    render(
      <FacultyAttendance
        selectedCourseId={4}
        onSelectCourse={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Sanjai Karthikeyan')).toBeInTheDocument();
    });

    // Date change
    api.getCourseAttendance.mockResolvedValueOnce([
      { studentUserId: 10, studentId: 'BCA-STU-001', studentName: 'Sanjai Karthikeyan', status: 'ABSENT' },
      { studentUserId: 11, studentId: 'BCA-STU-002', studentName: 'Aravind Mohan', status: 'ABSENT' },
    ]);

    const dateInput = screen.getByLabelText(/Attendance Date:/i);
    fireEvent.change(dateInput, { target: { value: '2026-09-14' } });

    await waitFor(() => {
      expect(api.getCourseAttendance).toHaveBeenCalledWith(4, '2026-09-14');
    });
  });

  it('9. FacultyAssessments renders configured assessments and navigation tabs', async () => {
    api.getMyAssignedCourses.mockResolvedValue(mockAssignedCourses);
    api.getCourseAssessments.mockResolvedValue([
      { id: 101, title: 'Midterm Exam 1', type: 'MIDTERM', maxMarks: 50, weightage: 30 },
      { id: 102, title: 'End Term Project', type: 'PROJECT', maxMarks: 100, weightage: 70 },
    ]);

    render(
      <FacultyAssessments
        selectedCourseId={4}
        onSelectCourse={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Assessment & Grading Engine')).toBeInTheDocument();
      expect(screen.getByText('Midterm Exam 1')).toBeInTheDocument();
      expect(screen.getByText('End Term Project')).toBeInTheDocument();
      expect(screen.getByText(/30% Weight/i)).toBeInTheDocument();
      expect(screen.getByText(/70% Weight/i)).toBeInTheDocument();
    });
  });

  it('10. FacultyAssessments calculates and publishes final student grades', async () => {
    api.getMyAssignedCourses.mockResolvedValue(mockAssignedCourses);
    api.getCourseAssessments.mockResolvedValue([
      { id: 101, title: 'Midterm Exam', type: 'MIDTERM', maxMarks: 50, weightage: 50 },
    ]);
    api.calculateGrades.mockResolvedValue({
      courseId: 4,
      courseCode: 'BCA201',
      courseName: 'Java Programming',
      totalStudents: 2,
      gradedStudents: 2,
      studentSummaries: [
        {
          studentId: 10,
          studentRegistrationNumber: 'BCA-STU-001',
          studentName: 'Sanjai Karthikeyan',
          finalPercentage: 92.0,
          finalGrade: 'O',
          gradePoints: 10.0,
          assessmentScores: [],
        },
      ],
    });

    render(
      <FacultyAssessments
        selectedCourseId={4}
        onSelectCourse={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Assessment & Grading Engine')).toBeInTheDocument();
    });

    // Switch to Grade Summary tab
    const gradeTabBtn = screen.getByText(/Grade Summary & Publish/i);
    fireEvent.click(gradeTabBtn);

    // Click Calculate & Publish Grades
    const calcBtn = screen.getByText(/Calculate & Publish Grades/i);
    fireEvent.click(calcBtn);

    await waitFor(() => {
      expect(api.calculateGrades).toHaveBeenCalledWith(4);
      expect(screen.getByText('Sanjai Karthikeyan')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument();
      expect(screen.getByText('O')).toBeInTheDocument();
    });
  });
});
