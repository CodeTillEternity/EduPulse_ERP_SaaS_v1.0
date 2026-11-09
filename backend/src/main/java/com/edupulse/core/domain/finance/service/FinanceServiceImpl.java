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
import com.edupulse.core.domain.billing.repository.TenantSubscriptionRepository;
import com.edupulse.core.domain.finance.dto.BrandedDocumentDTO;
import com.edupulse.core.domain.finance.event.InvoiceGeneratedEvent;
import com.edupulse.core.domain.finance.event.PaymentSuccessEvent;
import com.edupulse.core.domain.finance.repository.FeeStructureItemRepository;
import com.edupulse.core.domain.finance.repository.FeeStructureRepository;
import com.edupulse.core.domain.finance.repository.StudentInvoiceRepository;
import com.edupulse.core.domain.student.EnrollmentStatus;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.repository.StudentRepository;
import com.erp.multitenancy.dto.TenantBrandingDTO;
import com.erp.multitenancy.service.TenantBrandingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

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
    private final TenantBrandingService tenantBrandingService;
    private final TenantSubscriptionRepository tenantSubscriptionRepository;
    private final ApplicationEventPublisher eventPublisher;

    public FinanceServiceImpl(
            @Qualifier("coreFeeHeadRepository") FeeHeadRepository feeHeadRepository,
            @Qualifier("coreFeeStructureRepository") FeeStructureRepository feeStructureRepository,
            @Qualifier("coreFeeStructureItemRepository") FeeStructureItemRepository feeStructureItemRepository,
            @Qualifier("coreStudentInvoiceRepository") StudentInvoiceRepository studentInvoiceRepository,
            @Qualifier("coreFeePaymentRepository") FeePaymentRepository feePaymentRepository,
            @Qualifier("coreStudentRepository") StudentRepository studentRepository,
            @Qualifier("coreBatchRepository") BatchRepository batchRepository) {
        this(feeHeadRepository, feeStructureRepository, feeStructureItemRepository,
             studentInvoiceRepository, feePaymentRepository, studentRepository, batchRepository,
             null, null, null);
    }

    public FinanceServiceImpl(
            @Qualifier("coreFeeHeadRepository") FeeHeadRepository feeHeadRepository,
            @Qualifier("coreFeeStructureRepository") FeeStructureRepository feeStructureRepository,
            @Qualifier("coreFeeStructureItemRepository") FeeStructureItemRepository feeStructureItemRepository,
            @Qualifier("coreStudentInvoiceRepository") StudentInvoiceRepository studentInvoiceRepository,
            @Qualifier("coreFeePaymentRepository") FeePaymentRepository feePaymentRepository,
            @Qualifier("coreStudentRepository") StudentRepository studentRepository,
            @Qualifier("coreBatchRepository") BatchRepository batchRepository,
            TenantBrandingService tenantBrandingService,
            TenantSubscriptionRepository tenantSubscriptionRepository) {
        this(feeHeadRepository, feeStructureRepository, feeStructureItemRepository,
             studentInvoiceRepository, feePaymentRepository, studentRepository, batchRepository,
             tenantBrandingService, tenantSubscriptionRepository, null);
    }

    @Autowired
    public FinanceServiceImpl(
            @Qualifier("coreFeeHeadRepository") FeeHeadRepository feeHeadRepository,
            @Qualifier("coreFeeStructureRepository") FeeStructureRepository feeStructureRepository,
            @Qualifier("coreFeeStructureItemRepository") FeeStructureItemRepository feeStructureItemRepository,
            @Qualifier("coreStudentInvoiceRepository") StudentInvoiceRepository studentInvoiceRepository,
            @Qualifier("coreFeePaymentRepository") FeePaymentRepository feePaymentRepository,
            @Qualifier("coreStudentRepository") StudentRepository studentRepository,
            @Qualifier("coreBatchRepository") BatchRepository batchRepository,
            @Autowired(required = false) TenantBrandingService tenantBrandingService,
            @Autowired(required = false) @Qualifier("coreBillingTenantSubscriptionRepository") TenantSubscriptionRepository tenantSubscriptionRepository,
            @Autowired(required = false) ApplicationEventPublisher eventPublisher) {
        this.feeHeadRepository = feeHeadRepository;
        this.feeStructureRepository = feeStructureRepository;
        this.feeStructureItemRepository = feeStructureItemRepository;
        this.studentInvoiceRepository = studentInvoiceRepository;
        this.feePaymentRepository = feePaymentRepository;
        this.studentRepository = studentRepository;
        this.batchRepository = batchRepository;
        this.tenantBrandingService = tenantBrandingService;
        this.tenantSubscriptionRepository = tenantSubscriptionRepository;
        this.eventPublisher = eventPublisher;
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

        if (eventPublisher != null) {
            for (StudentInvoice invoice : createdInvoices) {
                String studentName = invoice.getStudent() != null
                        ? invoice.getStudent().getFirstName() + " " + invoice.getStudent().getLastName()
                        : "Student";
                String studentEmail = invoice.getStudent() != null ? invoice.getStudent().getEmail() : null;
                Long studentId = invoice.getStudent() != null ? invoice.getStudent().getId() : null;

                eventPublisher.publishEvent(new InvoiceGeneratedEvent(
                        invoice.getId(),
                        invoice.getInvoiceNumber(),
                        studentId,
                        studentName,
                        studentEmail,
                        invoice.getNetAmount(),
                        invoice.getDueDate(),
                        tenantId
                ));
            }
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

        if (eventPublisher != null) {
            Long studentId = updatedInvoice.getStudent() != null ? updatedInvoice.getStudent().getId() : null;
            eventPublisher.publishEvent(new PaymentSuccessEvent(
                    savedPayment.getId(),
                    updatedInvoice.getId(),
                    updatedInvoice.getInvoiceNumber(),
                    studentId,
                    savedPayment.getReferenceNumber(),
                    savedPayment.getAmount(),
                    savedPayment.getPaymentMethod(),
                    savedPayment.getPaymentDate(),
                    tenantId
            ));
        }

        TenantBrandingDTO branding = resolveBranding(tenantId);
        boolean watermarkRemoved = isHigherTierSubscriber(tenantId);

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
                .institutionName(branding.institutionName())
                .logoUrl(branding.logoUrl())
                .primaryColorHex(branding.primaryColorHex())
                .watermarkRemoved(watermarkRemoved)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentLedgerResponseDTO getStudentLedger(String enrollmentNumber) {
        String tenantId = getRequiredTenantId();
        TenantBrandingDTO branding = resolveBranding(tenantId);
        boolean watermarkRemoved = isHigherTierSubscriber(tenantId);

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
                        .institutionName(branding.institutionName())
                        .logoUrl(branding.logoUrl())
                        .primaryColorHex(branding.primaryColorHex())
                        .watermarkRemoved(watermarkRemoved)
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

    @Override
    @Transactional(readOnly = true)
    public Page<StudentInvoiceResponseDTO> getInvoices(int page, int size, String search, String status, String sortBy, String sortDir) {
        String tenantId = getRequiredTenantId();
        String validSortBy = (sortBy != null && !sortBy.isBlank()) ? sortBy : "createdAt";
        if ("studentName".equalsIgnoreCase(validSortBy) || "feeStructureName".equalsIgnoreCase(validSortBy)) {
            validSortBy = "createdAt";
        }
        Sort sort = Sort.by("asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC, validSortBy);
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), sort);

        Page<StudentInvoice> invoicePage;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            try {
                InvoiceStatus invoiceStatus = InvoiceStatus.valueOf(status.toUpperCase());
                invoicePage = studentInvoiceRepository.findByTenantIdAndStatus(tenantId, invoiceStatus, pageable);
            } catch (IllegalArgumentException e) {
                invoicePage = studentInvoiceRepository.findByTenantId(tenantId, pageable);
            }
        } else {
            invoicePage = studentInvoiceRepository.findByTenantId(tenantId, pageable);
        }
        return invoicePage.map(this::mapToStudentInvoiceResponse);
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

        TenantBrandingDTO branding = resolveBranding(invoice.getTenantId() != null ? invoice.getTenantId() : getRequiredTenantId());
        boolean watermarkRemoved = isHigherTierSubscriber(invoice.getTenantId() != null ? invoice.getTenantId() : getRequiredTenantId());

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
                .institutionName(branding.institutionName())
                .logoUrl(branding.logoUrl())
                .primaryColorHex(branding.primaryColorHex())
                .watermarkRemoved(watermarkRemoved)
                .build();
    }

    private TenantBrandingDTO resolveBranding(String tenantId) {
        if (tenantBrandingService != null) {
            return tenantBrandingService.getBrandingByTenantId(tenantId)
                    .orElseGet(() -> new TenantBrandingDTO(
                            tenantId,
                            "EduPulse Institution",
                            tenantId,
                            null,
                            null,
                            "#0F172A",
                            "#38BDF8"
                    ));
        }
        return new TenantBrandingDTO(
                tenantId,
                "EduPulse Institution",
                tenantId,
                null,
                null,
                "#0F172A",
                "#38BDF8"
        );
    }

    private boolean isHigherTierSubscriber(String tenantId) {
        if (tenantSubscriptionRepository == null) {
            return false;
        }
        return tenantSubscriptionRepository.findByTenantId(tenantId)
                .map(sub -> {
                    if (sub.getPlan() == null || sub.getPlan().getName() == null) {
                        return false;
                    }
                    String plan = sub.getPlan().getName().trim().toUpperCase();
                    return plan.contains("ENTERPRISE") || plan.contains("PRO") || plan.contains("GROWTH") || plan.contains("PREMIUM");
                })
                .orElse(false);
    }

    @Override
    @Transactional(readOnly = true)
    public BrandedDocumentDTO generateInvoiceDocument(Long invoiceId) {
        String tenantId = getRequiredTenantId();
        StudentInvoice invoice = studentInvoiceRepository.findByIdAndTenantId(invoiceId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Student invoice with ID " + invoiceId + " not found"));

        TenantBrandingDTO branding = resolveBranding(tenantId);
        boolean watermarkRemoved = isHigherTierSubscriber(tenantId);

        String studentName = (invoice.getStudent() != null)
                ? invoice.getStudent().getFirstName() + " " + invoice.getStudent().getLastName()
                : "Student #" + invoice.getStudent().getId();
        String enrollmentNo = (invoice.getStudent() != null)
                ? invoice.getStudent().getEnrollmentNumber()
                : "ENR-UNKNOWN";

        String primaryColor = (branding.primaryColorHex() != null && !branding.primaryColorHex().isBlank())
                ? branding.primaryColorHex() : "#0F172A";
        String secondaryColor = (branding.secondaryColorHex() != null && !branding.secondaryColorHex().isBlank())
                ? branding.secondaryColorHex() : "#38BDF8";
        String institution = (branding.institutionName() != null && !branding.institutionName().isBlank())
                ? branding.institutionName() : "EduPulse Institutional Academy";

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'>");
        html.append("<title>Fee Invoice - ").append(invoice.getInvoiceNumber()).append("</title>");
        html.append("<style>");
        html.append("body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 40px; background: #ffffff; }");
        html.append(".invoice-card { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: relative; overflow: hidden; }");
        html.append(".header-bar { height: 6px; background: ").append(primaryColor).append("; position: absolute; top: 0; left: 0; right: 0; }");
        html.append(".logo { max-height: 55px; max-width: 180px; object-fit: contain; margin-bottom: 8px; }");
        html.append(".inst-title { color: ").append(primaryColor).append("; font-size: 22px; font-weight: 800; margin: 0; }");
        html.append(".doc-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; background: ").append(primaryColor).append("15; color: ").append(primaryColor).append("; }");
        html.append(".grid { display: flex; justify-content: space-between; margin-top: 30px; }");
        html.append(".col { flex: 1; }");
        html.append(".label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 4px; }");
        html.append(".val { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }");
        html.append("table { width: 100%; border-collapse: collapse; margin-top: 30px; }");
        html.append("th { background-color: ").append(primaryColor).append("; color: #ffffff; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }");
        html.append("td { padding: 14px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }");
        html.append(".total-row td { font-weight: bold; font-size: 15px; border-top: 2px solid ").append(primaryColor).append("; }");
        html.append(".watermark { text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #94a3b8; font-weight: 500; }");
        html.append("</style></head><body>");
        html.append("<div class='invoice-card'>");
        html.append("<div class='header-bar'></div>");
        html.append("<div style='display:flex; justify-content:space-between; align-items:flex-start;'>");
        html.append("<div>");
        if (branding.logoUrl() != null && !branding.logoUrl().isBlank()) {
            html.append("<img src='").append(branding.logoUrl()).append("' class='logo' alt='Institution Logo'/>");
        }
        html.append("<h1 class='inst-title'>").append(institution).append("</h1>");
        html.append("<div style='color:#64748b; font-size:12px; margin-top:2px;'>Institutional Financial Ledger Service</div>");
        html.append("</div>");
        html.append("<div style='text-align:right;'>");
        html.append("<div class='doc-badge'>OFFICIAL INVOICE</div>");
        html.append("<div style='font-size:18px; font-weight:800; margin-top:8px;'>").append(invoice.getInvoiceNumber()).append("</div>");
        html.append("<div style='font-size:12px; color:#64748b;'>Issued: ").append(invoice.getCreatedAt() != null ? invoice.getCreatedAt().toLocalDate() : LocalDate.now()).append("</div>");
        html.append("</div>");
        html.append("</div>");

        html.append("<div class='grid'>");
        html.append("<div class='col'>");
        html.append("<div class='label'>Billed Student</div>");
        html.append("<div class='val'>").append(studentName).append("</div>");
        html.append("<div class='label'>Enrollment ID</div>");
        html.append("<div class='val'>").append(enrollmentNo).append("</div>");
        html.append("</div>");
        html.append("<div class='col' style='text-align:right;'>");
        html.append("<div class='label'>Fee Blueprint</div>");
        html.append("<div class='val'>").append(invoice.getFeeStructure() != null ? invoice.getFeeStructure().getName() : "Standard Blueprint").append("</div>");
        html.append("<div class='label'>Due Date</div>");
        html.append("<div class='val' style='color:#dc2626;'>").append(invoice.getDueDate()).append("</div>");
        html.append("</div>");
        html.append("</div>");

        html.append("<table>");
        html.append("<thead><tr><th>Description</th><th style='text-align:right;'>Amount</th></tr></thead>");
        html.append("<tbody>");
        html.append("<tr><td>Gross Fee Assessment</td><td style='text-align:right;'>₹").append(invoice.getGrossAmount()).append("</td></tr>");
        if (invoice.getDiscount() != null && invoice.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            html.append("<tr><td style='color:#16a34a;'>Scholarship / Concession Discount</td><td style='text-align:right; color:#16a34a;'>- ₹").append(invoice.getDiscount()).append("</td></tr>");
        }
        html.append("<tr><td>Amount Paid to Date</td><td style='text-align:right;'>₹").append(invoice.getAmountPaid()).append("</td></tr>");
        html.append("<tr class='total-row'><td>Net Outstanding Balance</td><td style='text-align:right; color:").append(primaryColor).append(";'>₹").append(invoice.getOutstandingBalance()).append("</td></tr>");
        html.append("</tbody></table>");

        if (!watermarkRemoved) {
            html.append("<div class='watermark'>Powered by EduPulse ERP • Unified Institutional Multi-Tenant SaaS Platform</div>");
        }
        html.append("</div></body></html>");

        return BrandedDocumentDTO.builder()
                .documentType("FEE_INVOICE")
                .documentNumber(invoice.getInvoiceNumber())
                .tenantId(tenantId)
                .institutionName(institution)
                .logoUrl(branding.logoUrl())
                .primaryColorHex(primaryColor)
                .secondaryColorHex(secondaryColor)
                .watermarkRemoved(watermarkRemoved)
                .studentName(studentName)
                .studentEnrollmentNumber(enrollmentNo)
                .amount(invoice.getOutstandingBalance())
                .documentDate(invoice.getCreatedAt() != null ? invoice.getCreatedAt().toLocalDate() : LocalDate.now())
                .htmlContent(html.toString())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public String generateInvoiceDocumentHtml(Long invoiceId) {
        return generateInvoiceDocument(invoiceId).getHtmlContent();
    }

    @Override
    @Transactional(readOnly = true)
    public BrandedDocumentDTO generatePaymentReceiptDocument(Long paymentId) {
        String tenantId = getRequiredTenantId();
        FeePayment payment = feePaymentRepository.findByIdAndTenantId(paymentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Payment transaction with ID " + paymentId + " not found"));

        StudentInvoice invoice = payment.getStudentInvoice();
        Student student = (invoice != null) ? invoice.getStudent() : null;

        TenantBrandingDTO branding = resolveBranding(tenantId);
        boolean watermarkRemoved = isHigherTierSubscriber(tenantId);

        String studentName = (student != null)
                ? student.getFirstName() + " " + student.getLastName()
                : "Student Record";
        String enrollmentNo = (student != null)
                ? student.getEnrollmentNumber()
                : "ENR-UNKNOWN";

        String primaryColor = (branding.primaryColorHex() != null && !branding.primaryColorHex().isBlank())
                ? branding.primaryColorHex() : "#0F172A";
        String secondaryColor = (branding.secondaryColorHex() != null && !branding.secondaryColorHex().isBlank())
                ? branding.secondaryColorHex() : "#38BDF8";
        String institution = (branding.institutionName() != null && !branding.institutionName().isBlank())
                ? branding.institutionName() : "EduPulse Institutional Academy";

        String receiptNumber = "RCP-" + payment.getId();

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'>");
        html.append("<title>Payment Receipt - ").append(receiptNumber).append("</title>");
        html.append("<style>");
        html.append("body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 40px; background: #ffffff; }");
        html.append(".receipt-card { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: relative; overflow: hidden; }");
        html.append(".header-bar { height: 6px; background: ").append(primaryColor).append("; position: absolute; top: 0; left: 0; right: 0; }");
        html.append(".logo { max-height: 55px; max-width: 180px; object-fit: contain; margin-bottom: 8px; }");
        html.append(".inst-title { color: ").append(primaryColor).append("; font-size: 22px; font-weight: 800; margin: 0; }");
        html.append(".doc-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; background: #16a34a18; color: #16a34a; }");
        html.append(".grid { display: flex; justify-content: space-between; margin-top: 30px; }");
        html.append(".col { flex: 1; }");
        html.append(".label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 4px; }");
        html.append(".val { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }");
        html.append("table { width: 100%; border-collapse: collapse; margin-top: 30px; }");
        html.append("th { background-color: ").append(primaryColor).append("; color: #ffffff; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }");
        html.append("td { padding: 14px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }");
        html.append(".watermark { text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #94a3b8; font-weight: 500; }");
        html.append("</style></head><body>");
        html.append("<div class='receipt-card'>");
        html.append("<div class='header-bar'></div>");
        html.append("<div style='display:flex; justify-content:space-between; align-items:flex-start;'>");
        html.append("<div>");
        if (branding.logoUrl() != null && !branding.logoUrl().isBlank()) {
            html.append("<img src='").append(branding.logoUrl()).append("' class='logo' alt='Institution Logo'/>");
        }
        html.append("<h1 class='inst-title'>").append(institution).append("</h1>");
        html.append("<div style='color:#64748b; font-size:12px; margin-top:2px;'>Institutional Financial Ledger Service</div>");
        html.append("</div>");
        html.append("<div style='text-align:right;'>");
        html.append("<div class='doc-badge'>OFFICIAL PAYMENT RECEIPT</div>");
        html.append("<div style='font-size:18px; font-weight:800; margin-top:8px;'>").append(receiptNumber).append("</div>");
        html.append("<div style='font-size:12px; color:#64748b;'>Date: ").append(payment.getPaymentDate() != null ? payment.getPaymentDate().toLocalDate() : LocalDate.now()).append("</div>");
        html.append("</div>");
        html.append("</div>");

        html.append("<div class='grid'>");
        html.append("<div class='col'>");
        html.append("<div class='label'>Student Name</div>");
        html.append("<div class='val'>").append(studentName).append("</div>");
        html.append("<div class='label'>Enrollment Number</div>");
        html.append("<div class='val'>").append(enrollmentNo).append("</div>");
        html.append("</div>");
        html.append("<div class='col' style='text-align:right;'>");
        html.append("<div class='label'>Invoice Reference</div>");
        html.append("<div class='val'>").append(invoice != null ? invoice.getInvoiceNumber() : "N/A").append("</div>");
        html.append("<div class='label'>Payment Method</div>");
        html.append("<div class='val'>").append(payment.getPaymentMethod()).append("</div>");
        html.append("</div>");
        html.append("</div>");

        html.append("<table>");
        html.append("<thead><tr><th>Payment Description</th><th>Transaction Ref</th><th style='text-align:right;'>Amount Paid</th></tr></thead>");
        html.append("<tbody>");
        html.append("<tr>");
        html.append("<td>Fee Collection Payment</td>");
        html.append("<td>").append(payment.getReferenceNumber() != null ? payment.getReferenceNumber() : "Direct Payment").append("</td>");
        html.append("<td style='text-align:right; font-weight:bold; color:#16a34a; font-size:16px;'>₹").append(payment.getAmount()).append("</td>");
        html.append("</tr>");
        if (invoice != null) {
            html.append("<tr><td colspan='2'>Remaining Invoice Balance</td><td style='text-align:right; font-weight:bold;'>₹").append(invoice.getOutstandingBalance()).append("</td></tr>");
        }
        html.append("</tbody></table>");

        if (!watermarkRemoved) {
            html.append("<div class='watermark'>Powered by EduPulse ERP • Unified Institutional Multi-Tenant SaaS Platform</div>");
        }
        html.append("</div></body></html>");

        return BrandedDocumentDTO.builder()
                .documentType("PAYMENT_RECEIPT")
                .documentNumber(receiptNumber)
                .tenantId(tenantId)
                .institutionName(institution)
                .logoUrl(branding.logoUrl())
                .primaryColorHex(primaryColor)
                .secondaryColorHex(secondaryColor)
                .watermarkRemoved(watermarkRemoved)
                .studentName(studentName)
                .studentEnrollmentNumber(enrollmentNo)
                .amount(payment.getAmount())
                .documentDate(payment.getPaymentDate() != null ? payment.getPaymentDate().toLocalDate() : LocalDate.now())
                .htmlContent(html.toString())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public String generatePaymentReceiptHtml(Long paymentId) {
        return generatePaymentReceiptDocument(paymentId).getHtmlContent();
    }
}
