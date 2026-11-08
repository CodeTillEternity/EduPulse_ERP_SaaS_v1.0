package com.edupulse.core.domain.operations.repository;

import com.edupulse.core.domain.operations.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository managing student attendance tracking records.
 * Enforces multi-tenant data isolation.
 */
@Repository("coreAttendanceRepository")
public interface AttendanceRepository extends JpaRepository<AttendanceRecord, Long> {

    /**
     * Retrieves all attendance records for a specific student.
     *
     * @param studentId Student primary ID
     * @return List of student attendance records
     */
    List<AttendanceRecord> findByStudent_Id(Long studentId);

    /**
     * Retrieves all attendance records for a specific student under explicit tenant boundary.
     *
     * @param studentId Student primary ID
     * @param tenantId  Target institutional tenant
     * @return List of student attendance records
     */
    List<AttendanceRecord> findByStudent_IdAndTenantId(Long studentId, String tenantId);

    /**
     * Retrieves all attendance records for a designated timetable entry on a specific date.
     *
     * @param timetableEntryId Timetable entry ID
     * @param date             Scheduled session date
     * @return List of attendance records for the class session
     */
    List<AttendanceRecord> findByTimetableEntry_IdAndDate(Long timetableEntryId, LocalDate date);

    /**
     * Retrieves all attendance records for a designated timetable entry on a specific date and tenant.
     *
     * @param timetableEntryId Timetable entry ID
     * @param date             Scheduled session date
     * @param tenantId         Target institutional tenant
     * @return List of attendance records for the class session
     */
    List<AttendanceRecord> findByTimetableEntry_IdAndDateAndTenantId(Long timetableEntryId, LocalDate date, String tenantId);

    /**
     * Finds an existing attendance record for a student on a specific timetable entry and date.
     * Useful for idempotent upserts when revising attendance records.
     *
     * @param studentId        Student ID
     * @param timetableEntryId Timetable Entry ID
     * @param date             Session date
     * @return Optional existing attendance record
     */
    Optional<AttendanceRecord> findByStudent_IdAndTimetableEntry_IdAndDate(Long studentId, Long timetableEntryId, LocalDate date);
}
