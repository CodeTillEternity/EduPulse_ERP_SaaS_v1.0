package com.edupulse.core.domain.academic.repository;

import com.edupulse.core.domain.academic.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository("coreCourseRepository")
public interface CourseRepository extends JpaRepository<Course, Long> {

    Optional<Course> findByIdAndTenantId(Long id, String tenantId);

    Optional<Course> findByCodeAndTenantId(String code, String tenantId);

    List<Course> findByDepartmentIdAndTenantId(Long departmentId, String tenantId);

    List<Course> findAllByTenantId(String tenantId);

    boolean existsByCodeAndTenantId(String code, String tenantId);
}
