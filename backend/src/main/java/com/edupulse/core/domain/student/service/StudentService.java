package com.edupulse.core.domain.student.service;

import com.edupulse.core.domain.student.dto.StudentRequestDTO;
import com.edupulse.core.domain.student.dto.StudentResponseDTO;

/**
 * Service interface managing student admissions and lifecycle operations.
 */
public interface StudentService {

    /**
     * Enrolls a new student into the specified department and batch under the active tenant.
     *
     * @param dto Student enrollment request details
     * @return Enrolled student details
     */
    StudentResponseDTO enrollNewStudent(StudentRequestDTO dto);

    /**
     * Retrieves a student by unique primary ID within the active tenant partition.
     *
     * @param id Student entity ID
     * @return Student details
     */
    StudentResponseDTO getStudentById(Long id);

    /**
     * Retrieves a student by their tenant-unique enrollment number.
     *
     * @param enrollmentNumber Student enrollment number
     * @return Student details
     */
    StudentResponseDTO getStudentByEnrollmentNumber(String enrollmentNumber);

    /**
     * Retrieves a student by their institutional email address.
     *
     * @param email Student email address
     * @return Student details
     */
    StudentResponseDTO getStudentByEmail(String email);
}

