package com.erp.subscription.controller;

import com.erp.common.response.ApiResponse;
import com.erp.subscription.service.SubscriptionService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Public controller managing Stripe webhook events for SaaS subscription activations.
 */
@RestController
@RequestMapping("/api/v1/saas/webhooks")
@Tag(name = "SaaS Webhooks", description = "Public webhooks for payment gateways and external events")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    private final SubscriptionService subscriptionService;
    private final Set<String> processedSessions = Collections.newSetFromMap(new ConcurrentHashMap<>());

    @Value("${stripe.webhook-secret:whsec_placeholder}")
    private String webhookSecret;

    public StripeWebhookController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    /**
     * Ingests and processes incoming Stripe webhook events.
     *
     * @param payload   the raw JSON webhook payload
     * @param sigHeader the Stripe-Signature cryptographic header
     * @return processing confirmation response
     */
    @PostMapping("/stripe")
    @Operation(summary = "Handle Stripe Webhook", description = "Verifies signature and processes checkout.session.completed idempotently")
    public ResponseEntity<ApiResponse<String>> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {

        if (sigHeader == null || sigHeader.isBlank()) {
            log.warn("Missing Stripe-Signature header on webhook request");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Missing Stripe-Signature header"));
        }

        Event event;
        try {
            event = constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException ex) {
            log.warn("Invalid Stripe signature: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid webhook signature"));
        } catch (Exception ex) {
            log.error("Failed to parse Stripe webhook: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Malformed webhook payload"));
        }

        log.info("Received Stripe webhook event: [id={}, type={}]", event.getId(), event.getType());

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            if (session == null) {
                log.warn("checkout.session.completed event missing session data object");
                return ResponseEntity.ok(ApiResponse.success("Session object not found", "Ignored"));
            }

            String sessionId = session.getId();

            // Idempotency check
            if (sessionId != null && processedSessions.contains(sessionId)) {
                log.info("Stripe Checkout Session [{}] already processed idempotently", sessionId);
                return ResponseEntity.ok(ApiResponse.success("Session already processed", sessionId));
            }

            Map<String, String> metadata = session.getMetadata();
            String tenantId = session.getClientReferenceId();
            if (tenantId == null && metadata != null) {
                tenantId = metadata.get("tenant_id");
            }

            String planIdStr = metadata != null ? metadata.get("plan_id") : null;
            String planName = metadata != null ? metadata.get("plan_name") : null;
            String billingCycle = metadata != null ? metadata.get("billing_cycle") : "MONTHLY";

            Long planId = null;
            if (planIdStr != null && !planIdStr.isBlank() && !"null".equalsIgnoreCase(planIdStr)) {
                try {
                    planId = Long.parseLong(planIdStr);
                } catch (NumberFormatException ignored) {}
            }

            log.info("Processing subscription activation for tenant [{}] on plan [{}]", tenantId, planName);
            subscriptionService.activateSubscription(tenantId, planId, planName, billingCycle);

            if (sessionId != null) {
                processedSessions.add(sessionId);
            }

            return ResponseEntity.ok(ApiResponse.success("Checkout session processed successfully", sessionId));
        }

        return ResponseEntity.ok(ApiResponse.success("Event received but not handled", event.getType()));
    }

    public Event constructEvent(String payload, String sigHeader, String secret) throws SignatureVerificationException {
        return Webhook.constructEvent(payload, sigHeader, secret);
    }
}
