package com.edupulse.core.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for Stripe API and Webhook credentials.
 * Automatically binds properties prefixed with 'stripe' from application configuration.
 */
@Configuration
@ConfigurationProperties(prefix = "stripe")
@Data
public class StripeProperties {

    /**
     * Secret API Key used to authenticate requests to Stripe.
     */
    private String secretKey;

    /**
     * Fallback API Key alias commonly used in standard Stripe configs.
     */
    private String apiKey;

    /**
     * Webhook signing secret used to verify cryptographic signatures of incoming webhook payloads.
     */
    private String webhookSecret = "whsec_placeholder";

    /**
     * Redirect URL for successful checkout completions.
     */
    private String successUrl = "http://localhost:5173/billing?session_id={CHECKOUT_SESSION_ID}";

    /**
     * Redirect URL for cancelled checkout sessions.
     */
    private String cancelUrl = "http://localhost:5173/billing?cancelled=true";

    /**
     * Returns the active secret key, falling back to apiKey if secretKey is not explicitly set.
     *
     * @return Stripe secret key
     */
    public String getSecretKey() {
        if (secretKey != null && !secretKey.isBlank()) {
            return secretKey;
        }
        if (apiKey != null && !apiKey.isBlank()) {
            return apiKey;
        }
        return "sk_test_placeholder";
    }
}

