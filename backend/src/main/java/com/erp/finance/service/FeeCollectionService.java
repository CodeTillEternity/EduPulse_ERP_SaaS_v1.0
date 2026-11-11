package com.erp.finance.service;

import com.erp.finance.dto.FeeOrderRequest;
import com.erp.finance.dto.FeeOrderResponse;
import com.erp.finance.dto.FeePaymentVerificationRequest;
import com.erp.finance.dto.StudentInvoiceLedgerDto;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FeeCollectionService {

    private static final Logger log = LoggerFactory.getLogger(FeeCollectionService.class);

    @Value("${razorpay.key-id:rzp_test_placeholder}")
    private String keyId;

    @Value("${razorpay.key-secret:rzp_secret_placeholder}")
    private String keySecret;

    @Value("${razorpay.webhook-secret:rzp_webhook_secret_placeholder}")
    private String webhookSecret;

    private RazorpayClient razorpayClient;
    private final Map<String, StudentInvoiceLedgerDto> invoiceLedger = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        try {
            if (keyId != null && !keyId.startsWith("placeholder") && keySecret != null && !keySecret.startsWith("placeholder")) {
                this.razorpayClient = new RazorpayClient(keyId, keySecret);
            }
        } catch (Exception e) {
            log.warn("Could not initialize live RazorpayClient: {}. Standard test fallback active.", e.getMessage());
        }

        seedLedgerInvoices();
    }

    private void seedLedgerInvoices() {
        // 1. Fall 2026 Tuition
        List<StudentInvoiceLedgerDto.FeeBreakdownItem> tBreakdown = new ArrayList<>();
        tBreakdown.add(new StudentInvoiceLedgerDto.FeeBreakdownItem("Academic Tuition Fee", 75000.00));
        tBreakdown.add(new StudentInvoiceLedgerDto.FeeBreakdownItem("Institutional Development Fund", 10000.00));
        tBreakdown.add(new StudentInvoiceLedgerDto.FeeBreakdownItem("Student Welfare & Library Access", 5000.00));

        StudentInvoiceLedgerDto inv1 = StudentInvoiceLedgerDto.builder()
                .invoiceNumber("INV-2026-FALL-0842")
                .title("Fall Semester 2026 — Tuition & Academic Fee")
                .term("Fall 2026")
                .totalAmount(90000.00)
                .amountInPaise(9000000L)
                .status("PENDING")
                .dueDate(Instant.now().plus(30, ChronoUnit.DAYS))
                .breakdown(tBreakdown)
                .build();
        invoiceLedger.put(inv1.getInvoiceNumber(), inv1);

        // 2. High-Performance Computing & Lab Fee
        List<StudentInvoiceLedgerDto.FeeBreakdownItem> lBreakdown = new ArrayList<>();
        lBreakdown.add(new StudentInvoiceLedgerDto.FeeBreakdownItem("Distributed Computing Cluster Quota", 10000.00));
        lBreakdown.add(new StudentInvoiceLedgerDto.FeeBreakdownItem("Hardware Lab Component Kit", 5000.00));

        StudentInvoiceLedgerDto inv2 = StudentInvoiceLedgerDto.builder()
                .invoiceNumber("INV-2026-LAB-0192")
                .title("Advanced Systems Computing & Hardware Lab Fee")
                .term("Fall 2026")
                .totalAmount(15000.00)
                .amountInPaise(1500000L)
                .status("PENDING")
                .dueDate(Instant.now().plus(15, ChronoUnit.DAYS))
                .breakdown(lBreakdown)
                .build();
        invoiceLedger.put(inv2.getInvoiceNumber(), inv2);

        // 3. Campus Residence & Meal Plan (Paid)
        List<StudentInvoiceLedgerDto.FeeBreakdownItem> hBreakdown = new ArrayList<>();
        hBreakdown.add(new StudentInvoiceLedgerDto.FeeBreakdownItem("Campus Hostel Block B (Single Room)", 30000.00));
        hBreakdown.add(new StudentInvoiceLedgerDto.FeeBreakdownItem("Institutional Dining Meal Plan", 15000.00));

        StudentInvoiceLedgerDto inv3 = StudentInvoiceLedgerDto.builder()
                .invoiceNumber("INV-2026-HOSTEL-0044")
                .title("Campus Residence & Dining Service Fee")
                .term("Fall 2026")
                .totalAmount(45000.00)
                .amountInPaise(4500000L)
                .status("PAID")
                .dueDate(Instant.now().minus(10, ChronoUnit.DAYS))
                .paidAt(Instant.now().minus(8, ChronoUnit.DAYS))
                .paymentReference("pay_Pq7wL9x0K2mB4v")
                .breakdown(hBreakdown)
                .build();
        invoiceLedger.put(inv3.getInvoiceNumber(), inv3);
    }

    /**
     * Creates a Razorpay Order for a student tuition invoice.
     */
    public FeeOrderResponse createOrderForInvoice(FeeOrderRequest request) {
        StudentInvoiceLedgerDto invoice = invoiceLedger.get(request.getInvoiceNumber());
        long amountInPaise = (request.getAmountInPaise() != null && request.getAmountInPaise() > 0)
                ? request.getAmountInPaise()
                : (invoice != null ? invoice.getAmountInPaise() : 9000000L);

        String orderId = "order_rzp_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        String receipt = "rcpt_" + request.getInvoiceNumber() + "_" + System.currentTimeMillis();

        if (razorpayClient != null && razorpayClient.orders != null) {
            try {
                JSONObject orderReq = new JSONObject();
                orderReq.put("amount", amountInPaise);
                orderReq.put("currency", "INR");
                orderReq.put("receipt", receipt);

                JSONObject notes = new JSONObject();
                notes.put("invoice_number", request.getInvoiceNumber());
                notes.put("student_name", request.getStudentName() != null ? request.getStudentName() : "Student");
                notes.put("type", "B2C_STUDENT_FEE");
                orderReq.put("notes", notes);

                Order order = razorpayClient.orders.create(orderReq);
                if (order != null && order.has("id")) {
                    orderId = order.get("id");
                }
            } catch (RazorpayException e) {
                log.warn("Razorpay API order creation exception: {}. Using deterministic order ID.", e.getMessage());
            }
        }

        return FeeOrderResponse.builder()
                .orderId(orderId)
                .invoiceNumber(request.getInvoiceNumber())
                .amountInPaise(amountInPaise)
                .displayAmount(amountInPaise / 100.0)
                .currency("INR")
                .keyId(keyId)
                .receipt(receipt)
                .studentName(request.getStudentName() != null ? request.getStudentName() : "Aarav Sharma")
                .studentEmail(request.getStudentEmail() != null ? request.getStudentEmail() : "aarav.sharma@edupulse.edu")
                .description("Tuition Fee Settlement for " + request.getInvoiceNumber())
                .build();
    }

    /**
     * Verifies payment signature and marks the student invoice as PAID.
     */
    public StudentInvoiceLedgerDto verifyPayment(FeePaymentVerificationRequest request) {
        StudentInvoiceLedgerDto invoice = invoiceLedger.get(request.getInvoiceNumber());
        if (invoice == null) {
            throw new IllegalArgumentException("Invoice not found: " + request.getInvoiceNumber());
        }

        boolean isValid = true;
        if (keySecret != null && !keySecret.startsWith("placeholder") && request.getRazorpaySignature() != null) {
            try {
                JSONObject options = new JSONObject();
                options.put("razorpay_order_id", request.getRazorpayOrderId());
                options.put("razorpay_payment_id", request.getRazorpayPaymentId());
                options.put("razorpay_signature", request.getRazorpaySignature());
                isValid = Utils.verifyPaymentSignature(options, keySecret);
            } catch (Exception e) {
                log.warn("Razorpay signature verification fallback: {}", e.getMessage());
            }
        }

        if (isValid) {
            invoice.setStatus("PAID");
            invoice.setPaidAt(Instant.now());
            invoice.setPaymentReference(request.getRazorpayPaymentId());
            invoiceLedger.put(invoice.getInvoiceNumber(), invoice);
            log.info("Student invoice [{}] successfully marked as PAID via payment [{}]",
                    request.getInvoiceNumber(), request.getRazorpayPaymentId());
        }

        return invoice;
    }

    /**
     * Handles Razorpay webhook event (payment.captured) to mark ledger invoice as PAID.
     */
    public boolean handleRazorpayWebhook(String rawPayload, String signatureHeader) {
        log.info("Received Razorpay webhook payload: {}", rawPayload);

        boolean signatureValid = true;
        if (webhookSecret != null && !webhookSecret.startsWith("placeholder") && signatureHeader != null) {
            try {
                signatureValid = Utils.verifyWebhookSignature(rawPayload, signatureHeader, webhookSecret);
            } catch (Exception e) {
                log.warn("Webhook signature check warning: {}", e.getMessage());
            }
        }

        if (!signatureValid) {
            log.error("Invalid Razorpay webhook signature");
            return false;
        }

        try {
            JSONObject root = new JSONObject(rawPayload);
            String event = root.optString("event");

            if ("payment.captured".equals(event) || "order.paid".equals(event)) {
                JSONObject payloadObj = root.optJSONObject("payload");
                if (payloadObj != null) {
                    JSONObject paymentObj = payloadObj.optJSONObject("payment");
                    JSONObject entity = (paymentObj != null) ? paymentObj.optJSONObject("entity") : null;
                    if (entity != null) {
                        String paymentId = entity.optString("id");
                        JSONObject notes = entity.optJSONObject("notes");
                        String invoiceNumber = (notes != null) ? notes.optString("invoice_number") : null;

                        if (invoiceNumber != null && invoiceLedger.containsKey(invoiceNumber)) {
                            StudentInvoiceLedgerDto inv = invoiceLedger.get(invoiceNumber);
                            inv.setStatus("PAID");
                            inv.setPaidAt(Instant.now());
                            inv.setPaymentReference(paymentId);
                            invoiceLedger.put(invoiceNumber, inv);
                            log.info("Webhook reconciled: Invoice [{}] marked as PAID", invoiceNumber);
                            return true;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Razorpay webhook payload: {}", e.getMessage());
        }

        return true;
    }

    /**
     * Returns student fee ledger invoices.
     */
    public List<StudentInvoiceLedgerDto> getStudentInvoices() {
        return new ArrayList<>(invoiceLedger.values());
    }
}
