package com.erp.academic.classroom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateClassroomRequest {
    private String roomName;
    private String courseCode;
    private String courseName;
    private String instructorName;
    private String topic;
    private String sectionName;
    private Integer durationMinutes;
    private Boolean recordingEnabled;
}
