package com.erp.academic.classroom.service;

import com.erp.academic.classroom.dto.ClassroomTokenResponse;
import com.erp.academic.classroom.dto.CreateClassroomRequest;
import com.erp.academic.classroom.dto.VirtualClassroomDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VirtualClassroomService {

    private static final Logger log = LoggerFactory.getLogger(VirtualClassroomService.class);

    @Value("${edupulse.integrations.jitsi.domain:meet.jit.si}")
    private String jitsiDomain;

    private final Map<String, VirtualClassroomDto> classroomRegistry = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        seedInitialClassroom("EduPulse-CS302-DistributedSystems", "CS-302", "Advanced Distributed Systems", "Dr. Aris Thorne", 90);
        seedInitialClassroom("EduPulse-SE404-CloudArchitecture", "SE-404", "Cloud Systems Engineering", "Prof. Elena Rostova", 60);
        seedInitialClassroom("EduPulse-MA201-LinearAlgebra", "MA-201", "Applied Linear Algebra", "Dr. Marcus Vance", 75);
    }

    private void seedInitialClassroom(String roomName, String courseCode, String courseName, String instructor, int durationMinutes) {
        String roomUrl = "https://" + jitsiDomain + "/" + roomName;
        VirtualClassroomDto dto = VirtualClassroomDto.builder()
                .roomId(UUID.randomUUID().toString())
                .roomName(roomName)
                .roomUrl(roomUrl)
                .token("jitsi-token-" + roomName)
                .courseCode(courseCode)
                .courseName(courseName)
                .instructorName(instructor)
                .topic("Scheduled Lecture")
                .sectionName("A")
                .startTime(Instant.now())
                .durationMinutes(durationMinutes)
                .isLive(true)
                .activeParticipants(0)
                .recordingEnabled(true)
                .provider("JITSI_MEET")
                .build();
        classroomRegistry.put(roomName, dto);
    }

    /**
     * Creates or retrieves a Jitsi WebRTC room.
     * Generates a secure, unique room name locally in Java without third-party API dependencies.
     */
    public VirtualClassroomDto createOrGetClassroom(CreateClassroomRequest request) {
        String courseCode = (request.getCourseCode() != null && !request.getCourseCode().isBlank())
                ? request.getCourseCode().replaceAll("[^a-zA-Z0-9]", "")
                : "GEN";

        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        String generatedRoomName = (request.getRoomName() != null && !request.getRoomName().isBlank())
                ? request.getRoomName().replaceAll("[^a-zA-Z0-9_-]", "")
                : "EduPulse-" + courseCode + "-" + uniqueSuffix;

        // Check if room already cached in memory registry
        if (classroomRegistry.containsKey(generatedRoomName)) {
            return classroomRegistry.get(generatedRoomName);
        }

        String roomUrl = "https://" + jitsiDomain + "/" + generatedRoomName;

        VirtualClassroomDto classroom = VirtualClassroomDto.builder()
                .roomId(UUID.randomUUID().toString())
                .roomName(generatedRoomName)
                .roomUrl(roomUrl)
                .token(UUID.randomUUID().toString())
                .courseCode(request.getCourseCode() != null ? request.getCourseCode() : "GEN-101")
                .courseName(request.getCourseName() != null ? request.getCourseName() : "General Lecture")
                .instructorName(request.getInstructorName() != null ? request.getInstructorName() : "Faculty Instructor")
                .topic(request.getTopic() != null ? request.getTopic() : "Lecture Session")
                .sectionName(request.getSectionName() != null ? request.getSectionName() : "A")
                .startTime(Instant.now())
                .durationMinutes(request.getDurationMinutes() > 0 ? request.getDurationMinutes() : 60)
                .isLive(true)
                .activeParticipants(0)
                .recordingEnabled(true)
                .provider("JITSI_MEET")
                .build();

        classroomRegistry.put(generatedRoomName, classroom);
        log.info("Provisioned local Jitsi WebRTC lecture room: {}", generatedRoomName);
        return classroom;
    }

    public Optional<VirtualClassroomDto> getClassroom(String roomName) {
        return Optional.ofNullable(classroomRegistry.get(roomName));
    }

    public List<VirtualClassroomDto> getActiveClassrooms() {
        return new ArrayList<>(classroomRegistry.values());
    }

    /**
     * Generates a session token descriptor for the client WebRTC connection.
     */
    public ClassroomTokenResponse generateJoinToken(String roomName, String userName, boolean isOwner) {
        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(4, ChronoUnit.HOURS);

        return ClassroomTokenResponse.builder()
                .token(token)
                .roomName(roomName)
                .roomUrl("https://" + jitsiDomain + "/" + roomName)
                .role(isOwner ? "OWNER" : "ATTENDEE")
                .userName(userName)
                .expiresAt(expiresAt.getEpochSecond())
                .build();
    }
}
