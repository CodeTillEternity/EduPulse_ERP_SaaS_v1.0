package com.erp.subscription.service;

import com.erp.common.exception.ResourceNotFoundException;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.AccountStatus;
import com.erp.multitenancy.model.TenantStatus;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import com.erp.multitenancy.service.TenantProvisioningService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.razorpay.Customer;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Subscription;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Enterprise Service managing Razorpay B2B Recurring Subscription Billing lifecycle,
 * RBI-compliant institutional onboarding, checkout sessions, and webhook synchronization.
 */
@Service
public class SaaSBillingService {

    private static final Logger log = LoggerFactory.getLogger(SaaSBillingService.class);

    private final TenantRegistryRepository tenantRegistryRepository;
    private final TenantProvisioningService tenantProvisioningService;
    private final ObjectMapper objectMapper;

    @Autowired(required = false)
    private RazorpayClient razorpayClient;

    @Value("${razorpay.key-id:rzp_test_placeholder}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret:rzp_secret_placeholder}")
    private String razorpayKeySecret;

    @Value("${razorpay.webhook-secret:rzp_webhook_secret_placeholder}")
    private String razorpayWebhookSecret;

    @Value("${razorpay.pro-plan-id:plan_pro_placeholder}")
    private String proPlanId;

    @Value("${razorpay.enterprise-plan-id:plan_enterprise_placeholder}")
    private String enterprisePlanId;

    @Autowired
    public SaaSBillingService(TenantRegistryRepository tenantRegistryRepository,
                              @Lazy TenantProvisioningService tenantProvisioningService,
                              ObjectMapper objectMapper) {
        this.tenantRegistryRepository = tenantRegistryRepository;
        this.tenantProvisioningService = tenantProvisioningService;
        this.objectMapper = objectMapper;
    }

    /**
     * Creates a Razorpay Customer for an institution during trial provisioning.
     *
     * @param tenant          the tenant registry entity
     * @param adminEmail      administrator email address
     * @param institutionName institution display name
     * @return the generated or provisioned Razorpay Customer ID
     */
    @Transactional
    public String createRazorpayCustomer(TenantRegistry tenant, String adminEmail, String institutionName) {
        if (tenant == null) {
            throw new IllegalArgumentException("Tenant entity cannot be null");
        }

        String customerId = null;
        if (isLiveCredentialsConfigured()) {
            try {
                RazorpayClient client = getOrInitRazorpayClient();
                if (client != null && client.customers != null) {
                    JSONObject customerReq = new JSONObject();
                    customerReq.put("name", institutionName);
                    customerReq.put("email", adminEmail);
                    customerReq.put("notes", new JSONObject()
                            .put("tenantId", tenant.getTenantId())
                            .put("subdomain", tenant.getSubdomain()));

                    Customer customer = client.customers.create(customerReq);
                    customerId = customer.get("id");
                    log.info("Provisioned Razorpay Customer [{}] for tenant [{}]", customerId, tenant.getTenantId());
                }
            } catch (Exception ex) {
                log.error("Razorpay API customer creation failed for tenant [{}]: {}", tenant.getTenantId(), ex.getMessage());
            }
        }

        if (customerId == null || customerId.isBlank()) {
            customerId = "cust_rzp_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
            log.info("Assigned fallback/sandbox Razorpay Customer ID [{}] for tenant [{}]", customerId, tenant.getTenantId());
        }

        tenant.setRazorpayCustomerId(customerId);
        tenant.setStripeCustomerId(customerId); // maintain backward compatibility
        if (tenant.getCurrentPeriodEnd() == null) {
            tenant.setCurrentPeriodEnd(tenant.getTrialEndDate() != null ? tenant.getTrialEndDate() : LocalDateTime.now().plusDays(14));
        }
        tenantRegistryRepository.save(tenant);
        return customerId;
    }

    /**
     * Compatibility alias for legacy callers.
     */
    @Transactional
    public String createStripeCustomer(TenantRegistry tenant, String adminEmail, String institutionName) {
        return createRazorpayCustomer(tenant, adminEmail, institutionName);
    }

