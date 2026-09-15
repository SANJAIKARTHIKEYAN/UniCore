const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('unicore_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `HTTP Error ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Authentication
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  registerStudent: (studentId, collegeEmail, password) =>
    request('/auth/register/student', {
      method: 'POST',
      body: JSON.stringify({ studentId, collegeEmail, password }),
    }),

  registerFaculty: (facultyId, collegeEmail, password) =>
    request('/auth/register/faculty', {
      method: 'POST',
      body: JSON.stringify({ facultyId, collegeEmail, password }),
    }),

  getCurrentUser: () => request('/auth/me'),

  // Student Endpoints
  getMyStudentProfile: () => request('/student/me/profile'),
  getStudentProfileById: (userId) => request(`/student/profile/${userId}`),
  getStudentDashboard: () => request('/student/me/dashboard'),
  getStudentAttendance: () => request('/student/me/attendance'),
  getStudentAcademicPerformance: () => request('/student/me/academic-performance'),
  getStudentResults: (semester) => request(`/student/me/results${semester ? `?semester=${semester}` : ''}`),
  getStudentRiskStatus: () => request('/student/me/risk-status'),
  getStudentFees: () => request('/student/me/fees'),
  getStudentDocuments: () => request('/student/me/documents'),
  getStudentNotifications: () => request('/student/me/notifications'),

  // Faculty Endpoints
  getMyFacultyProfile: () => request('/faculty/me/profile'),
  getMyAssignedCourses: () => request('/faculty/me/courses'),
  getCourseRoster: (courseId) => request(`/faculty/courses/${courseId}/students`),
  getCourseAttendance: (courseId, date) =>
    request(`/faculty/courses/${courseId}/attendance?date=${date}`),
  submitCourseAttendance: (courseId, payload) =>
    request(`/faculty/courses/${courseId}/attendance`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  getDepartmentStudents: (department) =>
    request(`/faculty/department-students?department=${encodeURIComponent(department)}`),

  // Departments
  getDepartments: () => request('/departments'),

  // Admin Endpoints
  getAdminUsers: () => request('/admin/users'),
  getAdminDepartments: () => request('/admin/departments'),
  createDepartment: (dept) =>
    request('/admin/departments', {
      method: 'POST',
      body: JSON.stringify(dept),
    }),
  updateDepartment: (id, dept) =>
    request(`/admin/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dept),
    }),
  toggleDepartmentStatus: (id) =>
    request(`/admin/departments/${id}/status`, {
      method: 'PATCH',
    }),
  getApprovedStudents: () => request('/admin/approved-students'),
  addApprovedStudent: (student) =>
    request('/admin/approved-students', {
      method: 'POST',
      body: JSON.stringify(student),
    }),
  toggleApprovedStudentStatus: (id) =>
    request(`/admin/approved-students/${id}/status`, {
      method: 'PATCH',
    }),
  getApprovedFaculty: () => request('/admin/approved-faculty'),
  addApprovedFaculty: (faculty) =>
    request('/admin/approved-faculty', {
      method: 'POST',
      body: JSON.stringify(faculty),
    }),
  toggleApprovedFacultyStatus: (id) =>
    request(`/admin/approved-faculty/${id}/status`, {
      method: 'PATCH',
    }),
};
