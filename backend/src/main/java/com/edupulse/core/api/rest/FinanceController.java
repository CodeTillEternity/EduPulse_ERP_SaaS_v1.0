package com.edupulse.core.api.rest;

import com.edupulse.core.domain.finance.dto.BatchInvoiceRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeHeadRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeHeadResponseDTO;
import com.edupulse.core.domain.finance.dto.FeeStructureRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeStructureResponseDTO;
import com.edupulse.core.domain.finance.dto.PaymentRequestDTO;
import com.edupulse.core.domain.finance.dto.PaymentResponseDTO;
import com.edupulse.core.domain.finance.dto.StudentInvoiceResponseDTO;
import com.edupulse.core.domain.finance.dto.StudentLedgerResponseDTO;
import com.edupulse.core.domain.finance.service.FinanceService;
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
 * REST controller managing Student Finance, Fee Structures, Invoicing, and Payment Collection.
 * Strictly secured under multi-tenant role authorization for SUPERADMIN and FINANCE_MANAGER.
 */
@RestController("coreFinanceController")
@RequestMapping("/api/v1/finance")
@Tag(name = "Finance Management", description = "Fee heads, structures, batch invoicing, and payment processing API")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'FINANCE_MANAGER')")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(@Qualifier("coreFinanceService") FinanceService financeService) {
        this.financeService = financeService;
    }

    @PostMapping("/heads")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create Fee Head", description = "Defines a new fee ledger category (e.g. Tuition, Lab, Hostel)")
    public ResponseEntity<FeeHeadResponseDTO> createFeeHead(@Valid @RequestBody FeeHeadRequestDTO request) {
        FeeHeadResponseDTO created = financeService.createFeeHead(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/heads")
    @Operation(summary = "List Fee Heads", description = "Retrieves all fee head categories for the tenant")
    public ResponseEntity<List<FeeHeadResponseDTO>> getFeeHeads() {
        List<FeeHeadResponseDTO> heads = financeService.getFeeHeads();
        return ResponseEntity.ok(heads);
    }

    @PostMapping("/structures")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create Fee Structure", description = "Constructs a fee structure blueprint with line items for a batch")
    public ResponseEntity<FeeStructureResponseDTO> createFeeStructure(@Valid @RequestBody FeeStructureRequestDTO request) {
        FeeStructureResponseDTO created = financeService.createFeeStructure(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/structures")
    @Operation(summary = "List Fee Structures", description = "Retrieves all fee structure blueprints for the tenant")
    public ResponseEntity<List<FeeStructureResponseDTO>> getFeeStructures() {
        List<FeeStructureResponseDTO> structures = financeService.getFeeStructures();
        return ResponseEntity.ok(structures);
    }

    @GetMapping("/structures/batch/{batchId}")
    @Operation(summary = "Get Fee Structures by Batch", description = "Retrieves fee structure blueprints configured for a batch")
    public ResponseEntity<List<FeeStructureResponseDTO>> getFeeStructuresByBatch(@PathVariable Long batchId) {
        List<FeeStructureResponseDTO> structures = financeService.getFeeStructuresByBatch(batchId);
        return ResponseEntity.ok(structures);
    }

    @PostMapping("/invoices/batch")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Generate Invoices for Batch", description = "Generates student fee invoices for all active students in a batch")
    public ResponseEntity<List<StudentInvoiceResponseDTO>> generateInvoicesForBatch(
            @Valid @RequestBody BatchInvoiceRequestDTO request) {
        List<StudentInvoiceResponseDTO> invoices = financeService.generateInvoicesForBatch(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(invoices);
    }

    @PostMapping("/payments")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Record Payment", description = "Applies a fee payment transaction against a student invoice")
    public ResponseEntity<PaymentResponseDTO> recordPayment(@Valid @RequestBody PaymentRequestDTO request) {
        PaymentResponseDTO response = financeService.recordPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/ledger/student/{enrollmentNumber}")
    @Operation(summary = "Get Student Ledger", description = "Retrieves complete invoice and payment history for a student")
    public ResponseEntity<StudentLedgerResponseDTO> getStudentLedger(@PathVariable String enrollmentNumber) {
        StudentLedgerResponseDTO ledger = financeService.getStudentLedger(enrollmentNumber);
        return ResponseEntity.ok(ledger);
    }

    @GetMapping("/invoices/student/{studentId}")
    @Operation(summary = "Get Invoices by Student ID", description = "Retrieves all invoices generated for a student record")
    public ResponseEntity<List<StudentInvoiceResponseDTO>> getInvoicesByStudent(@PathVariable Long studentId) {
        List<StudentInvoiceResponseDTO> invoices = financeService.getInvoicesByStudent(studentId);
        return ResponseEntity.ok(invoices);
    }
}
