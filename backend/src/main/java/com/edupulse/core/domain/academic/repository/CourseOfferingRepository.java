package com.edupulse.core.domain.academic.repository;

import com.edupulse.core.domain.academic.CourseOffering;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository("coreCourseOfferingRepository")
public interface CourseOfferingRepository extends JpaRepository<CourseOffering, Long> {

    Optional<CourseOffering> findByIdAndTenantId(Long id, String tenantId);

    List<CourseOffering> findByFacultyIdAndTenantId(Long facultyId, String tenantId);

    List<CourseOffering> findByBatchIdAndTenantId(Long batchId, String tenantId);

    List<CourseOffering> findByCourseIdAndTenantId(Long courseId, String tenantId);

    List<CourseOffering> findAllByTenantId(String tenantId);
}
