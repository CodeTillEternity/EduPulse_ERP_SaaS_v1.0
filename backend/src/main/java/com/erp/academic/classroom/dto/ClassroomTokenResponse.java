package com.erp.academic.classroom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomTokenResponse {
    private String token;
    private String roomName;
    private String roomUrl;
    private String role;
    private String userName;
    private Long expiresAt;
}
