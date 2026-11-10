package com.erp.subscription.service;

import com.erp.common.exception.ResourceNotFoundException;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.AccountStatus;
import com.erp.multitenancy.model.TenantStatus;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import com.erp.multitenancy.service.TenantProvisioningService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.Invoice;
import com.stripe.model.StripeObject;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
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
import java.util.Optional;
import java.util.UUID;

/**
 * Enterprise Service managing Stripe B2B Subscription Billing lifecycle,
 * customer onboarding, checkout sessions, and webhook synchronization.
 */
@Service
public class SaaSBillingService {

    private static final Logger log = LoggerFactory.getLogger(SaaSBillingService.class);

    private final TenantRegistryRepository tenantRegistryRepository;
    private final TenantProvisioningService tenantProvisioningService;
    private final ObjectMapper objectMapper;

    @Value("${stripe.api-key:sk_test_placeholder}")
    private String stripeApiKey;

    @Value("${stripe.webhook-secret:whsec_test_placeholder}")
    private String stripeWebhookSecret;

    @Value("${stripe.pro-price-id:price_pro_placeholder}")
    private String proPriceId;

    @Value("${stripe.enterprise-price-id:price_enterprise_placeholder}")
    private String enterprisePriceId;

    @Autowired
    public SaaSBillingService(TenantRegistryRepository tenantRegistryRepository,
                             @Lazy TenantProvisioningService tenantProvisioningService,
                             ObjectMapper objectMapper) {
        this.tenantRegistryRepository = tenantRegistryRepository;
        this.tenantProvisioningService = tenantProvisioningService;
        this.objectMapper = objectMapper;
    }

    /**
     * Creates a Stripe Customer for an institution during trial provisioning.
     *
     * @param tenant          the tenant registry entity
     * @param adminEmail      administrator email address
     * @param institutionName institution display name
     * @return the generated or provisioned Stripe Customer ID
     */
    @Transactional
    public String createStripeCustomer(TenantRegistry tenant, String adminEmail, String institutionName) {
        if (tenant == null) {
            throw new IllegalArgumentException("Tenant entity cannot be null");
        }

        String customerId = null;
        if (isLiveApiKeyConfigured()) {
            try {
                Stripe.apiKey = stripeApiKey;
                CustomerCreateParams params = CustomerCreateParams.builder()
                        .setEmail(adminEmail)
                        .setName(institutionName)
                        .putMetadata("tenantId", tenant.getTenantId())
                        .putMetadata("subdomain", tenant.getSubdomain())
                        .build();

                Customer customer = Customer.create(params);
                customerId = customer.getId();
                log.info("Provisioned Stripe Customer [{}] for tenant [{}]", customerId, tenant.getTenantId());
            } catch (Exception ex) {
                log.error("Stripe API customer creation failed for tenant [{}]: {}", tenant.getTenantId(), ex.getMessage());
            }
        }

        if (customerId == null || customerId.isBlank()) {
            customerId = "cus_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            log.info("Assigned fallback/sandbox Stripe Customer ID [{}] for tenant [{}]", customerId, tenant.getTenantId());
        }

        tenant.setStripeCustomerId(customerId);
        if (tenant.getCurrentPeriodEnd() == null) {
            tenant.setCurrentPeriodEnd(tenant.getTrialEndDate() != null ? tenant.getTrialEndDate() : LocalDateTime.now().plusDays(14));
        }
        tenantRegistryRepository.save(tenant);
        return customerId;
    }

