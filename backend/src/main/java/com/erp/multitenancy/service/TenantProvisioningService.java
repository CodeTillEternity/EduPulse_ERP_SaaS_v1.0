package com.erp.multitenancy.service;

import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.multitenancy.dto.TenantRegistrationRequest;
import com.erp.multitenancy.dto.TenantRegistrationResponse;
import com.erp.multitenancy.entity.TenantBranding;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.AccountStatus;
import com.erp.multitenancy.model.TenantStatus;
import com.erp.multitenancy.repository.TenantBrandingRepository;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import com.erp.subscription.entity.SubscriptionPlan;
import com.erp.subscription.entity.TenantSubscription;
import com.erp.subscription.repository.SubscriptionPlanRepository;
import com.erp.subscription.repository.TenantSubscriptionRepository;
import com.erp.subscription.service.SaaSBillingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Enterprise Service responsible for SaaS Tenant Provisioning, central registry management,
 * and lifecycle status control (TRIAL, ACTIVE, SUSPENDED).
 */
@Service
public class TenantProvisioningService {

    private static final Logger log = LoggerFactory.getLogger(TenantProvisioningService.class);
    public static final int DEFAULT_TRIAL_PERIOD_DAYS = 14;

    private final TenantRegistryRepository tenantRegistryRepository;
    private final TenantBrandingRepository tenantBrandingRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final TenantSubscriptionRepository tenantSubscriptionRepository;
    private final SaaSBillingService saaSBillingService;

    public TenantProvisioningService(TenantRegistryRepository tenantRegistryRepository,
                                     UserRepository userRepository,
                                     PasswordEncoder passwordEncoder) {
        this(tenantRegistryRepository, null, userRepository, passwordEncoder, null, null, null);
    }

    public TenantProvisioningService(TenantRegistryRepository tenantRegistryRepository,
                                     TenantBrandingRepository tenantBrandingRepository,
                                     UserRepository userRepository,
                                     PasswordEncoder passwordEncoder) {
        this(tenantRegistryRepository, tenantBrandingRepository, userRepository, passwordEncoder, null, null, null);
    }

    public TenantProvisioningService(TenantRegistryRepository tenantRegistryRepository,
                                     TenantBrandingRepository tenantBrandingRepository,
                                     UserRepository userRepository,
                                     PasswordEncoder passwordEncoder,
                                     SubscriptionPlanRepository subscriptionPlanRepository,
                                     TenantSubscriptionRepository tenantSubscriptionRepository) {
        this(tenantRegistryRepository, tenantBrandingRepository, userRepository, passwordEncoder, subscriptionPlanRepository, tenantSubscriptionRepository, null);
    }

    @Autowired
    public TenantProvisioningService(TenantRegistryRepository tenantRegistryRepository,
                                     @Autowired(required = false) TenantBrandingRepository tenantBrandingRepository,
                                     UserRepository userRepository,
                                     PasswordEncoder passwordEncoder,
                                     @Autowired(required = false) SubscriptionPlanRepository subscriptionPlanRepository,
                                     @Autowired(required = false) TenantSubscriptionRepository tenantSubscriptionRepository,
                                     @Autowired(required = false) @org.springframework.context.annotation.Lazy SaaSBillingService saaSBillingService) {
        this.tenantRegistryRepository = tenantRegistryRepository;
        this.tenantBrandingRepository = tenantBrandingRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.tenantSubscriptionRepository = tenantSubscriptionRepository;
        this.saaSBillingService = saaSBillingService;
    }

    /**
     * Provisions a new institution in the Central Tenant Registry.
     * <p>
     * 1. Creates the TenantRegistry entry with 14-day trial window.
     * 2. Sets accountStatus = TRIAL and databaseRoutingKey = SHARED_DEFAULT.
     * 3. Initializes the tenant_id namespace with default branding.
     * 4. Seeds the initial SUPERADMIN user for that specific school.
     *
     * @param name  Institution display name (e.g. "Delhi Public School")
     * @param email Initial administrator email (e.g. "principal@dps.edu")
     * @return the persisted TenantRegistry entity
     */
    @Transactional
    public TenantRegistry provisionNewInstitution(String name, String email) {
        return provisionNewInstitution(name, email, null, null);
    }

