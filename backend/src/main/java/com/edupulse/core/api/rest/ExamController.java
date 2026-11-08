package com.edupulse.core.api.rest;

import com.edupulse.core.domain.academic.dto.ExamRequestDTO;
import com.edupulse.core.domain.academic.dto.ExamResponseDTO;
import com.edupulse.core.domain.academic.dto.GradeScaleDTO;
import com.edupulse.core.domain.academic.dto.GradeScaleResponseDTO;
import com.edupulse.core.domain.academic.dto.ResultRequestDTO;
import com.edupulse.core.domain.academic.dto.ResultResponseDTO;
import com.edupulse.core.domain.academic.dto.StudentTranscriptDTO;
import com.edupulse.core.domain.academic.service.ExamService;
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

import java.util.List;

/**
 * REST controller managing Examination Scheduling, Grade Scales, Result Recording,
 * and Student Transcripts. Secured under multi-tenant role authorization for
 * SUPERADMIN, ACADEMIC_ADMIN, and FACULTY.
 */
@RestController("coreExamController")
@RequestMapping("/api/v1/academic")
@Tag(name = "Examinations & Grading", description = "Exam scheduling, grade scale definitions, result processing, and transcript generation API")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ACADEMIC_ADMIN', 'FACULTY')")
public class ExamController {

    private final ExamService examService;

    public ExamController(@Qualifier("coreExamService") ExamService examService) {
        this.examService = examService;
    }

    @PostMapping("/exams")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Schedule Examination", description = "Schedules a new exam linked to a CourseOffering")
    public ResponseEntity<ExamResponseDTO> createExam(@Valid @RequestBody ExamRequestDTO request) {
        ExamResponseDTO created = examService.createExam(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/exams")
    @Operation(summary = "List Examinations", description = "Retrieves all scheduled exams across the institution")
    public ResponseEntity<List<ExamResponseDTO>> getExams() {
        List<ExamResponseDTO> exams = examService.getExams();
        return ResponseEntity.ok(exams);
    }

    @GetMapping("/exams/{id}")
    @Operation(summary = "Get Examination by ID", description = "Retrieves details of a specific examination")
    public ResponseEntity<ExamResponseDTO> getExamById(@PathVariable Long id) {
        ExamResponseDTO exam = examService.getExamById(id);
        return ResponseEntity.ok(exam);
    }

    @GetMapping("/exams/offering/{offeringId}")
    @Operation(summary = "Get Exams for CourseOffering", description = "Retrieves all scheduled exams for a specific course offering")
    public ResponseEntity<List<ExamResponseDTO>> getExamsByCourseOffering(@PathVariable Long offeringId) {
        List<ExamResponseDTO> exams = examService.getExamsByCourseOffering(offeringId);
        return ResponseEntity.ok(exams);
    }

    @PostMapping("/grade-scales")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Define Grade Scale", description = "Creates or updates a grading bracket, mark boundaries, and grade points")
    public ResponseEntity<GradeScaleResponseDTO> defineGradeScale(@Valid @RequestBody GradeScaleDTO request) {
        GradeScaleResponseDTO created = examService.defineGradeScale(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/grade-scales")
    @Operation(summary = "List Grade Scales", description = "Retrieves all configured grade scale bands for the tenant")
    public ResponseEntity<List<GradeScaleResponseDTO>> getGradeScales() {
        List<GradeScaleResponseDTO> scales = examService.getGradeScales();
        return ResponseEntity.ok(scales);
    }

    @PostMapping("/exams/{examId}/results")
    @Operation(summary = "Record Student Results", description = "Records marks obtained, automatically evaluates grades against GradeScale bands, and updates results")
    public ResponseEntity<List<ResultResponseDTO>> recordStudentResults(
            @PathVariable Long examId,
            @Valid @RequestBody List<ResultRequestDTO> results) {
        List<ResultResponseDTO> recorded = examService.recordStudentResults(examId, results);
        return ResponseEntity.ok(recorded);
    }

    @GetMapping("/exams/{examId}/results")
    @Operation(summary = "Get Exam Results", description = "Retrieves all student results recorded for an examination")
    public ResponseEntity<List<ResultResponseDTO>> getResultsByExam(@PathVariable Long examId) {
        List<ResultResponseDTO> results = examService.getResultsByExam(examId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/exams/{examId}/students")
    @Operation(summary = "Get Enrolled Students for Exam", description = "Retrieves all students enrolled in the batch for this exam's course offering")
    public ResponseEntity<List<com.edupulse.core.domain.student.dto.StudentResponseDTO>> getStudentsForExam(@PathVariable Long examId) {
        List<com.edupulse.core.domain.student.dto.StudentResponseDTO> students = examService.getStudentsForExam(examId);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/students/{studentId}/results")
    @Operation(summary = "Get Student Results", description = "Retrieves all exam results for a specific student")
    public ResponseEntity<List<ResultResponseDTO>> getResultsByStudent(@PathVariable Long studentId) {
        List<ResultResponseDTO> results = examService.getResultsByStudent(studentId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/transcripts/{enrollmentNumber}")
    @Operation(summary = "Generate Student Transcript", description = "Generates a full academic transcript including cumulative GPA calculation")
    public ResponseEntity<StudentTranscriptDTO> getStudentTranscript(@PathVariable String enrollmentNumber) {
        StudentTranscriptDTO transcript = examService.getStudentTranscript(enrollmentNumber);
        return ResponseEntity.ok(transcript);
    }
}
