package com.unicore.service;

import com.unicore.entity.Department;
import com.unicore.exception.BadRequestException;
import com.unicore.exception.ResourceNotFoundException;
import com.unicore.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Department> getActiveDepartments() {
        return departmentRepository.findByActiveTrue();
    }

    @Transactional(readOnly = true)
    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Department getDepartmentByCodeOrName(String identifier) {
        String trimmed = identifier.trim();
        return departmentRepository.findByShortCodeIgnoreCase(trimmed)
                .or(() -> departmentRepository.findByNameIgnoreCase(trimmed))
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with code or name: " + identifier));
    }

    @Transactional(readOnly = true)
    public Department getDepartmentByShortCode(String shortCode) {
        return getDepartmentByCodeOrName(shortCode);
    }

    @Transactional
    public Department createDepartment(Department department) {
        if (department.getShortCode() == null || department.getShortCode().trim().isEmpty()) {
            throw new BadRequestException("Department short code is required");
        }
        if (department.getName() == null || department.getName().trim().isEmpty()) {
            throw new BadRequestException("Department name is required");
        }
        String shortCode = department.getShortCode().trim().toUpperCase();
        if (departmentRepository.existsByShortCodeIgnoreCase(shortCode)) {
            throw new BadRequestException("Department already exists with code: " + shortCode);
        }
        department.setShortCode(shortCode);
        department.setName(department.getName().trim());
        return departmentRepository.save(department);
    }

    @Transactional
    public Department updateDepartment(Long id, Department updated) {
        Department existing = getDepartmentById(id);

        if (updated.getName() != null && !updated.getName().trim().isEmpty()) {
            existing.setName(updated.getName().trim());
        }
        if (updated.getShortCode() != null && !updated.getShortCode().trim().isEmpty()) {
            String newCode = updated.getShortCode().trim().toUpperCase();
            if (!newCode.equalsIgnoreCase(existing.getShortCode()) && departmentRepository.existsByShortCodeIgnoreCase(newCode)) {
                throw new BadRequestException("Department code already in use: " + newCode);
            }
            existing.setShortCode(newCode);
        }
        existing.setActive(updated.isActive());
        return departmentRepository.save(existing);
    }

    @Transactional
    public Department toggleDepartmentStatus(Long id) {
        Department existing = getDepartmentById(id);
        existing.setActive(!existing.isActive());
        return departmentRepository.save(existing);
    }
}
