package com.unicore.service;

import com.unicore.dto.response.UserResponse;
import com.unicore.entity.ApprovedFaculty;
import com.unicore.entity.ApprovedStudent;
import com.unicore.entity.Department;
import com.unicore.entity.User;
import com.unicore.exception.BadRequestException;
import com.unicore.exception.ResourceNotFoundException;
import com.unicore.repository.ApprovedFacultyRepository;
import com.unicore.repository.ApprovedStudentRepository;
import com.unicore.repository.DepartmentRepository;
import com.unicore.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ApprovedStudentRepository approvedStudentRepository;
    private final ApprovedFacultyRepository approvedFacultyRepository;
    private final DepartmentRepository departmentRepository;
    private final AuthService authService;

    public AdminService(UserRepository userRepository,
                        ApprovedStudentRepository approvedStudentRepository,
                        ApprovedFacultyRepository approvedFacultyRepository,
                        DepartmentRepository departmentRepository,
                        AuthService authService) {
        this.userRepository = userRepository;
        this.approvedStudentRepository = approvedStudentRepository;
        this.approvedFacultyRepository = approvedFacultyRepository;
        this.departmentRepository = departmentRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(authService::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApprovedStudent> getApprovedStudentsRoster() {
        return approvedStudentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<ApprovedFaculty> getApprovedFacultyRoster() {
        return approvedFacultyRepository.findAll();
    }

    @Transactional
    public ApprovedStudent addApprovedStudent(ApprovedStudent student) {
        if (student.getStudentId() == null || student.getStudentId().trim().isEmpty()) {
            throw new BadRequestException("Student ID is required");
        }
        if (student.getName() == null || student.getName().trim().isEmpty()) {
            throw new BadRequestException("Student Name is required");
        }
        if (student.getCollegeEmail() == null || student.getCollegeEmail().trim().isEmpty()) {
            throw new BadRequestException("College email is required");
        }
        if (student.getDepartment() == null || student.getDepartment().trim().isEmpty()) {
            throw new BadRequestException("Department is required");
        }
        if (student.getAdmissionYear() == null || student.getCurrentSemester() == null) {
            throw new BadRequestException("Admission year and current semester are required");
        }

        String studentId = student.getStudentId().trim();
        String email = student.getCollegeEmail().trim().toLowerCase();
        String deptCode = student.getDepartment().trim();

        if (approvedStudentRepository.existsByStudentId(studentId)) {
            throw new BadRequestException("Student ID already exists in approved roster: " + studentId);
        }
        if (approvedStudentRepository.findByCollegeEmail(email).isPresent()) {
            throw new BadRequestException("College email already exists in approved roster: " + email);
        }

        // Validate department exists
        Department dept = departmentRepository.findByShortCodeIgnoreCase(deptCode)
                .or(() -> departmentRepository.findByNameIgnoreCase(deptCode))
                .orElseThrow(() -> new BadRequestException("Department '" + deptCode + "' does not exist in institutional departments."));
        if (!dept.isActive()) {
            throw new BadRequestException("Cannot add student to inactive department: " + deptCode);
        }

        student.setStudentId(studentId);
        student.setName(student.getName().trim());
        student.setCollegeEmail(email);
        student.setDepartment(dept.getShortCode());
        student.setActive(true);
        student.setRegistered(false);

        return approvedStudentRepository.save(student);
    }

    @Transactional
    public ApprovedFaculty addApprovedFaculty(ApprovedFaculty faculty) {
        if (faculty.getFacultyId() == null || faculty.getFacultyId().trim().isEmpty()) {
            throw new BadRequestException("Faculty ID is required");
        }
        if (faculty.getName() == null || faculty.getName().trim().isEmpty()) {
            throw new BadRequestException("Faculty Name is required");
        }
        if (faculty.getCollegeEmail() == null || faculty.getCollegeEmail().trim().isEmpty()) {
            throw new BadRequestException("College email is required");
        }
        if (faculty.getDepartment() == null || faculty.getDepartment().trim().isEmpty()) {
            throw new BadRequestException("Department is required");
        }

        String facultyId = faculty.getFacultyId().trim();
        String email = faculty.getCollegeEmail().trim().toLowerCase();
        String deptCode = faculty.getDepartment().trim();

        if (approvedFacultyRepository.existsByFacultyId(facultyId)) {
            throw new BadRequestException("Faculty ID already exists in approved roster: " + facultyId);
        }
        if (approvedFacultyRepository.findByCollegeEmail(email).isPresent()) {
            throw new BadRequestException("College email already exists in approved roster: " + email);
        }

        // Validate department exists
        Department dept = departmentRepository.findByShortCodeIgnoreCase(deptCode)
                .or(() -> departmentRepository.findByNameIgnoreCase(deptCode))
                .orElseThrow(() -> new BadRequestException("Department '" + deptCode + "' does not exist in institutional departments."));
        if (!dept.isActive()) {
            throw new BadRequestException("Cannot add faculty to inactive department: " + deptCode);
        }

        faculty.setFacultyId(facultyId);
        faculty.setName(faculty.getName().trim());
        faculty.setCollegeEmail(email);
        faculty.setDepartment(dept.getShortCode());
        faculty.setActive(true);
        faculty.setRegistered(false);

        return approvedFacultyRepository.save(faculty);
    }

    @Transactional
    public ApprovedStudent toggleApprovedStudentStatus(Long id) {
        ApprovedStudent student = approvedStudentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Approved student record not found with id: " + id));
        student.setActive(!student.isActive());
        return approvedStudentRepository.save(student);
    }

    @Transactional
    public ApprovedFaculty toggleApprovedFacultyStatus(Long id) {
        ApprovedFaculty faculty = approvedFacultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Approved faculty record not found with id: " + id));
        faculty.setActive(!faculty.isActive());
        return approvedFacultyRepository.save(faculty);
    }
}
