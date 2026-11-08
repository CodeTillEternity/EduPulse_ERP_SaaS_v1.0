package com.edupulse.core.domain.finance.service;

import com.edupulse.core.domain.finance.dto.BatchInvoiceRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeHeadRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeHeadResponseDTO;
import com.edupulse.core.domain.finance.dto.FeeStructureRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeStructureResponseDTO;
import com.edupulse.core.domain.finance.dto.PaymentRequestDTO;
import com.edupulse.core.domain.finance.dto.PaymentResponseDTO;
import com.edupulse.core.domain.finance.dto.StudentInvoiceResponseDTO;
import com.edupulse.core.domain.finance.dto.StudentLedgerResponseDTO;

import java.util.List;

/**
 * High-level business service interface for Student Finance management:
 * Fee heads, Fee structure blueprints, Batch invoicing, Payment recording, and Student ledgers.
 */
public interface FinanceService {

    FeeHeadResponseDTO createFeeHead(FeeHeadRequestDTO request);

    List<FeeHeadResponseDTO> getFeeHeads();

    FeeStructureResponseDTO createFeeStructure(FeeStructureRequestDTO request);

    List<FeeStructureResponseDTO> getFeeStructures();

    List<FeeStructureResponseDTO> getFeeStructuresByBatch(Long batchId);

    List<StudentInvoiceResponseDTO> generateInvoicesForBatch(Long batchId, Long feeStructureId);

    List<StudentInvoiceResponseDTO> generateInvoicesForBatch(BatchInvoiceRequestDTO request);

    PaymentResponseDTO recordPayment(PaymentRequestDTO request);

    StudentLedgerResponseDTO getStudentLedger(String enrollmentNumber);

    List<StudentInvoiceResponseDTO> getInvoicesByStudent(Long studentId);
}
