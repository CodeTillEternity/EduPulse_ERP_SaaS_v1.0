package com.edupulse.core.domain.operations.repository;

import com.edupulse.core.domain.operations.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository managing TimetableEntry operations.
 * Scoped automatically by tenant boundary isolation.
 */
@Repository("coreTimetableRepository")
public interface TimetableRepository extends JpaRepository<TimetableEntry, Long> {

    /**
     * Finds timetable entries by CourseOffering batch identifier and tenantId.
     *
     * @param batchId  Academic batch record ID
     * @param tenantId Target institutional tenant boundary
     * @return List of matching scheduled timetable entries
     */
    List<TimetableEntry> findByCourseOffering_Batch_IdAndTenantId(Long batchId, String tenantId);

    /**
     * Finds timetable entries by CourseOffering batch identifier using automated Hibernate @TenantId scoping.
     *
     * @param batchId Academic batch record ID
     * @return List of matching scheduled timetable entries
     */
    List<TimetableEntry> findByCourseOffering_Batch_Id(Long batchId);

    /**
     * Finds timetable entries by CourseOffering batch ID and tenant ID using an explicit JPQL query.
     *
     * @param batchId  Academic batch record ID
     * @param tenantId Target institutional tenant boundary
     * @return List of matching scheduled timetable entries
     */
    @Query("SELECT t FROM CoreTimetableEntry t WHERE t.courseOffering.batch.id = :batchId AND t.tenantId = :tenantId")
    List<TimetableEntry> findByBatchIdAndTenantId(@Param("batchId") Long batchId, @Param("tenantId") String tenantId);

    /**
     * Finds all timetable entries for a specific room and day of the week under the active tenant partition.
     *
     * @param dayOfWeek  Day of week (e.g. "MONDAY")
     * @param roomNumber Allocated classroom/room number
     * @param tenantId   Target tenant partition
     * @return List of timetable entries matching day and room
     */
    List<TimetableEntry> findByDayOfWeekAndRoomNumberAndTenantId(String dayOfWeek, String roomNumber, String tenantId);

    /**
     * Finds all timetable entries for a specific room and day of the week under automated @TenantId filter.
     *
     * @param dayOfWeek  Day of week (e.g. "MONDAY")
     * @param roomNumber Allocated classroom/room number
     * @return List of timetable entries matching day and room
     */
    List<TimetableEntry> findByDayOfWeekAndRoomNumber(String dayOfWeek, String roomNumber);
}
