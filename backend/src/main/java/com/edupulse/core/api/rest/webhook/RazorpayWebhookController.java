package com.edupulse.core.api.rest.webhook;

import com.edupulse.core.config.RazorpayProperties;
import com.edupulse.core.domain.billing.service.RazorpayBillingService;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Public webhook listener capturing and cryptographically verifying real-time billing
 * lifecycle events from Razorpay for RBI-compliant recurring SaaS subscriptions.
 */
@RestController("coreRazorpayWebhookController")
@RequestMapping("/api/v1/billing")
@Tag(name = "Razorpay Webhook Listener", description = "Cryptographically verified Razorpay webhook ingestion endpoint")
@Slf4j
public class RazorpayWebhookController {

    private final RazorpayBillingService razorpayBillingService;
    private final RazorpayProperties razorpayProperties;

    public RazorpayWebhookController(RazorpayBillingService razorpayBillingService,
                                     RazorpayProperties razorpayProperties) {
        this.razorpayBillingService = razorpayBillingService;
        this.razorpayProperties = razorpayProperties;
    }

    /**
     * Ingests and cryptographically validates incoming Razorpay webhook events using HMAC-SHA256.
     * Listens for subscription.charged and payment.captured events to activate tenant subscriptions.
     *
     * @param payload   Raw JSON request body
     * @param sigHeader x-razorpay-signature HTTP header
     * @return 200 OK upon valid signature verification and processing
     */
    @PostMapping("/razorpay-webhook")
    @Operation(summary = "Handle Razorpay Webhook", description = "Verifies cryptographic HMAC signature and activates tenant subscriptions")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "x-razorpay-signature", required = false) String sigHeader) {

        if (sigHeader == null || sigHeader.isBlank()) {
            log.warn("Missing x-razorpay-signature header on billing webhook");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing x-razorpay-signature header");
        }

        boolean isValid;
        try {
            isValid = verifyWebhookSignature(payload, sigHeader, razorpayProperties.getWebhookSecret());
        } catch (RazorpayException e) {
            log.error("Razorpay webhook signature verification failure: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Signature verification failed");
        }

        if (!isValid) {
            log.warn("Invalid Razorpay webhook signature header: {}", sigHeader);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid webhook signature");
        }

        try {
            JSONObject root = new JSONObject(payload);
            String event = root.optString("event");
            log.info("Received verified Razorpay webhook event: [event={}]", event);

            if ("subscription.charged".equals(event) || "payment.captured".equals(event)) {
                String tenantId = extractTenantId(root);
                String subscriptionId = extractSubscriptionId(root);

                if (tenantId != null && !tenantId.isBlank()) {
                    log.info("Processing {} for tenant [{}], subscription [{}]", event, tenantId, subscriptionId);
                    razorpayBillingService.activateSubscription(tenantId, subscriptionId, "ACTIVE");
                } else {
                    log.warn("No tenant_id found in Razorpay webhook payload notes for event: {}", event);
                }
            } else {
                log.debug("Ignored unhandled Razorpay event: {}", event);
            }

            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            log.error("Failed to parse Razorpay webhook payload: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Malformed payload");
        }
    }

    /**
     * Endpoint to initialize a Razorpay subscription for the active tenant.
     *
     * @param request Payload containing planId / priceId
     * @return Map containing subscriptionId and public keyId
     */
    @PostMapping("/razorpay-subscription")
    @Operation(summary = "Create Razorpay Subscription", description = "Creates a Razorpay recurring subscription and returns subscription_id")
    public ResponseEntity<Map<String, Object>> createRazorpaySubscription(@RequestBody Map<String, Object> request) {
        String planId = null;
        if (request != null) {
            if (request.containsKey("planId") && request.get("planId") != null) {
                planId = String.valueOf(request.get("planId"));
            } else if (request.containsKey("priceId") && request.get("priceId") != null) {
                planId = String.valueOf(request.get("priceId"));
            }
        }
        if (planId == null || planId.isBlank()) {
            planId = "plan_pro_institutional_499";
        }

        String tenantId = null;
        if (request != null && request.containsKey("tenantId") && request.get("tenantId") != null) {
            tenantId = String.valueOf(request.get("tenantId"));
        }
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = com.erp.multitenancy.TenantContext.getTenantId();
        }
        if (tenantId == null || tenantId.isBlank() || "default".equalsIgnoreCase(tenantId)) {
            tenantId = "tenant-default";
        }

        String subscriptionId = razorpayBillingService.createSubscription(tenantId, planId);

        Map<String, Object> response = new HashMap<>();
        response.put("subscriptionId", subscriptionId);
        response.put("subscription_id", subscriptionId);
        response.put("keyId", razorpayProperties.getKeyId());
        response.put("tenantId", tenantId);

        return ResponseEntity.ok(response);
    }

    /**
     * Verifies cryptographic signature using Razorpay SDK Utils.
     */
    protected boolean verifyWebhookSignature(String payload, String signatureHeader, String webhookSecret) throws RazorpayException {
        return Utils.verifyWebhookSignature(payload, signatureHeader, webhookSecret);
    }

    private String extractTenantId(JSONObject root) {
        // 1. Direct payload.entity.notes check
        if (root.has("payload")) {
            JSONObject payloadObj = root.optJSONObject("payload");
            if (payloadObj != null) {
                if (payloadObj.has("entity")) {
                    JSONObject entityObj = payloadObj.optJSONObject("entity");
                    if (entityObj != null && entityObj.has("notes")) {
                        String t = entityObj.optJSONObject("notes").optString("tenant_id", null);
                        if (t != null && !t.isBlank()) return t;
                    }
                }
                if (payloadObj.has("subscription")) {
                    JSONObject subObj = payloadObj.optJSONObject("subscription");
                    if (subObj != null && subObj.has("entity")) {
                        JSONObject entityObj = subObj.optJSONObject("entity");
                        if (entityObj != null && entityObj.has("notes")) {
                            String t = entityObj.optJSONObject("notes").optString("tenant_id", null);
                            if (t != null && !t.isBlank()) return t;
                        }
                    }
                }
                if (payloadObj.has("payment")) {
                    JSONObject payObj = payloadObj.optJSONObject("payment");
                    if (payObj != null && payObj.has("entity")) {
                        JSONObject entityObj = payObj.optJSONObject("entity");
                        if (entityObj != null && entityObj.has("notes")) {
                            String t = entityObj.optJSONObject("notes").optString("tenant_id", null);
                            if (t != null && !t.isBlank()) return t;
                        }
                    }
                }
            }
        }
        // 2. Direct entity.notes check
        if (root.has("entity")) {
            JSONObject entity = root.optJSONObject("entity");
            if (entity != null && entity.has("notes")) {
                String t = entity.optJSONObject("notes").optString("tenant_id", null);
                if (t != null && !t.isBlank()) return t;
            }
        }
        return null;
    }

    private String extractSubscriptionId(JSONObject root) {
        if (root.has("payload")) {
            JSONObject payloadObj = root.optJSONObject("payload");
            if (payloadObj != null) {
                if (payloadObj.has("subscription")) {
                    JSONObject sub = payloadObj.optJSONObject("subscription");
                    if (sub != null && sub.has("entity")) {
                        return sub.optJSONObject("entity").optString("id", null);
                    }
                }
                if (payloadObj.has("payment")) {
                    JSONObject pay = payloadObj.optJSONObject("payment");
                    if (pay != null && pay.has("entity")) {
                        return pay.optJSONObject("entity").optString("subscription_id", null);
                    }
                }
            }
        }
        return null;
    }
}
