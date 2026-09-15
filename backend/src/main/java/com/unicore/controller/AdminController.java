package com.unicore.controller;

import com.unicore.dto.response.UserResponse;
import com.unicore.entity.ApprovedFaculty;
import com.unicore.entity.ApprovedStudent;
import com.unicore.entity.Department;
import com.unicore.service.AdminService;
import com.unicore.service.DepartmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final DepartmentService departmentService;

    public AdminController(AdminService adminService, DepartmentService departmentService) {
        this.adminService = adminService;
        this.departmentService = departmentService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @PostMapping("/departments")
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        return ResponseEntity.status(HttpStatus.CREATED).body(departmentService.createDepartment(department));
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable Long id, @RequestBody Department department) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, department));
    }

    @PatchMapping("/departments/{id}/status")
    public ResponseEntity<Department> toggleDepartmentStatus(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.toggleDepartmentStatus(id));
    }

    @GetMapping("/approved-students")
    public ResponseEntity<List<ApprovedStudent>> getApprovedStudentsRoster() {
        return ResponseEntity.ok(adminService.getApprovedStudentsRoster());
    }

    @PostMapping("/approved-students")
    public ResponseEntity<ApprovedStudent> addApprovedStudent(@RequestBody ApprovedStudent student) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.addApprovedStudent(student));
    }

    @PatchMapping("/approved-students/{id}/status")
    public ResponseEntity<ApprovedStudent> toggleApprovedStudentStatus(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleApprovedStudentStatus(id));
    }

    @GetMapping("/approved-faculty")
    public ResponseEntity<List<ApprovedFaculty>> getApprovedFacultyRoster() {
        return ResponseEntity.ok(adminService.getApprovedFacultyRoster());
    }

    @PostMapping("/approved-faculty")
    public ResponseEntity<ApprovedFaculty> addApprovedFaculty(@RequestBody ApprovedFaculty faculty) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.addApprovedFaculty(faculty));
    }

    @PatchMapping("/approved-faculty/{id}/status")
    public ResponseEntity<ApprovedFaculty> toggleApprovedFacultyStatus(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleApprovedFacultyStatus(id));
    }
}
