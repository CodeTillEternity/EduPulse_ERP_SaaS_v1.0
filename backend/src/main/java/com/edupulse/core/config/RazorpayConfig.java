package com.edupulse.core.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Initializes and exposes the official RazorpayClient Spring Bean for
 * RBI-compliant recurring SaaS subscription billing and payment operations.
 */
@Configuration("coreRazorpayConfig")
@Slf4j
public class RazorpayConfig {

    private final RazorpayProperties razorpayProperties;

    public RazorpayConfig(RazorpayProperties razorpayProperties) {
        this.razorpayProperties = razorpayProperties;
    }

    /**
     * Exposes a singleton RazorpayClient instance configured with the Key ID and Key Secret.
     *
     * @return Initialized RazorpayClient bean
     * @throws RazorpayException if client instantiation encounters an unexpected error
     */
    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        String keyId = razorpayProperties.getKeyId();
        String keySecret = razorpayProperties.getKeySecret();
        log.info("Initializing RazorpayClient bean with keyId: [configured={}]",
                keyId != null && !keyId.isBlank() && !keyId.contains("placeholder"));
        return new RazorpayClient(keyId, keySecret);
    }
}
