package com.erp.academic.notion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotionBlockDto {
    private String id;
    private String type; // heading_1, heading_2, heading_3, paragraph, bulleted_list_item, numbered_list_item, to_do, code, callout, divider
    private String plainText;
    private String language;
    private Boolean checked;
    private String icon;
    private List<NotionBlockDto> children;
}