    /**
     * Cryptographically verifies incoming Razorpay webhook payload using HMAC-SHA256 signature.
     *
     * @param payload   raw webhook body
     * @param sigHeader X-Razorpay-Signature header value
     * @return true if signature is valid
     * @throws RazorpayException if verification fails
     */
    public boolean verifyWebhookSignature(String payload, String sigHeader) throws RazorpayException {
        if (sigHeader == null || sigHeader.isBlank()) {
            throw new IllegalArgumentException("X-Razorpay-Signature header is missing");
        }
        String secret = (razorpayWebhookSecret != null && !razorpayWebhookSecret.isBlank())
                ? razorpayWebhookSecret : "rzp_webhook_secret_placeholder";
        return Utils.verifyWebhookSignature(payload, sigHeader, secret);
    }

    /**
     * Handles `subscription.charged` event by extending the tenant's currentPeriodEnd
     * and activating their account status.
     *
     * @param rawPayload raw JSON payload
     * @param signature  incoming signature
     */
    @Transactional
    public void handleSubscriptionCharged(String rawPayload, String signature) {
        String customerId = null;
        String subscriptionId = null;
        String tenantIdHint = null;
        String requestedTier = null;
        Long periodEndEpoch = null;

        try {
            JsonNode root = objectMapper.readTree(rawPayload);
            JsonNode subEntity = root.path("payload").path("subscription").path("entity");
            if (!subEntity.isMissingNode() && !subEntity.isNull()) {
                subscriptionId = subEntity.path("id").asText(null);
                customerId = subEntity.path("customer_id").asText(null);
                if (subEntity.has("current_end")) {
                    periodEndEpoch = subEntity.path("current_end").asLong();
                } else if (subEntity.has("charge_at")) {
                    periodEndEpoch = subEntity.path("charge_at").asLong();
                }
                JsonNode notes = subEntity.path("notes");
                if (!notes.isMissingNode()) {
                    tenantIdHint = notes.path("tenantId").asText(null);
                    requestedTier = notes.path("tier").asText(null);
                }
            } else {
                // Flat structure fallback
                subscriptionId = root.path("subscription_id").asText(root.path("id").asText(null));
                customerId = root.path("customer_id").asText(null);
                if (root.path("notes").has("tenantId")) {
                    tenantIdHint = root.path("notes").path("tenantId").asText(null);
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to parse subscription.charged payload via Jackson: {}", ex.getMessage());
        }

        log.info("Processing subscription.charged: customerId={}, subscriptionId={}, periodEndEpoch={}, tenantHint={}",
                customerId, subscriptionId, periodEndEpoch, tenantIdHint);

        TenantRegistry tenant = findTenant(customerId, subscriptionId, tenantIdHint);
        if (tenant == null) {
            log.error("No tenant found matching customerId [{}], subscriptionId [{}], or tenantHint [{}]",
                    customerId, subscriptionId, tenantIdHint);
            return;
        }

        if (subscriptionId != null && !subscriptionId.isBlank()) {
            tenant.setRazorpaySubscriptionId(subscriptionId);
            tenant.setStripeSubscriptionId(subscriptionId);
        }
        if (customerId != null && !customerId.isBlank()) {
            tenant.setRazorpayCustomerId(customerId);
        }

        LocalDateTime newPeriodEnd;
        if (periodEndEpoch != null && periodEndEpoch > 0) {
            newPeriodEnd = LocalDateTime.ofInstant(Instant.ofEpochSecond(periodEndEpoch), ZoneId.systemDefault());
        } else {
            newPeriodEnd = LocalDateTime.now().plusMonths(1);
        }

        tenant.setCurrentPeriodEnd(newPeriodEnd);
        tenant.setAccountStatus(AccountStatus.ACTIVE);
        tenant.setStatus(TenantStatus.ACTIVE);

        if (requestedTier != null && !requestedTier.isBlank()) {
            tenant.setSubscriptionTier(requestedTier.toUpperCase());
        } else if ("TRIAL".equalsIgnoreCase(tenant.getSubscriptionTier())) {
            tenant.setSubscriptionTier("PRO");
        }

        tenantRegistryRepository.save(tenant);
        log.info("Tenant [{}] renewed successfully via Razorpay. Tier: {}, AccountStatus: ACTIVE, currentPeriodEnd: {}",
                tenant.getTenantId(), tenant.getSubscriptionTier(), newPeriodEnd);
    }

    /**
     * Handles `subscription.cancelled` by triggering the TenantProvisioningService
     * to instantly flip the tenant's accountStatus to SUSPENDED.
     *
     * @param rawPayload raw JSON payload
     * @param signature  incoming signature
     */
    @Transactional
    public void handleSubscriptionCancelled(String rawPayload, String signature) {
        String customerId = null;
        String subscriptionId = null;
        String tenantIdHint = null;

        try {
            JsonNode root = objectMapper.readTree(rawPayload);
            JsonNode subEntity = root.path("payload").path("subscription").path("entity");
            if (!subEntity.isMissingNode() && !subEntity.isNull()) {
                subscriptionId = subEntity.path("id").asText(null);
                customerId = subEntity.path("customer_id").asText(null);
                JsonNode notes = subEntity.path("notes");
                if (!notes.isMissingNode()) {
                    tenantIdHint = notes.path("tenantId").asText(null);
                }
            } else {
                subscriptionId = root.path("subscription_id").asText(root.path("id").asText(null));
                customerId = root.path("customer_id").asText(null);
                if (root.path("notes").has("tenantId")) {
                    tenantIdHint = root.path("notes").path("tenantId").asText(null);
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to parse subscription.cancelled JSON via fallback: {}", ex.getMessage());
        }

        log.warn("Processing subscription.cancelled: customerId={}, subscriptionId={}, tenantHint={}",
                customerId, subscriptionId, tenantIdHint);

        TenantRegistry tenant = findTenant(customerId, subscriptionId, tenantIdHint);
        if (tenant == null) {
            log.error("Cannot suspend tenant: No tenant found for customer [{}] / subscription [{}] / hint [{}]",
                    customerId, subscriptionId, tenantIdHint);
            return;
        }

        tenantProvisioningService.updateTenantStatus(tenant.getTenantId(), AccountStatus.SUSPENDED);
        tenant.setAccountStatus(AccountStatus.SUSPENDED);
        tenantRegistryRepository.save(tenant);
        log.warn("ACTION COMPLETE: Tenant [{}] has been SUSPENDED following Razorpay subscription cancellation",
                tenant.getTenantId());
    }

    /**
     * Creates or prepares a Razorpay Subscription for upgrading an institution to PRO or ENTERPRISE.
     *
     * @param tenantId the tenant identifier
     * @param tier     the requested SaaS tier (PRO, ENTERPRISE)
     * @return map with checkout modal parameters
     */
    public Map<String, Object> createSubscriptionForUpgrade(String tenantId, String tier) {
        TenantRegistry tenant = tenantRegistryRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + tenantId));

        String targetTier = (tier != null && !tier.isBlank()) ? tier.trim().toUpperCase() : "PRO";
        String planId = "ENTERPRISE".equalsIgnoreCase(targetTier) ? enterprisePlanId : proPlanId;
        long amountPaise = "ENTERPRISE".equalsIgnoreCase(targetTier) ? 4999900L : 1999900L;

        String subscriptionId = null;
        if (isLiveCredentialsConfigured() && planId != null && !planId.contains("placeholder")) {
            try {
                RazorpayClient client = getOrInitRazorpayClient();
                if (client != null && client.subscriptions != null) {
                    JSONObject subRequest = new JSONObject();
                    subRequest.put("plan_id", planId);
                    subRequest.put("total_count", 12);
                    subRequest.put("quantity", 1);
                    subRequest.put("customer_notify", 1);

                    JSONObject notes = new JSONObject();
                    notes.put("tenantId", tenantId);
                    notes.put("tier", targetTier);
                    subRequest.put("notes", notes);

                    if (tenant.getRazorpayCustomerId() != null && !tenant.getRazorpayCustomerId().startsWith("cust_rzp_mock")) {
                        subRequest.put("customer_id", tenant.getRazorpayCustomerId());
                    }

                    Subscription subscription = client.subscriptions.create(subRequest);
                    subscriptionId = subscription.get("id");
                }
            } catch (Exception ex) {
                log.error("Live Razorpay subscription creation failed: {}", ex.getMessage());
            }
        }

        if (subscriptionId == null || subscriptionId.isBlank()) {
            subscriptionId = "sub_rzp_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("subscriptionId", subscriptionId);
        response.put("keyId", razorpayKeyId);
        response.put("amount", amountPaise);
        response.put("currency", "INR");
        response.put("tier", targetTier);
        response.put("institutionName", tenant.getInstitutionName());
        response.put("adminEmail", tenant.getAdminEmail() != null ? tenant.getAdminEmail() : "admin@" + tenant.getSubdomain() + ".edu");
        return response;
    }

    /**
     * Backward-compatible checkout session URL generator.
     */
    public String createCheckoutSession(String tenantId, String tier, String successUrl, String cancelUrl) {
        Map<String, Object> subData = createSubscriptionForUpgrade(tenantId, tier);
        String subId = (String) subData.get("subscriptionId");
        String targetTier = (String) subData.get("tier");
        return (successUrl != null && !successUrl.isBlank())
                ? successUrl + (successUrl.contains("?") ? "&" : "?") + "subscription_id=" + subId + "&tier=" + targetTier
                : "/billing/success?subscription_id=" + subId + "&tier=" + targetTier;
    }

    private TenantRegistry findTenant(String customerId, String subscriptionId, String tenantIdHint) {
        if (tenantIdHint != null && !tenantIdHint.isBlank()) {
            Optional<TenantRegistry> opt = tenantRegistryRepository.findById(tenantIdHint);
            if (opt.isPresent()) return opt.get();
        }
        if (subscriptionId != null && !subscriptionId.isBlank()) {
            Optional<TenantRegistry> opt = tenantRegistryRepository.findByRazorpaySubscriptionId(subscriptionId);
            if (opt.isPresent()) return opt.get();
            opt = tenantRegistryRepository.findByStripeSubscriptionId(subscriptionId);
            if (opt.isPresent()) return opt.get();
        }
        if (customerId != null && !customerId.isBlank()) {
            Optional<TenantRegistry> opt = tenantRegistryRepository.findByRazorpayCustomerId(customerId);
            if (opt.isPresent()) return opt.get();
            opt = tenantRegistryRepository.findByStripeCustomerId(customerId);
            if (opt.isPresent()) return opt.get();
        }
        return null;
    }

    private synchronized RazorpayClient getOrInitRazorpayClient() {
        if (razorpayClient != null) {
            return razorpayClient;
        }
        if (isLiveCredentialsConfigured()) {
            try {
                this.razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            } catch (Exception e) {
                log.error("Failed to initialize RazorpayClient: {}", e.getMessage());
            }
        }
        return razorpayClient;
    }

    private boolean isLiveCredentialsConfigured() {
        return razorpayKeyId != null && !razorpayKeyId.isBlank() && !razorpayKeyId.contains("placeholder")
                && razorpayKeySecret != null && !razorpayKeySecret.isBlank() && !razorpayKeySecret.contains("placeholder");
    }

    // Setters for unit testing
    public void setRazorpayKeyId(String razorpayKeyId) {
        this.razorpayKeyId = razorpayKeyId;
    }

    public void setRazorpayKeySecret(String razorpayKeySecret) {
        this.razorpayKeySecret = razorpayKeySecret;
    }

    public void setRazorpayWebhookSecret(String razorpayWebhookSecret) {
        this.razorpayWebhookSecret = razorpayWebhookSecret;
    }

    public void setRazorpayClient(RazorpayClient razorpayClient) {
        this.razorpayClient = razorpayClient;
    }

    public void setStripeApiKey(String stripeApiKey) {
        // No-op for backward-compatible test injection
    }

    public void setStripeWebhookSecret(String stripeWebhookSecret) {
        this.razorpayWebhookSecret = stripeWebhookSecret;
    }
}
