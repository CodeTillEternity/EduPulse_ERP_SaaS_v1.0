package com.erp.academic.classroom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VirtualClassroomDto {
    private String roomId;
    private String roomName;
    private String roomUrl;
    private String token;
    private String courseCode;
    private String courseName;
    private String instructorName;
    private String topic;
    private String sectionName;
    private Instant startTime;
    private Integer durationMinutes;
    private Boolean isLive;
    private Integer activeParticipants;
    private Boolean recordingEnabled;
    private String provider;
}

