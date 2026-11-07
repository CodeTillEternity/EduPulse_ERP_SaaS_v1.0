package com.edupulse.core.domain.billing.service;

import com.edupulse.core.config.StripeProperties;
import com.edupulse.core.domain.billing.TenantSubscription;
import com.edupulse.core.domain.billing.repository.SubscriptionPlanRepository;
import com.edupulse.core.domain.billing.repository.TenantSubscriptionRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StripeBillingServiceTest {

    @Mock
    private TenantSubscriptionRepository tenantSubscriptionRepository;

    @Mock
    private SubscriptionPlanRepository subscriptionPlanRepository;

    private StripeProperties stripeProperties;
    private StripeBillingService billingService;

    @BeforeEach
    void setUp() {
        stripeProperties = new StripeProperties();
        stripeProperties.setSecretKey("sk_test_123");
        stripeProperties.setSuccessUrl("http://localhost:5173/success");
        stripeProperties.setCancelUrl("http://localhost:5173/cancel");

        billingService = new StripeBillingService(tenantSubscriptionRepository, subscriptionPlanRepository, stripeProperties) {
            @Override
            protected Session createStripeSession(SessionCreateParams params) throws StripeException {
                Session session = new Session();
                session.setId("cs_mock_test_session");
                session.setUrl("https://checkout.stripe.com/c/pay/cs_mock_test_session");
                session.setClientReferenceId(params.getClientReferenceId());
                return session;
            }
        };
    }

    @Test
    @DisplayName("createCheckoutSession builds checkout session with tenantId as client_reference_id")
    void createCheckoutSession_setsClientReferenceId() {
        when(tenantSubscriptionRepository.findByTenantId("tenant-oxford")).thenReturn(Optional.empty());

        String checkoutUrl = billingService.createCheckoutSession("tenant-oxford", "price_growth_tier");

        assertThat(checkoutUrl).isEqualTo("https://checkout.stripe.com/c/pay/cs_mock_test_session");
    }

    @Test
    @DisplayName("provisionSubscription marks subscription ACTIVE and saves customer/subscription IDs")
    void provisionSubscription_activatesTenantSubscription() {
        TenantSubscription existing = TenantSubscription.builder()
                .tenantId("tenant-harvard")
                .status("TRIALING")
                .build();

        when(tenantSubscriptionRepository.findByTenantId("tenant-harvard")).thenReturn(Optional.of(existing));

        billingService.provisionSubscription("tenant-harvard", "cus_999", "sub_888");

        ArgumentCaptor<TenantSubscription> captor = ArgumentCaptor.forClass(TenantSubscription.class);
        verify(tenantSubscriptionRepository).save(captor.capture());

        TenantSubscription saved = captor.getValue();
        assertThat(saved.getTenantId()).isEqualTo("tenant-harvard");
        assertThat(saved.getStripeCustomerId()).isEqualTo("cus_999");
        assertThat(saved.getStripeSubscriptionId()).isEqualTo("sub_888");
        assertThat(saved.getStatus()).isEqualTo("ACTIVE");
        assertThat(saved.getCurrentPeriodEnd()).isNotNull();
    }

    @Test
    @DisplayName("updateSubscriptionStatus updates lifecycle status and currentPeriodEnd")
    void updateSubscriptionStatus_updatesStatusAndDate() {
        TenantSubscription existing = TenantSubscription.builder()
                .tenantId("tenant-yale")
                .stripeSubscriptionId("sub_yale_1")
                .status("ACTIVE")
                .build();

        when(tenantSubscriptionRepository.findByStripeSubscriptionId("sub_yale_1")).thenReturn(Optional.of(existing));

        LocalDateTime newEnd = LocalDateTime.now().plusYears(1);
        billingService.updateSubscriptionStatus("sub_yale_1", "PAST_DUE", newEnd);

        ArgumentCaptor<TenantSubscription> captor = ArgumentCaptor.forClass(TenantSubscription.class);
        verify(tenantSubscriptionRepository).save(captor.capture());

        TenantSubscription saved = captor.getValue();
        assertThat(saved.getStatus()).isEqualTo("PAST_DUE");
        assertThat(saved.getCurrentPeriodEnd()).isEqualTo(newEnd);
    }
}
