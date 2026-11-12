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
import org.springframework.web.client.HttpClientErrorException;
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
        seedInitialClassroom("cs302-distributed-systems", "CS-302", "Advanced Distributed Systems", "Dr. Aris Thorne", 90);
        seedInitialClassroom("se404-cloud-architecture", "SE-404", "Cloud Systems Engineering", "Prof. Elena Rostova", 60);
        seedInitialClassroom("ma201-linear-algebra", "MA-201", "Applied Linear Algebra", "Dr. Marcus Vance", 75);
    }

    private void seedInitialClassroom(String roomName, String courseCode, String courseName, String instructor, int durationMinutes) {
        String roomUrl = "https://" + dailyDomain + ".daily.co/" + roomName;
        VirtualClassroomDto dto = VirtualClassroomDto.builder()
                .roomId(UUID.randomUUID().toString())
                .roomName(roomName)
                .roomUrl(roomUrl)
                .token("token-" + roomName)
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
                .provider("DAILY_WEBRTC")
                .build();
        classroomRegistry.put(roomName, dto);
    }

    /**
     * Creates or retrieves a Daily.co WebRTC room via HTTP POST to api.daily.co/v1/rooms.
     */
    public VirtualClassroomDto createOrGetClassroom(CreateClassroomRequest request) {
        String rawName = (request.getRoomName() != null && !request.getRoomName().isBlank())
                ? request.getRoomName()
                : (request.getCourseCode() != null ? "edupulse-" + request.getCourseCode().toLowerCase().replace(" ", "-") : "room-" + System.currentTimeMillis());

        String sanitizedRoomName = rawName.replaceAll("[^a-zA-Z0-9_-]", "-").toLowerCase();

        // Check if room already cached
        if (classroomRegistry.containsKey(sanitizedRoomName)) {
            return classroomRegistry.get(sanitizedRoomName);
        }

        String roomUrl = "https://" + dailyDomain + ".daily.co/" + sanitizedRoomName;

        // If Daily.co API key is configured, perform real HTTP POST to api.daily.co/v1/rooms
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
                        log.info("Daily.co room created successfully: {}", roomUrl);
                    }
                }
            } catch (HttpClientErrorException.Conflict conflictEx) {
                // Room already exists in Daily.co account; query its details
                try {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setBearerAuth(dailyApiKey);
                    HttpEntity<Void> getEntity = new HttpEntity<>(headers);
                    ResponseEntity<String> getRes = restTemplate.exchange(
                            DAILY_API_BASE + "/rooms/" + sanitizedRoomName,
                            HttpMethod.GET,
                            getEntity,
                            String.class
                    );
                    if (getRes.getStatusCode().is2xxSuccessful() && getRes.getBody() != null) {
                        JSONObject getJson = new JSONObject(getRes.getBody());
                        if (getJson.has("url")) {
                            roomUrl = getJson.getString("url");
                        }
                    }
                } catch (Exception fetchEx) {
                    log.warn("Failed to retrieve existing Daily.co room: {}", fetchEx.getMessage());
                }
            } catch (Exception e) {
                log.warn("Daily.co API call failed: {}", e.getMessage());
            }
        }

        VirtualClassroomDto classroom = VirtualClassroomDto.builder()
                .roomId(UUID.randomUUID().toString())
                .roomName(sanitizedRoomName)
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
                .provider("DAILY_WEBRTC")
                .build();

        classroomRegistry.put(sanitizedRoomName, classroom);
        return classroom;
    }

    public Optional<VirtualClassroomDto> getClassroom(String roomName) {
        return Optional.ofNullable(classroomRegistry.get(roomName));
    }

    public List<VirtualClassroomDto> getActiveClassrooms() {
        return new ArrayList<>(classroomRegistry.values());
    }

    /**
     * Generates a meeting token for authenticated access to a Daily.co room.
     */
    public ClassroomTokenResponse generateJoinToken(String roomName, String userName, boolean isOwner) {
        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(4, ChronoUnit.HOURS);

        if (dailyApiKey != null && !dailyApiKey.isBlank() && !dailyApiKey.startsWith("placeholder")) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(dailyApiKey);

                JSONObject properties = new JSONObject();
                properties.put("room_name", roomName);
                properties.put("user_name", userName);
                properties.put("is_owner", isOwner);
                properties.put("exp", expiresAt.getEpochSecond());

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
                log.warn("Daily.co meeting token generation failed: {}", e.getMessage());
            }
        }

        return new ClassroomTokenResponse(token, roomName, userName, isOwner, expiresAt);
    }
}
