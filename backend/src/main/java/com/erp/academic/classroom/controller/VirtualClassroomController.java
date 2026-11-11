package com.erp.academic.classroom.controller;

import com.erp.academic.classroom.dto.ClassroomTokenResponse;
import com.erp.academic.classroom.dto.CreateClassroomRequest;
import com.erp.academic.classroom.dto.VirtualClassroomDto;
import com.erp.academic.classroom.service.VirtualClassroomService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/classrooms")
public class VirtualClassroomController {

    private final VirtualClassroomService virtualClassroomService;

    public VirtualClassroomController(VirtualClassroomService virtualClassroomService) {
        this.virtualClassroomService = virtualClassroomService;
    }

    @PostMapping("/rooms")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<VirtualClassroomDto> createOrGetRoom(@RequestBody CreateClassroomRequest request) {
        return ResponseEntity.ok(virtualClassroomService.createOrGetClassroom(request));
    }

    @GetMapping("/rooms/{roomName}")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN', 'SUPER_ADMIN', 'PARENT')")
    public ResponseEntity<VirtualClassroomDto> getRoomDetails(@PathVariable String roomName) {
        return virtualClassroomService.getClassroom(roomName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN', 'SUPER_ADMIN', 'PARENT')")
    public ResponseEntity<List<VirtualClassroomDto>> getActiveClassrooms() {
        return ResponseEntity.ok(virtualClassroomService.getActiveClassrooms());
    }

    @GetMapping("/rooms/{roomName}/token")
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ClassroomTokenResponse> getJoinToken(
            @PathVariable String roomName,
            @RequestParam(required = false, defaultValue = "Student User") String displayName,
            Authentication authentication) {
        boolean isFaculty = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_FACULTY") || a.getAuthority().equals("ROLE_ADMIN"));
        String user = (authentication != null && authentication.getName() != null)
                ? authentication.getName()
                : displayName;
        return ResponseEntity.ok(virtualClassroomService.generateJoinToken(roomName, user, isFaculty));
    }
}