    /**
     * Overloaded method supporting custom administrator password and name during self-serve onboarding.
     */
    @Transactional
    public TenantRegistry provisionNewInstitution(String name, String email, String password, String adminName) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Institution name is required");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Admin email is required");
        }

        String normalizedName = name.trim();
        String normalizedEmail = email.trim().toLowerCase();

        // Check if an existing institution already matches name or email
        Optional<TenantRegistry> existing = tenantRegistryRepository.findByInstitutionNameIgnoreCase(normalizedName)
                .or(() -> tenantRegistryRepository.findByAdminEmailIgnoreCase(normalizedEmail));
        if (existing.isPresent()) {
            log.info("Institution '{}' ({}) already registered with tenantId: {}",
                    normalizedName, normalizedEmail, existing.get().getTenantId());
            return existing.get();
        }

        // Generate canonical subdomain slug
        String subdomainSlug = generateSubdomainSlug(normalizedName);
        String tenantId = "tenant-" + subdomainSlug;

        // 1. Create and persist TenantRegistry entry with 14-day trial
        TenantRegistry registry = new TenantRegistry();
        registry.setTenantId(tenantId);
        registry.setInstitutionName(normalizedName);
        registry.setSubdomain(subdomainSlug);
        registry.setAdminEmail(normalizedEmail);
        registry.setSubscriptionTier("TRIAL");
        registry.setAccountStatus(AccountStatus.TRIAL);
        LocalDateTime trialEnd = LocalDateTime.now().plusDays(DEFAULT_TRIAL_PERIOD_DAYS);
        registry.setTrialEndDate(trialEnd);
        registry.setCurrentPeriodEnd(trialEnd);
        registry.setDatabaseRoutingKey("SHARED_DEFAULT");
        registry.setDatabaseMode("SHARED");
        registry.setStatus(TenantStatus.TRIAL_ACTIVE);

        TenantRegistry savedRegistry = tenantRegistryRepository.save(registry);
        log.info("Central Tenant Registry created: [{}] ({}) in TRIAL status until {}",
                tenantId, subdomainSlug, registry.getTrialEndDate());

        // Razorpay Customer creation during trial provisioning
        if (saaSBillingService != null) {
            try {
                saaSBillingService.createRazorpayCustomer(savedRegistry, normalizedEmail, normalizedName);
            } catch (Exception ex) {
                log.warn("Could not create Razorpay customer for tenant [{}]: {}", tenantId, ex.getMessage());
            }
        }

        // 2. Initialize the tenant_id namespace with default branding
        if (tenantBrandingRepository != null) {
            TenantBranding branding = new TenantBranding();
            branding.setTenant(savedRegistry);
            branding.setInstitutionName(normalizedName);
            branding.setCustomSubdomain(subdomainSlug);
            branding.setPrimaryColorHex("#4f46e5");
            branding.setSecondaryColorHex("#0f172a");
            tenantBrandingRepository.save(branding);
            savedRegistry.setBranding(branding);
            log.info("Initialized branding namespace for tenant [{}] with subdomain '{}'", tenantId, subdomainSlug);
        }

        // 3. Seed initial SUPERADMIN user for that specific school
        String effectivePassword = (password != null && !password.isBlank())
                ? password
                : "Admin@" + UUID.randomUUID().toString().substring(0, 8);
        AppUser superAdmin = new AppUser();
        superAdmin.setUsername(normalizedEmail);
        superAdmin.setEmail(normalizedEmail);
        superAdmin.setPassword(passwordEncoder.encode(effectivePassword));
        superAdmin.setRole(Role.SUPER_ADMIN);
        superAdmin.setTenantId(tenantId);
        superAdmin.setEnabled(true);

        userRepository.save(superAdmin);
        log.info("Seeded initial SUPERADMIN user '{}' for tenant [{}] with configured credentials",
                normalizedEmail, tenantId);

        // 4. Provision default baseline subscription if available
        if (subscriptionPlanRepository != null && tenantSubscriptionRepository != null) {
            SubscriptionPlan trialPlan = subscriptionPlanRepository.findByNameIgnoreCase("Trial")
                    .or(() -> subscriptionPlanRepository.findByNameIgnoreCase("Starter"))
                    .orElseGet(() -> subscriptionPlanRepository.save(new SubscriptionPlan("Trial", 100, 1024, false)));

            TenantSubscription subscription = new TenantSubscription(
                    tenantId,
                    trialPlan,
                    "TRIAL",
                    savedRegistry.getTrialEndDate(),
                    true
            );
            tenantSubscriptionRepository.save(subscription);
        }

        return savedRegistry;
    }

    /**
     * Instantly transitions a tenant's accountStatus (e.g. SUSPENDED or ACTIVE).
     *
     * @param tenantId  the target institution identifier
     * @param newStatus the target AccountStatus
     * @return the updated TenantRegistry entity
     */
    @Transactional
    public TenantRegistry updateTenantStatus(String tenantId, AccountStatus newStatus) {
        TenantRegistry tenant = tenantRegistryRepository.findById(tenantId)
                .or(() -> tenantRegistryRepository.findBySubdomainIgnoreCase(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found with identifier: " + tenantId));

        tenant.setAccountStatus(newStatus);
        TenantRegistry updated = tenantRegistryRepository.save(tenant);
        log.warn("ADMIN ACTION: Tenant [{}] status transitioned to [{}]", tenantId, newStatus);
        return updated;
    }

    /**
     * Backward-compatible provisioning endpoint accepting structured request.
     */
    @Transactional
    public TenantRegistrationResponse provisionNewTenant(TenantRegistrationRequest request) {
        TenantRegistry registry = provisionNewInstitution(
                request.getInstitutionName(),
                request.getAdminEmail(),
                request.getAdminPassword(),
                request.getAdminName()
        );
        return new TenantRegistrationResponse(
                registry.getTenantId(),
                registry.getStatus(),
                registry.getTrialEndDate(),
                registry.getInstitutionName(),
                registry.getAdminEmail(),
                "Tenant successfully provisioned with active 14-day trial"
        );
    }

    public LocalDateTime calculateTrialEndDate() {
        return LocalDateTime.now().plusDays(DEFAULT_TRIAL_PERIOD_DAYS);
    }

    private String generateSubdomainSlug(String institutionName) {
        String slug = institutionName.toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-");
        while (slug.startsWith("-")) {
            slug = slug.substring(1);
        }
        if (slug.length() > 24) {
            slug = slug.substring(0, 24);
        }
        while (slug.endsWith("-")) {
            slug = slug.substring(0, slug.length() - 1);
        }
        if (slug.isBlank()) {
            slug = "inst-" + UUID.randomUUID().toString().substring(0, 6);
        }

        // Check collision and append random suffix if needed
        String candidate = slug;
        int attempt = 1;
        while (tenantRegistryRepository.existsBySubdomainIgnoreCase(candidate)) {
            candidate = slug + "-" + attempt++;
        }
        return candidate;
    }
}
