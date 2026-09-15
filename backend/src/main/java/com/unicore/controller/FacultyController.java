package com.unicore.controller;

import com.unicore.dto.request.AttendanceSubmitRequest;
import com.unicore.dto.response.AttendanceEntryResponse;
import com.unicore.dto.response.FacultyCourseResponse;
import com.unicore.dto.response.FacultyCourseRosterResponse;
import com.unicore.dto.response.FacultyProfileResponse;
import com.unicore.dto.response.MessageResponse;
import com.unicore.dto.response.StudentProfileResponse;
import com.unicore.security.UserPrincipal;
import com.unicore.service.FacultyService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/faculty")
@PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    @GetMapping("/me/profile")
    public ResponseEntity<FacultyProfileResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        FacultyProfileResponse response = facultyService.getMyProfile(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/courses")
    public ResponseEntity<List<FacultyCourseResponse>> getMyCourses(@AuthenticationPrincipal UserPrincipal principal) {
        List<FacultyCourseResponse> response = facultyService.getMyAssignedCourses(principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/courses/{id}/students")
    public ResponseEntity<FacultyCourseRosterResponse> getCourseRoster(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        FacultyCourseRosterResponse response = facultyService.getCourseRoster(id, principal);
        return ResponseEntity.ok(response);
    }

    /**
     * Fetch the attendance grid for a course on a given date.
     * Returns one entry per enrolled student with their attendance status (null if unmarked).
     */
    @GetMapping("/courses/{id}/attendance")
    public ResponseEntity<List<AttendanceEntryResponse>> getCourseAttendance(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<AttendanceEntryResponse> response = facultyService.getAttendanceForDate(id, date, principal);
        return ResponseEntity.ok(response);
    }

    /**
     * Submit or update attendance for a batch of students on a given date.
     * Uses upsert logic — existing records are updated, new ones are created.
     */
    @PutMapping("/courses/{id}/attendance")
    public ResponseEntity<MessageResponse> submitCourseAttendance(
            @PathVariable Long id,
            @Valid @RequestBody AttendanceSubmitRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        MessageResponse response = facultyService.submitAttendance(id, request, principal);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint accessible only by faculty/admin.
     * Enforces that a faculty user cannot access students of another department.
     */
    @GetMapping("/department-students")
    public ResponseEntity<List<StudentProfileResponse>> getDepartmentStudents(
            @RequestParam String department,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<StudentProfileResponse> response = facultyService.getStudentsByDepartment(department, principal);
        return ResponseEntity.ok(response);
    }
}

