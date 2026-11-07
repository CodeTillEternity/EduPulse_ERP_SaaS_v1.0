package com.edupulse.core.domain.academic.service;

import com.edupulse.core.domain.academic.dto.CourseOfferingRequestDTO;
import com.edupulse.core.domain.academic.dto.CourseOfferingResponseDTO;
import com.edupulse.core.domain.academic.dto.CourseRequestDTO;
import com.edupulse.core.domain.academic.dto.CourseResponseDTO;
import com.edupulse.core.domain.academic.dto.FacultyRequestDTO;
import com.edupulse.core.domain.academic.dto.FacultyResponseDTO;

import java.util.List;

/**
 * Service interface managing multi-tenant Academic operations:
 * Faculty registrations, Course catalog management, and CourseOffering instructor assignments.
 */
public interface AcademicService {

    FacultyResponseDTO createFaculty(FacultyRequestDTO request);

    List<FacultyResponseDTO> getAllFaculty();

    CourseResponseDTO createCourse(CourseRequestDTO request);

    List<CourseResponseDTO> getAllCourses();

    CourseOfferingResponseDTO assignFacultyToCourse(CourseOfferingRequestDTO request);

    List<CourseOfferingResponseDTO> getAllCourseOfferings();
}

