package com.erp.multitenancy.service;

import com.erp.multitenancy.dto.TenantBrandingDTO;
import com.erp.multitenancy.entity.TenantBranding;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.TenantStatus;
import com.erp.multitenancy.repository.TenantBrandingRepository;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TenantBrandingServiceTest {

    @Mock
    private TenantBrandingRepository brandingRepository;

    @Mock
    private TenantRegistryRepository tenantRegistryRepository;

    @InjectMocks
    private TenantBrandingService brandingService;

    private TenantRegistry tenant;
    private TenantBranding branding;

    @BeforeEach
    void setUp() {
        tenant = new TenantRegistry("tenant-stanford", "Stanford University", TenantStatus.ACTIVE, "SHARED");
        branding = new TenantBranding(
                tenant,
                "stanford",
                "https://cdn.stanford.edu/logo.png",
                "https://cdn.stanford.edu/favicon.ico",
                "#8C1515",
                "#000000"
        );
    }

    @Test
    void shouldFindBrandingBySubdomain_WhenSubdomainMatches() {
        when(brandingRepository.findByCustomSubdomainIgnoreCase("stanford")).thenReturn(Optional.of(branding));

        Optional<TenantBrandingDTO> result = brandingService.getBrandingBySubdomain("stanford");

        assertThat(result).isPresent();
        assertThat(result.get().customSubdomain()).isEqualTo("stanford");
        assertThat(result.get().institutionName()).isEqualTo("Stanford University");
        assertThat(result.get().primaryColorHex()).isEqualTo("#8C1515");
        assertThat(result.get().logoUrl()).isEqualTo("https://cdn.stanford.edu/logo.png");
    }

    @Test
    void shouldFindBrandingByTenantId_WhenSubdomainFallsBackToTenantId() {
        when(brandingRepository.findByCustomSubdomainIgnoreCase("tenant-stanford")).thenReturn(Optional.empty());
        when(brandingRepository.findByTenant_TenantIdIgnoreCase("tenant-stanford")).thenReturn(Optional.of(branding));

        Optional<TenantBrandingDTO> result = brandingService.getBrandingBySubdomain("tenant-stanford");

        assertThat(result).isPresent();
        assertThat(result.get().tenantId()).isEqualTo("tenant-stanford");
        assertThat(result.get().primaryColorHex()).isEqualTo("#8C1515");
    }

    @Test
    void shouldReturnEmpty_WhenSubdomainNotFound() {
        when(brandingRepository.findByCustomSubdomainIgnoreCase("unknown")).thenReturn(Optional.empty());
        when(brandingRepository.findByTenant_TenantIdIgnoreCase("unknown")).thenReturn(Optional.empty());
        when(tenantRegistryRepository.findById("unknown")).thenReturn(Optional.empty());

        Optional<TenantBrandingDTO> result = brandingService.getBrandingBySubdomain("unknown");

        assertThat(result).isEmpty();
    }

    @Test
    void shouldSaveOrUpdateBrandingSuccessfully() {
        when(tenantRegistryRepository.findById("tenant-stanford")).thenReturn(Optional.of(tenant));
        when(brandingRepository.findByTenant_TenantId("tenant-stanford")).thenReturn(Optional.of(branding));
        when(brandingRepository.save(any(TenantBranding.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TenantBrandingDTO saved = brandingService.saveOrUpdateBranding(
                "tenant-stanford",
                "stanford",
                "https://cdn.stanford.edu/new-logo.png",
                "https://cdn.stanford.edu/new-favicon.ico",
                "#B1040E",
                "#FFFFFF"
        );

        assertThat(saved.primaryColorHex()).isEqualTo("#B1040E");
        assertThat(saved.logoUrl()).isEqualTo("https://cdn.stanford.edu/new-logo.png");
        verify(brandingRepository, times(1)).save(any(TenantBranding.class));
    }
}
