package com.edupulse.core.domain.finance;

import com.edupulse.core.domain.academic.Batch;
import com.edupulse.core.domain.academic.repository.BatchRepository;
import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.finance.dto.BatchInvoiceRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeHeadRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeHeadResponseDTO;
import com.edupulse.core.domain.finance.dto.FeeStructureItemRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeStructureRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeStructureResponseDTO;
import com.edupulse.core.domain.finance.dto.PaymentRequestDTO;
import com.edupulse.core.domain.finance.dto.PaymentResponseDTO;
import com.edupulse.core.domain.finance.dto.StudentInvoiceResponseDTO;
import com.edupulse.core.domain.finance.repository.FeeHeadRepository;
import com.edupulse.core.domain.finance.repository.FeePaymentRepository;
import com.edupulse.core.domain.finance.repository.FeeStructureItemRepository;
import com.edupulse.core.domain.finance.repository.FeeStructureRepository;
import com.edupulse.core.domain.finance.repository.StudentInvoiceRepository;
import com.edupulse.core.domain.finance.service.FinanceServiceImpl;
import com.edupulse.core.domain.student.EnrollmentStatus;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.repository.StudentRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FinanceServiceTest {

    private static final String TENANT_ID = "tenant-fin-service-test";

    @Mock
    private FeeHeadRepository feeHeadRepository;

    @Mock
    private FeeStructureRepository feeStructureRepository;

    @Mock
    private FeeStructureItemRepository feeStructureItemRepository;

    @Mock
    private StudentInvoiceRepository studentInvoiceRepository;

    @Mock
    private FeePaymentRepository feePaymentRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private BatchRepository batchRepository;

    @Mock
    private com.erp.multitenancy.service.TenantBrandingService tenantBrandingService;

    @Mock
    private com.edupulse.core.domain.billing.repository.TenantSubscriptionRepository tenantSubscriptionRepository;

    @InjectMocks
    private FinanceServiceImpl financeService;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("createFeeHead saves and returns FeeHead DTO")
    void shouldCreateFeeHead() {
        FeeHeadRequestDTO request = new FeeHeadRequestDTO("Tuition Fee", "Tuition charges", true);
        FeeHead savedHead = new FeeHead("Tuition Fee", "Tuition charges", true);
        savedHead.setId(1L);

        when(feeHeadRepository.findByNameAndTenantId("Tuition Fee", TENANT_ID)).thenReturn(Optional.empty());
        when(feeHeadRepository.save(any(FeeHead.class))).thenReturn(savedHead);

        FeeHeadResponseDTO response = financeService.createFeeHead(request);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Tuition Fee");
        verify(feeHeadRepository).save(any(FeeHead.class));
    }

    @Test
    @DisplayName("generateInvoicesForBatch creates invoices for active batch students")
    void shouldGenerateInvoicesForBatch() {
        Batch batch = new Batch();
        batch.setId(10L);
        batch.setAcademicYear("2026-2027");

        FeeStructure structure = new FeeStructure();
        structure.setId(5L);
        structure.setName("2026 Annual Blueprint");
        structure.setTotalAmount(new BigDecimal("50000.00"));
        structure.setBatch(batch);

        Student student1 = new Student();
        student1.setId(101L);
        student1.setFirstName("Ada");
        student1.setLastName("Lovelace");
        student1.setEnrollmentNumber("ENR-101");
        student1.setStatus(EnrollmentStatus.ACTIVE);
        student1.setBatch(batch);

        when(feeStructureRepository.findByIdAndTenantId(5L, TENANT_ID)).thenReturn(Optional.of(structure));
        when(batchRepository.findByIdAndTenantId(10L, TENANT_ID)).thenReturn(Optional.of(batch));
        when(studentRepository.findByBatchIdAndTenantId(10L, TENANT_ID)).thenReturn(List.of(student1));
        when(studentInvoiceRepository.existsByStudentIdAndFeeStructureIdAndTenantId(101L, 5L, TENANT_ID)).thenReturn(false);

        StudentInvoice savedInvoice = new StudentInvoice();
        savedInvoice.setId(501L);
        savedInvoice.setInvoiceNumber("INV-2026-0101");
        savedInvoice.setStudent(student1);
        savedInvoice.setFeeStructure(structure);
        savedInvoice.setGrossAmount(new BigDecimal("50000.00"));
        savedInvoice.setDiscount(BigDecimal.ZERO);
        savedInvoice.setNetAmount(new BigDecimal("50000.00"));
        savedInvoice.setAmountPaid(BigDecimal.ZERO);
        savedInvoice.setDueDate(LocalDate.now().plusDays(30));
        savedInvoice.setStatus(InvoiceStatus.UNPAID);

        when(studentInvoiceRepository.save(any(StudentInvoice.class))).thenReturn(savedInvoice);

        List<StudentInvoiceResponseDTO> responses = financeService.generateInvoicesForBatch(10L, 5L);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getStudentEnrollmentNumber()).isEqualTo("ENR-101");
        assertThat(responses.get(0).getNetAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(responses.get(0).getStatus()).isEqualTo(InvoiceStatus.UNPAID);
    }

    @Test
    @DisplayName("recordPayment applies payment amount and updates invoice balance")
    void shouldRecordPayment() {
        Student student = new Student();
        student.setId(101L);

        FeeStructure structure = new FeeStructure();
        structure.setId(5L);
        structure.setName("Blueprint");

        StudentInvoice invoice = new StudentInvoice();
        invoice.setId(501L);
        invoice.setInvoiceNumber("INV-2026-0101");
        invoice.setStudent(student);
        invoice.setFeeStructure(structure);
        invoice.setNetAmount(new BigDecimal("50000.00"));
        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setStatus(InvoiceStatus.UNPAID);

        when(studentInvoiceRepository.findByIdAndTenantId(501L, TENANT_ID)).thenReturn(Optional.of(invoice));

        FeePayment savedPayment = new FeePayment();
        savedPayment.setId(1001L);
        savedPayment.setStudentInvoice(invoice);
        savedPayment.setAmount(new BigDecimal("20000.00"));
        savedPayment.setPaymentMethod("UPI");
        savedPayment.setReferenceNumber("UPI-REF-999");
        savedPayment.setPaymentDate(java.time.LocalDateTime.now());

        when(feePaymentRepository.save(any(FeePayment.class))).thenReturn(savedPayment);
        when(studentInvoiceRepository.save(any(StudentInvoice.class))).thenReturn(invoice);

        PaymentRequestDTO request = PaymentRequestDTO.builder()
                .invoiceId(501L)
                .amount(new BigDecimal("20000.00"))
                .paymentMethod("UPI")
                .referenceNumber("UPI-REF-999")
                .notes("Partial payment")
                .build();

        PaymentResponseDTO response = financeService.recordPayment(request);

        assertThat(response.getId()).isEqualTo(1001L);
        assertThat(response.getAmount()).isEqualByComparingTo(new BigDecimal("20000.00"));
        assertThat(response.getInvoiceStatus()).isEqualTo(InvoiceStatus.PARTIAL);
        assertThat(response.getRemainingInvoiceBalance()).isEqualByComparingTo(new BigDecimal("30000.00"));
    }

    @Test
    @DisplayName("generateInvoiceDocument embeds tenant branding and removes watermark for higher-tier subscribers")
    void shouldGenerateInvoiceDocumentWithBrandingAndRemoveWatermarkForHigherTier() {
        Student student = new Student();
        student.setId(201L);
        student.setFirstName("Marie");
        student.setLastName("Curie");
        student.setEnrollmentNumber("ENR-201");

        FeeStructure structure = new FeeStructure();
        structure.setId(10L);
        structure.setName("Advanced Physics Tuition");

        StudentInvoice invoice = new StudentInvoice();
        invoice.setId(888L);
        invoice.setInvoiceNumber("INV-2026-8888");
        invoice.setStudent(student);
        invoice.setFeeStructure(structure);
        invoice.setGrossAmount(new BigDecimal("75000.00"));
        invoice.setDiscount(new BigDecimal("5000.00"));
        invoice.setNetAmount(new BigDecimal("70000.00"));
        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setStatus(InvoiceStatus.UNPAID);
        invoice.setTenantId(TENANT_ID);

        when(studentInvoiceRepository.findByIdAndTenantId(888L, TENANT_ID)).thenReturn(Optional.of(invoice));

        com.erp.multitenancy.dto.TenantBrandingDTO mockBranding = new com.erp.multitenancy.dto.TenantBrandingDTO(
                TENANT_ID,
                "Sorbonne Academy",
                "sorbonne",
                "https://cdn.sorbonne.edu/crest.png",
                "https://cdn.sorbonne.edu/favicon.ico",
                "#800000",
                "#FFD700"
        );
        when(tenantBrandingService.getBrandingByTenantId(TENANT_ID)).thenReturn(Optional.of(mockBranding));

        // Enterprise higher-tier subscription
        com.edupulse.core.domain.billing.SubscriptionPlan plan = new com.edupulse.core.domain.billing.SubscriptionPlan();
        plan.setName("ENTERPRISE");
        com.edupulse.core.domain.billing.TenantSubscription sub = new com.edupulse.core.domain.billing.TenantSubscription();
        sub.setPlan(plan);
        when(tenantSubscriptionRepository.findByTenantId(TENANT_ID)).thenReturn(Optional.of(sub));

        com.edupulse.core.domain.finance.dto.BrandedDocumentDTO doc = financeService.generateInvoiceDocument(888L);

        assertThat(doc.getInstitutionName()).isEqualTo("Sorbonne Academy");
        assertThat(doc.getLogoUrl()).isEqualTo("https://cdn.sorbonne.edu/crest.png");
        assertThat(doc.getPrimaryColorHex()).isEqualTo("#800000");
        assertThat(doc.isWatermarkRemoved()).isTrue();
        assertThat(doc.getHtmlContent()).contains("Sorbonne Academy");
        assertThat(doc.getHtmlContent()).contains("https://cdn.sorbonne.edu/crest.png");
        assertThat(doc.getHtmlContent()).contains("#800000");
        assertThat(doc.getHtmlContent()).doesNotContain("Powered by EduPulse ERP");
    }

    @Test
    @DisplayName("generateInvoiceDocument includes watermark for starter or trial tier subscribers")
    void shouldGenerateInvoiceDocumentWithWatermarkForStarterTier() {
        Student student = new Student();
        student.setId(202L);
        student.setFirstName("Isaac");
        student.setLastName("Newton");
        student.setEnrollmentNumber("ENR-202");

        StudentInvoice invoice = new StudentInvoice();
        invoice.setId(999L);
        invoice.setInvoiceNumber("INV-2026-9999");
        invoice.setStudent(student);
        invoice.setGrossAmount(new BigDecimal("30000.00"));
        invoice.setDiscount(BigDecimal.ZERO);
        invoice.setNetAmount(new BigDecimal("30000.00"));
        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setStatus(InvoiceStatus.UNPAID);
        invoice.setTenantId(TENANT_ID);

        when(studentInvoiceRepository.findByIdAndTenantId(999L, TENANT_ID)).thenReturn(Optional.of(invoice));

        com.erp.multitenancy.dto.TenantBrandingDTO mockBranding = new com.erp.multitenancy.dto.TenantBrandingDTO(
                TENANT_ID,
                "Cambridge School",
                "cambridge",
                null,
                null,
                "#002147",
                "#38BDF8"
        );
        when(tenantBrandingService.getBrandingByTenantId(TENANT_ID)).thenReturn(Optional.of(mockBranding));

        // Starter tier plan
        com.edupulse.core.domain.billing.SubscriptionPlan plan = new com.edupulse.core.domain.billing.SubscriptionPlan();
        plan.setName("STARTER");
        com.edupulse.core.domain.billing.TenantSubscription sub = new com.edupulse.core.domain.billing.TenantSubscription();
        sub.setPlan(plan);
        when(tenantSubscriptionRepository.findByTenantId(TENANT_ID)).thenReturn(Optional.of(sub));

        com.edupulse.core.domain.finance.dto.BrandedDocumentDTO doc = financeService.generateInvoiceDocument(999L);

        assertThat(doc.isWatermarkRemoved()).isFalse();
        assertThat(doc.getHtmlContent()).contains("Powered by EduPulse ERP");
    }

    @Test
    @DisplayName("generatePaymentReceiptDocument embeds branding and transaction details")
    void shouldGeneratePaymentReceiptDocument() {
        Student student = new Student();
        student.setId(203L);
        student.setFirstName("Alan");
        student.setLastName("Turing");
        student.setEnrollmentNumber("ENR-203");

        StudentInvoice invoice = new StudentInvoice();
        invoice.setId(777L);
        invoice.setInvoiceNumber("INV-2026-7777");
        invoice.setStudent(student);
        invoice.setGrossAmount(new BigDecimal("40000.00"));
        invoice.setDiscount(BigDecimal.ZERO);
        invoice.setNetAmount(new BigDecimal("40000.00"));
        invoice.setAmountPaid(new BigDecimal("25000.00"));

        FeePayment payment = new FeePayment();
        payment.setId(444L);
        payment.setStudentInvoice(invoice);
        payment.setAmount(new BigDecimal("25000.00"));
        payment.setPaymentMethod("NET_BANKING");
        payment.setReferenceNumber("TXN-ALAN-444");
        payment.setPaymentDate(java.time.LocalDateTime.now());
        payment.setTenantId(TENANT_ID);

        when(feePaymentRepository.findByIdAndTenantId(444L, TENANT_ID)).thenReturn(Optional.of(payment));

        com.erp.multitenancy.dto.TenantBrandingDTO mockBranding = new com.erp.multitenancy.dto.TenantBrandingDTO(
                TENANT_ID,
                "Turing Computing Institute",
                "turing",
                "https://cdn.turing.ac.uk/logo.png",
                null,
                "#1E3A8A",
                "#3B82F6"
        );
        when(tenantBrandingService.getBrandingByTenantId(TENANT_ID)).thenReturn(Optional.of(mockBranding));
        when(tenantSubscriptionRepository.findByTenantId(TENANT_ID)).thenReturn(Optional.empty());

        com.edupulse.core.domain.finance.dto.BrandedDocumentDTO receipt = financeService.generatePaymentReceiptDocument(444L);

        assertThat(receipt.getDocumentType()).isEqualTo("PAYMENT_RECEIPT");
        assertThat(receipt.getDocumentNumber()).isEqualTo("RCP-444");
        assertThat(receipt.getAmount()).isEqualByComparingTo(new BigDecimal("25000.00"));
        assertThat(receipt.getStudentName()).isEqualTo("Alan Turing");
        assertThat(receipt.getHtmlContent()).contains("OFFICIAL PAYMENT RECEIPT");
        assertThat(receipt.getHtmlContent()).contains("25000.00");
    }
}
