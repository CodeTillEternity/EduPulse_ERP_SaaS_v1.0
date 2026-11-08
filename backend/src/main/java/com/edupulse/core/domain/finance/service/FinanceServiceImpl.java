package com.edupulse.core.domain.finance.service;

import com.edupulse.core.domain.academic.Batch;
import com.edupulse.core.domain.academic.repository.BatchRepository;
import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.finance.FeeHead;
import com.edupulse.core.domain.finance.FeePayment;
import com.edupulse.core.domain.finance.FeeStructure;
import com.edupulse.core.domain.finance.FeeStructureItem;
import com.edupulse.core.domain.finance.InvoiceStatus;
import com.edupulse.core.domain.finance.StudentInvoice;
import com.edupulse.core.domain.finance.dto.BatchInvoiceRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeHeadRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeHeadResponseDTO;
import com.edupulse.core.domain.finance.dto.FeeStructureItemRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeStructureItemResponseDTO;
import com.edupulse.core.domain.finance.dto.FeeStructureRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeStructureResponseDTO;
import com.edupulse.core.domain.finance.dto.PaymentRequestDTO;
import com.edupulse.core.domain.finance.dto.PaymentResponseDTO;
import com.edupulse.core.domain.finance.dto.StudentInvoiceResponseDTO;
import com.edupulse.core.domain.finance.dto.StudentLedgerResponseDTO;
import com.edupulse.core.domain.finance.repository.FeeHeadRepository;
import com.edupulse.core.domain.finance.repository.FeePaymentRepository;
import com.edupulse.core.domain.finance.repository.FeeStructureItemRepository;
import com.edupulse.core.domain.finance.repository.FeeStructureRepository;
import com.edupulse.core.domain.finance.repository.StudentInvoiceRepository;
import com.edupulse.core.domain.student.EnrollmentStatus;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Enterprise service implementation managing fee heads, structures, batch invoicing,
 * student ledger calculations, and payment collection.
 */
@Service("coreFinanceService")
public class FinanceServiceImpl implements FinanceService {

    private final FeeHeadRepository feeHeadRepository;
    private final FeeStructureRepository feeStructureRepository;
    private final FeeStructureItemRepository feeStructureItemRepository;
    private final StudentInvoiceRepository studentInvoiceRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final StudentRepository studentRepository;
    private final BatchRepository batchRepository;

    public FinanceServiceImpl(
            @Qualifier("coreFeeHeadRepository") FeeHeadRepository feeHeadRepository,
            @Qualifier("coreFeeStructureRepository") FeeStructureRepository feeStructureRepository,
            @Qualifier("coreFeeStructureItemRepository") FeeStructureItemRepository feeStructureItemRepository,
            @Qualifier("coreStudentInvoiceRepository") StudentInvoiceRepository studentInvoiceRepository,
            @Qualifier("coreFeePaymentRepository") FeePaymentRepository feePaymentRepository,
            @Qualifier("coreStudentRepository") StudentRepository studentRepository,
            @Qualifier("coreBatchRepository") BatchRepository batchRepository) {
        this.feeHeadRepository = feeHeadRepository;
        this.feeStructureRepository = feeStructureRepository;
        this.feeStructureItemRepository = feeStructureItemRepository;
        this.studentInvoiceRepository = studentInvoiceRepository;
        this.feePaymentRepository = feePaymentRepository;
        this.studentRepository = studentRepository;
        this.batchRepository = batchRepository;
    }

