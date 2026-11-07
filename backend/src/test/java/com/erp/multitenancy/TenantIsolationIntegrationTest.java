package com.erp.multitenancy;

import com.erp.campus.entity.Campus;
import com.erp.campus.repository.CampusRepository;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.TenantStatus;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test validating cross-tenant data isolation at the repository and ORM layer.
 * Verifies that entities persisted under Tenant A are strictly partitioned and return 0 results when queried by Tenant B.
 */
@SpringBootTest(properties = {
    "spring.jpa.show-sql=false",
    "logging.level.org.hibernate.SQL=WARN"
})
public class TenantIsolationIntegrationTest {

    private static final String TENANT_A = "tenant-iso-a";
    private static final String TENANT_B = "tenant-iso-b";

    @Autowired
    private TenantRegistryRepository tenantRegistryRepository;

    @Autowired
    private CampusRepository campusRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private TransactionTemplate transactionTemplate;

    @BeforeEach
    void setUp() {
        transactionTemplate = new TransactionTemplate(transactionManager);
        TenantContext.clear();

        // 1. Register mock tenants A and B in TenantRegistry (Platform scope)
        transactionTemplate.executeWithoutResult(status -> {
            tenantRegistryRepository.save(new TenantRegistry(TENANT_A, "Institution A", TenantStatus.ACTIVE, "SHARED"));
            tenantRegistryRepository.save(new TenantRegistry(TENANT_B, "Institution B", TenantStatus.ACTIVE, "SHARED"));
        });
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        try {
            transactionTemplate.executeWithoutResult(status -> {
                tenantRegistryRepository.deleteById(TENANT_A);
                tenantRegistryRepository.deleteById(TENANT_B);
            });
        } catch (Exception ignored) {
        }
    }

    @Test
    @DisplayName("Verify that Tenant B repository layer returns 0 results when querying Tenant A's data")
    void shouldIsolateTenantDataBetweenPartitions() {
        // Step 1: Bind context as Tenant A and persist test entity
        TenantContext.setTenantId(TENANT_A);

        Long campusAId = transactionTemplate.execute(status -> {
            Campus campus = new Campus();
            campus.setName("North Campus A");
            campus.setAddress("100 Alpha Road");
            return campusRepository.save(campus).getId();
        });

        assertThat(campusAId).isNotNull();

        // Step 2: Query as Tenant A to verify persistence
        transactionTemplate.executeWithoutResult(status -> {
            List<Campus> tenantACampuses = campusRepository.findAll();
            assertThat(tenantACampuses)
                    .isNotEmpty()
                    .anyMatch(c -> c.getName().equals("North Campus A"));
        });

        // Step 3: Authenticate / switch context to Tenant B
        TenantContext.setTenantId(TENANT_B);

        // Step 4: Verify Tenant B repository layer returns 0 results for Tenant A's data
        transactionTemplate.executeWithoutResult(status -> {
            List<Campus> tenantBCampuses = campusRepository.findAll();
            assertThat(tenantBCampuses)
                    .as("Tenant B repository query must return 0 results for Tenant A's partition")
                    .isEmpty();
            assertThat(campusRepository.count()).isEqualTo(0L);
        });

        // Step 5: Switch back to Tenant A and verify data integrity
        TenantContext.setTenantId(TENANT_A);
        transactionTemplate.executeWithoutResult(status -> {
            List<Campus> restoredList = campusRepository.findAll();
            assertThat(restoredList).hasSize(1);
            assertThat(restoredList.get(0).getName()).isEqualTo("North Campus A");

            // Clean up
            campusRepository.deleteById(campusAId);
        });
    }
}
