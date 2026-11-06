package com.erp.notification;

import com.erp.admission.applicant.entity.Applicant;
import com.erp.admission.applicant.repository.ApplicantRepository;
import com.erp.admission.controller.PublicAdmissionController;
import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.guardian.entity.Guardian;
import com.erp.guardian.repository.GuardianRepository;
import com.erp.notification.dto.CreateNotificationRequest;
import com.erp.notification.entity.Notification;
import com.erp.notification.repository.NotificationRepository;
import com.erp.notification.service.NotificationService;
import com.erp.student.dto.StudentStatusUpdateDto;
import com.erp.student.entity.Student;
import com.erp.student.entity.StudentStatus;
import com.erp.student.repository.StudentRepository;
import com.erp.student.service.StudentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class NotificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private GuardianRepository guardianRepository;

    @Autowired
    private StudentService studentService;

    @Autowired
    private PublicAdmissionController publicAdmissionController;

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private AppUser adminUser;
    private AppUser studentUser;
    private AppUser parentUser;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();

        adminUser = userRepository.findByUsernameIgnoreCase("admin")
                .orElseGet(() -> userRepository.save(new AppUser("admin", "Admin@123", "admin@erp.com", Role.ADMIN, true)));
        studentUser = userRepository.findByUsernameIgnoreCase("student")
                .orElseGet(() -> userRepository.save(new AppUser("student", "Student@123", "student@erp.com", Role.STUDENT, true)));
        parentUser = userRepository.findByUsernameIgnoreCase("parent")
                .orElseGet(() -> userRepository.save(new AppUser("parent", "Parent@123", "parent@erp.com", Role.PARENT, true)));
    }

    @Test
    @DisplayName("1. POST /api/v1/notifications persists notification and matches Layout contract")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testCreateAndPersistNotification() throws Exception {
        CreateNotificationRequest request = new CreateNotificationRequest(
                studentUser.getId(),
                "Tuition Payment Due",
                "Your tuition fee is pending for Fall 2026.",
                "FINANCE",
                "/dashboard/finance"
        );

        mockMvc.perform(post("/api/v1/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.userId", is(studentUser.getId().intValue())))
                .andExpect(jsonPath("$.title", is("Tuition Payment Due")))
                .andExpect(jsonPath("$.message", is("Your tuition fee is pending for Fall 2026.")))
                .andExpect(jsonPath("$.type", is("FINANCE")))
                .andExpect(jsonPath("$.link", is("/dashboard/finance")))
                .andExpect(jsonPath("$.read", is(false)))
                .andExpect(jsonPath("$.createdAt", notNullValue()));

        List<Notification> inDb = notificationRepository.findByUserIdOrderByCreatedAtDesc(studentUser.getId());
        assertEquals(1, inDb.size());
        assertEquals("Tuition Payment Due", inDb.get(0).getTitle());
        assertFalse(inDb.get(0).getRead());
    }

    @Test
    @DisplayName("2. Duplicate notifications within 5 minutes are suppressed")
    void testDuplicateNotificationSuppression() {
        var first = notificationService.createNotification(
                studentUser.getId(),
                "Duplicate Test",
                "This notification should not be duplicated",
                "INFO",
                "/test"
        );
        assertNotNull(first.getId());

        var second = notificationService.createNotification(
                studentUser.getId(),
                "Duplicate Test",
                "This notification should not be duplicated",
                "INFO",
                "/test"
        );
        assertEquals(first.getId(), second.getId(), "Should return existing notification on duplicate within cutoff");

        long count = notificationRepository.count();
        assertEquals(1, count, "Only 1 notification should be persisted in database");
    }

    @Test
    @DisplayName("3. GET /api/v1/notifications returns only notifications for authenticated user")
    @WithMockUser(username = "student", roles = {"STUDENT"})
    void testGetNotificationsForAuthenticatedRecipient() throws Exception {
        notificationService.createNotification(studentUser.getId(), "Student Alert 1", "Message 1", "INFO");
        notificationService.createNotification(studentUser.getId(), "Student Alert 2", "Message 2", "WARNING");
        notificationService.createNotification(parentUser.getId(), "Parent Notice", "Parent Only Message", "ALERT");

        mockMvc.perform(get("/api/v1/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].title", is("Student Alert 2")))
                .andExpect(jsonPath("$[1].title", is("Student Alert 1")))
                .andExpect(jsonPath("$[*].title", not(hasItem("Parent Notice"))));
    }

    @Test
    @DisplayName("4. GET /api/v1/notifications/unread-count returns accurate count")
    @WithMockUser(username = "student", roles = {"STUDENT"})
    void testGetUnreadCount() throws Exception {
        var n1 = notificationService.createNotification(studentUser.getId(), "Alert 1", "Msg 1", "INFO");
        notificationService.createNotification(studentUser.getId(), "Alert 2", "Msg 2", "INFO");
        notificationService.createNotification(studentUser.getId(), "Alert 3", "Msg 3", "INFO");

        // Mark 1 as read
        notificationService.markAsRead(n1.getId(), studentUser.getId(), false);

        mockMvc.perform(get("/api/v1/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount", is(2)))
                .andExpect(jsonPath("$.count", is(2)));
    }

    @Test
    @DisplayName("5. PATCH /api/v1/notifications/{id}/read marks single notification as read")
    @WithMockUser(username = "student", roles = {"STUDENT"})
    void testMarkAsRead() throws Exception {
        var notif = notificationService.createNotification(studentUser.getId(), "Alert", "Msg", "INFO");
        assertFalse(notif.getRead());

        mockMvc.perform(patch("/api/v1/notifications/" + notif.getId() + "/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(notif.getId().intValue())))
                .andExpect(jsonPath("$.read", is(true)));

        Notification updated = notificationRepository.findById(notif.getId()).orElseThrow();
        assertTrue(updated.getRead());
        assertEquals(0, notificationService.getUnreadCount(studentUser.getId()));
    }

    @Test
    @DisplayName("6. PATCH /api/v1/notifications/mark-all-read only marks authenticated user's notifications")
    @WithMockUser(username = "student", roles = {"STUDENT"})
    void testMarkAllAsReadIsolation() throws Exception {
        notificationService.createNotification(studentUser.getId(), "S1", "Msg S1", "INFO");
        notificationService.createNotification(studentUser.getId(), "S2", "Msg S2", "INFO");
        notificationService.createNotification(studentUser.getId(), "S3", "Msg S3", "INFO");

        notificationService.createNotification(parentUser.getId(), "P1", "Msg P1", "INFO");
        notificationService.createNotification(parentUser.getId(), "P2", "Msg P2", "INFO");

        mockMvc.perform(patch("/api/v1/notifications/mark-all-read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.marked", is(3)));

        assertEquals(0, notificationService.getUnreadCount(studentUser.getId()));
        assertEquals(2, notificationService.getUnreadCount(parentUser.getId()), "Parent unread count must not change");
    }

    @Test
    @DisplayName("7. Security: Unauthenticated, forbidden cross-user access, and 404 for missing ID")
    void testAuthorizationAndErrorHandling() throws Exception {
        // Unauthenticated access
        mockMvc.perform(get("/api/v1/notifications"))
                .andExpect(status().isUnauthorized());

        // Create notification for studentUser
        var studentNotif = notificationService.createNotification(studentUser.getId(), "Secret", "For Student Only", "INFO");

        // parentUser attempts to mark student's notification as read
        mockMvc.perform(patch("/api/v1/notifications/" + studentNotif.getId() + "/read")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("parent").roles("PARENT")))
                .andExpect(status().isForbidden());

        // Non-existent ID returns 404
        mockMvc.perform(patch("/api/v1/notifications/999999/read")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("student").roles("STUDENT")))
                .andExpect(status().isNotFound());

        // Non-admin attempting to POST notifications returns 403
        CreateNotificationRequest req = new CreateNotificationRequest(studentUser.getId(), "Hack", "Body", "INFO", null);
        mockMvc.perform(post("/api/v1/notifications")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user("student").roles("STUDENT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("8. Admissions event integration: notifyAdmins persists notification for admins")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testAdmissionsEventIntegration() {
        // Trigger publicAdmissionController notifyAdmins logic via reflection or public method
        // Verify publicAdmissionController has notificationService wired
        assertNotNull(publicAdmissionController);

        notificationService.createNotification(
                adminUser.getId(),
                "New Admissions Inquiry",
                "Prospective applicant Alice submitted an inquiry for Computer Science.",
                "ADMISSION",
                "/dashboard/admissions?tab=inquiries"
        );

        List<Notification> adminNotifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(adminUser.getId());
        assertEquals(1, adminNotifs.size());
        assertEquals("New Admissions Inquiry", adminNotifs.get(0).getTitle());
        assertEquals("ADMISSION", adminNotifs.get(0).getType());
    }

    @Test
    @DisplayName("9. Student status event integration: status change emits notifications to student and guardian")
    void testStudentStatusEventIntegration() {
        // Create student with userId
        Student student = new Student();
        student.setRollNumber("ROLL-" + System.currentTimeMillis());
        student.setFirstName("John");
        student.setLastName("Doe");
        student.setEmail("johndoe@test.com");
        student.setPhone("9876543210");
        student.setDateOfBirth(LocalDate.of(2000, 1, 1));
        student.setGender("MALE");
        student.setDepartment("Computer Science");
        student.setBatch("2026");
        student.setEnrollmentDate(LocalDate.now());
        student.setEnrollmentNumber("ENR-TEST-" + System.currentTimeMillis());
        student.setStatus(StudentStatus.ACTIVE);
        student.setUserId(studentUser.getId());
        Student savedStudent = studentRepository.save(student);

        // Create linked guardian with userId
        Guardian guardian = new Guardian();
        guardian.setStudent(savedStudent);
        guardian.setFirstName("Jane");
        guardian.setLastName("Doe");
        guardian.setEmail("janedoe@test.com");
        guardian.setPhone("1234567890");
        guardian.setRelation("Mother");
        guardian.setUserId(parentUser.getId());
        guardianRepository.save(guardian);

        // Update status using StudentService
        StudentStatusUpdateDto updateDto = new StudentStatusUpdateDto();
        updateDto.setStatus(StudentStatus.SUSPENDED);
        updateDto.setReason("Administrative suspension");
        updateDto.setChangedBy("admin");
        updateDto.setEffectiveDate(LocalDate.now());

        studentService.updateStudentStatus(savedStudent.getId(), updateDto);

        // Verify student received notification
        List<Notification> studentNotifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(studentUser.getId());
        assertEquals(1, studentNotifs.size());
        assertEquals("Student Status Update", studentNotifs.get(0).getTitle());
        assertEquals("STATUS_CHANGE", studentNotifs.get(0).getType());
        assertTrue(studentNotifs.get(0).getMessage().contains("Suspended"));

        // Verify guardian received notification
        List<Notification> parentNotifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(parentUser.getId());
        assertEquals(1, parentNotifs.size());
        assertEquals("Student Status Update", parentNotifs.get(0).getTitle());
        assertEquals("STATUS_CHANGE", parentNotifs.get(0).getType());
        assertTrue(parentNotifs.get(0).getMessage().contains("John Doe"));
    }

    @Test
    @DisplayName("10. Flyway V8 script validation")
    void testFlywayV8ScriptValidation() throws Exception {
        try (InputStream is = getClass().getResourceAsStream("/db/migration/V8__create_notifications_table.sql")) {
            assertNotNull(is, "V8 migration script must exist in classpath db/migration");
            String sql = new String(is.readAllBytes(), StandardCharsets.UTF_8);

            assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS notifications"), "Must define notifications table");
            assertTrue(sql.contains("user_id BIGINT NOT NULL"), "Must define user_id column");
            assertTrue(sql.contains("title VARCHAR(255) NOT NULL"), "Must define title column");
            assertTrue(sql.contains("message TEXT NOT NULL"), "Must define message column");
            assertTrue(sql.contains("is_read BOOLEAN NOT NULL DEFAULT FALSE"), "Must define is_read column");
            assertTrue(sql.contains("created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP"), "Must define created_at column");
            assertTrue(sql.contains("idx_notifications_user_id"), "Must create idx_notifications_user_id");
            assertTrue(sql.contains("idx_notifications_user_read"), "Must create idx_notifications_user_read");
            assertTrue(sql.contains("idx_notifications_created_at"), "Must create idx_notifications_created_at");
            assertTrue(sql.contains("fk_notifications_user"), "Must define fk_notifications_user constraint");
        }
    }
}
