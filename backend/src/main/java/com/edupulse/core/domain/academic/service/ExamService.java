package com.edupulse.core.domain.academic.service;

import com.edupulse.core.domain.academic.dto.ExamRequestDTO;
import com.edupulse.core.domain.academic.dto.ExamResponseDTO;
import com.edupulse.core.domain.academic.dto.GradeScaleDTO;
import com.edupulse.core.domain.academic.dto.GradeScaleResponseDTO;
import com.edupulse.core.domain.academic.dto.ResultRequestDTO;
import com.edupulse.core.domain.academic.dto.ResultResponseDTO;
import com.edupulse.core.domain.academic.dto.StudentTranscriptDTO;

import java.util.List;

/**
 * Service interface for exam scheduling, grade scale management, result evaluation,
 * and academic transcript aggregation.
 */
public interface ExamService {

    ExamResponseDTO createExam(ExamRequestDTO dto);

    List<ExamResponseDTO> getExams();

    ExamResponseDTO getExamById(Long examId);

    List<ExamResponseDTO> getExamsByCourseOffering(Long offeringId);

    GradeScaleResponseDTO defineGradeScale(GradeScaleDTO dto);

    List<GradeScaleResponseDTO> getGradeScales();

    List<ResultResponseDTO> recordStudentResults(Long examId, List<ResultRequestDTO> results);

    List<ResultResponseDTO> getResultsByExam(Long examId);

    List<com.edupulse.core.domain.student.dto.StudentResponseDTO> getStudentsForExam(Long examId);

    List<ResultResponseDTO> getResultsByStudent(Long studentId);

    StudentTranscriptDTO getStudentTranscript(String enrollmentNumber);
}
