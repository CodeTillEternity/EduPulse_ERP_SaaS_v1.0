package com.edupulse.core.domain.academic.repository;

import com.edupulse.core.domain.academic.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository("coreFacultyRepository")
public interface FacultyRepository extends JpaRepository<Faculty, Long> {

    Optional<Faculty> findByIdAndTenantId(Long id, String tenantId);

    Optional<Faculty> findByEmployeeIdAndTenantId(String employeeId, String tenantId);

    Optional<Faculty> findByEmailAndTenantId(String email, String tenantId);

    List<Faculty> findByDepartmentIdAndTenantId(Long departmentId, String tenantId);

    List<Faculty> findAllByTenantId(String tenantId);

    boolean existsByEmployeeIdAndTenantId(String employeeId, String tenantId);

    boolean existsByEmailAndTenantId(String email, String tenantId);
}
