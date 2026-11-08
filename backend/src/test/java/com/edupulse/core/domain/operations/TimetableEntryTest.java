package com.edupulse.core.domain.operations;

import com.edupulse.core.domain.academic.CourseOffering;
import com.erp.multitenancy.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

class TimetableEntryTest {

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId("tenant-oxford");
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("TimetableEntry extends BaseTenantEntity and auto-injects tenantId via prePersist")
    void timetableEntry_prePersist_injectsTenantId() {
        CourseOffering offering = new CourseOffering();
        offering.setId(10L);

        TimetableEntry entry = TimetableEntry.builder()
                .courseOffering(offering)
                .dayOfWeek("MONDAY")
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 30))
                .roomNumber("LH-101")
                .build();

        entry.prePersist();

        assertThat(entry.getTenantId()).isEqualTo("tenant-oxford");
        assertThat(entry.getDayOfWeek()).isEqualTo("MONDAY");
        assertThat(entry.getStartTime()).isEqualTo(LocalTime.of(9, 0));
        assertThat(entry.getEndTime()).isEqualTo(LocalTime.of(10, 30));
        assertThat(entry.getRoomNumber()).isEqualTo("LH-101");
        assertThat(entry.getCourseOffering().getId()).isEqualTo(10L);
    }
}
