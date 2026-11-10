package com.erp.subscription;

import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.AccountStatus;
import com.erp.multitenancy.model.TenantStatus;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import com.erp.multitenancy.service.TenantProvisioningService;
import com.erp.subscription.controller.RazorpayB2BWebhookController;
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
import static org.mockito.Mockito.*;

class RazorpayB2BBillingTest {

    private static final String TEST_WEBHOOK_SECRET = "rzp_webhook_secret_for_unit_tests_12345678";

    private TenantRegistryRepository tenantRegistryRepository;
    private TenantProvisioningService tenantProvisioningService;
    private ObjectMapper objectMapper;
    private SaaSBillingService saaSBillingService;
    private RazorpayB2BWebhookController webhookController;

    @BeforeEach
    void setUp() {
        tenantRegistryRepository = mock(TenantRegistryRepository.class);
        tenantProvisioningService = mock(TenantProvisioningService.class);
        objectMapper = new ObjectMapper();

        saaSBillingService = new SaaSBillingService(tenantRegistryRepository, tenantProvisioningService, objectMapper);
        saaSBillingService.setRazorpayWebhookSecret(TEST_WEBHOOK_SECRET);
        saaSBillingService.setRazorpayKeyId("rzp_test_key_12345");
        saaSBillingService.setRazorpayKeySecret("rzp_secret_key_12345");

        webhookController = new RazorpayB2BWebhookController(saaSBillingService, objectMapper);
    }

    private String generateRazorpaySignature(String payload) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(TEST_WEBHOOK_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder();
        for (byte b : hash) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }

