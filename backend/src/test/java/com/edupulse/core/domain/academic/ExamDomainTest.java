package com.edupulse.core.domain.academic;

import com.edupulse.core.domain.base.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class ExamDomainTest {

    private static final String TENANT_ID = "tenant-exam-001";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("Exam entity inherits BaseTenantEntity and binds course offering")
    void shouldCreateExamWithTenantId() {
        Course course = new Course();
        course.setId(10L);
        course.setCode("CS-301");
        course.setName("Operating Systems");

        CourseOffering offering = new CourseOffering();
        offering.setId(100L);
        offering.setCourse(course);
        offering.setSemester("Fall 2026");

        Exam exam = new Exam();
        exam.setName("Midterm 1");
        exam.setExamDate(LocalDate.of(2026, 10, 15));
        exam.setTotalMarks(new BigDecimal("100.00"));
        exam.setCourseOffering(offering);
        exam.prePersist();

        assertThat(exam.getTenantId()).isEqualTo(TENANT_ID);
        assertThat(exam.getName()).isEqualTo("Midterm 1");
        assertThat(exam.getTotalMarks()).isEqualByComparingTo("100.00");
        assertThat(exam.getCourseOffering().getCourse().getCode()).isEqualTo("CS-301");
    }

    @Test
    @DisplayName("GradeScale entity stores grade boundaries and grade points")
    void shouldCreateGradeScaleWithTenantId() {
        GradeScale scale = new GradeScale();
        scale.setGrade("A+");
        scale.setMinMarks(new BigDecimal("90.00"));
        scale.setMaxMarks(new BigDecimal("100.00"));
        scale.setGradePoint(new BigDecimal("4.00"));
        scale.prePersist();

        assertThat(scale.getTenantId()).isEqualTo(TENANT_ID);
        assertThat(scale.getGrade()).isEqualTo("A+");
        assertThat(scale.getMinMarks()).isEqualByComparingTo("90.00");
        assertThat(scale.getMaxMarks()).isEqualByComparingTo("100.00");
        assertThat(scale.getGradePoint()).isEqualByComparingTo("4.00");
    }
}
