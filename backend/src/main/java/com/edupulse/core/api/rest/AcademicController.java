package com.edupulse.core.api.rest;

import com.edupulse.core.domain.academic.dto.CourseOfferingRequestDTO;
import com.edupulse.core.domain.academic.dto.CourseOfferingResponseDTO;
import com.edupulse.core.domain.academic.dto.CourseRequestDTO;
import com.edupulse.core.domain.academic.dto.CourseResponseDTO;
import com.edupulse.core.domain.academic.dto.FacultyRequestDTO;
import com.edupulse.core.domain.academic.dto.FacultyResponseDTO;
import com.edupulse.core.domain.academic.service.AcademicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller managing Academic operations: Faculty member onboarding,
 * Course catalogue registrations, and Curriculum CourseOffering instructor assignments.
 * Protected via strict Role-Based Access Control allowing SUPERADMIN and ACADEMIC_ADMIN.
 */
@RestController("coreAcademicController")
@RequestMapping("/api/v1/academic")
@Tag(name = "Core Academic Management", description = "Multi-tenant Faculty, Course, and Offering registry API")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ACADEMIC_ADMIN')")
public class AcademicController {

    private final AcademicService academicService;

    public AcademicController(@Qualifier("coreAcademicService") AcademicService academicService) {
        this.academicService = academicService;
    }

    /**
     * Registers a new Faculty member in the institution.
     */
    @PostMapping("/faculty")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ACADEMIC_ADMIN')")
    @Operation(summary = "Create Faculty", description = "Onboards a new faculty member under the active tenant")
    public ResponseEntity<FacultyResponseDTO> createFaculty(@Valid @RequestBody FacultyRequestDTO request) {
        FacultyResponseDTO response = academicService.createFaculty(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieves all Faculty members for the active tenant.
     */
    @GetMapping("/faculty")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ACADEMIC_ADMIN')")
    @Operation(summary = "Get All Faculty", description = "Retrieves all faculty members scoped by the active tenant boundary")
    public ResponseEntity<List<FacultyResponseDTO>> getAllFaculty() {
        List<FacultyResponseDTO> facultyList = academicService.getAllFaculty();
        return ResponseEntity.ok(facultyList);
    }

    /**
     * Registers a new Course in the institutional catalogue.
     */
    @PostMapping("/courses")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ACADEMIC_ADMIN')")
    @Operation(summary = "Create Course", description = "Creates a new academic course under the active tenant")
    public ResponseEntity<CourseResponseDTO> createCourse(@Valid @RequestBody CourseRequestDTO request) {
        CourseResponseDTO response = academicService.createCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieves all Courses for the active tenant.
     */
    @GetMapping("/courses")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ACADEMIC_ADMIN')")
    @Operation(summary = "Get All Courses", description = "Retrieves all academic courses scoped by tenant")
    public ResponseEntity<List<CourseResponseDTO>> getAllCourses() {
        List<CourseResponseDTO> courses = academicService.getAllCourses();
        return ResponseEntity.ok(courses);
    }

    /**
     * Assigns a Faculty instructor to a Course for a student Batch in a specific Semester.
     */
    @PostMapping("/offerings")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ACADEMIC_ADMIN')")
    @Operation(summary = "Assign Faculty to Course Offering", description = "Maps Course, Faculty, and Batch for a given semester")
    public ResponseEntity<CourseOfferingResponseDTO> assignFacultyToCourse(@Valid @RequestBody CourseOfferingRequestDTO request) {
        CourseOfferingResponseDTO response = academicService.assignFacultyToCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieves all Course Offerings for the active tenant.
     */
    @GetMapping("/offerings")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ACADEMIC_ADMIN')")
    @Operation(summary = "Get All Course Offerings", description = "Retrieves all course offerings mapped to faculty and batches")
    public ResponseEntity<List<CourseOfferingResponseDTO>> getAllCourseOfferings() {
        List<CourseOfferingResponseDTO> offerings = academicService.getAllCourseOfferings();
        return ResponseEntity.ok(offerings);
    }
}

