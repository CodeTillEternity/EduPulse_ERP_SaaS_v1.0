package com.edupulse.core.api.rest;

import com.edupulse.core.domain.student.dto.StudentRequestDTO;
import com.edupulse.core.domain.student.dto.StudentResponseDTO;
import com.edupulse.core.domain.student.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller managing Student admissions and identity records.
 * Secured via strict Role-Based Access Control (RBAC) permitting only
 * SUPERADMIN and ADMISSIONS_OFFICER roles.
 */
@RestController("coreStudentController")
@RequestMapping("/api/v1/students")
@Tag(name = "Core Student Admissions Registry", description = "Tenant-scoped student registry and admissions API")
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "edupulse.core.student-controller.enabled", havingValue = "true", matchIfMissing = false)
public class StudentController {

    private final StudentService studentService;

    public StudentController(@Qualifier("coreStudentService") StudentService studentService) {
        this.studentService = studentService;
    }

    /**
     * Enrolls a new student into the institution registry.
     * Accessible only by authorized institutional administrators and admission officers.
     *
     * @param request Student registration payload
     * @return Created student profile
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMISSIONS_OFFICER')")
    @Operation(summary = "Enroll Student", description = "Enrolls a new student under the active tenant partition")
    public ResponseEntity<StudentResponseDTO> enrollStudent(@Valid @RequestBody StudentRequestDTO request) {
        StudentResponseDTO createdStudent = studentService.enrollNewStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStudent);
    }

    /**
     * Retrieves an enrolled student profile by primary identifier.
     * Scoped strictly by the active tenant boundary.
     *
     * @param id Student primary record ID
     * @return Student profile details
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMISSIONS_OFFICER')")
    @Operation(summary = "Get Student by ID", description = "Retrieves student profile scoped by tenant ID")
    public ResponseEntity<StudentResponseDTO> getStudentById(@PathVariable Long id) {
        StudentResponseDTO student = studentService.getStudentById(id);
        return ResponseEntity.ok(student);
    }

    /**
     * Retrieves an enrolled student profile by institutional enrollment number.
     *
     * @param enrollmentNumber Tenant-unique enrollment number
     * @return Student profile details
     */
    @GetMapping("/enrollment/{enrollmentNumber}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMISSIONS_OFFICER')")
    @Operation(summary = "Get Student by Enrollment Number", description = "Retrieves student profile by enrollment number")
    public ResponseEntity<StudentResponseDTO> getStudentByEnrollmentNumber(@PathVariable String enrollmentNumber) {
        StudentResponseDTO student = studentService.getStudentByEnrollmentNumber(enrollmentNumber);
        return ResponseEntity.ok(student);
    }
}

