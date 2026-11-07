package com.edupulse.core.config;

import com.stripe.Stripe;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class StripeConfigTest {

    @Test
    @DisplayName("StripeConfig should set Stripe.apiKey from StripeProperties")
    void initStripeApiKey_setsStripeApiKey() {
        StripeProperties properties = new StripeProperties();
        properties.setSecretKey("sk_test_mock_1234567890abcdef");
        properties.setWebhookSecret("whsec_test_secret");

        StripeConfig config = new StripeConfig(properties);
        config.initStripeApiKey();

        assertThat(Stripe.apiKey).isEqualTo("sk_test_mock_1234567890abcdef");
        assertThat(properties.getWebhookSecret()).isEqualTo("whsec_test_secret");
    }

    @Test
    @DisplayName("StripeProperties should fall back to apiKey if secretKey is unset")
    void stripeProperties_fallsBackToApiKey() {
        StripeProperties properties = new StripeProperties();
        properties.setApiKey("sk_test_fallback_api_key");

        assertThat(properties.getSecretKey()).isEqualTo("sk_test_fallback_api_key");
    }
}

