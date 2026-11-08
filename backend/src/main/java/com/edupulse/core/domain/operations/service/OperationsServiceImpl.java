package com.edupulse.core.domain.operations.service;

import com.edupulse.core.domain.academic.CourseOffering;
import com.edupulse.core.domain.academic.repository.CourseOfferingRepository;
import com.edupulse.core.domain.operations.AttendanceRecord;
import com.edupulse.core.domain.operations.TimetableEntry;
import com.edupulse.core.domain.operations.dto.AttendanceRequestDTO;
import com.edupulse.core.domain.operations.dto.AttendanceResponseDTO;
import com.edupulse.core.domain.operations.dto.TimetableRequestDTO;
import com.edupulse.core.domain.operations.dto.TimetableResponseDTO;
import com.edupulse.core.domain.operations.repository.AttendanceRepository;
import com.edupulse.core.domain.operations.repository.TimetableRepository;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.dto.StudentResponseDTO;
import com.edupulse.core.domain.student.repository.StudentRepository;
import com.erp.multitenancy.TenantContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Implementation of OperationsService enforcing multi-tenant isolation, room collision checks,
 * and batch-wide attendance tracking.
 */
@Service("coreOperationsService")
@Slf4j
public class OperationsServiceImpl implements OperationsService {

    private final TimetableRepository timetableRepository;
    private final AttendanceRepository attendanceRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final StudentRepository studentRepository;

