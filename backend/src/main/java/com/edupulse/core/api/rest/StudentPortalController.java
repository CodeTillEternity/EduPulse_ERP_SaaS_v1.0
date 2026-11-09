package com.edupulse.core.api.rest;

import com.edupulse.core.domain.academic.dto.StudentTranscriptDTO;
import com.edupulse.core.domain.academic.service.ExamService;
import com.edupulse.core.domain.finance.InvoiceStatus;
import com.edupulse.core.domain.finance.dto.StudentInvoiceResponseDTO;
import com.edupulse.core.domain.finance.service.FinanceService;
import com.edupulse.core.domain.operations.dto.TimetableResponseDTO;
import com.edupulse.core.domain.operations.service.OperationsService;
import com.edupulse.core.domain.portal.dto.PortalDashboardDTO;
import com.edupulse.core.domain.student.dto.StudentResponseDTO;
import com.edupulse.core.domain.student.service.StudentService;
import com.erp.auth.model.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Controller exposing self-service APIs for the restricted B2C Student Portal.
 * Enforces strict multi-tenant boundary scoping and identity isolation:
 * students can only access their own dashboard, schedule, transcript, and invoices.
 */
@RestController("coreStudentPortalController")
@RequestMapping("/api/v1/portal")
@Tag(name = "Student Portal", description = "Student self-service endpoints for schedule, GPA, and fee collection")
@PreAuthorize("hasAnyRole('STUDENT', 'SUPER_ADMIN', 'ADMIN', 'INSTITUTION_ADMIN')")
@Slf4j
public class StudentPortalController {

    private final OperationsService operationsService;
    private final FinanceService financeService;
    private final ExamService examService;
    private final StudentService studentService;

    public StudentPortalController(
            @Qualifier("coreOperationsService") OperationsService operationsService,
            @Qualifier("coreFinanceService") FinanceService financeService,
            @Qualifier("coreExamService") ExamService examService,
            @Qualifier("coreStudentService") StudentService studentService) {
        this.operationsService = operationsService;
        this.financeService = financeService;
        this.examService = examService;
        this.studentService = studentService;
    }

    /**
     * Aggregates the personal dashboard snapshot for the currently authenticated student.
     * Extracts identity from JWT SecurityContext, and pulls:
     * 1. Today's scheduled class timetable entries
     * 2. Pending student invoices (status != PAID)
     * 3. Cumulative GPA from academic examinations & grading
     *
     * @return PortalDashboardDTO with aggregated metrics
     */
    @GetMapping("/dashboard/me")
    @Operation(summary = "Get Student Dashboard Snapshot", description = "Fetches today's timetable, pending fee invoices, and cumulative GPA for the authenticated student")
    public ResponseEntity<PortalDashboardDTO> getMyDashboard() {
        StudentResponseDTO student = resolveAuthenticatedStudent();
        log.info("Generating portal dashboard snapshot for student [{}] (ID: {}, Batch: {})",
                student.getEnrollmentNumber(), student.getId(), student.getAcademicYear());

        // 1. Fetch Today's Classes
        List<TimetableResponseDTO> todayClasses = Collections.emptyList();
        if (student.getBatchId() != null) {
            String currentDayOfWeek = LocalDate.now().getDayOfWeek().name();
            List<TimetableResponseDTO> batchSchedule = operationsService.getTimetableByBatch(student.getBatchId());
            if (batchSchedule != null) {
                todayClasses = batchSchedule.stream()
                        .filter(item -> item.getDayOfWeek() != null && item.getDayOfWeek().equalsIgnoreCase(currentDayOfWeek))
                        .toList();
            }
        }

        // 2. Fetch Unpaid Invoices
        List<StudentInvoiceResponseDTO> allInvoices = financeService.getInvoicesByStudent(student.getId());
        List<StudentInvoiceResponseDTO> unpaidInvoices = Collections.emptyList();
        BigDecimal totalUnpaidAmount = BigDecimal.ZERO;
        if (allInvoices != null) {
            unpaidInvoices = allInvoices.stream()
                    .filter(inv -> inv.getStatus() != null && inv.getStatus() != InvoiceStatus.PAID)
                    .toList();
            totalUnpaidAmount = unpaidInvoices.stream()
                    .map(inv -> inv.getOutstandingBalance() != null ? inv.getOutstandingBalance() : inv.getNetAmount())
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        // 3. Fetch Cumulative GPA from Exam Service
        BigDecimal cumulativeGpa = BigDecimal.ZERO;
        try {
            StudentTranscriptDTO transcript = examService.getStudentTranscript(student.getEnrollmentNumber());
            if (transcript != null && transcript.getCumulativeGpa() != null) {
                cumulativeGpa = transcript.getCumulativeGpa();
            }
        } catch (Exception ex) {
            log.warn("Transcript not found or GPA calculation error for enrollment [{}]: {}",
                    student.getEnrollmentNumber(), ex.getMessage());
        }

        PortalDashboardDTO dashboardDTO = PortalDashboardDTO.builder()
                .studentId(student.getId())
                .studentName(student.getFirstName() + " " + student.getLastName())
                .enrollmentNumber(student.getEnrollmentNumber())
                .email(student.getEmail())
                .batchId(student.getBatchId())
                .batchName(student.getAcademicYear())
                .departmentName(student.getDepartmentName())
                .todayClasses(todayClasses)
                .unpaidInvoices(unpaidInvoices)
                .cumulativeGpa(cumulativeGpa)
                .totalUnpaidAmount(totalUnpaidAmount)
                .build();

        return ResponseEntity.ok(dashboardDTO);
    }

    /**
     * Resolves the Student profile corresponding to the authenticated security principal.
     */
    protected StudentResponseDTO resolveAuthenticatedStudent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        String username = auth.getName();
        String email = null;

        if (auth.getPrincipal() instanceof UserPrincipal principal) {
            email = principal.getEmail();
        }

        // 1. Try lookup by enrollment number
        try {
            return studentService.getStudentByEnrollmentNumber(username);
        } catch (Exception ignored) {
        }

        // 2. Try lookup by email if available
        if (email != null && !email.isBlank()) {
            try {
                return studentService.getStudentByEmail(email);
            } catch (Exception ignored) {
            }
        }

        // 3. Try lookup by username as email
        try {
            return studentService.getStudentByEmail(username);
        } catch (Exception ignored) {
        }

        throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Student profile not found for authenticated identifier: " + username
        );
    }
}
