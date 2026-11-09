package com.edupulse.core.domain.academic.repository;

import com.edupulse.core.domain.academic.Exam;
import com.edupulse.core.domain.academic.ExamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Exam entities partitioned by tenantId.
 */
@Repository("coreExamRepository")
public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findByCourseOfferingIdAndTenantId(Long courseOfferingId, String tenantId);

    List<Exam> findByTenantId(String tenantId);

    Optional<Exam> findByIdAndTenantId(Long id, String tenantId);

    List<Exam> findByStatusAndTenantId(ExamStatus status, String tenantId);

    List<Exam> findByCourseIdAndTenantId(Long courseId, String tenantId);

    @Query("SELECT e FROM AcademicCoreExam e WHERE e.tenantId = :tenantId AND e.status = :status AND " +
           "(e.courseId = :courseId OR (e.courseOffering IS NOT NULL AND e.courseOffering.course.id = :courseId))")
    List<Exam> findPublishedExamsForCourse(@Param("courseId") Long courseId,
                                          @Param("status") ExamStatus status,
                                          @Param("tenantId") String tenantId);

    @Query("SELECT e FROM AcademicCoreExam e WHERE e.tenantId = :tenantId AND e.status = :status AND " +
           "(e.courseId IN :courseIds OR (e.courseOffering IS NOT NULL AND e.courseOffering.course.id IN :courseIds))")
    List<Exam> findPublishedExamsForCourses(@Param("courseIds") List<Long> courseIds,
                                           @Param("status") ExamStatus status,
                                           @Param("tenantId") String tenantId);
}
