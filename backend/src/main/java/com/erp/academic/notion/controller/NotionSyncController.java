package com.erp.academic.notion.controller;

import com.erp.academic.notion.dto.NotionPageDto;
import com.erp.academic.notion.service.NotionSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/academic/notion")
public class NotionSyncController {

    private final NotionSyncService notionSyncService;

    public NotionSyncController(NotionSyncService notionSyncService) {
        this.notionSyncService = notionSyncService;
    }

    @GetMapping("/pages")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN', 'SUPER_ADMIN', 'PARENT')")
    public ResponseEntity<List<NotionPageDto>> getAvailablePages() {
        return ResponseEntity.ok(notionSyncService.getAvailablePages());
    }

    @GetMapping("/pages/{pageId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN', 'SUPER_ADMIN', 'PARENT')")
    public ResponseEntity<NotionPageDto> getPage(@PathVariable String pageId) {
        return notionSyncService.getPageById(pageId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/pages/{pageId}/sync")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NotionPageDto> syncPage(@PathVariable String pageId) {
        return ResponseEntity.ok(notionSyncService.syncPageFromNotion(pageId));
    }
}
