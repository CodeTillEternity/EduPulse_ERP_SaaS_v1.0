package com.erp.subscription.controller;

import com.erp.common.response.ApiResponse;
import com.erp.subscription.entity.SubscriptionPlan;
import com.erp.subscription.entity.TenantSubscription;
import com.erp.subscription.service.SubscriptionService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.checkout.Session;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripeWebhookControllerTest {

    @Mock
    private SubscriptionService subscriptionService;

    private StripeWebhookController webhookController;

    @BeforeEach
    void setUp() {
        webhookController = spy(new StripeWebhookController(subscriptionService));
    }

    @Test
    void shouldReturnBadRequestWhenStripeSignatureHeaderIsMissing() {
        ResponseEntity<ApiResponse<String>> response = webhookController.handleStripeWebhook("{}", null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertTrue(response.getBody().getMessage().contains("Missing Stripe-Signature header"));
        verifyNoInteractions(subscriptionService);
    }

    @Test
    void shouldReturnBadRequestWhenSignatureVerificationFails() throws Exception {
        doThrow(new SignatureVerificationException("Sig mismatch", "bad_sig"))
                .when(webhookController).constructEvent(any(), any(), any());

        ResponseEntity<ApiResponse<String>> response = webhookController.handleStripeWebhook("{}", "bad_sig");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertTrue(response.getBody().getMessage().contains("Invalid webhook signature"));
        verifyNoInteractions(subscriptionService);
    }

    @Test
    void shouldProcessCheckoutSessionCompletedEventAndActivateSubscription() throws Exception {
        String sessionId = "cs_test_abc123";
        String tenantId = "tenant-apex-101";

        Event event = mock(Event.class);
        EventDataObjectDeserializer deserializer = mock(EventDataObjectDeserializer.class);
        Session session = mock(Session.class);

        when(event.getId()).thenReturn("evt_test_1");
        when(event.getType()).thenReturn("checkout.session.completed");
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(session));

        when(session.getId()).thenReturn(sessionId);
        when(session.getClientReferenceId()).thenReturn(tenantId);
        when(session.getMetadata()).thenReturn(Map.of(
                "tenant_id", tenantId,
                "plan_name", "Growth",
                "billing_cycle", "MONTHLY"
        ));

        SubscriptionPlan plan = new SubscriptionPlan("Growth", 2500, 25600, true);
        TenantSubscription mockSub = new TenantSubscription(tenantId, plan, "MONTHLY", LocalDateTime.now().plusMonths(1), true);
        when(subscriptionService.activateSubscription(eq(tenantId), any(), eq("Growth"), eq("MONTHLY")))
                .thenReturn(mockSub);

        doReturn(event).when(webhookController).constructEvent(any(), any(), any());

        ResponseEntity<ApiResponse<String>> response = webhookController.handleStripeWebhook("{}", "valid_sig");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(sessionId, response.getBody().getData());

        verify(subscriptionService, times(1))
                .activateSubscription(eq(tenantId), any(), eq("Growth"), eq("MONTHLY"));
    }

    @Test
    void shouldProcessSessionIdempotentlyWhenDuplicateEventDelivered() throws Exception {
        String sessionId = "cs_test_idempotent_999";
        String tenantId = "tenant-apex-102";

        Event event = mock(Event.class);
        EventDataObjectDeserializer deserializer = mock(EventDataObjectDeserializer.class);
        Session session = mock(Session.class);

        when(event.getId()).thenReturn("evt_test_2");
        when(event.getType()).thenReturn("checkout.session.completed");
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(session));

        when(session.getId()).thenReturn(sessionId);
        when(session.getClientReferenceId()).thenReturn(tenantId);
        when(session.getMetadata()).thenReturn(Map.of(
                "tenant_id", tenantId,
                "plan_name", "Enterprise",
                "billing_cycle", "ANNUAL"
        ));

        doReturn(event).when(webhookController).constructEvent(any(), any(), any());

        // First delivery
        ResponseEntity<ApiResponse<String>> first = webhookController.handleStripeWebhook("{}", "valid_sig");
        assertEquals(HttpStatus.OK, first.getStatusCode());

        // Second delivery of duplicate session ID
        ResponseEntity<ApiResponse<String>> second = webhookController.handleStripeWebhook("{}", "valid_sig");
        assertEquals(HttpStatus.OK, second.getStatusCode());
        assertTrue(second.getBody().getMessage().contains("already processed"));

        // SubscriptionService must ONLY have been called once
        verify(subscriptionService, times(1))
                .activateSubscription(eq(tenantId), any(), eq("Enterprise"), eq("ANNUAL"));
    }

    @Test
    void shouldIgnoreUnrelatedStripeEventsGracefully() throws Exception {
        Event event = mock(Event.class);
        when(event.getId()).thenReturn("evt_other_3");
        when(event.getType()).thenReturn("customer.subscription.updated");

        doReturn(event).when(webhookController).constructEvent(any(), any(), any());

        ResponseEntity<ApiResponse<String>> response = webhookController.handleStripeWebhook("{}", "valid_sig");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verifyNoInteractions(subscriptionService);
    }
}
