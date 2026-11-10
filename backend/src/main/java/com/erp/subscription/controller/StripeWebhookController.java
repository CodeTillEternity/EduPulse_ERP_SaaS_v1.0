package com.erp.subscription.controller;

import com.erp.subscription.service.SaaSBillingService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
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
 * Controller receiving incoming Stripe Webhook events to automatically synchronize
 * subscription lifecycle states and account access.
 */
@RestController
@RequestMapping("/api/v1/saas/webhooks")
@Tag(name = "SaaS Webhooks", description = "Asynchronous payment and subscription webhook processing")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    private final SaaSBillingService saaSBillingService;

    public StripeWebhookController(SaaSBillingService saaSBillingService) {
        this.saaSBillingService = saaSBillingService;
    }

    /**
     * Webhook endpoint listening for Stripe B2B subscription events.
     * Requires valid Stripe-Signature HMAC-SHA256 verification.
     *
     * @param payload   raw request payload
     * @param sigHeader Stripe-Signature header value
     * @return HTTP 200 with acknowledgment, or HTTP 400 on signature failure
     */
    @PostMapping(value = "/stripe", consumes = "application/json")
    @Operation(summary = "Stripe webhook processor", description = "Verifies Stripe-Signature and processes subscription events")
    public ResponseEntity<Map<String, Object>> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {

        if (sigHeader == null || sigHeader.isBlank()) {
            log.warn("Rejected incoming Stripe webhook: Missing Stripe-Signature header");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Missing Stripe-Signature header"));
        }

        Event event;
        try {
            event = saaSBillingService.verifyAndConstructEvent(payload, sigHeader);
        } catch (SignatureVerificationException ex) {
            log.error("Stripe webhook signature verification failed: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Invalid webhook signature"));
        } catch (Exception ex) {
            log.error("Stripe webhook processing error: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", ex.getMessage()));
        }

        log.info("Received valid Stripe webhook event: [id={}, type={}]", event.getId(), event.getType());

        switch (event.getType()) {
            case "invoice.payment_succeeded" -> {
                saaSBillingService.handleInvoicePaymentSucceeded(event, payload);
            }
            case "customer.subscription.deleted" -> {
                saaSBillingService.handleSubscriptionDeleted(event, payload);
            }
            default -> log.debug("Unhandled Stripe webhook event type: {}", event.getType());
        }

        return ResponseEntity.ok(Map.of(
                "received", true,
                "eventId", event.getId(),
                "type", event.getType()
        ));
    }
}