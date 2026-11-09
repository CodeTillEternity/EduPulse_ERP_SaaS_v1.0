package com.edupulse.core.api.rest;

import com.edupulse.core.domain.academic.dto.ExamDefinitionDTO;
import com.edupulse.core.domain.academic.dto.ExamResponseDTO;
import com.edupulse.core.domain.academic.dto.ExamStartRequestDTO;
import com.edupulse.core.domain.academic.dto.ExamStartResponseDTO;
import com.edupulse.core.domain.academic.service.AcademicService;
import com.edupulse.core.domain.academic.service.ExamSecurityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller managing Academic Examination definitions, multi-tenant RBAC,
 * and physical layer proctoring (IP subnet filtering & dynamic exam PIN verification).
 */
@RestController("academicExamRbacController")
@RequestMapping({"/api/exams", "/api/v1/exams"})
@Tag(name = "Academic Examinations", description = "Exam creation, scheduling, RBAC scoping, and physical proctoring API")
public class AcademicExamController {

    private final AcademicService academicService;
    private final ExamSecurityService examSecurityService;

    public AcademicExamController(
            @Qualifier("coreAcademicService") AcademicService academicService,
            @Qualifier("coreExamSecurityService") ExamSecurityService examSecurityService) {
        this.academicService = academicService;
        this.examSecurityService = examSecurityService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ACADEMIC_ADMIN', 'FACULTY', 'SUPER_ADMIN', 'SUPERADMIN', 'ADMIN')")
    @Operation(summary = "Create Examination", description = "Restricted to ACADEMIC_ADMIN and FACULTY roles")
    public ResponseEntity<ExamResponseDTO> createExam(@Valid @RequestBody ExamDefinitionDTO request) {
        ExamResponseDTO created = academicService.createExam(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "List Examinations", description = "Returns published enrolled exams for Students; all exams for Faculty/Admin")
    public ResponseEntity<List<ExamResponseDTO>> getExams(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long courseId) {
        List<ExamResponseDTO> exams = academicService.getPublishedExamsForStudent(studentId, courseId);
        return ResponseEntity.ok(exams);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Examination by ID", description = "Retrieves exam details, enforcing student enrollment and publish checks")
    public ResponseEntity<ExamResponseDTO> getExamById(@PathVariable Long id) {
        ExamResponseDTO exam = academicService.getExamById(id);
        return ResponseEntity.ok(exam);
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ACADEMIC_ADMIN', 'FACULTY', 'SUPER_ADMIN', 'SUPERADMIN', 'ADMIN')")
    @Operation(summary = "Publish Examination", description = "Publishes a draft exam for student access")
    public ResponseEntity<ExamResponseDTO> publishExam(@PathVariable Long id) {
        ExamResponseDTO published = academicService.publishExam(id);
        return ResponseEntity.ok(published);
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "Start Examination Session", description = "Validates physical subnet whitelisting via X-Forwarded-For and dynamic exam PIN")
    public ResponseEntity<ExamStartResponseDTO> startExam(
            @PathVariable Long id,
            @Valid @RequestBody ExamStartRequestDTO request,
            HttpServletRequest servletRequest) {
        String clientIp = examSecurityService.extractClientIp(servletRequest);
        ExamStartResponseDTO response = examSecurityService.startExam(id, request, clientIp);
        return ResponseEntity.ok(response);
    }
}
