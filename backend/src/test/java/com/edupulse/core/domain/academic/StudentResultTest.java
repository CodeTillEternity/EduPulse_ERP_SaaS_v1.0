package com.edupulse.core.domain.academic;

import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.student.Student;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class StudentResultTest {

    private static final String TENANT_ID = "tenant-results-001";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("StudentResult entity stores marks, calculated grades, and partitions by tenant")
    void shouldCreateStudentResultWithTenantId() {
        Student student = new Student();
        student.setId(50L);
        student.setEnrollmentNumber("ENR-2026-0050");
        student.setFirstName("Linus");
        student.setLastName("Torvalds");

        Exam exam = new Exam();
        exam.setId(200L);
        exam.setName("Final Examination");
        exam.setExamDate(LocalDate.of(2026, 12, 1));
        exam.setTotalMarks(new BigDecimal("100.00"));

        StudentResult result = new StudentResult();
        result.setStudent(student);
        result.setExam(exam);
        result.setMarksObtained(new BigDecimal("95.50"));
        result.setGradeLabel("A+");
        result.setGradePoint(new BigDecimal("4.00"));
        result.setRemarks("Excellent performance");
        result.prePersist();

        assertThat(result.getTenantId()).isEqualTo(TENANT_ID);
        assertThat(result.getMarksObtained()).isEqualByComparingTo("95.50");
        assertThat(result.getGradeLabel()).isEqualTo("A+");
        assertThat(result.getGradePoint()).isEqualByComparingTo("4.00");
        assertThat(result.getStudent().getEnrollmentNumber()).isEqualTo("ENR-2026-0050");
        assertThat(result.getExam().getName()).isEqualTo("Final Examination");
    }
}
