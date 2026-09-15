import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import StudentSidebar from '../components/student/StudentSidebar';
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentAdvisor from '../pages/student/StudentAdvisor';
import { api } from '../services/api';

// Mock the API service
vi.mock('../services/api', () => ({
  api: {
    getStudentDashboard: vi.fn(),
    getMyRisk: vi.fn(),
    getAdvisorOverview: vi.fn(),
    refreshAdvisor: vi.fn(),
    askAdvisor: vi.fn(),
  },
}));

const mockStudentUser = {
  id: 1,
  name: 'Sanjai Karthikeyan',
  email: 'bca.stu001@unicore.edu',
  role: 'STUDENT',
  department: 'BCA',
  studentProfile: {
    studentId: 'BCA-STU-001',
    admissionYear: 2024,
    currentSemester: 2,
  },
};

const mockDashboardData = {
  studentName: 'Sanjai Karthikeyan',
  studentId: 'BCA-STU-001',
  department: 'BCA',
  semester: 2,
  derivedYear: '1st Year',
  enrolledCoursesCount: 4,
  overallAttendancePercent: 88.5,
  pendingFeesCount: 0,
  unreadNotificationsCount: 2,
};

const mockRiskData = {
  riskCategory: 'Low Risk',
  confidence: 0.92,
  recommendation: 'Student is demonstrating healthy academic progress. Continue standard course engagement.',
  features: {
    'Attendance (%)': 88.5,
    'Midterm_Score': 82.0,
    'Assignments_Avg': 85.0,
    'Quizzes_Avg': 80.0,
  },
};

const mockAdvisorOverview = {
  summaryHeadline: 'Academic health is strong with 88.5% attendance and active grade standing.',
  riskCategory: 'Low Risk',
  riskConfidence: 0.92,
  overallAttendancePercent: 88.5,
  averageMarksPercent: 82.3,
  courseCount: 4,
  recommendations: [
    {
      category: 'ACADEMIC',
      priority: 'MEDIUM',
      title: 'Target Distinction in Java',
      advice: 'Scores are consistently above 80%. Review advanced concurrency topics.',
      actionItem: 'Complete extra credit assignments.',
      rationale: 'Current score: 82.0%',
      metricTag: 'Java: 82.0%',
    },
    {
      category: 'ATTENDANCE',
      priority: 'LOW',
      title: 'Maintain Attendance Pacing',
      advice: 'Attendance is above safe buffer.',
      actionItem: 'Keep regular class attendance.',
      rationale: 'Current attendance is 88.5%',
      metricTag: 'Attendance: 88.5%',
    },
  ],
  generatedAt: '2026-09-15T12:00:00',
};

describe('Student Portal & AI Advisor UI Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders student sidebar with student details and navigation links', () => {
    const onTabChange = vi.fn();
    render(
      <StudentSidebar
        activeTab="dashboard"
        onTabChange={onTabChange}
        currentUser={mockStudentUser}
      />
    );

    expect(screen.getByText('Sanjai Karthikeyan')).toBeInTheDocument();
    expect(screen.getByText('BCA-STU-001')).toBeInTheDocument();
    expect(screen.getByText('AI Advisor')).toBeInTheDocument();

    const advisorBtn = screen.getByText('AI Advisor');
    fireEvent.click(advisorBtn);
    expect(onTabChange).toHaveBeenCalledWith('advisor');
  });

  it('renders student dashboard with academic metrics and ML early warning card', async () => {
    api.getStudentDashboard.mockResolvedValue(mockDashboardData);
    api.getMyRisk.mockResolvedValue(mockRiskData);

    const onNavigate = vi.fn();
    render(<StudentDashboard onNavigate={onNavigate} currentUser={mockStudentUser} />);

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Sanjai Karthikeyan!/)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/88\.5%/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Low Risk \(92% Confidence\)/)).toBeInTheDocument();
    expect(screen.getByText('🤖 Consult AI Advisor →')).toBeInTheDocument();

    // Click quick link to AI Advisor
    fireEvent.click(screen.getByText('🤖 Consult AI Advisor →'));
    expect(onNavigate).toHaveBeenCalledWith('advisor');
  });

  it('renders AI Advisor overview with health metrics, recommendation cards, and quick chips', async () => {
    api.getAdvisorOverview.mockResolvedValue(mockAdvisorOverview);

    render(<StudentAdvisor />);

    await waitFor(() => {
      expect(screen.getByText(/AI Academic Advisor/)).toBeInTheDocument();
    });

    expect(screen.getByText('Low Risk')).toBeInTheDocument();
    expect(screen.getByText('Target Distinction in Java')).toBeInTheDocument();
    expect(screen.getByText('Maintain Attendance Pacing')).toBeInTheDocument();
    expect(screen.getByText('How is my attendance standing?')).toBeInTheDocument();
  });

  it('handles asking a question to the AI Advisor and displaying the grounded response', async () => {
    api.getAdvisorOverview.mockResolvedValue(mockAdvisorOverview);
    api.askAdvisor.mockResolvedValue({
      intent: 'ATTENDANCE_INQUIRY',
      answer: 'Your overall attendance is currently at 88.5% across 4 courses. This comfortably exceeds the mandatory 75% cutoff.',
      source: 'UniCore Attendance Records',
      suggestedQuestions: ['Which course should I focus on?'],
    });

    render(<StudentAdvisor />);

    await waitFor(() => {
      expect(screen.getByText(/AI Academic Advisor/)).toBeInTheDocument();
    });

    // Click a quick prompt chip
    const promptChip = screen.getByText('How is my attendance standing?');
    fireEvent.click(promptChip);

    await waitFor(() => {
      expect(screen.getByText(/Your overall attendance is currently at 88.5%/)).toBeInTheDocument();
    });
  });
});
