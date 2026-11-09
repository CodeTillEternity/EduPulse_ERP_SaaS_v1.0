package com.erp.multitenancy.controller;

import com.erp.multitenancy.dto.TenantBrandingDTO;
import com.erp.multitenancy.service.TenantBrandingService;
import com.erp.security.jwt.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PublicBrandingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TenantBrandingService brandingService;

    @MockBean
    private JwtService jwtService;

    @Test
    void getBrandingBySubdomain_ShouldReturn200AndBranding_WhenFound() throws Exception {
        TenantBrandingDTO dto = new TenantBrandingDTO(
                "tenant-dps",
                "Delhi Public School",
                "dps",
                "https://cdn.edupulse.com/dps-logo.png",
                "https://cdn.edupulse.com/dps-favicon.ico",
                "#006633",
                "#FFCC00"
        );

        when(brandingService.getBrandingBySubdomain("dps")).thenReturn(Optional.of(dto));

        mockMvc.perform(get("/api/public/branding/dps")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customSubdomain").value("dps"))
                .andExpect(jsonPath("$.institutionName").value("Delhi Public School"))
                .andExpect(jsonPath("$.primaryColorHex").value("#006633"))
                .andExpect(jsonPath("$.secondaryColorHex").value("#FFCC00"))
                .andExpect(jsonPath("$.logoUrl").value("https://cdn.edupulse.com/dps-logo.png"))
                .andExpect(jsonPath("$.faviconUrl").value("https://cdn.edupulse.com/dps-favicon.ico"));
    }

    @Test
    void getBrandingBySubdomain_ShouldReturn404_WhenNotFound() throws Exception {
        when(brandingService.getBrandingBySubdomain("nonexistent")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/public/branding/nonexistent")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