    private String getRequiredTenantId() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            throw new IllegalStateException("Tenant context is not established for the current request");
        }
        return tenantId;
    }

    @Override
    @Transactional
    public FeeHeadResponseDTO createFeeHead(FeeHeadRequestDTO request) {
        String tenantId = getRequiredTenantId();

        feeHeadRepository.findByNameAndTenantId(request.getName(), tenantId).ifPresent(existing -> {
            throw new IllegalArgumentException("Fee head with name '" + request.getName() + "' already exists");
        });

        FeeHead feeHead = new FeeHead();
        feeHead.setName(request.getName());
        feeHead.setDescription(request.getDescription());
        feeHead.setActive(request.getActive() != null ? request.getActive() : true);

        FeeHead saved = feeHeadRepository.save(feeHead);
        return mapToFeeHeadResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeeHeadResponseDTO> getFeeHeads() {
        String tenantId = getRequiredTenantId();
        return feeHeadRepository.findByTenantId(tenantId)
                .stream()
                .map(this::mapToFeeHeadResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FeeStructureResponseDTO createFeeStructure(FeeStructureRequestDTO request) {
        String tenantId = getRequiredTenantId();

        Batch batch = batchRepository.findByIdAndTenantId(request.getBatchId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Academic Batch with ID " + request.getBatchId() + " not found"));

        FeeStructure feeStructure = new FeeStructure();
        feeStructure.setName(request.getName());
        feeStructure.setBatch(batch);

        BigDecimal calculatedTotal = BigDecimal.ZERO;
        List<FeeStructureItem> structureItems = new ArrayList<>();

        for (FeeStructureItemRequestDTO itemDTO : request.getItems()) {
            FeeHead feeHead = feeHeadRepository.findByIdAndTenantId(itemDTO.getFeeHeadId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("FeeHead with ID " + itemDTO.getFeeHeadId() + " not found"));

            FeeStructureItem item = new FeeStructureItem();
            item.setFeeHead(feeHead);
            item.setAmount(itemDTO.getAmount());
            feeStructure.addItem(item);
            structureItems.add(item);

            calculatedTotal = calculatedTotal.add(itemDTO.getAmount());
        }

        feeStructure.setTotalAmount(calculatedTotal);
        FeeStructure saved = feeStructureRepository.save(feeStructure);

        return mapToFeeStructureResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeeStructureResponseDTO> getFeeStructures() {
        String tenantId = getRequiredTenantId();
        return feeStructureRepository.findByTenantId(tenantId)
                .stream()
                .map(this::mapToFeeStructureResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeeStructureResponseDTO> getFeeStructuresByBatch(Long batchId) {
        String tenantId = getRequiredTenantId();
        return feeStructureRepository.findByBatchIdAndTenantId(batchId, tenantId)
                .stream()
                .map(this::mapToFeeStructureResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<StudentInvoiceResponseDTO> generateInvoicesForBatch(Long batchId, Long feeStructureId) {
        BatchInvoiceRequestDTO request = BatchInvoiceRequestDTO.builder()
                .batchId(batchId)
                .feeStructureId(feeStructureId)
                .dueDate(LocalDate.now().plusDays(30))
                .discount(BigDecimal.ZERO)
                .build();
        return generateInvoicesForBatch(request);
    }

    @Override
    @Transactional
    public List<StudentInvoiceResponseDTO> generateInvoicesForBatch(BatchInvoiceRequestDTO request) {
        String tenantId = getRequiredTenantId();

        FeeStructure feeStructure = feeStructureRepository.findByIdAndTenantId(request.getFeeStructureId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("FeeStructure with ID " + request.getFeeStructureId() + " not found"));

        Batch batch = batchRepository.findByIdAndTenantId(request.getBatchId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Batch with ID " + request.getBatchId() + " not found"));

        List<Student> students = studentRepository.findByBatchIdAndTenantId(batch.getId(), tenantId);

        List<StudentInvoice> createdInvoices = new ArrayList<>();
        LocalDate effectiveDueDate = request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(30);
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal gross = feeStructure.getTotalAmount();
        BigDecimal net = gross.subtract(discount);
        if (net.compareTo(BigDecimal.ZERO) < 0) {
            net = BigDecimal.ZERO;
        }

        for (Student student : students) {
            if (student.getStatus() != null && student.getStatus() != EnrollmentStatus.ACTIVE) {
                continue; // Skip suspended or alumni students
            }

            // Check if invoice already exists for this student and structure
            boolean alreadyInvoiced = studentInvoiceRepository.existsByStudentIdAndFeeStructureIdAndTenantId(
                    student.getId(), feeStructure.getId(), tenantId);

            if (alreadyInvoiced) {
                continue;
            }

            String invoiceNumber = String.format("INV-%d-%04d-%04d",
                    LocalDate.now().getYear(),
                    student.getId(),
                    (int) (Math.random() * 9000) + 1000);

            StudentInvoice invoice = new StudentInvoice();
            invoice.setInvoiceNumber(invoiceNumber);
            invoice.setStudent(student);
            invoice.setFeeStructure(feeStructure);
            invoice.setGrossAmount(gross);
            invoice.setDiscount(discount);
            invoice.setNetAmount(net);
            invoice.setAmountPaid(BigDecimal.ZERO);
            invoice.setDueDate(effectiveDueDate);
            invoice.setStatus(InvoiceStatus.UNPAID);

            createdInvoices.add(studentInvoiceRepository.save(invoice));
        }

        return createdInvoices.stream()
                .map(this::mapToStudentInvoiceResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PaymentResponseDTO recordPayment(PaymentRequestDTO request) {
        String tenantId = getRequiredTenantId();

        StudentInvoice invoice = studentInvoiceRepository.findByIdAndTenantId(request.getInvoiceId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Student invoice with ID " + request.getInvoiceId() + " not found"));

        BigDecimal outstanding = invoice.getOutstandingBalance();
        if (outstanding.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Invoice " + invoice.getInvoiceNumber() + " is already fully paid");
        }

        if (request.getAmount().compareTo(outstanding) > 0) {
            throw new IllegalArgumentException("Payment amount (" + request.getAmount() +
                    ") exceeds outstanding invoice balance (" + outstanding + ")");
        }

        String refNumber = (request.getReferenceNumber() != null && !request.getReferenceNumber().isBlank())
                ? request.getReferenceNumber()
                : "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        FeePayment payment = new FeePayment();
        payment.setStudentInvoice(invoice);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod().toUpperCase());
        payment.setReferenceNumber(refNumber);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setNotes(request.getNotes());

        FeePayment savedPayment = feePaymentRepository.save(payment);

        // Update invoice balance and status
        invoice.applyPayment(request.getAmount());
        StudentInvoice updatedInvoice = studentInvoiceRepository.save(invoice);

        return PaymentResponseDTO.builder()
                .id(savedPayment.getId())
                .invoiceId(updatedInvoice.getId())
                .invoiceNumber(updatedInvoice.getInvoiceNumber())
                .amount(savedPayment.getAmount())
                .paymentMethod(savedPayment.getPaymentMethod())
                .referenceNumber(savedPayment.getReferenceNumber())
                .paymentDate(savedPayment.getPaymentDate())
                .notes(savedPayment.getNotes())
                .remainingInvoiceBalance(updatedInvoice.getOutstandingBalance())
                .invoiceStatus(updatedInvoice.getStatus())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentLedgerResponseDTO getStudentLedger(String enrollmentNumber) {
        String tenantId = getRequiredTenantId();

        Student student = studentRepository.findByEnrollmentNumberAndTenantId(enrollmentNumber, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Student with enrollment number '" + enrollmentNumber + "' not found"));

        List<StudentInvoice> invoices = studentInvoiceRepository.findByStudentIdAndTenantId(student.getId(), tenantId);

        List<StudentInvoiceResponseDTO> invoiceDTOs = invoices.stream()
                .map(this::mapToStudentInvoiceResponse)
                .collect(Collectors.toList());

        List<PaymentResponseDTO> paymentDTOs = new ArrayList<>();
        BigDecimal totalInvoiced = BigDecimal.ZERO;
        BigDecimal totalPaid = BigDecimal.ZERO;

        for (StudentInvoice inv : invoices) {
            totalInvoiced = totalInvoiced.add(inv.getNetAmount());
            totalPaid = totalPaid.add(inv.getAmountPaid());

            List<FeePayment> payments = feePaymentRepository.findByStudentInvoiceIdAndTenantId(inv.getId(), tenantId);
            for (FeePayment p : payments) {
                paymentDTOs.add(PaymentResponseDTO.builder()
                        .id(p.getId())
                        .invoiceId(inv.getId())
                        .invoiceNumber(inv.getInvoiceNumber())
                        .amount(p.getAmount())
                        .paymentMethod(p.getPaymentMethod())
                        .referenceNumber(p.getReferenceNumber())
                        .paymentDate(p.getPaymentDate())
                        .notes(p.getNotes())
                        .remainingInvoiceBalance(inv.getOutstandingBalance())
                        .invoiceStatus(inv.getStatus())
                        .build());
            }
        }

        BigDecimal totalOutstanding = totalInvoiced.subtract(totalPaid);
        if (totalOutstanding.compareTo(BigDecimal.ZERO) < 0) {
            totalOutstanding = BigDecimal.ZERO;
        }

        String batchName = student.getBatch() != null ? student.getBatch().getName() : "N/A";

        return StudentLedgerResponseDTO.builder()
                .studentId(student.getId())
                .studentName(student.getFirstName() + " " + student.getLastName())
                .enrollmentNumber(student.getEnrollmentNumber())
                .email(student.getEmail())
                .batchName(batchName)
                .totalInvoiced(totalInvoiced)
                .totalPaid(totalPaid)
                .totalOutstanding(totalOutstanding)
                .invoices(invoiceDTOs)
                .payments(paymentDTOs)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentInvoiceResponseDTO> getInvoicesByStudent(Long studentId) {
        String tenantId = getRequiredTenantId();
        return studentInvoiceRepository.findByStudentIdAndTenantId(studentId, tenantId)
                .stream()
                .map(this::mapToStudentInvoiceResponse)
                .collect(Collectors.toList());
    }

    private FeeHeadResponseDTO mapToFeeHeadResponse(FeeHead head) {
        return FeeHeadResponseDTO.builder()
                .id(head.getId())
                .name(head.getName())
                .description(head.getDescription())
                .active(head.getActive())
                .createdAt(head.getCreatedAt())
                .build();
    }

    private FeeStructureResponseDTO mapToFeeStructureResponse(FeeStructure structure) {
        List<FeeStructureItemResponseDTO> items = (structure.getItems() != null)
                ? structure.getItems().stream()
                .map(item -> FeeStructureItemResponseDTO.builder()
                        .id(item.getId())
                        .feeHeadId(item.getFeeHead() != null ? item.getFeeHead().getId() : null)
                        .feeHeadName(item.getFeeHead() != null ? item.getFeeHead().getName() : null)
                        .amount(item.getAmount())
                        .build())
                .collect(Collectors.toList())
                : Collections.emptyList();

        String batchName = structure.getBatch() != null ? structure.getBatch().getName() : "Batch #" + structure.getBatch().getId();

        return FeeStructureResponseDTO.builder()
                .id(structure.getId())
                .name(structure.getName())
                .batchId(structure.getBatch() != null ? structure.getBatch().getId() : null)
                .batchName(batchName)
                .totalAmount(structure.getTotalAmount())
                .items(items)
                .createdAt(structure.getCreatedAt())
                .build();
    }

    private StudentInvoiceResponseDTO mapToStudentInvoiceResponse(StudentInvoice invoice) {
        String studentName = (invoice.getStudent() != null)
                ? invoice.getStudent().getFirstName() + " " + invoice.getStudent().getLastName()
                : "Student #" + invoice.getStudent().getId();

        String enrollmentNo = (invoice.getStudent() != null)
                ? invoice.getStudent().getEnrollmentNumber()
                : "ENR-UNKNOWN";

        String structureName = (invoice.getFeeStructure() != null)
                ? invoice.getFeeStructure().getName()
                : "Standard Fee Blueprint";

        return StudentInvoiceResponseDTO.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .studentId(invoice.getStudent() != null ? invoice.getStudent().getId() : null)
                .studentName(studentName)
                .studentEnrollmentNumber(enrollmentNo)
                .feeStructureId(invoice.getFeeStructure() != null ? invoice.getFeeStructure().getId() : null)
                .feeStructureName(structureName)
                .grossAmount(invoice.getGrossAmount())
                .discount(invoice.getDiscount())
                .netAmount(invoice.getNetAmount())
                .amountPaid(invoice.getAmountPaid())
                .outstandingBalance(invoice.getOutstandingBalance())
                .dueDate(invoice.getDueDate())
                .status(invoice.getStatus())
                .createdAt(invoice.getCreatedAt())
                .build();
    }
}
