package com.edupulse.core.domain.billing.service;

import com.edupulse.core.domain.billing.TenantSubscription;
import com.edupulse.core.domain.billing.repository.SubscriptionPlanRepository;
import com.edupulse.core.domain.billing.repository.TenantSubscriptionRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Subscription;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RazorpayBillingServiceTest {

    @Mock
    private TenantSubscriptionRepository tenantSubscriptionRepository;

    @Mock
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Mock
    private RazorpayClient razorpayClient;

    private RazorpayBillingService billingService;
    private JSONObject capturedRequest;

    @BeforeEach
    void setUp() {
        billingService = new RazorpayBillingService(tenantSubscriptionRepository, subscriptionPlanRepository, razorpayClient) {
            @Override
            protected Subscription createRazorpaySubscription(JSONObject request) throws RazorpayException {
                capturedRequest = request;
                Subscription sub = mock(Subscription.class);
                when(sub.get("id")).thenReturn("sub_rzp_mock_123456789");
                return sub;
            }
        };
    }

    @Test
    @DisplayName("createSubscription passes tenant_id in notes and returns generated subscription_id")
    void createSubscription_createsSubscriptionWithTenantInNotes() {
        when(tenantSubscriptionRepository.findByTenantId("tenant-oxford")).thenReturn(Optional.empty());

        String subscriptionId = billingService.createSubscription("tenant-oxford", "plan_growth_tier");

        assertThat(subscriptionId).isEqualTo("sub_rzp_mock_123456789");
        assertThat(capturedRequest).isNotNull();
        assertThat(capturedRequest.getString("plan_id")).isEqualTo("plan_growth_tier");
        assertThat(capturedRequest.getJSONObject("notes").getString("tenant_id")).isEqualTo("tenant-oxford");

        ArgumentCaptor<TenantSubscription> captor = ArgumentCaptor.forClass(TenantSubscription.class);
        verify(tenantSubscriptionRepository).save(captor.capture());
        TenantSubscription saved = captor.getValue();
        assertThat(saved.getTenantId()).isEqualTo("tenant-oxford");
        assertThat(saved.getRazorpaySubscriptionId()).isEqualTo("sub_rzp_mock_123456789");
        assertThat(saved.getStatus()).isEqualTo("CREATED");
    }

    @Test
    @DisplayName("activateSubscription marks tenant subscription ACTIVE and updates record")
    void activateSubscription_updatesStatusToActive() {
        TenantSubscription existing = TenantSubscription.builder()
                .tenantId("tenant-harvard")
                .status("CREATED")
                .build();

        when(tenantSubscriptionRepository.findByTenantId("tenant-harvard")).thenReturn(Optional.of(existing));

        billingService.activateSubscription("tenant-harvard", "sub_rzp_mock_123456789", "ACTIVE");

        ArgumentCaptor<TenantSubscription> captor = ArgumentCaptor.forClass(TenantSubscription.class);
        verify(tenantSubscriptionRepository).save(captor.capture());

        TenantSubscription saved = captor.getValue();
        assertThat(saved.getTenantId()).isEqualTo("tenant-harvard");
        assertThat(saved.getStatus()).isEqualTo("ACTIVE");
        assertThat(saved.getRazorpaySubscriptionId()).isEqualTo("sub_rzp_mock_123456789");
        assertThat(saved.getCurrentPeriodEnd()).isNotNull();
    }
}
