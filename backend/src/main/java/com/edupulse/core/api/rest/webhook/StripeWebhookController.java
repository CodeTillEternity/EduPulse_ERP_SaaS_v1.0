package com.edupulse.core.api.rest.webhook;

import com.edupulse.core.config.StripeProperties;
import com.edupulse.core.domain.billing.service.StripeBillingService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Public webhook listener capturing and verifying real-time billing lifecycle events from Stripe.
 */
@RestController("coreStripeWebhookController")
@RequestMapping("/api/v1/billing")
@Tag(name = "Stripe Webhook Listener", description = "Cryptographically verified Stripe webhook ingestion endpoint")
@Slf4j
public class StripeWebhookController {

    private final StripeBillingService stripeBillingService;
    private final StripeProperties stripeProperties;

    public StripeWebhookController(StripeBillingService stripeBillingService,
                                   StripeProperties stripeProperties) {
        this.stripeBillingService = stripeBillingService;
        this.stripeProperties = stripeProperties;
    }

    /**
     * Ingests, cryptographically validates, and processes incoming Stripe webhook events.
     *
     * @param payload   Raw JSON request body
     * @param sigHeader Stripe-Signature HTTP header
     * @return 200 OK upon valid processing to prevent delivery retries
     */
    @PostMapping("/webhook")
    @Operation(summary = "Handle Stripe Webhook", description = "Verifies cryptographic signature and processes subscription events")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {

        if (sigHeader == null || sigHeader.isBlank()) {
            log.warn("Missing Stripe-Signature header on billing webhook");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing Stripe-Signature header");
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, stripeProperties.getWebhookSecret());
        } catch (SignatureVerificationException e) {
            log.error("Stripe webhook cryptographic verification failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Stripe signature");
        } catch (Exception e) {
            log.error("Stripe webhook payload parsing failure: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook processing error");
        }

        log.info("Received verified Stripe webhook event: [id={}, type={}]", event.getId(), event.getType());

        switch (event.getType()) {
            case "checkout.session.completed":
                handleCheckoutSessionCompleted(event);
                break;

            case "customer.subscription.updated":
                handleCustomerSubscriptionUpdated(event);
                break;

            default:
                log.debug("Ignored unhandled Stripe event type: {}", event.getType());
                break;
        }

        return ResponseEntity.ok("Webhook processed successfully");
    }

    private void handleCheckoutSessionCompleted(Event event) {
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        if (dataObjectDeserializer.getObject().isPresent()) {
            Session session = (Session) dataObjectDeserializer.getObject().get();
            String tenantId = session.getClientReferenceId();
            String customerId = session.getCustomer();
            String subscriptionId = session.getSubscription();

            log.info("Processing checkout.session.completed [tenantId={}, customerId={}, subscriptionId={}]",
                    tenantId, customerId, subscriptionId);

            if (tenantId != null && !tenantId.isBlank()) {
                stripeBillingService.provisionSubscription(tenantId, customerId, subscriptionId);
            } else {
                log.warn("No client_reference_id found on Checkout Session [{}]", session.getId());
            }
        } else {
            log.warn("Unable to deserialize Session object from event: {}", event.getId());
        }
    }

    private void handleCustomerSubscriptionUpdated(Event event) {
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        if (dataObjectDeserializer.getObject().isPresent()) {
            Subscription subscription = (Subscription) dataObjectDeserializer.getObject().get();
            String subscriptionId = subscription.getId();
            String status = subscription.getStatus() != null ? subscription.getStatus().toUpperCase() : "ACTIVE";

            LocalDateTime periodEnd = null;
            if (subscription.getCurrentPeriodEnd() != null) {
                periodEnd = LocalDateTime.ofInstant(
                        Instant.ofEpochSecond(subscription.getCurrentPeriodEnd()),
                        ZoneId.systemDefault()
                );
            }

            log.info("Processing customer.subscription.updated [subscriptionId={}, status={}, periodEnd={}]",
                    subscriptionId, status, periodEnd);

            stripeBillingService.updateSubscriptionStatus(subscriptionId, status, periodEnd);
        } else {
            log.warn("Unable to deserialize Subscription object from event: {}", event.getId());
        }
    }
}
