package com.erp.finance;

import com.erp.finance.fee_structure.entity.FeeHead;
import com.erp.finance.fee_structure.entity.FeeStructure;
import com.erp.finance.fee_structure.repository.FeeHeadRepository;
import com.erp.finance.fee_structure.repository.FeeStructureRepository;
import com.erp.finance.service.FeeStructureService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "spring.jpa.open-in-view=false")
public class FeeStructureOpenInViewTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private FeeStructureService feeStructureService;

    @Autowired
    private FeeStructureRepository feeStructureRepository;

    @Autowired
    private FeeHeadRepository feeHeadRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        feeStructureRepository.deleteAll();
        feeHeadRepository.deleteAll();
    }

    @Test
    @DisplayName("GET fee-structures succeeds with HTTP 200 and components when open-in-view=false")
    @WithMockUser(authorities = {"ROLE_FINANCE", "FEE_STRUCTURE_VIEW", "FEE_STRUCTURE_CREATE"})
    void testGetFeeStructuresWithComponentsWhenOpenInViewIsFalse() throws Exception {
        // 1. Create a Fee Head
        FeeHead feeHead = new FeeHead();
        feeHead.setCode("HEAD-LAB-" + System.currentTimeMillis());
        feeHead.setName("Laboratory Science Fee");
        feeHead.setDescription("Physics & Chemistry lab fee");
        feeHead.setActive(true);
        FeeHead savedHead = feeHeadRepository.save(feeHead);

        // 2. Create Fee Structure via POST endpoint
        FeeStructure structPayload = new FeeStructure();
        structPayload.setName("B.Tech Computer Science AY 2026");
        structPayload.setCode("FS-CS-" + System.currentTimeMillis());
        structPayload.setActive(true);

        String createResponse = mockMvc.perform(post("/api/v1/finance/fee-structures")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(structPayload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andReturn().getResponse().getContentAsString();

        Long structureId = objectMapper.readTree(createResponse).get("id").asLong();

        // 3. Attach component to Fee Structure
        mockMvc.perform(post("/api/v1/finance/fee-structures/" + structureId + "/components")
                        .param("headId", String.valueOf(savedHead.getId()))
                        .param("amount", "25000.00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components", hasSize(1)));

        // 4. Perform GET /api/v1/finance/fee-structures with open-in-view=false
        mockMvc.perform(get("/api/v1/finance/fee-structures"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[?(@.id == " + structureId + ")].components", hasSize(1)))
                .andExpect(jsonPath("$[?(@.id == " + structureId + ")].components[0].feeHeadId").value(savedHead.getId().intValue()))
                .andExpect(jsonPath("$[?(@.id == " + structureId + ")].components[0].feeHeadName").value("Laboratory Science Fee"))
                .andExpect(jsonPath("$[?(@.id == " + structureId + ")].components[0].amount").value(25000.00));

        // 5. Also perform GET /api/v1/finance/fee-structures/{id}
        mockMvc.perform(get("/api/v1/finance/fee-structures/" + structureId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(structureId))
                .andExpect(jsonPath("$.components", hasSize(1)))
                .andExpect(jsonPath("$.components[0].feeHeadName").value("Laboratory Science Fee"));
    }
}
