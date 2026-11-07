package com.edupulse.core.domain.academic.repository;

import com.edupulse.core.domain.academic.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository("coreDepartmentRepository")
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByIdAndTenantId(Long id, String tenantId);

    Optional<Department> findByCodeAndTenantId(String code, String tenantId);

    List<Department> findAllByTenantId(String tenantId);
}
