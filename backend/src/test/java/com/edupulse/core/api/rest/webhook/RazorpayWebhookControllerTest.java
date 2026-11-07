package com.edupulse.core.api.rest.webhook;

import com.edupulse.core.config.RazorpayProperties;
import com.edupulse.core.domain.billing.service.RazorpayBillingService;
import com.razorpay.RazorpayException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RazorpayWebhookControllerTest {

    @Mock
    private RazorpayBillingService razorpayBillingService;

    private RazorpayProperties razorpayProperties;
    private RazorpayWebhookController controller;
    private boolean signatureValid = true;

    @BeforeEach
    void setUp() {
        razorpayProperties = new RazorpayProperties();
        razorpayProperties.setWebhookSecret("test_webhook_secret_123");
        razorpayProperties.setKeyId("rzp_test_key_abc");

        controller = new RazorpayWebhookController(razorpayBillingService, razorpayProperties) {
            @Override
            protected boolean verifyWebhookSignature(String payload, String signatureHeader, String webhookSecret) throws RazorpayException {
                return signatureValid;
            }
        };
    }

    @Test
    @DisplayName("handleRazorpayWebhook returns 400 when x-razorpay-signature header is missing")
    void handleRazorpayWebhook_missingSignature_returnsBadRequest() {
        ResponseEntity<String> response = controller.handleRazorpayWebhook("{}", null);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("Missing x-razorpay-signature header");
    }

    @Test
    @DisplayName("handleRazorpayWebhook returns 400 when signature verification fails")
    void handleRazorpayWebhook_invalidSignature_returnsBadRequest() {
        signatureValid = false;
        ResponseEntity<String> response = controller.handleRazorpayWebhook("{}", "invalid_sig");
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("Invalid webhook signature");
    }

    @Test
    @DisplayName("handleRazorpayWebhook extracts tenant_id from payload.entity.notes and activates subscription")
    void handleRazorpayWebhook_validSubscriptionCharged_activatesTenant() {
        signatureValid = true;
        String payload = """
                {
                  "event": "subscription.charged",
                  "payload": {
                    "subscription": {
                      "entity": {
                        "id": "sub_rzp_mock_123",
                        "status": "active",
                        "notes": {
                          "tenant_id": "tenant-cambridge"
                        }
                      }
                    }
                  }
                }
                """;

        ResponseEntity<String> response = controller.handleRazorpayWebhook(payload, "valid_sig_123");
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(razorpayBillingService).activateSubscription("tenant-cambridge", "sub_rzp_mock_123", "ACTIVE");
    }

    @Test
    @DisplayName("handleRazorpayWebhook extracts tenant_id from payment.captured event")
    void handleRazorpayWebhook_paymentCaptured_activatesTenant() {
        signatureValid = true;
        String payload = """
                {
                  "event": "payment.captured",
                  "payload": {
                    "payment": {
                      "entity": {
                        "id": "pay_rzp_mock_999",
                        "subscription_id": "sub_rzp_mock_999",
                        "notes": {
                          "tenant_id": "tenant-stanford"
                        }
                      }
                    }
                  }
                }
                """;

        ResponseEntity<String> response = controller.handleRazorpayWebhook(payload, "valid_sig_999");
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(razorpayBillingService).activateSubscription("tenant-stanford", "sub_rzp_mock_999", "ACTIVE");
    }

    @Test
    @DisplayName("createRazorpaySubscription generates subscription and returns id and key")
    void createRazorpaySubscription_returnsSubscriptionDetails() {
        when(razorpayBillingService.createSubscription("tenant-princeton", "plan_enterprise_999"))
                .thenReturn("sub_rzp_princeton_123");

        ResponseEntity<Map<String, Object>> response = controller.createRazorpaySubscription(
                Map.of("tenantId", "tenant-princeton", "planId", "plan_enterprise_999")
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("subscriptionId")).isEqualTo("sub_rzp_princeton_123");
        assertThat(response.getBody().get("keyId")).isEqualTo("rzp_test_key_abc");
    }
}
