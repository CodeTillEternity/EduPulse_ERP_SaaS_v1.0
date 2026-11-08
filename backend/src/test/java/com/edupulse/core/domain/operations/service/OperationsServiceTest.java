package com.edupulse.core.domain.operations.service;

import com.edupulse.core.domain.academic.Batch;
import com.edupulse.core.domain.academic.Course;
import com.edupulse.core.domain.academic.CourseOffering;
import com.edupulse.core.domain.academic.Faculty;
import com.edupulse.core.domain.academic.repository.CourseOfferingRepository;
import com.edupulse.core.domain.operations.AttendanceRecord;
import com.edupulse.core.domain.operations.AttendanceStatus;
import com.edupulse.core.domain.operations.TimetableEntry;
import com.edupulse.core.domain.operations.dto.AttendanceRequestDTO;
import com.edupulse.core.domain.operations.dto.AttendanceResponseDTO;
import com.edupulse.core.domain.operations.dto.TimetableRequestDTO;
import com.edupulse.core.domain.operations.dto.TimetableResponseDTO;
import com.edupulse.core.domain.operations.repository.AttendanceRepository;
import com.edupulse.core.domain.operations.repository.TimetableRepository;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.repository.StudentRepository;
import com.erp.multitenancy.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OperationsServiceTest {

    @Mock
    private TimetableRepository timetableRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private CourseOfferingRepository courseOfferingRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private OperationsServiceImpl operationsService;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId("tenant-apex");
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("scheduleClass successfully schedules timetable slot when no collisions exist")
    void scheduleClass_success() {
        CourseOffering offering = createMockOffering(10L, 100L);
        when(courseOfferingRepository.findByIdAndTenantId(10L, "tenant-apex")).thenReturn(Optional.of(offering));
        when(timetableRepository.findByDayOfWeekAndRoomNumberAndTenantId("MONDAY", "ROOM-101", "tenant-apex"))
                .thenReturn(List.of());

        TimetableEntry saved = TimetableEntry.builder()
                .courseOffering(offering)
                .dayOfWeek("MONDAY")
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 30))
                .roomNumber("ROOM-101")
                .build();
        saved.setId(1L);
        saved.setTenantId("tenant-apex");

        when(timetableRepository.save(any(TimetableEntry.class))).thenReturn(saved);

        TimetableRequestDTO request = TimetableRequestDTO.builder()
                .courseOfferingId(10L)
                .dayOfWeek("MONDAY")
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 30))
                .roomNumber("ROOM-101")
                .build();

        TimetableResponseDTO response = operationsService.scheduleClass(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getRoomNumber()).isEqualTo("ROOM-101");
        assertThat(response.getDayOfWeek()).isEqualTo("MONDAY");
        assertThat(response.getCourseCode()).isEqualTo("CS101");
        verify(timetableRepository).save(any(TimetableEntry.class));
    }

    @Test
    @DisplayName("scheduleClass throws IllegalArgumentException when overlapping room slot exists")
    void scheduleClass_roomCollision_throwsException() {
        CourseOffering offering = createMockOffering(10L, 100L);
        when(courseOfferingRepository.findByIdAndTenantId(10L, "tenant-apex")).thenReturn(Optional.of(offering));

        TimetableEntry conflicting = TimetableEntry.builder()
                .courseOffering(offering)
                .dayOfWeek("MONDAY")
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 30))
                .roomNumber("ROOM-101")
                .build();

        when(timetableRepository.findByDayOfWeekAndRoomNumberAndTenantId("MONDAY", "ROOM-101", "tenant-apex"))
                .thenReturn(List.of(conflicting));

        // Overlapping request: 10:00 to 11:30 (conflicts with 9:00 - 10:30)
        TimetableRequestDTO request = TimetableRequestDTO.builder()
                .courseOfferingId(10L)
                .dayOfWeek("MONDAY")
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 30))
                .roomNumber("ROOM-101")
                .build();

        assertThatThrownBy(() -> operationsService.scheduleClass(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Room 'ROOM-101' is already booked");
    }

    @Test
    @DisplayName("markAttendance successfully saves attendance records for batch students")
    void markAttendance_success() {
        Student student = new Student();
        student.setId(50L);
        student.setFirstName("Ada");
        student.setLastName("Lovelace");
        student.setEnrollmentNumber("ENR-001");
        student.setTenantId("tenant-apex");

        TimetableEntry entry = new TimetableEntry();
        entry.setId(10L);

        when(studentRepository.findByIdAndTenantId(50L, "tenant-apex")).thenReturn(Optional.of(student));
        when(timetableRepository.findById(10L)).thenReturn(Optional.of(entry));
        when(attendanceRepository.findByStudent_IdAndTimetableEntry_IdAndDate(50L, 10L, LocalDate.of(2026, 11, 8)))
                .thenReturn(Optional.empty());

        AttendanceRecord saved = AttendanceRecord.builder()
                .student(student)
                .timetableEntry(entry)
                .date(LocalDate.of(2026, 11, 8))
                .status(AttendanceStatus.PRESENT)
                .build();
        saved.setId(1L);
        saved.setTenantId("tenant-apex");

        when(attendanceRepository.save(any(AttendanceRecord.class))).thenReturn(saved);

        AttendanceRequestDTO req = AttendanceRequestDTO.builder()
                .studentId(50L)
                .timetableEntryId(10L)
                .date(LocalDate.of(2026, 11, 8))
                .status(AttendanceStatus.PRESENT)
                .build();

        List<AttendanceResponseDTO> responses = operationsService.markAttendance(List.of(req));

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getStudentName()).isEqualTo("Ada Lovelace");
        assertThat(responses.get(0).getStatus()).isEqualTo(AttendanceStatus.PRESENT);
        verify(attendanceRepository).save(any(AttendanceRecord.class));
    }

    private CourseOffering createMockOffering(Long offeringId, Long batchId) {
        Course course = new Course();
        course.setCode("CS101");
        course.setName("Computer Science I");

        Faculty faculty = new Faculty();
        faculty.setId(5L);
        faculty.setFirstName("Alan");
        faculty.setLastName("Turing");

        Batch batch = new Batch();
        batch.setId(batchId);
        batch.setAcademicYear("2026-2027");

        CourseOffering offering = new CourseOffering();
        offering.setId(offeringId);
        offering.setCourse(course);
        offering.setFaculty(faculty);
        offering.setBatch(batch);
        offering.setSemester("Fall 2026");
        offering.setTenantId("tenant-apex");
        return offering;
    }
}
