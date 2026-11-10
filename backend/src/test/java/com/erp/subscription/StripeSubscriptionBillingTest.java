package com.erp.subscription;

import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.AccountStatus;
import com.erp.multitenancy.model.TenantStatus;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import com.erp.multitenancy.service.TenantProvisioningService;
import com.erp.subscription.controller.StripeWebhookController;
import com.erp.subscription.service.SaaSBillingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class StripeSubscriptionBillingTest {

    private static final String TEST_WEBHOOK_SECRET = "whsec_test_secret_for_unit_tests_12345678";

    private TenantRegistryRepository tenantRegistryRepository;
    private TenantProvisioningService tenantProvisioningService;
    private ObjectMapper objectMapper;
    private SaaSBillingService saaSBillingService;
    private StripeWebhookController webhookController;

    @BeforeEach
    void setUp() {
        tenantRegistryRepository = mock(TenantRegistryRepository.class);
        tenantProvisioningService = mock(TenantProvisioningService.class);
        objectMapper = new ObjectMapper();

        saaSBillingService = new SaaSBillingService(tenantRegistryRepository, tenantProvisioningService, objectMapper);
        saaSBillingService.setStripeWebhookSecret(TEST_WEBHOOK_SECRET);
        saaSBillingService.setStripeApiKey("sk_test_placeholder");

        webhookController = new StripeWebhookController(saaSBillingService);
    }

    private String generateSignatureHeader(String payload, long timestamp) throws Exception {
        String payloadToSign = timestamp + "." + payload;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(TEST_WEBHOOK_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(payloadToSign.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder();
        for (byte b : hash) {
            hex.append(String.format("%02x", b));
        }
        return "t=" + timestamp + ",v1=" + hex;
    }

    @Test
    @DisplayName("createStripeCustomer assigns customer ID and initializes currentPeriodEnd")
    void testCreateStripeCustomer() {
        TenantRegistry tenant = new TenantRegistry();
        tenant.setTenantId("tenant-oxford");
        tenant.setInstitutionName("Oxford Academy");
        tenant.setTrialEndDate(LocalDateTime.now().plusDays(14));

        when(tenantRegistryRepository.save(any(TenantRegistry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String customerId = saaSBillingService.createStripeCustomer(tenant, "admin@oxford.edu", "Oxford Academy");

        assertThat(customerId).isNotNull();
        assertThat(customerId).startsWith("cus_");
        assertThat(tenant.getStripeCustomerId()).isEqualTo(customerId);
        assertThat(tenant.getCurrentPeriodEnd()).isNotNull();
        verify(tenantRegistryRepository, atLeastOnce()).save(tenant);
    }

    @Test
    @DisplayName("Webhook rejects missing or invalid Stripe-Signature header")
    void testWebhookMissingOrInvalidSignature() {
        String payload = "{\"id\":\"evt_123\",\"type\":\"invoice.payment_succeeded\"}";

        // Missing signature header
        ResponseEntity<Map<String, Object>> missingSigResp = webhookController.handleStripeWebhook(payload, null);
        assertThat(missingSigResp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(missingSigResp.getBody()).containsEntry("success", false);

        // Invalid signature header
        ResponseEntity<Map<String, Object>> invalidSigResp = webhookController.handleStripeWebhook(payload, "t=123,v1=bad_signature");
        assertThat(invalidSigResp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(invalidSigResp.getBody()).containsEntry("success", false);
    }

    @Test
    @DisplayName("invoice.payment_succeeded extends currentPeriodEnd and sets status to ACTIVE")
    void testInvoicePaymentSucceededExtendsPeriodAndActivates() throws Exception {
        String customerId = "cus_oxford_12345";
        String subscriptionId = "sub_oxford_99999";
        long futureEpoch = Instant.now().plusSeconds(86400 * 30).getEpochSecond();

        TenantRegistry tenant = new TenantRegistry();
        tenant.setTenantId("tenant-oxford");
        tenant.setStripeCustomerId(customerId);
        tenant.setAccountStatus(AccountStatus.TRIAL);
        tenant.setStatus(TenantStatus.TRIAL_ACTIVE);
        tenant.setSubscriptionTier("TRIAL");

        when(tenantRegistryRepository.findByStripeCustomerId(customerId)).thenReturn(Optional.of(tenant));
        when(tenantRegistryRepository.findByStripeSubscriptionId(subscriptionId)).thenReturn(Optional.of(tenant));
        when(tenantRegistryRepository.save(any(TenantRegistry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String payload = """
                {
                  "id": "evt_test_payment_succeeded",
                  "object": "event",
                  "type": "invoice.payment_succeeded",
                  "data": {
                    "object": {
                      "id": "in_12345",
                      "customer": "%s",
                      "subscription": "%s",
                      "period_end": %d,
                      "lines": {
                        "data": [
                          {
                            "period": {
                              "end": %d
                            }
                          }
                        ]
                      }
                    }
                  }
                }
                """.formatted(customerId, subscriptionId, futureEpoch, futureEpoch);

        long timestamp = Instant.now().getEpochSecond();
        String sigHeader = generateSignatureHeader(payload, timestamp);

        ResponseEntity<Map<String, Object>> response = webhookController.handleStripeWebhook(payload, sigHeader);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("received", true);
        assertThat(tenant.getAccountStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(tenant.getStatus()).isEqualTo(TenantStatus.ACTIVE);
        assertThat(tenant.getSubscriptionTier()).isEqualTo("PRO");
        assertThat(tenant.getStripeSubscriptionId()).isEqualTo(subscriptionId);
        assertThat(tenant.getCurrentPeriodEnd()).isNotNull();
        verify(tenantRegistryRepository, atLeastOnce()).save(tenant);
    }

    @Test
    @DisplayName("customer.subscription.deleted flips tenant accountStatus to SUSPENDED")
    void testCustomerSubscriptionDeletedSuspendsTenant() throws Exception {
        String customerId = "cus_suspend_12345";
        String subscriptionId = "sub_suspend_99999";

        TenantRegistry tenant = new TenantRegistry();
        tenant.setTenantId("tenant-cambridge");
        tenant.setStripeCustomerId(customerId);
        tenant.setStripeSubscriptionId(subscriptionId);
        tenant.setAccountStatus(AccountStatus.ACTIVE);

        when(tenantRegistryRepository.findByStripeSubscriptionId(subscriptionId)).thenReturn(Optional.of(tenant));
        when(tenantRegistryRepository.findByStripeCustomerId(customerId)).thenReturn(Optional.of(tenant));

        String payload = """
                {
                  "id": "evt_test_sub_deleted",
                  "object": "event",
                  "type": "customer.subscription.deleted",
                  "data": {
                    "object": {
                      "id": "%s",
                      "customer": "%s"
                    }
                  }
                }
                """.formatted(subscriptionId, customerId);

        long timestamp = Instant.now().getEpochSecond();
        String sigHeader = generateSignatureHeader(payload, timestamp);

        ResponseEntity<Map<String, Object>> response = webhookController.handleStripeWebhook(payload, sigHeader);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("received", true);

        verify(tenantProvisioningService, times(1)).updateTenantStatus("tenant-cambridge", AccountStatus.SUSPENDED);
    }
}