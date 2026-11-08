package com.edupulse.core.domain.operations.service;

import com.edupulse.core.domain.operations.dto.AttendanceRequestDTO;
import com.edupulse.core.domain.operations.dto.AttendanceResponseDTO;
import com.edupulse.core.domain.operations.dto.TimetableRequestDTO;
import com.edupulse.core.domain.operations.dto.TimetableResponseDTO;
import com.edupulse.core.domain.student.dto.StudentResponseDTO;

import java.time.LocalDate;
import java.util.List;

/**
 * Service contract orchestrating class timetable scheduling and daily student attendance tracking.
 */
public interface OperationsService {

    /**
     * Schedules a new class timetable entry, ensuring no time overlaps exist in the specified room.
     *
     * @param request Scheduling request parameters
     * @return Created timetable entry details
     */
    TimetableResponseDTO scheduleClass(TimetableRequestDTO request);

    /**
     * Retrieves all scheduled timetable entries for a specific academic batch.
     *
     * @param batchId Academic batch record ID
     * @return List of timetable entries for the batch
     */
    List<TimetableResponseDTO> getTimetableByBatch(Long batchId);

    /**
     * Records or updates daily attendance for a collection of students.
     *
     * @param requests List of student attendance status entries
     * @return Persisted attendance records
     */
    List<AttendanceResponseDTO> markAttendance(List<AttendanceRequestDTO> requests);

    /**
     * Retrieves attendance records for a designated timetable entry on a specific date.
     *
     * @param timetableEntryId Scheduled timetable entry ID
     * @param date             Attendance record date
     * @return List of student attendance records
     */
    List<AttendanceResponseDTO> getAttendanceByTimetableAndDate(Long timetableEntryId, LocalDate date);

    /**
     * Retrieves all enrolled students belonging to an academic batch for attendance registration.
     *
     * @param batchId Academic batch record ID
     * @return List of student profiles in the batch
     */
    List<StudentResponseDTO> getStudentsForBatch(Long batchId);
}
