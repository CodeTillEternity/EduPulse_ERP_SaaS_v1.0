package com.edupulse.core.api.rest;

import com.edupulse.core.config.RazorpayProperties;
import com.edupulse.core.domain.academic.dto.StudentTranscriptDTO;
import com.edupulse.core.domain.academic.service.ExamService;
import com.edupulse.core.domain.finance.InvoiceStatus;
import com.edupulse.core.domain.finance.StudentInvoice;
import com.edupulse.core.domain.finance.dto.StudentInvoiceResponseDTO;
import com.edupulse.core.domain.finance.repository.StudentInvoiceRepository;
import com.edupulse.core.domain.finance.service.FinanceService;
import com.edupulse.core.domain.operations.dto.TimetableResponseDTO;
import com.edupulse.core.domain.operations.service.OperationsService;
import com.edupulse.core.domain.portal.dto.FeeCheckoutResponseDTO;
import com.edupulse.core.domain.portal.dto.PortalDashboardDTO;
import com.edupulse.core.domain.student.dto.StudentResponseDTO;
import com.edupulse.core.domain.student.service.StudentService;
import com.erp.auth.model.UserPrincipal;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
    private final StudentInvoiceRepository invoiceRepository;
    private final RazorpayClient razorpayClient;
    private final RazorpayProperties razorpayProperties;

    public StudentPortalController(
            @Qualifier("coreOperationsService") OperationsService operationsService,
            @Qualifier("coreFinanceService") FinanceService financeService,
            @Qualifier("coreExamService") ExamService examService,
            @Qualifier("coreStudentService") StudentService studentService,
            @Qualifier("coreStudentInvoiceRepository") StudentInvoiceRepository invoiceRepository,
            RazorpayClient razorpayClient,
            @Qualifier("coreRazorpayProperties") RazorpayProperties razorpayProperties) {
        this.operationsService = operationsService;
        this.financeService = financeService;
        this.examService = examService;
        this.studentService = studentService;
        this.invoiceRepository = invoiceRepository;
        this.razorpayClient = razorpayClient;
        this.razorpayProperties = razorpayProperties;
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
     * Retrieves all historical and pending fee invoices for the authenticated student.
     *
     * @return List of StudentInvoiceResponseDTO
     */
    @GetMapping("/fees/invoices")
    @Operation(summary = "Get Student Invoices", description = "Retrieves all historical and pending fee invoices for the authenticated student")
    public ResponseEntity<List<StudentInvoiceResponseDTO>> getMyInvoices() {
        StudentResponseDTO student = resolveAuthenticatedStudent();
        List<StudentInvoiceResponseDTO> invoices = financeService.getInvoicesByStudent(student.getId());
        return ResponseEntity.ok(invoices != null ? invoices : Collections.emptyList());
    }

    /**
     * Initializes a Razorpay order for an unpaid fee invoice owned by the authenticated student.
     *
     * @param invoiceId Target StudentInvoice identifier
     * @return FeeCheckoutResponseDTO with Razorpay order details and public Key ID
     */
    @PostMapping("/fees/{invoiceId}/checkout")
    @Operation(summary = "Create Razorpay Fee Checkout Order", description = "Verifies ownership of invoice by authenticated student and initializes a Razorpay order")
    public ResponseEntity<FeeCheckoutResponseDTO> createFeeCheckoutOrder(@PathVariable Long invoiceId) {
        StudentResponseDTO student = resolveAuthenticatedStudent();

        StudentInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found with ID: " + invoiceId));

        // Strict RBAC Verification: Student can only pay their own invoice
        if (!student.getId().equals(invoice.getStudent().getId())) {
            log.warn("Security violation: Student [{}] attempted checkout on invoice [{}] belonging to student [{}]",
                    student.getId(), invoiceId, invoice.getStudent().getId());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: Invoice does not belong to you");
        }

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice is already fully paid");
        }

        BigDecimal payableAmount = invoice.getOutstandingBalance();
        if (payableAmount == null || payableAmount.compareTo(BigDecimal.ZERO) <= 0) {
            payableAmount = invoice.getNetAmount();
        }

        long amountInPaise = payableAmount.multiply(BigDecimal.valueOf(100)).longValue();

        String orderId;
        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "inv_" + invoice.getId() + "_" + System.currentTimeMillis());

            JSONObject notes = new JSONObject();
            notes.put("tenant_id", student.getTenantId() != null ? student.getTenantId() : "default");
            notes.put("invoice_id", String.valueOf(invoice.getId()));
            notes.put("student_id", String.valueOf(student.getId()));
            notes.put("enrollment_number", student.getEnrollmentNumber());
            notes.put("type", "STUDENT_FEE");
            orderRequest.put("notes", notes);

            if (razorpayClient != null && razorpayClient.orders != null) {
                Order order = razorpayClient.orders.create(orderRequest);
                orderId = order.get("id");
            } else {
                orderId = "order_mock_" + invoice.getId() + "_" + System.currentTimeMillis();
            }
            log.info("Successfully created Razorpay order [{}] for invoice [{}] (amount: ₹{})",
                    orderId, invoiceId, payableAmount);
        } catch (RazorpayException ex) {
            log.error("Razorpay order creation failed for invoice [{}]: {}", invoiceId, ex.getMessage(), ex);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to initiate payment with Razorpay: " + ex.getMessage());
        }

        FeeCheckoutResponseDTO response = FeeCheckoutResponseDTO.builder()
                .orderId(orderId)
                .amount(amountInPaise)
                .displayAmount(payableAmount)
                .currency("INR")
                .keyId(razorpayProperties.getKeyId())
                .invoiceId(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .studentName(student.getFirstName() + " " + student.getLastName())
                .studentEmail(student.getEmail())
                .description("Fee payment for Invoice #" + invoice.getInvoiceNumber())
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Delegates order creation to RazorpayClient SDK.
     */
    protected Order createRazorpayOrder(JSONObject orderRequest) throws RazorpayException {
        return razorpayClient.orders.create(orderRequest);
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