    public OperationsServiceImpl(TimetableRepository timetableRepository,
                                 AttendanceRepository attendanceRepository,
                                 CourseOfferingRepository courseOfferingRepository,
                                 StudentRepository studentRepository) {
        this.timetableRepository = timetableRepository;
        this.attendanceRepository = attendanceRepository;
        this.courseOfferingRepository = courseOfferingRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    @Transactional
    public TimetableResponseDTO scheduleClass(TimetableRequestDTO request) {
        log.info("Scheduling class slot: CourseOffering={}, Day={}, Time={}-{}, Room={}",
                request.getCourseOfferingId(), request.getDayOfWeek(), request.getStartTime(),
                request.getEndTime(), request.getRoomNumber());

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new IllegalArgumentException("Class startTime must be strictly before endTime");
        }

        String tenantId = getActiveTenantId();

        CourseOffering offering = courseOfferingRepository.findByIdAndTenantId(request.getCourseOfferingId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("CourseOffering not found: " + request.getCourseOfferingId()));

        // Enforce room collision detection
        List<TimetableEntry> existingEntries = timetableRepository.findByDayOfWeekAndRoomNumberAndTenantId(
                request.getDayOfWeek(), request.getRoomNumber(), tenantId
        );

        for (TimetableEntry existing : existingEntries) {
            boolean overlaps = request.getStartTime().isBefore(existing.getEndTime()) &&
                               existing.getStartTime().isBefore(request.getEndTime());
            if (overlaps) {
                String courseCode = existing.getCourseOffering() != null && existing.getCourseOffering().getCourse() != null
                        ? existing.getCourseOffering().getCourse().getCode()
                        : "Course";
                throw new IllegalArgumentException(String.format(
                        "Room '%s' is already booked on %s between %s and %s for course '%s'",
                        request.getRoomNumber(),
                        request.getDayOfWeek(),
                        existing.getStartTime(),
                        existing.getEndTime(),
                        courseCode
                ));
            }
        }

        TimetableEntry entry = TimetableEntry.builder()
                .courseOffering(offering)
                .dayOfWeek(request.getDayOfWeek().toUpperCase())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .roomNumber(request.getRoomNumber())
                .build();

        TimetableEntry saved = timetableRepository.save(entry);
        log.info("Successfully scheduled timetable entry [id={}] for batch [{}]", saved.getId(), offering.getBatch().getName());

        return mapToTimetableResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableResponseDTO> getTimetableByBatch(Long batchId) {
        String tenantId = getActiveTenantId();
        List<TimetableEntry> entries = timetableRepository.findByCourseOffering_Batch_IdAndTenantId(batchId, tenantId);
        return entries.stream().map(this::mapToTimetableResponse).toList();
    }

    @Override
    @Transactional
    public List<AttendanceResponseDTO> markAttendance(List<AttendanceRequestDTO> requests) {
        if (requests == null || requests.isEmpty()) {
            return List.of();
        }

        String tenantId = getActiveTenantId();
        List<AttendanceResponseDTO> responses = new ArrayList<>();

        for (AttendanceRequestDTO req : requests) {
            Student student = studentRepository.findByIdAndTenantId(req.getStudentId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found: " + req.getStudentId()));

            TimetableEntry entry = timetableRepository.findById(req.getTimetableEntryId())
                    .orElseThrow(() -> new IllegalArgumentException("TimetableEntry not found: " + req.getTimetableEntryId()));

            // Upsert attendance record for idempotency
            AttendanceRecord record = attendanceRepository
                    .findByStudent_IdAndTimetableEntry_IdAndDate(req.getStudentId(), req.getTimetableEntryId(), req.getDate())
                    .orElseGet(() -> AttendanceRecord.builder()
                            .student(student)
                            .timetableEntry(entry)
                            .date(req.getDate())
                            .build());

            record.setStatus(req.getStatus());
            AttendanceRecord saved = attendanceRepository.save(record);
            responses.add(mapToAttendanceResponse(saved));
        }

        log.info("Successfully marked attendance for {} students", responses.size());
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDTO> getAttendanceByTimetableAndDate(Long timetableEntryId, LocalDate date) {
        String tenantId = getActiveTenantId();
        List<AttendanceRecord> records = attendanceRepository
                .findByTimetableEntry_IdAndDateAndTenantId(timetableEntryId, date, tenantId);
        return records.stream().map(this::mapToAttendanceResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponseDTO> getStudentsForBatch(Long batchId) {
        String tenantId = getActiveTenantId();
        List<Student> students = studentRepository.findByBatchIdAndTenantId(batchId, tenantId);
        return students.stream().map(s -> StudentResponseDTO.builder()
                .id(s.getId())
                .enrollmentNumber(s.getEnrollmentNumber())
                .firstName(s.getFirstName())
                .lastName(s.getLastName())
                .email(s.getEmail())
                .tenantId(s.getTenantId())
                .departmentId(s.getDepartment() != null ? s.getDepartment().getId() : null)
                .departmentName(s.getDepartment() != null ? s.getDepartment().getName() : null)
                .batchId(s.getBatch() != null ? s.getBatch().getId() : null)
                .academicYear(s.getBatch() != null ? s.getBatch().getAcademicYear() : null)
                .status(s.getStatus())
                .createdAt(s.getCreatedAt())
                .build()).toList();
    }

    private TimetableResponseDTO mapToTimetableResponse(TimetableEntry entry) {
        CourseOffering offering = entry.getCourseOffering();
        return TimetableResponseDTO.builder()
                .id(entry.getId())
                .courseOfferingId(offering != null ? offering.getId() : null)
                .courseCode(offering != null && offering.getCourse() != null ? offering.getCourse().getCode() : null)
                .courseName(offering != null && offering.getCourse() != null ? offering.getCourse().getName() : null)
                .facultyId(offering != null && offering.getFaculty() != null ? offering.getFaculty().getId() : null)
                .facultyName(offering != null && offering.getFaculty() != null
                        ? offering.getFaculty().getFirstName() + " " + offering.getFaculty().getLastName() : null)
                .batchId(offering != null && offering.getBatch() != null ? offering.getBatch().getId() : null)
                .batchName(offering != null && offering.getBatch() != null ? offering.getBatch().getName() : null)
                .semester(offering != null ? offering.getSemester() : null)
                .dayOfWeek(entry.getDayOfWeek())
                .startTime(entry.getStartTime())
                .endTime(entry.getEndTime())
                .roomNumber(entry.getRoomNumber())
                .tenantId(entry.getTenantId())
                .build();
    }

    private AttendanceResponseDTO mapToAttendanceResponse(AttendanceRecord record) {
        Student s = record.getStudent();
        return AttendanceResponseDTO.builder()
                .id(record.getId())
                .studentId(s != null ? s.getId() : null)
                .studentName(s != null ? s.getFirstName() + " " + s.getLastName() : null)
                .enrollmentNumber(s != null ? s.getEnrollmentNumber() : null)
                .timetableEntryId(record.getTimetableEntry() != null ? record.getTimetableEntry().getId() : null)
                .date(record.getDate())
                .status(record.getStatus())
                .tenantId(record.getTenantId())
                .build();
    }

    private String getActiveTenantId() {
        String tenantId = TenantContext.getTenantId();
        return (tenantId != null && !tenantId.isBlank()) ? tenantId : "default";
    }
}