    @Test
    @DisplayName("createRazorpayCustomer assigns customer ID and initializes currentPeriodEnd")
    void testCreateRazorpayCustomer() {
        TenantRegistry tenant = new TenantRegistry();
        tenant.setTenantId("tenant-oxford");
        tenant.setInstitutionName("Oxford Academy");
        tenant.setTrialEndDate(LocalDateTime.now().plusDays(14));

        when(tenantRegistryRepository.save(any(TenantRegistry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String customerId = saaSBillingService.createRazorpayCustomer(tenant, "admin@oxford.edu", "Oxford Academy");

        assertThat(customerId).isNotNull();
        assertThat(customerId).contains("rzp");
        assertThat(tenant.getRazorpayCustomerId()).isEqualTo(customerId);
        assertThat(tenant.getCurrentPeriodEnd()).isNotNull();
        verify(tenantRegistryRepository, atLeastOnce()).save(tenant);
    }

    @Test
    @DisplayName("Webhook rejects missing or invalid X-Razorpay-Signature header")
    void testWebhookMissingOrInvalidSignature() {
        String payload = "{\"event\":\"subscription.charged\"}";

        // Missing signature header
        ResponseEntity<Map<String, Object>> missingSigResp = webhookController.handleWebhook(payload, null, null);
        assertThat(missingSigResp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(missingSigResp.getBody()).containsEntry("success", false);

        // Invalid signature header
        ResponseEntity<Map<String, Object>> invalidSigResp = webhookController.handleWebhook(payload, "invalid_bad_sig_hex", null);
        assertThat(invalidSigResp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(invalidSigResp.getBody()).containsEntry("success", false);
    }

    @Test
    @DisplayName("subscription.charged extends currentPeriodEnd and sets status to ACTIVE")
    void testSubscriptionChargedExtendsPeriodAndActivates() throws Exception {
        String customerId = "cust_rzp_oxford_12345";
        String subscriptionId = "sub_rzp_oxford_99999";
        long futureEpoch = Instant.now().plusSeconds(86400 * 30).getEpochSecond();

        TenantRegistry tenant = new TenantRegistry();
        tenant.setTenantId("tenant-oxford");
        tenant.setRazorpayCustomerId(customerId);
        tenant.setAccountStatus(AccountStatus.TRIAL);
        tenant.setStatus(TenantStatus.TRIAL_ACTIVE);
        tenant.setSubscriptionTier("TRIAL");

        when(tenantRegistryRepository.findByRazorpayCustomerId(customerId)).thenReturn(Optional.of(tenant));
        when(tenantRegistryRepository.findByRazorpaySubscriptionId(subscriptionId)).thenReturn(Optional.of(tenant));
        when(tenantRegistryRepository.save(any(TenantRegistry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String payload = """
                {
                  "entity": "event",
                  "event": "subscription.charged",
                  "payload": {
                    "subscription": {
                      "entity": {
                        "id": "%s",
                        "customer_id": "%s",
                        "current_end": %d,
                        "notes": {
                          "tenantId": "tenant-oxford",
                          "tier": "PRO"
                        }
                      }
                    }
                  }
                }
                """.formatted(subscriptionId, customerId, futureEpoch);

        String signature = generateRazorpaySignature(payload);

        ResponseEntity<Map<String, Object>> response = webhookController.handleWebhook(payload, signature, null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("received", true);
        assertThat(tenant.getAccountStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(tenant.getStatus()).isEqualTo(TenantStatus.ACTIVE);
        assertThat(tenant.getSubscriptionTier()).isEqualTo("PRO");
        assertThat(tenant.getRazorpaySubscriptionId()).isEqualTo(subscriptionId);
        assertThat(tenant.getCurrentPeriodEnd()).isNotNull();
        verify(tenantRegistryRepository, atLeastOnce()).save(tenant);
    }

    @Test
    @DisplayName("subscription.cancelled flips tenant accountStatus to SUSPENDED")
    void testSubscriptionCancelledSuspendsTenant() throws Exception {
        String customerId = "cust_rzp_suspend_12345";
        String subscriptionId = "sub_rzp_suspend_99999";

        TenantRegistry tenant = new TenantRegistry();
        tenant.setTenantId("tenant-cambridge");
        tenant.setRazorpayCustomerId(customerId);
        tenant.setRazorpaySubscriptionId(subscriptionId);
        tenant.setAccountStatus(AccountStatus.ACTIVE);

        when(tenantRegistryRepository.findByRazorpaySubscriptionId(subscriptionId)).thenReturn(Optional.of(tenant));
        when(tenantRegistryRepository.findByRazorpayCustomerId(customerId)).thenReturn(Optional.of(tenant));
        when(tenantRegistryRepository.save(any(TenantRegistry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String payload = """
                {
                  "entity": "event",
                  "event": "subscription.cancelled",
                  "payload": {
                    "subscription": {
                      "entity": {
                        "id": "%s",
                        "customer_id": "%s",
                        "notes": {
                          "tenantId": "tenant-cambridge"
                        }
                      }
                    }
                  }
                }
                """.formatted(subscriptionId, customerId);

        String signature = generateRazorpaySignature(payload);

        ResponseEntity<Map<String, Object>> response = webhookController.handleWebhook(payload, signature, null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("received", true);

        verify(tenantProvisioningService, times(1)).updateTenantStatus("tenant-cambridge", AccountStatus.SUSPENDED);
        assertThat(tenant.getAccountStatus()).isEqualTo(AccountStatus.SUSPENDED);
    }

    @Test
    @DisplayName("createSubscriptionForUpgrade produces valid modal parameters")
    void testCreateSubscriptionForUpgrade() {
        TenantRegistry tenant = new TenantRegistry();
        tenant.setTenantId("tenant-stanford");
        tenant.setInstitutionName("Stanford University");
        tenant.setAdminEmail("provost@stanford.edu");

        when(tenantRegistryRepository.findById("tenant-stanford")).thenReturn(Optional.of(tenant));

        Map<String, Object> details = saaSBillingService.createSubscriptionForUpgrade("tenant-stanford", "PRO");

        assertThat(details).isNotNull();
        assertThat(details.get("subscriptionId")).isNotNull();
        assertThat(details.get("keyId")).isEqualTo("rzp_test_key_12345");
        assertThat(details.get("currency")).isEqualTo("INR");
        assertThat(details.get("tier")).isEqualTo("PRO");
        assertThat(details.get("institutionName")).isEqualTo("Stanford University");
    }
}
