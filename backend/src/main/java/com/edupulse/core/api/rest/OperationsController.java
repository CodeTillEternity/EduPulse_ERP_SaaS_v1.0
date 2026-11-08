package com.edupulse.core.api.rest;

import com.edupulse.core.domain.operations.dto.AttendanceRequestDTO;
import com.edupulse.core.domain.operations.dto.AttendanceResponseDTO;
import com.edupulse.core.domain.operations.dto.TimetableRequestDTO;
import com.edupulse.core.domain.operations.dto.TimetableResponseDTO;
import com.edupulse.core.domain.operations.service.OperationsService;
import com.edupulse.core.domain.student.dto.StudentResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller managing Operations: Timetable scheduling and Daily Attendance tracking.
 * Secured with strict Role-Based Access Control permitting SUPERADMIN and FACULTY.
 */
@RestController("coreOperationsController")
@RequestMapping("/api/v1/operations")
@Tag(name = "Operations Management", description = "Class scheduling, timetable, and student attendance tracking API")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'FACULTY')")
public class OperationsController {

    private final OperationsService operationsService;

    public OperationsController(@Qualifier("coreOperationsService") OperationsService operationsService) {
        this.operationsService = operationsService;
    }

    /**
     * Schedules a new class timetable entry.
     * Enforces room non-overlapping constraint within the active tenant partition.
     *
     * @param request Scheduling parameters
     * @return Persisted timetable entry
     */
    @PostMapping("/timetable")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Schedule Class", description = "Schedules a course offering timetable slot without room collisions")
    public ResponseEntity<TimetableResponseDTO> scheduleClass(@Valid @RequestBody TimetableRequestDTO request) {
        TimetableResponseDTO created = operationsService.scheduleClass(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Retrieves all scheduled timetable entries for an academic batch.
     *
     * @param batchId Academic batch record ID
     * @return List of timetable entries
     */
    @GetMapping("/timetable/batch/{batchId}")
    @Operation(summary = "Get Timetable by Batch", description = "Retrieves timetable entries scheduled for an academic batch")
    public ResponseEntity<List<TimetableResponseDTO>> getTimetableByBatch(@PathVariable Long batchId) {
        List<TimetableResponseDTO> entries = operationsService.getTimetableByBatch(batchId);
        return ResponseEntity.ok(entries);
    }

    /**
     * Records or updates daily attendance for a batch of students.
     *
     * @param requests List of attendance status records
     * @return Persisted attendance entries
     */
    @PostMapping("/attendance")
    @Operation(summary = "Mark Attendance", description = "Persists batch attendance records for students in a class session")
    public ResponseEntity<List<AttendanceResponseDTO>> markAttendance(
            @Valid @RequestBody List<AttendanceRequestDTO> requests) {
        List<AttendanceResponseDTO> responses = operationsService.markAttendance(requests);
        return ResponseEntity.ok(responses);
    }

    /**
     * Retrieves recorded attendance for a timetable entry on a specific date.
     *
     * @param timetableEntryId Timetable entry ID
     * @param date             Record date
     * @return List of student attendance records
     */
    @GetMapping("/attendance/timetable/{timetableEntryId}")
    @Operation(summary = "Get Attendance by Timetable and Date", description = "Fetches attendance records for a specific session and date")
    public ResponseEntity<List<AttendanceResponseDTO>> getAttendanceByTimetableAndDate(
            @PathVariable Long timetableEntryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        List<AttendanceResponseDTO> records = operationsService.getAttendanceByTimetableAndDate(timetableEntryId, targetDate);
        return ResponseEntity.ok(records);
    }

    /**
     * Retrieves all enrolled students in a batch for building the attendance roster.
     *
     * @param batchId Academic batch ID
     * @return List of student profiles in the batch
     */
    @GetMapping("/students/batch/{batchId}")
    @Operation(summary = "Get Students for Batch", description = "Fetches student profiles in an academic batch for attendance marking")
    public ResponseEntity<List<StudentResponseDTO>> getStudentsForBatch(@PathVariable Long batchId) {
        List<StudentResponseDTO> students = operationsService.getStudentsForBatch(batchId);
        return ResponseEntity.ok(students);
    }
}
