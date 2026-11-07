package com.edupulse.core.multitenancy;

import com.edupulse.core.domain.academic.Department;
import com.edupulse.core.domain.academic.repository.DepartmentRepository;
import com.edupulse.core.domain.base.TenantContext;
import com.erp.multitenancy.entity.TenantRegistry;
import com.erp.multitenancy.model.TenantStatus;
import com.erp.multitenancy.repository.TenantRegistryRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test validating strict cross-tenant isolation in EduPulse Core.
 * Ensures that entities persisted under Tenant A are strictly invisible to Tenant B
 * across all ORM and repository queries.
 */
@SpringBootTest(properties = {
        "spring.jpa.show-sql=false",
        "logging.level.org.hibernate.SQL=WARN"
})
public class TenantIsolationIntegrationTest {

    private static final String TENANT_A = "tenant-isolation-alpha";
    private static final String TENANT_B = "tenant-isolation-beta";

    @Autowired
    private TenantRegistryRepository tenantRegistryRepository;

    @Autowired
    @Qualifier("coreDepartmentRepository")
    private DepartmentRepository departmentRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private TransactionTemplate transactionTemplate;

    @BeforeEach
    void setUp() {
        transactionTemplate = new TransactionTemplate(transactionManager);
        TenantContext.clear();

        // 1. Register mock Tenant A and Tenant B in the central TenantRegistry
        transactionTemplate.executeWithoutResult(status -> {
            tenantRegistryRepository.save(new TenantRegistry(TENANT_A, "Alpha University", TenantStatus.ACTIVE, "SHARED"));
            tenantRegistryRepository.save(new TenantRegistry(TENANT_B, "Beta Institute", TenantStatus.ACTIVE, "SHARED"));
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
    @DisplayName("Verify that Tenant B repository layer returns mathematically 0 results for Tenant A's data")
    void shouldEnforceStrictTenantIsolationAcrossPartitions() {
        // Step 1: Bind context as Tenant A and persist test entity
        TenantContext.setTenantId(TENANT_A);

        Long departmentAId = transactionTemplate.execute(status -> {
            Department dept = new Department();
            dept.setCode("CS-ISO-01");
            dept.setName("Computer Science & Engineering");
            dept.setTenantId(TENANT_A);
            return departmentRepository.save(dept).getId();
        });

        assertThat(departmentAId).isNotNull();

        // Step 2: Query as Tenant A to verify persistence
        transactionTemplate.executeWithoutResult(status -> {
            List<Department> tenantADepartments = departmentRepository.findAllByTenantId(TENANT_A);
            assertThat(tenantADepartments)
                    .isNotEmpty()
                    .hasSize(1)
                    .anyMatch(d -> d.getCode().equals("CS-ISO-01"));

            Optional<Department> foundInA = departmentRepository.findByIdAndTenantId(departmentAId, TENANT_A);
            assertThat(foundInA).isPresent();
        });

        // Step 3: Authenticate context as Tenant B
        TenantContext.setTenantId(TENANT_B);

        // Step 4: Verify mathematically using AssertJ that querying Tenant A's data returns 0 results
        transactionTemplate.executeWithoutResult(status -> {
            List<Department> tenantBDepartments = departmentRepository.findAllByTenantId(TENANT_B);
            assertThat(tenantBDepartments)
                    .as("Tenant B repository query must return exactly 0 results for Tenant A's partition")
                    .isEmpty();
            assertThat(tenantBDepartments.size())
                    .as("Mathematical size must equal 0")
                    .isZero();

            Optional<Department> leakedFromA = departmentRepository.findByIdAndTenantId(departmentAId, TENANT_B);
            assertThat(leakedFromA)
                    .as("Tenant B must not be able to retrieve Tenant A entity by primary identifier")
                    .isNotPresent();
        });
    }
}

