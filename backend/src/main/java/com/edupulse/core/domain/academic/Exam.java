package com.edupulse.core.domain.academic;

import com.edupulse.core.domain.base.BaseTenantEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Exam domain entity representing scheduled examinations, tests, or assessments
 * tied to a specific CourseOffering and Course. Automatically isolated by tenantId via BaseTenantEntity.
 */
@Entity(name = "AcademicCoreExam")
@Table(name = "academic_exams")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = {"questions"})
@ToString(callSuper = true, exclude = {"questions"})
public class Exam extends BaseTenantEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "title", length = 150)
    private String title;

    @Column(name = "exam_date")
    private LocalDate examDate;

    @Column(name = "scheduled_start_time")
    private LocalDateTime scheduledStartTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "total_marks", precision = 7, scale = 2)
    private BigDecimal totalMarks;

    @Column(name = "max_marks", precision = 7, scale = 2)
    private BigDecimal maxMarks;

    @Column(name = "passing_marks", precision = 7, scale = 2)
    private BigDecimal passingMarks;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    @Builder.Default
    private ExamStatus status = ExamStatus.DRAFT;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_offering_id")
    private CourseOffering courseOffering;

    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "exam_pin", length = 50)
    private String examPin;

    @Column(name = "allowed_ip_subnet", length = 100)
    private String allowedIpSubnet;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<ExamQuestion> questions = new ArrayList<>();

    public String getTitle() {
        return title != null && !title.isBlank() ? title : name;
    }

    public void setTitle(String title) {
        this.title = title;
        if (this.name == null || this.name.isBlank()) {
            this.name = title;
        }
    }

    public String getName() {
        return name != null && !name.isBlank() ? name : title;
    }

    public void setName(String name) {
        this.name = name;
        if (this.title == null || this.title.isBlank()) {
            this.title = name;
        }
    }

    public BigDecimal getMaxMarks() {
        return maxMarks != null ? maxMarks : totalMarks;
    }

    public void setMaxMarks(BigDecimal maxMarks) {
        this.maxMarks = maxMarks;
        if (this.totalMarks == null) {
            this.totalMarks = maxMarks;
        }
    }

    public BigDecimal getTotalMarks() {
        return totalMarks != null ? totalMarks : maxMarks;
    }

    public void setTotalMarks(BigDecimal totalMarks) {
        this.totalMarks = totalMarks;
        if (this.maxMarks == null) {
            this.maxMarks = totalMarks;
        }
    }

    public Long getCourseId() {
        if (courseId != null) {
            return courseId;
        }
        if (courseOffering != null && courseOffering.getCourse() != null) {
            return courseOffering.getCourse().getId();
        }
        return null;
    }

    public void addQuestion(ExamQuestion question) {
        if (this.questions == null) {
            this.questions = new ArrayList<>();
        }
        question.setExam(this);
        this.questions.add(question);
    }
}
