package com.edupulse.core.api.rest.webhook;

import com.edupulse.core.config.StripeProperties;
import com.edupulse.core.domain.billing.service.StripeBillingService;
import com.stripe.net.Webhook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class StripeWebhookControllerTest {

    @Mock
    private StripeBillingService stripeBillingService;

    private StripeProperties stripeProperties;
    private StripeWebhookController webhookController;

    private static final String TEST_SECRET = "whsec_test_secret_for_unit_tests_123456";

    @BeforeEach
    void setUp() {
        stripeProperties = new StripeProperties();
        stripeProperties.setWebhookSecret(TEST_SECRET);
        webhookController = new StripeWebhookController(stripeBillingService, stripeProperties);
    }

    @Test
    @DisplayName("handleStripeWebhook returns 400 when Stripe-Signature header is missing")
    void handleStripeWebhook_missingSignature_returnsBadRequest() {
        ResponseEntity<String> response = webhookController.handleStripeWebhook("{\"type\": \"test\"}", null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("Missing Stripe-Signature header");
        verifyNoInteractions(stripeBillingService);
    }

    @Test
    @DisplayName("handleStripeWebhook returns 400 when signature verification fails")
    void handleStripeWebhook_invalidSignature_returnsBadRequest() {
        ResponseEntity<String> response = webhookController.handleStripeWebhook(
                "{\"type\": \"test\"}",
                "t=12345,v1=invalid_signature_hex"
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("Invalid Stripe signature");
        verifyNoInteractions(stripeBillingService);
    }

    @Test
    @DisplayName("handleStripeWebhook returns 200 OK for cryptographically verified Stripe event")
    void handleStripeWebhook_validSignature_returnsOk() throws Exception {
        String payload = "{\"id\": \"evt_test_123\", \"object\": \"event\", \"type\": \"ping\"}";
        long timestamp = Instant.now().getEpochSecond();
        String signedPayload = timestamp + "." + payload;
        String signature = Webhook.Util.computeHmacSha256(TEST_SECRET, signedPayload);
        String sigHeader = "t=" + timestamp + ",v1=" + signature;

        ResponseEntity<String> response = webhookController.handleStripeWebhook(payload, sigHeader);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("Webhook processed successfully");
    }
}
