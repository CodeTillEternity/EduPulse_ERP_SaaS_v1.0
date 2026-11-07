package com.edupulse.core.config;

import com.razorpay.RazorpayClient;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RazorpayConfigTest {

    @Test
    @DisplayName("RazorpayConfig should instantiate RazorpayClient bean with configured properties")
    void razorpayClientBean_instantiatesSuccessfully() throws Exception {
        RazorpayProperties properties = new RazorpayProperties();
        properties.setKeyId("rzp_test_mock_key_123");
        properties.setKeySecret("rzp_secret_mock_secret_456");
        properties.setWebhookSecret("rzp_webhook_secret_789");

        RazorpayConfig config = new RazorpayConfig(properties);
        RazorpayClient client = config.razorpayClient();

        assertThat(client).isNotNull();
        assertThat(properties.getKeyId()).isEqualTo("rzp_test_mock_key_123");
        assertThat(properties.getKeySecret()).isEqualTo("rzp_secret_mock_secret_456");
        assertThat(properties.getWebhookSecret()).isEqualTo("rzp_webhook_secret_789");
    }
}
