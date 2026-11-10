package com.erp.subscription;

import com.edupulse.core.api.rest.AcademicExamController;
import com.edupulse.core.api.rest.FinanceController;
import com.edupulse.core.domain.academic.dto.ExamSubmissionRequestDTO;
import com.edupulse.core.domain.academic.dto.ExamSubmissionResponseDTO;
import com.edupulse.core.domain.academic.service.AcademicService;
import com.edupulse.core.domain.academic.service.ExamSecurityService;
import com.edupulse.core.domain.academic.service.SebConfigurationService;
import com.edupulse.core.domain.finance.service.FinanceService;
import com.erp.common.exception.GlobalExceptionHandler;
import com.erp.common.exception.PaymentRequiredException;
import com.erp.multitenancy.TenantContext;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.AccountStatus;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import com.erp.subscription.annotation.RequiresSaaSTier;
import com.erp.subscription.aspect.EntitlementAspect;
import com.erp.subscription.model.SaaSTier;
import com.erp.subscription.repository.SubscriptionPlanRepository;
import com.erp.subscription.repository.TenantSubscriptionRepository;
import com.erp.subscription.service.EntitlementService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.reflect.MethodSignature;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.aop.aspectj.annotation.AspectJProxyFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import java.lang.reflect.Method;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class EntitlementEngineTest {

    private TenantRegistryRepository tenantRegistryRepository;
    private TenantSubscriptionRepository tenantSubscriptionRepository;
    private SubscriptionPlanRepository subscriptionPlanRepository;
    private EntitlementService entitlementService;
    private EntitlementAspect entitlementAspect;
    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        tenantRegistryRepository = mock(TenantRegistryRepository.class);
        tenantSubscriptionRepository = mock(TenantSubscriptionRepository.class);
        subscriptionPlanRepository = mock(SubscriptionPlanRepository.class);

        entitlementService = new EntitlementService(
                tenantSubscriptionRepository,
                subscriptionPlanRepository,
                tenantRegistryRepository
        );

        entitlementAspect = new EntitlementAspect(entitlementService);
        exceptionHandler = new GlobalExceptionHandler();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("hasTierEntitlement evaluates tier hierarchy correctly")
    void testHasTierEntitlementHierarchy() {
        TenantRegistry enterpriseTenant = new TenantRegistry();
        enterpriseTenant.setTenantId("tenant-enterprise");
        enterpriseTenant.setSubscriptionTier("ENTERPRISE");
        enterpriseTenant.setAccountStatus(AccountStatus.ACTIVE);

        TenantRegistry proTenant = new TenantRegistry();
        proTenant.setTenantId("tenant-pro");
        proTenant.setSubscriptionTier("PRO");
        proTenant.setAccountStatus(AccountStatus.ACTIVE);

        TenantRegistry trialTenant = new TenantRegistry();
        trialTenant.setTenantId("tenant-trial");
        trialTenant.setSubscriptionTier("TRIAL");
        trialTenant.setAccountStatus(AccountStatus.TRIAL);

        TenantRegistry suspendedTenant = new TenantRegistry();
        suspendedTenant.setTenantId("tenant-suspended");
        suspendedTenant.setSubscriptionTier("ENTERPRISE");
        suspendedTenant.setAccountStatus(AccountStatus.SUSPENDED);

        when(tenantRegistryRepository.findById("tenant-enterprise")).thenReturn(Optional.of(enterpriseTenant));
        when(tenantRegistryRepository.findById("tenant-pro")).thenReturn(Optional.of(proTenant));
        when(tenantRegistryRepository.findById("tenant-trial")).thenReturn(Optional.of(trialTenant));
        when(tenantRegistryRepository.findById("tenant-suspended")).thenReturn(Optional.of(suspendedTenant));

        // Enterprise satisfies all tiers
        assertThat(entitlementService.hasTierEntitlement("tenant-enterprise", SaaSTier.ENTERPRISE)).isTrue();
        assertThat(entitlementService.hasTierEntitlement("tenant-enterprise", SaaSTier.PRO)).isTrue();
        assertThat(entitlementService.hasTierEntitlement("tenant-enterprise", SaaSTier.TRIAL)).isTrue();

        // Pro satisfies PRO and TRIAL, but NOT Enterprise
        assertThat(entitlementService.hasTierEntitlement("tenant-pro", SaaSTier.PRO)).isTrue();
        assertThat(entitlementService.hasTierEntitlement("tenant-pro", SaaSTier.TRIAL)).isTrue();
        assertThat(entitlementService.hasTierEntitlement("tenant-pro", SaaSTier.ENTERPRISE)).isFalse();

        // Trial satisfies TRIAL, but NOT PRO or Enterprise
        assertThat(entitlementService.hasTierEntitlement("tenant-trial", SaaSTier.TRIAL)).isTrue();
        assertThat(entitlementService.hasTierEntitlement("tenant-trial", SaaSTier.PRO)).isFalse();
        assertThat(entitlementService.hasTierEntitlement("tenant-trial", SaaSTier.ENTERPRISE)).isFalse();

        // Suspended tenant loses all entitlements
        assertThat(entitlementService.hasTierEntitlement("tenant-suspended", SaaSTier.ENTERPRISE)).isFalse();
    }

    @Test
    @DisplayName("EntitlementAspect throws PaymentRequiredException (402) when tenant lacks required tier")
    void testAspectThrowsPaymentRequiredException() throws Throwable {
        TenantContext.setTenantId("tenant-pro");

        TenantRegistry proTenant = new TenantRegistry();
        proTenant.setTenantId("tenant-pro");
        proTenant.setSubscriptionTier("PRO");
        proTenant.setAccountStatus(AccountStatus.ACTIVE);
        when(tenantRegistryRepository.findById("tenant-pro")).thenReturn(Optional.of(proTenant));

        ProceedingJoinPoint joinPoint = mock(ProceedingJoinPoint.class);
        MethodSignature signature = mock(MethodSignature.class);
        Method mockMethod = SampleGuardedClass.class.getMethod("enterpriseOnlyAction");
        when(signature.getMethod()).thenReturn(mockMethod);
        when(joinPoint.getSignature()).thenReturn(signature);

        RequiresSaaSTier annotation = mockMethod.getAnnotation(RequiresSaaSTier.class);

        assertThatThrownBy(() -> entitlementAspect.enforceSaaSTier(joinPoint, annotation))
                .isInstanceOf(PaymentRequiredException.class)
                .hasMessageContaining("requires 'ENTERPRISE' SaaS subscription tier");

        verify(joinPoint, never()).proceed();
    }

    @Test
    @DisplayName("EntitlementAspect allows request when tenant has required tier")
    void testAspectAllowsRequestWhenTierSatisfied() throws Throwable {
        TenantContext.setTenantId("tenant-enterprise");

        TenantRegistry enterpriseTenant = new TenantRegistry();
        enterpriseTenant.setTenantId("tenant-enterprise");
        enterpriseTenant.setSubscriptionTier("ENTERPRISE");
        enterpriseTenant.setAccountStatus(AccountStatus.ACTIVE);
        when(tenantRegistryRepository.findById("tenant-enterprise")).thenReturn(Optional.of(enterpriseTenant));

        ProceedingJoinPoint joinPoint = mock(ProceedingJoinPoint.class);
        MethodSignature signature = mock(MethodSignature.class);
        Method mockMethod = SampleGuardedClass.class.getMethod("enterpriseOnlyAction");
        when(signature.getMethod()).thenReturn(mockMethod);
        when(joinPoint.getSignature()).thenReturn(signature);
        when(joinPoint.proceed()).thenReturn("SUCCESS");

        RequiresSaaSTier annotation = mockMethod.getAnnotation(RequiresSaaSTier.class);

        Object result = entitlementAspect.enforceSaaSTier(joinPoint, annotation);
        assertThat(result).isEqualTo("SUCCESS");
        verify(joinPoint, times(1)).proceed();
    }

    @Test
    @DisplayName("GlobalExceptionHandler maps PaymentRequiredException to HTTP 402 with RFC 7807 ProblemDetail")
    void testPaymentRequiredExceptionHttpMapping() {
        PaymentRequiredException ex = new PaymentRequiredException(
                "Feature requires ENTERPRISE tier",
                SaaSTier.ENTERPRISE,
                SaaSTier.PRO
        );
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/v1/exams/1/seb-config");

        ResponseEntity<ProblemDetail> response = exceptionHandler.handlePaymentRequiredException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.PAYMENT_REQUIRED);
        ProblemDetail body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getStatus()).isEqualTo(402);
        assertThat(body.getTitle()).isEqualTo("Payment Required");
        assertThat(body.getProperties()).containsEntry("requiredTier", "ENTERPRISE");
        assertThat(body.getProperties()).containsEntry("currentTier", "PRO");
        assertThat(body.getProperties()).containsEntry("upgradeUrl", "/dashboard/billing/settings");
    }

    @Test
    @DisplayName("SEB Proctoring endpoints in AcademicExamController carry @RequiresSaaSTier(ENTERPRISE)")
    void testSebEndpointsAreGuardedWithEnterpriseAnnotation() throws NoSuchMethodException {
        Method sebConfigMethod = AcademicExamController.class.getMethod("getSebConfiguration", Long.class, jakarta.servlet.http.HttpServletRequest.class);
        RequiresSaaSTier sebConfigAnnotation = sebConfigMethod.getAnnotation(RequiresSaaSTier.class);
        assertThat(sebConfigAnnotation).isNotNull();
        assertThat(sebConfigAnnotation.value()).isEqualTo(SaaSTier.ENTERPRISE);

        Method submitExamMethod = AcademicExamController.class.getMethod("submitExam", Long.class, ExamSubmissionRequestDTO.class, String.class, jakarta.servlet.http.HttpServletRequest.class);
        RequiresSaaSTier submitAnnotation = submitExamMethod.getAnnotation(RequiresSaaSTier.class);
        assertThat(submitAnnotation).isNotNull();
        assertThat(submitAnnotation.value()).isEqualTo(SaaSTier.ENTERPRISE);
    }

    @Test
    @DisplayName("Watermark removal endpoint in FinanceController carries @RequiresSaaSTier(ENTERPRISE)")
    void testWatermarkRemovalIsGuardedWithEnterpriseAnnotation() throws NoSuchMethodException {
        Method watermarkMethod = FinanceController.class.getMethod("removeDocumentWatermark");
        RequiresSaaSTier annotation = watermarkMethod.getAnnotation(RequiresSaaSTier.class);
        assertThat(annotation).isNotNull();
        assertThat(annotation.value()).isEqualTo(SaaSTier.ENTERPRISE);
    }

    public static class SampleGuardedClass {
        @RequiresSaaSTier(SaaSTier.ENTERPRISE)
        public String enterpriseOnlyAction() {
            return "ENTERPRISE_OK";
        }
    }
}
