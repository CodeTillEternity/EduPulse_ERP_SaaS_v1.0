package com.edupulse.core.domain.operations;

import com.edupulse.core.domain.student.Student;
import com.erp.multitenancy.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class AttendanceRecordTest {

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId("tenant-cambridge");
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("AttendanceRecord extends BaseTenantEntity and captures student and timetable session")
    void attendanceRecord_prePersist_injectsTenantId() {
        Student student = new Student();
        student.setId(42L);

        TimetableEntry entry = new TimetableEntry();
        entry.setId(99L);

        AttendanceRecord record = AttendanceRecord.builder()
                .student(student)
                .timetableEntry(entry)
                .date(LocalDate.of(2026, 11, 8))
                .status(AttendanceStatus.PRESENT)
                .build();

        record.prePersist();

        assertThat(record.getTenantId()).isEqualTo("tenant-cambridge");
        assertThat(record.getStudent().getId()).isEqualTo(42L);
        assertThat(record.getTimetableEntry().getId()).isEqualTo(99L);
        assertThat(record.getDate()).isEqualTo(LocalDate.of(2026, 11, 8));
        assertThat(record.getStatus()).isEqualTo(AttendanceStatus.PRESENT);
    }
}
