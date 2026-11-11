package com.erp.academic.notion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotionPageDto {
    private String pageId;
    private String title;
    private String courseCode;
    private String courseName;
    private String facultyName;
    private Instant lastSyncedAt;
    private String icon;
    private String coverUrl;
    private List<NotionBlockDto> blocks;
}

