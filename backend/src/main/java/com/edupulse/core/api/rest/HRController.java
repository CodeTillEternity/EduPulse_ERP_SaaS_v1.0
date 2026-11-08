package com.edupulse.core.api.rest;

import com.edupulse.core.domain.hr.LeaveStatus;
import com.edupulse.core.domain.hr.dto.LeaveRequestDTO;
import com.edupulse.core.domain.hr.dto.LeaveResponseDTO;
import com.edupulse.core.domain.hr.dto.LeaveReviewDTO;
import com.edupulse.core.domain.hr.dto.MonthlyPayrollRequestDTO;
import com.edupulse.core.domain.hr.dto.PayrollResponseDTO;
import com.edupulse.core.domain.hr.service.HRService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller managing Staff Leave Applications and Automated Monthly Payroll Generation.
 * Secured under multi-tenant role authorization for SUPERADMIN, HR_MANAGER, and FACULTY.
 */
@RestController("coreHRController")
@RequestMapping("/api/v1/hr")
@Tag(name = "HR & Payroll Management", description = "Faculty leave requests, approval workflow, and monthly payroll disbursement API")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'HR_MANAGER', 'ADMIN', 'FACULTY')")
public class HRController {

    private final HRService hrService;

    public HRController(@Qualifier("coreHRService") HRService hrService) {
        this.hrService = hrService;
    }

    @PostMapping("/leaves")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Apply for Faculty Leave", description = "Submits a new leave request for a faculty member")
    public ResponseEntity<LeaveResponseDTO> applyForLeave(@Valid @RequestBody LeaveRequestDTO request) {
        LeaveResponseDTO response = hrService.applyForLeave(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/leaves/{leaveId}/review")
    @Operation(summary = "Review Faculty Leave", description = "Approves or rejects a pending faculty leave request")
    public ResponseEntity<LeaveResponseDTO> reviewLeave(
            @PathVariable Long leaveId,
            @Valid @RequestBody LeaveReviewDTO reviewDTO) {
        LeaveResponseDTO response = hrService.reviewLeave(leaveId, reviewDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/leaves/pending")
    @Operation(summary = "List Pending Leaves", description = "Retrieves all unreviewed faculty leave applications awaiting HR decision")
    public ResponseEntity<List<LeaveResponseDTO>> getPendingLeaves() {
        List<LeaveResponseDTO> leaves = hrService.getPendingLeaves();
        return ResponseEntity.ok(leaves);
    }

    @GetMapping("/leaves/faculty/{facultyId}")
    @Operation(summary = "Get Faculty Leaves", description = "Retrieves leave history for a specific faculty member")
    public ResponseEntity<List<LeaveResponseDTO>> getLeavesByFaculty(@PathVariable Long facultyId) {
        List<LeaveResponseDTO> leaves = hrService.getLeavesByFaculty(facultyId);
        return ResponseEntity.ok(leaves);
    }

    @GetMapping("/leaves")
    @Operation(summary = "List All Leaves", description = "Retrieves all faculty leave requests across the institution")
    public ResponseEntity<List<LeaveResponseDTO>> getAllLeaves() {
        List<LeaveResponseDTO> leaves = hrService.getAllLeaves();
        return ResponseEntity.ok(leaves);
    }

    @PostMapping("/payroll/generate")
    @Operation(summary = "Generate Monthly Payroll", description = "Calculates faculty monthly compensation and leave deductions")
    public ResponseEntity<List<PayrollResponseDTO>> generatePayroll(
            @Valid @RequestBody(required = false) MonthlyPayrollRequestDTO request,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        if (request != null) {
            return ResponseEntity.ok(hrService.generateMonthlyPayroll(request));
        } else if (month != null && year != null) {
            return ResponseEntity.ok(hrService.generateMonthlyPayroll(month, year));
        } else {
            throw new IllegalArgumentException("Month and year must be specified either in the request body or as query parameters");
        }
    }

    @GetMapping("/payroll")
    @Operation(summary = "Get Monthly Payroll", description = "Retrieves generated payroll records for a specific billing month and year")
    public ResponseEntity<List<PayrollResponseDTO>> getMonthlyPayroll(
            @RequestParam Integer month,
            @RequestParam Integer year) {
        List<PayrollResponseDTO> payroll = hrService.getMonthlyPayroll(month, year);
        return ResponseEntity.ok(payroll);
    }

    @PutMapping("/payroll/{payrollId}/pay")
    @Operation(summary = "Disburse / Mark Payroll as Paid", description = "Marks a monthly payroll payslip as PAID and stamps disbursement date")
    public ResponseEntity<PayrollResponseDTO> markPayrollAsPaid(@PathVariable Long payrollId) {
        PayrollResponseDTO response = hrService.markPayrollAsPaid(payrollId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/payroll/faculty/{facultyId}")
    @Operation(summary = "Get Faculty Payroll History", description = "Retrieves payslip records for a specific faculty member")
    public ResponseEntity<List<PayrollResponseDTO>> getPayrollByFaculty(@PathVariable Long facultyId) {
        List<PayrollResponseDTO> payroll = hrService.getPayrollByFaculty(facultyId);
        return ResponseEntity.ok(payroll);
    }
}

