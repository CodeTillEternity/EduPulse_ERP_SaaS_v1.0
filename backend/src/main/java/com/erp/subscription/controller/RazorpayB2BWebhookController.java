package com.erp.subscription.controller;

import com.erp.subscription.service.SaaSBillingService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Controller receiving incoming Razorpay B2B Webhook events to automatically synchronize
 * recurring subscription lifecycle states, tier activations, and suspensions.
 */
@RestController
@RequestMapping("/api/v1/saas/webhooks")
@Tag(name = "SaaS Webhooks", description = "Asynchronous Razorpay B2B subscription webhook processing")
public class RazorpayB2BWebhookController {

    private static final Logger log = LoggerFactory.getLogger(RazorpayB2BWebhookController.class);

    private final SaaSBillingService saaSBillingService;
    private final ObjectMapper objectMapper;

    public RazorpayB2BWebhookController(SaaSBillingService saaSBillingService, ObjectMapper objectMapper) {
        this.saaSBillingService = saaSBillingService;
        this.objectMapper = objectMapper;
    }

    public RazorpayB2BWebhookController(SaaSBillingService saaSBillingService) {
        this(saaSBillingService, new ObjectMapper());
    }

    /**
     * Webhook endpoint listening for Razorpay B2B subscription events.
     * Verifies cryptographic HMAC-SHA256 signature using X-Razorpay-Signature.
     *
     * @param payload        raw request payload
     * @param razorpaySig    X-Razorpay-Signature header value
     * @param stripeSigAlias Stripe-Signature header alias for backward compatibility
     * @return HTTP 200 with acknowledgment, or HTTP 400 on signature failure
     */
    @PostMapping(value = {"/razorpay", "/stripe"}, consumes = "application/json")
    @Operation(summary = "Razorpay B2B webhook processor", description = "Verifies X-Razorpay-Signature and processes subscription events")
    public ResponseEntity<Map<String, Object>> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String razorpaySig,
            @RequestHeader(value = "Stripe-Signature", required = false) String stripeSigAlias) {

        String sigHeader = (razorpaySig != null && !razorpaySig.isBlank()) ? razorpaySig : stripeSigAlias;

        if (sigHeader == null || sigHeader.isBlank()) {
            log.warn("Rejected incoming Razorpay B2B webhook: Missing signature header");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Missing signature header"));
        }

        try {
            boolean isValid = saaSBillingService.verifyWebhookSignature(payload, sigHeader);
            if (!isValid) {
                log.error("Razorpay webhook signature verification failed for payload");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "error", "Invalid webhook signature"));
            }
        } catch (Exception ex) {
            log.error("Razorpay webhook signature verification error: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Invalid webhook signature"));
        }

        String eventType = "unknown";
        try {
            JsonNode root = objectMapper.readTree(payload);
            eventType = root.path("event").asText(root.path("type").asText("unknown"));
        } catch (Exception e) {
            log.warn("Could not determine event type from webhook payload: {}", e.getMessage());
        }

        log.info("Received valid Razorpay B2B webhook event: [{}]", eventType);

        switch (eventType) {
            case "subscription.charged", "invoice.payment_succeeded" -> {
                saaSBillingService.handleSubscriptionCharged(payload, sigHeader);
            }
            case "subscription.cancelled", "customer.subscription.deleted" -> {
                saaSBillingService.handleSubscriptionCancelled(payload, sigHeader);
            }
            default -> log.debug("Unhandled webhook event type: {}", eventType);
        }

        return ResponseEntity.ok(Map.of(
                "received", true,
                "event", eventType
        ));
    }

    /**
     * Backward compatibility method matching previous StripeWebhookController signature for test suite.
     */
    public ResponseEntity<Map<String, Object>> handleStripeWebhook(String payload, String sigHeader) {
        return handleWebhook(payload, sigHeader, sigHeader);
    }
}
