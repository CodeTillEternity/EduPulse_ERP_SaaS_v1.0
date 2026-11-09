package com.edupulse.core.api.rest;

import com.edupulse.core.domain.finance.InvoiceStatus;
import com.edupulse.core.domain.finance.dto.BatchInvoiceRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeHeadRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeHeadResponseDTO;
import com.edupulse.core.domain.finance.dto.FeeStructureItemRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeStructureRequestDTO;
import com.edupulse.core.domain.finance.dto.FeeStructureResponseDTO;
import com.edupulse.core.domain.finance.dto.PaymentRequestDTO;
import com.edupulse.core.domain.finance.dto.PaymentResponseDTO;
import com.edupulse.core.domain.finance.dto.StudentInvoiceResponseDTO;
import com.edupulse.core.domain.finance.service.FinanceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
@ContextConfiguration(classes = {
        FinanceController.class,
        FinanceControllerTest.SecurityTestConfig.class
})
class FinanceControllerTest {

    @Configuration
    @EnableWebSecurity
    @EnableMethodSecurity(prePostEnabled = true)
    static class SecurityTestConfig {

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated());
            return http.build();
        }

        @Bean
        public ObjectMapper objectMapper() {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            return mapper;
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean(name = "coreFinanceService")
    private FinanceService financeService;

    @Test
    @WithMockUser(roles = "FINANCE_MANAGER")
    @DisplayName("POST /api/v1/finance/structures creates fee structure and returns 201 Created")
    void shouldCreateFeeStructure() throws Exception {
        FeeStructureRequestDTO request = FeeStructureRequestDTO.builder()
                .name("Annual Tech 2026")
                .batchId(1L)
                .items(List.of(
                        new FeeStructureItemRequestDTO(1L, new BigDecimal("40000.00")),
                        new FeeStructureItemRequestDTO(2L, new BigDecimal("10000.00"))
                ))
                .build();

        FeeStructureResponseDTO response = FeeStructureResponseDTO.builder()
                .id(10L)
                .name("Annual Tech 2026")
                .batchId(1L)
                .batchName("Batch 1 (CS 2026-A)")
                .totalAmount(new BigDecimal("50000.00"))
                .items(Collections.emptyList())
                .createdAt(LocalDateTime.now())
                .build();

        when(financeService.createFeeStructure(any(FeeStructureRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/finance/structures")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.name").value("Annual Tech 2026"))
                .andExpect(jsonPath("$.totalAmount").value(50000.00));
    }

    @Test
    @WithMockUser(roles = "SUPERADMIN")
    @DisplayName("POST /api/v1/finance/invoices/batch generates batch invoices and returns 201 Created")
    void shouldGenerateBatchInvoices() throws Exception {
        BatchInvoiceRequestDTO request = BatchInvoiceRequestDTO.builder()
                .batchId(1L)
                .feeStructureId(10L)
                .dueDate(LocalDate.now().plusDays(30))
                .discount(BigDecimal.ZERO)
                .build();

        StudentInvoiceResponseDTO invoiceDTO = StudentInvoiceResponseDTO.builder()
                .id(100L)
                .invoiceNumber("INV-2026-0001")
                .studentId(1L)
                .studentName("Ada Lovelace")
                .studentEnrollmentNumber("ENR-001")
                .grossAmount(new BigDecimal("50000.00"))
                .netAmount(new BigDecimal("50000.00"))
                .amountPaid(BigDecimal.ZERO)
                .outstandingBalance(new BigDecimal("50000.00"))
                .status(InvoiceStatus.UNPAID)
                .build();

        when(financeService.generateInvoicesForBatch(any(BatchInvoiceRequestDTO.class))).thenReturn(List.of(invoiceDTO));

        mockMvc.perform(post("/api/v1/finance/invoices/batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$[0].invoiceNumber").value("INV-2026-0001"))
                .andExpect(jsonPath("$[0].outstandingBalance").value(50000.00));
    }

    @Test
    @WithMockUser(roles = "FINANCE_MANAGER")
    @DisplayName("POST /api/v1/finance/payments records payment and returns 201 Created")
    void shouldRecordPayment() throws Exception {
        PaymentRequestDTO request = PaymentRequestDTO.builder()
                .invoiceId(100L)
                .amount(new BigDecimal("25000.00"))
                .paymentMethod("UPI")
                .referenceNumber("UPI-REF-001")
                .notes("Installment 1")
                .build();

        PaymentResponseDTO response = PaymentResponseDTO.builder()
                .id(500L)
                .invoiceId(100L)
                .invoiceNumber("INV-2026-0001")
                .amount(new BigDecimal("25000.00"))
                .paymentMethod("UPI")
                .referenceNumber("UPI-REF-001")
                .remainingInvoiceBalance(new BigDecimal("25000.00"))
                .invoiceStatus(InvoiceStatus.PARTIAL)
                .build();

        when(financeService.recordPayment(any(PaymentRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/finance/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(500))
                .andExpect(jsonPath("$.invoiceStatus").value("PARTIAL"))
                .andExpect(jsonPath("$.remainingInvoiceBalance").value(25000.00));
    }

    @Test
    @WithMockUser(roles = "FINANCE_MANAGER")
    @DisplayName("GET /api/v1/finance/invoices/{id}/document returns branded invoice document")
    void shouldGetInvoiceDocument() throws Exception {
        com.edupulse.core.domain.finance.dto.BrandedDocumentDTO doc = com.edupulse.core.domain.finance.dto.BrandedDocumentDTO.builder()
                .documentType("FEE_INVOICE")
                .documentNumber("INV-2026-0001")
                .institutionName("Stanford Academy")
                .logoUrl("https://cdn.stanford.edu/logo.png")
                .primaryColorHex("#8C1515")
                .watermarkRemoved(true)
                .amount(new BigDecimal("50000.00"))
                .htmlContent("<html><body><h1>Stanford Academy</h1></body></html>")
                .build();

        when(financeService.generateInvoiceDocument(100L)).thenReturn(doc);

        mockMvc.perform(get("/api/v1/finance/invoices/100/document"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.documentType").value("FEE_INVOICE"))
                .andExpect(jsonPath("$.institutionName").value("Stanford Academy"))
                .andExpect(jsonPath("$.primaryColorHex").value("#8C1515"))
                .andExpect(jsonPath("$.watermarkRemoved").value(true));
    }

    @Test
    @WithMockUser(roles = "FINANCE_MANAGER")
    @DisplayName("GET /api/v1/finance/payments/{id}/receipt returns branded payment receipt")
    void shouldGetPaymentReceipt() throws Exception {
        com.edupulse.core.domain.finance.dto.BrandedDocumentDTO doc = com.edupulse.core.domain.finance.dto.BrandedDocumentDTO.builder()
                .documentType("PAYMENT_RECEIPT")
                .documentNumber("RCP-500")
                .institutionName("Stanford Academy")
                .primaryColorHex("#8C1515")
                .watermarkRemoved(true)
                .amount(new BigDecimal("25000.00"))
                .htmlContent("<html><body><h1>Receipt</h1></body></html>")
                .build();

        when(financeService.generatePaymentReceiptDocument(500L)).thenReturn(doc);

        mockMvc.perform(get("/api/v1/finance/payments/500/receipt"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.documentType").value("PAYMENT_RECEIPT"))
                .andExpect(jsonPath("$.documentNumber").value("RCP-500"));
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    @DisplayName("Unauthorized role returns 403 Forbidden")
    void shouldDenyUnauthorizedRole() throws Exception {
        mockMvc.perform(get("/api/v1/finance/structures"))
                .andExpect(status().isForbidden());
    }
}