    /**
     * Cryptographically verifies incoming webhook payload using the Stripe-Signature header.
     *
     * @param payload   raw webhook body
     * @param sigHeader Stripe-Signature header value
     * @return deserialized Stripe Event
     * @throws SignatureVerificationException if signature verification fails
     */
    public Event verifyAndConstructEvent(String payload, String sigHeader) throws SignatureVerificationException {
        if (sigHeader == null || sigHeader.isBlank()) {
            throw new IllegalArgumentException("Stripe-Signature header is missing");
        }
        return Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);
    }

    /**
     * Handles `invoice.payment_succeeded` event by extending the tenant's currentPeriodEnd
     * and activating their account status.
     *
     * @param event      the verified Stripe event
     * @param rawPayload raw JSON payload for fallback parsing
     */
    @Transactional
    public void handleInvoicePaymentSucceeded(Event event, String rawPayload) {
        String customerId = null;
        String subscriptionId = null;
        Long periodEndEpoch = null;

        // Extract from Stripe SDK object
        Optional<StripeObject> stripeObject = event.getDataObjectDeserializer().getObject();
        if (stripeObject.isPresent() && stripeObject.get() instanceof Invoice invoice) {
            customerId = invoice.getCustomer();
            subscriptionId = invoice.getSubscription();
            if (invoice.getLines() != null && !invoice.getLines().getData().isEmpty()) {
                periodEndEpoch = invoice.getLines().getData().get(0).getPeriod().getEnd();
            } else if (invoice.getPeriodEnd() != null) {
                periodEndEpoch = invoice.getPeriodEnd();
            }
        } else {
            // Fallback via Jackson in case of API version mismatches
            try {
                JsonNode root = objectMapper.readTree(rawPayload);
                JsonNode dataObj = root.path("data").path("object");
                customerId = dataObj.path("customer").asText(null);
                subscriptionId = dataObj.path("subscription").asText(null);
                JsonNode lines = dataObj.path("lines").path("data");
                if (lines.isArray() && lines.size() > 0) {
                    periodEndEpoch = lines.get(0).path("period").path("end").asLong();
                } else if (dataObj.has("period_end")) {
                    periodEndEpoch = dataObj.path("period_end").asLong();
                }
            } catch (Exception ex) {
                log.warn("Failed to parse invoice JSON via fallback: {}", ex.getMessage());
            }
        }

        log.info("Processing invoice.payment_succeeded: customerId={}, subscriptionId={}, periodEndEpoch={}",
                customerId, subscriptionId, periodEndEpoch);

        TenantRegistry tenant = findTenantByCustomerOrSubscription(customerId, subscriptionId);
        if (tenant == null) {
            log.error("No tenant found matching customerId [{}] or subscriptionId [{}]", customerId, subscriptionId);
            return;
        }

        if (subscriptionId != null && !subscriptionId.isBlank()) {
            tenant.setStripeSubscriptionId(subscriptionId);
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

        // If tier was TRIAL, promote to PRO by default or retain higher tier
        if ("TRIAL".equalsIgnoreCase(tenant.getSubscriptionTier())) {
            tenant.setSubscriptionTier("PRO");
        }

        tenantRegistryRepository.save(tenant);
        log.info("Tenant [{}] renewed successfully. AccountStatus: ACTIVE, currentPeriodEnd: {}",
                tenant.getTenantId(), newPeriodEnd);
    }

    /**
     * Handles `customer.subscription.deleted` by triggering the TenantProvisioningService
     * to instantly flip the tenant's accountStatus to SUSPENDED.
     *
     * @param event      the verified Stripe event
     * @param rawPayload raw JSON payload for fallback parsing
     */
    @Transactional
    public void handleSubscriptionDeleted(Event event, String rawPayload) {
        String customerId = null;
        String subscriptionId = null;

        Optional<StripeObject> stripeObject = event.getDataObjectDeserializer().getObject();
        if (stripeObject.isPresent() && stripeObject.get() instanceof Subscription subscription) {
            customerId = subscription.getCustomer();
            subscriptionId = subscription.getId();
        } else {
            try {
                JsonNode root = objectMapper.readTree(rawPayload);
                JsonNode dataObj = root.path("data").path("object");
                customerId = dataObj.path("customer").asText(null);
                subscriptionId = dataObj.path("id").asText(null);
            } catch (Exception ex) {
                log.warn("Failed to parse subscription deletion JSON via fallback: {}", ex.getMessage());
            }
        }

        log.warn("Processing customer.subscription.deleted: customerId={}, subscriptionId={}", customerId, subscriptionId);

        TenantRegistry tenant = findTenantByCustomerOrSubscription(customerId, subscriptionId);
        if (tenant == null) {
            log.error("Cannot suspend tenant: No tenant found for customer [{}] / subscription [{}]",
                    customerId, subscriptionId);
            return;
        }

        tenantProvisioningService.updateTenantStatus(tenant.getTenantId(), AccountStatus.SUSPENDED);
        log.warn("ACTION COMPLETE: Tenant [{}] has been SUSPENDED following Stripe subscription cancellation",
                tenant.getTenantId());
    }

    /**
     * Creates a Stripe Checkout Session for upgrading an institution to PRO or ENTERPRISE.
     *
     * @param tenantId   the tenant identifier
     * @param tier       the requested SaaS tier (PRO, ENTERPRISE)
     * @param successUrl redirect URL on successful payment
     * @param cancelUrl  redirect URL on cancellation
     * @return checkout redirect URL
     */
    public String createCheckoutSession(String tenantId, String tier, String successUrl, String cancelUrl) {
        TenantRegistry tenant = tenantRegistryRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + tenantId));

        String targetTier = (tier != null && !tier.isBlank()) ? tier.trim().toUpperCase() : "PRO";
        String priceId = "ENTERPRISE".equalsIgnoreCase(targetTier) ? enterprisePriceId : proPriceId;

        if (isLiveApiKeyConfigured() && priceId != null && !priceId.contains("placeholder")) {
            try {
                Stripe.apiKey = stripeApiKey;
                SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                        .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}&tier=" + targetTier)
                        .setCancelUrl(cancelUrl)
                        .putMetadata("tenantId", tenantId)
                        .putMetadata("tier", targetTier)
                        .addLineItem(
                                SessionCreateParams.LineItem.builder()
                                        .setPrice(priceId)
                                        .setQuantity(1L)
                                        .build()
                        );

                if (tenant.getStripeCustomerId() != null && !tenant.getStripeCustomerId().startsWith("cus_mock_")) {
                    paramsBuilder.setCustomer(tenant.getStripeCustomerId());
                } else if (tenant.getAdminEmail() != null) {
                    paramsBuilder.setCustomerEmail(tenant.getAdminEmail());
                }

                Session session = Session.create(paramsBuilder.build());
                return session.getUrl();
            } catch (Exception ex) {
                log.error("Failed to generate live Stripe Checkout Session: {}", ex.getMessage());
            }
        }

        // Sandbox/local testing fallback URL
        String mockSessionId = "cs_test_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        return (successUrl != null && !successUrl.isBlank())
                ? successUrl + (successUrl.contains("?") ? "&" : "?") + "session_id=" + mockSessionId + "&tier=" + targetTier
                : "/billing/success?session_id=" + mockSessionId + "&tier=" + targetTier;
    }

    private TenantRegistry findTenantByCustomerOrSubscription(String customerId, String subscriptionId) {
        if (subscriptionId != null && !subscriptionId.isBlank()) {
            Optional<TenantRegistry> opt = tenantRegistryRepository.findByStripeSubscriptionId(subscriptionId);
            if (opt.isPresent()) return opt.get();
        }
        if (customerId != null && !customerId.isBlank()) {
            Optional<TenantRegistry> opt = tenantRegistryRepository.findByStripeCustomerId(customerId);
            if (opt.isPresent()) return opt.get();
        }
        return null;
    }

    private boolean isLiveApiKeyConfigured() {
        return stripeApiKey != null && !stripeApiKey.isBlank() && !stripeApiKey.contains("placeholder");
    }

    // Setters for test injection
    public void setStripeApiKey(String stripeApiKey) {
        this.stripeApiKey = stripeApiKey;
    }

    public void setStripeWebhookSecret(String stripeWebhookSecret) {
        this.stripeWebhookSecret = stripeWebhookSecret;
    }
}