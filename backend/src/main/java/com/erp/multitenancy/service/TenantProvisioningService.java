package com.erp.multitenancy.service;

import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import com.erp.multitenancy.dto.TenantRegistrationRequest;
import com.erp.multitenancy.dto.TenantRegistrationResponse;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.TenantStatus;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Service responsible for idempotent onboarding and lifecycle provisioning of SaaS tenants.
 */
@Service
public class TenantProvisioningService {

    private static final Logger log = LoggerFactory.getLogger(TenantProvisioningService.class);
    public static final int DEFAULT_TRIAL_PERIOD_DAYS = 14;

    private final TenantRegistryRepository tenantRegistryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public TenantProvisioningService(TenantRegistryRepository tenantRegistryRepository,
                                     UserRepository userRepository,
                                     PasswordEncoder passwordEncoder) {
        this.tenantRegistryRepository = tenantRegistryRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Provision a new tenant account idempotently with an active 14-day trial window.
     *
     * @param request the registration request
     * @return the registration response
     */
    @Transactional
    public TenantRegistrationResponse provisionNewTenant(TenantRegistrationRequest request) {
        // Idempotency check: verify whether a tenant with this institution name or admin email already exists
        Optional<TenantRegistry> existingByName = tenantRegistryRepository
                .findByInstitutionNameIgnoreCase(request.getInstitutionName());
        if (existingByName.isPresent()) {
            TenantRegistry existing = existingByName.get();
            log.info("Tenant with institution name '{}' already exists with status: {}",
                    request.getInstitutionName(), existing.getStatus());
            return new TenantRegistrationResponse(
                    existing.getTenantId(),
                    existing.getStatus(),
                    existing.getTrialEndDate(),
                    existing.getInstitutionName(),
                    existing.getAdminEmail(),
                    "Tenant already registered"
            );
        }

        if (request.getAdminEmail() != null && !request.getAdminEmail().isBlank()) {
            Optional<TenantRegistry> existingByEmail = tenantRegistryRepository
                    .findByAdminEmailIgnoreCase(request.getAdminEmail());
            if (existingByEmail.isPresent()) {
                TenantRegistry existing = existingByEmail.get();
                log.info("Tenant with admin email '{}' already exists with status: {}",
                        request.getAdminEmail(), existing.getStatus());
                return new TenantRegistrationResponse(
                        existing.getTenantId(),
                        existing.getStatus(),
                        existing.getTrialEndDate(),
                        existing.getInstitutionName(),
                        existing.getAdminEmail(),
                        "Tenant already registered"
                );
            }
        }

        String tenantId = generateTenantId(request.getInstitutionName());

        // 1. Save new TenantRegistry in PROVISIONING state
        TenantRegistry newTenant = new TenantRegistry();
        newTenant.setTenantId(tenantId);
        newTenant.setInstitutionName(request.getInstitutionName());
        newTenant.setAdminEmail(request.getAdminEmail());
        newTenant.setStatus(TenantStatus.PROVISIONING);
        newTenant.setDatabaseMode("SHARED");

        TenantRegistry saved = tenantRegistryRepository.save(newTenant);
        log.info("Tenant [{}] saved in PROVISIONING state for '{}'", tenantId, request.getInstitutionName());

        // 2. Create initial AppUser (Institution Admin) linked to this tenant_id
        String adminUsername = (request.getAdminEmail() != null && request.getAdminEmail().contains("@"))
                ? request.getAdminEmail().toLowerCase().trim()
                : (request.getAdminName().toLowerCase().replaceAll("\\s+", ".") + "@" + tenantId);

        String rawPassword = (request.getAdminPassword() != null && !request.getAdminPassword().isBlank())
                ? request.getAdminPassword()
                : "Admin@" + UUID.randomUUID().toString().substring(0, 8);

        AppUser adminUser = new AppUser();
        adminUser.setUsername(adminUsername);
        adminUser.setEmail(request.getAdminEmail().toLowerCase().trim());
        adminUser.setPassword(passwordEncoder.encode(rawPassword));
        adminUser.setRole(Role.INSTITUTION_ADMIN);
        adminUser.setEnabled(true);
        adminUser.setTenantId(tenantId);

        userRepository.save(adminUser);
        log.info("Created Institution Admin user '{}' with role INSTITUTION_ADMIN for tenant [{}]", adminUsername, tenantId);

        // 3. Calculate 14-day trial window and transition to TRIAL_ACTIVE
        LocalDateTime trialEndDate = calculateTrialEndDate();
        saved.setStatus(TenantStatus.TRIAL_ACTIVE);
        saved.setTrialEndDate(trialEndDate);
        TenantRegistry activated = tenantRegistryRepository.save(saved);
        log.info("Tenant [{}] transitioned to TRIAL_ACTIVE state with trialEndDate: {}", tenantId, trialEndDate);

        return new TenantRegistrationResponse(
                activated.getTenantId(),
                activated.getStatus(),
                activated.getTrialEndDate(),
                activated.getInstitutionName(),
                activated.getAdminEmail(),
                "Tenant successfully provisioned with active 14-day trial"
        );
    }

    public LocalDateTime calculateTrialEndDate() {
        return LocalDateTime.now().plusDays(DEFAULT_TRIAL_PERIOD_DAYS);
    }

    protected String generateTenantId(String institutionName) {
        String slug = institutionName.toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-");
        if (slug.startsWith("-")) {
            slug = slug.substring(1);
        }
        if (slug.endsWith("-")) {
            slug = slug.substring(0, slug.length() - 1);
        }
        if (slug.length() > 30) {
            slug = slug.substring(0, 30);
        }
        return slug + "-" + UUID.randomUUID().toString().substring(0, 8);
    }
}
