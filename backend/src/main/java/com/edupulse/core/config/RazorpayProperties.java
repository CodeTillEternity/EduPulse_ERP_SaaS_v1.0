package com.edupulse.core.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for Razorpay API credentials and webhook secrets.
 * Automatically binds properties prefixed with 'razorpay' from the environment
 * or application YAML configuration.
 */
@Configuration("coreRazorpayProperties")
@ConfigurationProperties(prefix = "razorpay")
@Data
public class RazorpayProperties {

    /**
     * Razorpay API Key ID (public key identifier).
     */
    private String keyId = "rzp_test_placeholder";

    /**
     * Razorpay API Key Secret (private cryptographic secret).
     */
    private String keySecret = "rzp_secret_placeholder";

    /**
     * Secret token used to cryptographically verify incoming webhook signatures.
     */
    private String webhookSecret = "rzp_webhook_secret_placeholder";
}
