package com.edupulse.core.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

/**
 * Initializes the Stripe Java SDK with global API credentials during application bootstrap.
 */
@Configuration("coreStripeConfig")
@Slf4j
public class StripeConfig {

    private final StripeProperties stripeProperties;

    public StripeConfig(StripeProperties stripeProperties) {
        this.stripeProperties = stripeProperties;
    }

    @PostConstruct
    public void initStripeApiKey() {
        String secretKey = stripeProperties.getSecretKey();
        Stripe.apiKey = secretKey;
        log.info("Initialized Stripe Java SDK with API key: [configured={}]", secretKey != null && !secretKey.isBlank());
    }
}

