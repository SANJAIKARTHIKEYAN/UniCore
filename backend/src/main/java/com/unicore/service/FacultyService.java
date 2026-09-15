package com.unicore.service;

import com.unicore.dto.request.AttendanceSubmitRequest;
import com.unicore.dto.response.AttendanceEntryResponse;
import com.unicore.dto.response.EnrolledStudentResponse;
import com.unicore.dto.response.FacultyCourseResponse;
import com.unicore.dto.response.FacultyCourseRosterResponse;
import com.unicore.dto.response.FacultyProfileResponse;
import com.unicore.dto.response.MessageResponse;
import com.unicore.dto.response.StudentProfileResponse;
import com.unicore.entity.*;
import com.unicore.exception.BadRequestException;
import com.unicore.exception.ForbiddenException;
import com.unicore.exception.ResourceNotFoundException;
import com.unicore.repository.*;
import com.unicore.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FacultyService {

    private final FacultyProfileRepository facultyProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final UserRepository userRepository;

    public FacultyService(FacultyProfileRepository facultyProfileRepository,
                          StudentProfileRepository studentProfileRepository,
                          CourseRepository courseRepository,
                          EnrollmentRepository enrollmentRepository,
                          AttendanceRecordRepository attendanceRecordRepository,
                          UserRepository userRepository) {
        this.facultyProfileRepository = facultyProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public FacultyProfileResponse getMyProfile(UserPrincipal principal) {
        FacultyProfile profile = facultyProfileRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user id: " + principal.getId()));
        return new FacultyProfileResponse(profile.getFacultyId(), profile.getDepartment());
    }

    /**
     * Retrieves all courses assigned to the currently authenticated faculty member.
     */
    @Transactional(readOnly = true)
    public List<FacultyCourseResponse> getMyAssignedCourses(UserPrincipal principal) {
        List<Course> courses = courseRepository.findByInstructorId(principal.getId());
        return courses.stream().map(c -> {
            long enrolledCount = enrollmentRepository.countByCourseId(c.getId());
            return new FacultyCourseResponse(
                    c.getId(),
                    c.getCourseCode(),
                    c.getCourseName(),
                    c.getDepartment(),
                    c.getSemester(),
                    c.getCredits(),
                    (int) enrolledCount
            );
        }).collect(Collectors.toList());
    }

    /**
     * Retrieves the enrolled students (roster) for a specific course assigned to the faculty member.
     * Enforces strict instructor ownership checks (403 if not assigned).
     */
    @Transactional(readOnly = true)
    public FacultyCourseRosterResponse getCourseRoster(Long courseId, UserPrincipal principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (principal.getRole() == Role.FACULTY) {
            if (course.getInstructor() == null || !course.getInstructor().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access Denied: You are not assigned to instruct course '" + course.getCourseCode() + "'.");
            }
        }

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        List<EnrolledStudentResponse> studentResponses = enrollments.stream().map(e -> {
            User studentUser = e.getStudent();
            StudentProfile sp = studentUser.getStudentProfile();
            String studentId = sp != null ? sp.getStudentId() : "";

            long totalClasses = attendanceRecordRepository.countByStudentIdAndCourseId(studentUser.getId(), course.getId());
            Double attendancePercent = null;
            if (totalClasses > 0) {
                long present = attendanceRecordRepository.countByStudentIdAndCourseIdAndStatus(studentUser.getId(), course.getId(), AttendanceStatus.PRESENT);
                long late = attendanceRecordRepository.countByStudentIdAndCourseIdAndStatus(studentUser.getId(), course.getId(), AttendanceStatus.LATE);
                attendancePercent = Math.round(((double) (present + late) / totalClasses * 100.0) * 10.0) / 10.0;
            }

            return new EnrolledStudentResponse(
                    e.getId(),
                    studentId,
                    studentUser.getName(),
                    studentUser.getEmail(),
                    studentUser.getDepartment(),
                    e.getSemester(),
                    e.getAcademicYear(),
                    e.getGrade(),
                    e.getGradePoints(),
                    attendancePercent
            );
        }).collect(Collectors.toList());

        return new FacultyCourseRosterResponse(
                course.getId(),
                course.getCourseCode(),
                course.getCourseName(),
                course.getDepartment(),
                course.getSemester(),
                course.getCredits(),
                studentResponses.size(),
                studentResponses
        );
    }

    /**
     * Enforces Department Isolation:
     * Faculty members can only query or manage data belonging to their own department.
     */
    @Transactional(readOnly = true)
    public List<StudentProfileResponse> getStudentsByDepartment(String requestedDepartment, UserPrincipal principal) {
        if (principal.getRole() == Role.FACULTY) {
            if (!principal.getDepartment().equalsIgnoreCase(requestedDepartment)) {
                throw new ForbiddenException("Access Denied: Faculty members are restricted to their assigned department ('"
                        + principal.getDepartment() + "') and cannot access department '" + requestedDepartment + "'.");
            }
        }

        List<StudentProfile> students = studentProfileRepository.findByUserDepartment(requestedDepartment);
        return students.stream()
                .map(sp -> new StudentProfileResponse(
                        sp.getStudentId(),
                        sp.getAdmissionYear(),
                        sp.getCurrentSemester(),
                        sp.getDerivedYear()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Retrieves the attendance grid for a specific course on a given date.
     * Returns one entry per enrolled student, with status=null if no record exists for that date.
     * Enforces strict instructor ownership.
     */
    @Transactional(readOnly = true)
    public List<AttendanceEntryResponse> getAttendanceForDate(Long courseId, LocalDate date, UserPrincipal principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (principal.getRole() == Role.FACULTY) {
            if (course.getInstructor() == null || !course.getInstructor().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access Denied: You are not assigned to instruct course '" + course.getCourseCode() + "'.");
            }
        }

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        List<AttendanceRecord> existingRecords = attendanceRecordRepository.findByCourseIdAndDate(courseId, date);

        Map<Long, AttendanceStatus> statusMap = existingRecords.stream()
                .collect(Collectors.toMap(r -> r.getStudent().getId(), AttendanceRecord::getStatus));

        return enrollments.stream().map(e -> {
            User studentUser = e.getStudent();
            StudentProfile sp = studentUser.getStudentProfile();
            String rollNumber = sp != null ? sp.getStudentId() : "";
            AttendanceStatus status = statusMap.getOrDefault(studentUser.getId(), null);
            return new AttendanceEntryResponse(studentUser.getId(), rollNumber, studentUser.getName(), status);
        }).collect(Collectors.toList());
    }

    /**
     * Submits/updates attendance for a batch of students on a given date for a specific course.
     * Validates instructor ownership and student enrollment before persisting.
     * Uses upsert logic: updates existing records, creates new ones.
     */
    @Transactional
    public MessageResponse submitAttendance(Long courseId, AttendanceSubmitRequest request, UserPrincipal principal) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (principal.getRole() == Role.FACULTY) {
            if (course.getInstructor() == null || !course.getInstructor().getId().equals(principal.getId())) {
                throw new ForbiddenException("Access Denied: You are not assigned to instruct course '" + course.getCourseCode() + "'.");
            }
        }

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        Map<Long, Enrollment> enrollmentMap = enrollments.stream()
                .collect(Collectors.toMap(e -> e.getStudent().getId(), e -> e));

        List<AttendanceRecord> recordsToSave = new ArrayList<>();

        for (AttendanceSubmitRequest.AttendanceEntry entry : request.getEntries()) {
            if (!enrollmentMap.containsKey(entry.getStudentId())) {
                throw new BadRequestException("Student with user ID " + entry.getStudentId()
                        + " is not enrolled in course '" + course.getCourseCode() + "'.");
            }

            User studentUser = userRepository.findById(entry.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + entry.getStudentId()));

            Optional<AttendanceRecord> existingRecord = attendanceRecordRepository
                    .findByStudentIdAndCourseIdAndDate(entry.getStudentId(), courseId, request.getDate());

            if (existingRecord.isPresent()) {
                AttendanceRecord record = existingRecord.get();
                record.setStatus(entry.getStatus());
                recordsToSave.add(record);
            } else {
                AttendanceRecord newRecord = new AttendanceRecord(studentUser, course, request.getDate(), entry.getStatus());
                recordsToSave.add(newRecord);
            }
        }

        attendanceRecordRepository.saveAll(recordsToSave);

        return new MessageResponse("Attendance saved successfully for " + recordsToSave.size()
                + " student(s) on " + request.getDate() + ".");
    }
}

