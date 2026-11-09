package com.edupulse.core.domain.academic.service;

import com.edupulse.core.domain.academic.dto.CourseOfferingRequestDTO;
import com.edupulse.core.domain.academic.dto.CourseOfferingResponseDTO;
import com.edupulse.core.domain.academic.dto.CourseRequestDTO;
import com.edupulse.core.domain.academic.dto.CourseResponseDTO;
import com.edupulse.core.domain.academic.dto.ExamDefinitionDTO;
import com.edupulse.core.domain.academic.dto.ExamResponseDTO;
import com.edupulse.core.domain.academic.dto.FacultyRequestDTO;
import com.edupulse.core.domain.academic.dto.FacultyResponseDTO;

import java.util.List;

/**
 * Service interface managing multi-tenant Academic operations:
 * Faculty registrations, Course catalog management, CourseOffering instructor assignments,
 * and Examination creation / RBAC student access scoping.
 */
public interface AcademicService {

    FacultyResponseDTO createFaculty(FacultyRequestDTO request);

    List<FacultyResponseDTO> getAllFaculty();

    CourseResponseDTO createCourse(CourseRequestDTO request);

    List<CourseResponseDTO> getAllCourses();

    CourseOfferingResponseDTO assignFacultyToCourse(CourseOfferingRequestDTO request);

    List<CourseOfferingResponseDTO> getAllCourseOfferings();

    /**
     * Creates an examination. Restricted to ACADEMIC_ADMIN and FACULTY roles.
     */
    ExamResponseDTO createExam(ExamDefinitionDTO request);

    /**
     * Retrieves published exams for an enrolled student.
     * Enforces that STUDENT roles can only view published exams mapped to their enrolled courses.
     */
    List<ExamResponseDTO> getPublishedExamsForStudent(Long studentId, Long courseId);

    /**
     * Retrieves all exams for a course (faculty/admin access).
     */
    List<ExamResponseDTO> getExamsForCourse(Long courseId);

    /**
     * Retrieves an exam by its ID. Enforces student published/enrolled RBAC checks.
     */
    ExamResponseDTO getExamById(Long examId);

    /**
     * Publishes an examination (restricted to ACADEMIC_ADMIN and FACULTY).
     */
    ExamResponseDTO publishExam(Long examId);
}
