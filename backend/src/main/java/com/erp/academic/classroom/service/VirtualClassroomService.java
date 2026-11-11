package com.erp.academic.classroom.service;

import com.erp.academic.classroom.dto.ClassroomTokenResponse;
import com.erp.academic.classroom.dto.CreateClassroomRequest;
import com.erp.academic.classroom.dto.VirtualClassroomDto;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VirtualClassroomService {

    private static final Logger log = LoggerFactory.getLogger(VirtualClassroomService.class);
    private static final String DAILY_API_BASE = "https://api.daily.co/v1";

    @Value("${daily.api-key:}")
    private String dailyApiKey;

    @Value("${daily.domain:edupulse}")
    private String dailyDomain;

    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, VirtualClassroomDto> classroomRegistry = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        // Pre-populate realistic academic lecture rooms for EduPulse CS and Engineering
        seedClassroom(
                "edupulse-cs302-distributed-systems",
                "CS-302",
                "Advanced Distributed Systems",
                "Dr. Aris Thorne",
                "Raft Consensus & Distributed Log Replication",
                "CS-Fall-2026-A",
                90,
                28
        );
        seedClassroom(
                "edupulse-se404-cloud-architecture",
                "SE-404",
                "Cloud Systems Engineering",
                "Prof. Elena Rostova",
                "Multi-Tenant Isolation & Zero-Downtime Migration",
                "SE-Fall-2026-B",
                60,
                22
        );
        seedClassroom(
                "edupulse-ma201-linear-algebra",
                "MA-201",
                "Applied Linear Algebra & Tensors",
                "Dr. Marcus Vance",
                "Singular Value Decomposition & Neural Encoders",
                "MA-Fall-2026-C",
                75,
                34
        );
    }

    private void seedClassroom(String roomName, String courseCode, String courseName,
                              String instructor, String topic, String section,
                              int durationMinutes, int participants) {
        String roomUrl = "https://" + dailyDomain + ".daily.co/" + roomName;
        VirtualClassroomDto dto = VirtualClassroomDto.builder()
                .roomId(UUID.randomUUID().toString())
                .roomName(roomName)
                .roomUrl(roomUrl)
                .token("seed-token-" + roomName)
                .courseCode(courseCode)
                .courseName(courseName)
                .instructorName(instructor)
                .topic(topic)
                .sectionName(section)
                .startTime(Instant.now().minus(15, ChronoUnit.MINUTES))
                .durationMinutes(durationMinutes)
                .isLive(true)
                .activeParticipants(participants)
                .recordingEnabled(true)
                .provider("DAILY_WEBRTC")
                .build();
        classroomRegistry.put(roomName, dto);
    }

    /**
     * Creates or retrieves a Daily.co WebRTC room for an academic lecture.
     */
    public VirtualClassroomDto createOrGetClassroom(CreateClassroomRequest request) {
        String rawName = (request.getRoomName() != null && !request.getRoomName().isBlank())
                ? request.getRoomName()
                : (request.getCourseCode() != null ? "edupulse-" + request.getCourseCode().toLowerCase().replace(" ", "-") : "edupulse-room-" + System.currentTimeMillis());

        String sanitizedRoomName = rawName.replaceAll("[^a-zA-Z0-9_-]", "-").toLowerCase();

        // Check if room already exists in memory registry
        if (classroomRegistry.containsKey(sanitizedRoomName)) {
            return classroomRegistry.get(sanitizedRoomName);
        }

        String roomUrl = "https://" + dailyDomain + ".daily.co/" + sanitizedRoomName;

        // If Daily.co API key is configured, invoke Daily REST API
        if (dailyApiKey != null && !dailyApiKey.isBlank() && !dailyApiKey.startsWith("placeholder")) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(dailyApiKey);

                JSONObject properties = new JSONObject();
                properties.put("enable_screenshare", true);
                properties.put("enable_chat", true);
                properties.put("start_video_off", false);
                properties.put("start_audio_off", false);
                long exp = Instant.now().plus(4, ChronoUnit.HOURS).getEpochSecond();
                properties.put("exp", exp);

                JSONObject body = new JSONObject();
                body.put("name", sanitizedRoomName);
                body.put("privacy", "public");
                body.put("properties", properties);

                HttpEntity<String> entity = new HttpEntity<>(body.toString(), headers);
                ResponseEntity<String> response = restTemplate.postForEntity(DAILY_API_BASE + "/rooms", entity, String.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JSONObject resJson = new JSONObject(response.getBody());
                    if (resJson.has("url")) {
                        roomUrl = resJson.getString("url");
                    }
                }
            } catch (Exception e) {
                log.warn("Daily.co API call encountered an exception; defaulting to deterministic room URL: {}", e.getMessage());
            }
        }

        VirtualClassroomDto classroom = VirtualClassroomDto.builder()
                .roomId(UUID.randomUUID().toString())
                .roomName(sanitizedRoomName)
                .roomUrl(roomUrl)
                .token(UUID.randomUUID().toString())
                .courseCode(request.getCourseCode() != null ? request.getCourseCode() : "GEN-101")
                .courseName(request.getCourseName() != null ? request.getCourseName() : "General Lecture Hall")
                .instructorName(request.getInstructorName() != null ? request.getInstructorName() : "Faculty Member")
                .topic(request.getTopic() != null ? request.getTopic() : "Interactive Lecture")
                .sectionName(request.getSectionName() != null ? request.getSectionName() : "Section A")
                .startTime(Instant.now())
                .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 60)
                .isLive(true)
                .activeParticipants(1)
                .recordingEnabled(request.getRecordingEnabled() != null ? request.getRecordingEnabled() : true)
                .provider("DAILY_WEBRTC")
                .build();

        classroomRegistry.put(sanitizedRoomName, classroom);
        return classroom;
    }

    /**
     * Retrieves an active classroom by room name.
     */
    public Optional<VirtualClassroomDto> getClassroom(String roomName) {
        return Optional.ofNullable(classroomRegistry.get(roomName));
    }

    /**
     * Lists all active/scheduled virtual classrooms.
     */
    public List<VirtualClassroomDto> getActiveClassrooms() {
        return new ArrayList<>(classroomRegistry.values());
    }

    /**
     * Generates a meeting token for authenticated student or faculty join.
     */
    public ClassroomTokenResponse generateJoinToken(String roomName, String userName, boolean isFaculty) {
        String token = "tok_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        long expiresAt = Instant.now().plus(4, ChronoUnit.HOURS).toEpochMilli();

        if (dailyApiKey != null && !dailyApiKey.isBlank() && !dailyApiKey.startsWith("placeholder")) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(dailyApiKey);

                JSONObject properties = new JSONObject();
                properties.put("room_name", roomName);
                properties.put("user_name", userName);
                properties.put("is_owner", isFaculty);
                properties.put("exp", Instant.now().plus(4, ChronoUnit.HOURS).getEpochSecond());

                JSONObject body = new JSONObject();
                body.put("properties", properties);

                HttpEntity<String> entity = new HttpEntity<>(body.toString(), headers);
                ResponseEntity<String> response = restTemplate.postForEntity(DAILY_API_BASE + "/meeting-tokens", entity, String.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JSONObject resJson = new JSONObject(response.getBody());
                    if (resJson.has("token")) {
                        token = resJson.getString("token");
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to generate Daily.co meeting token; using fallback token: {}", e.getMessage());
            }
        }

        String roomUrl = "https://" + dailyDomain + ".daily.co/" + roomName;
        VirtualClassroomDto existing = classroomRegistry.get(roomName);
        if (existing != null) {
            roomUrl = existing.getRoomUrl();
        }

        return ClassroomTokenResponse.builder()
                .token(token)
                .roomName(roomName)
                .roomUrl(roomUrl)
                .role(isFaculty ? "FACULTY_HOST" : "STUDENT_ATTENDEE")
                .userName(userName)
                .expiresAt(expiresAt)
                .build();
    }
}

