package com.erp.finance;

import com.erp.academic.academic_year.entity.AcademicYear;
import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import com.erp.finance.fee_structure.entity.FeeHead;
import com.erp.finance.fee_structure.entity.FeeStructure;
import com.erp.finance.fee_structure.entity.FeeStructureComponent;
import com.erp.finance.fee_structure.repository.FeeHeadRepository;
import com.erp.finance.fee_structure.repository.FeeStructureRepository;
import com.erp.finance.service.StudentFeeService;
import com.erp.finance.student_fee.entity.StudentFee;
import com.erp.finance.student_fee.repository.StudentFeeRepository;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "spring.jpa.open-in-view=false")
public class StudentFeeOpenInViewTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private StudentFeeService studentFeeService;

    @Autowired
    private StudentFeeRepository studentFeeRepository;

    @Autowired
    private FeeStructureRepository feeStructureRepository;

    @Autowired
    private FeeHeadRepository feeHeadRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    private Student testStudent;
    private FeeHead testHead;
    private FeeStructure testStructure;
    private AcademicYear testAcademicYear;

    @BeforeEach
    void setUp() {
        studentFeeRepository.deleteAll();
        feeStructureRepository.deleteAll();
        feeHeadRepository.deleteAll();
        studentRepository.deleteAll();
        userRepository.deleteAll();
        academicYearRepository.deleteAll();

        // 1. Create Academic Year
        testAcademicYear = new AcademicYear();
        testAcademicYear.setName("AY-2026-" + UUID.randomUUID().toString().substring(0, 6));
        testAcademicYear.setStartDate(LocalDate.of(2026, 7, 1));
        testAcademicYear.setEndDate(LocalDate.of(2027, 6, 30));
        testAcademicYear = academicYearRepository.save(testAcademicYear);

        // 2. Create Student User and Student Profile
        AppUser studentUser = new AppUser();
        studentUser.setUsername("stu_" + UUID.randomUUID().toString().substring(0, 8));
        studentUser.setEmail("stu_" + UUID.randomUUID().toString().substring(0, 8) + "@univ.edu");
        studentUser.setPassword("SecurePwd123!");
        studentUser.setRole(Role.STUDENT);
        studentUser = userRepository.save(studentUser);

        testStudent = new Student();
        testStudent.setFirstName("Rohan");
        testStudent.setLastName("Sharma");
        testStudent.setEmail(studentUser.getEmail());
        testStudent.setRollNumber("ROLL-" + UUID.randomUUID().toString().substring(0, 6));
        testStudent.setDepartment("Computer Science");
        testStudent.setBatch("2026");
        testStudent.setEnrollmentDate(LocalDate.now());
        testStudent.setDateOfBirth(LocalDate.of(2004, 5, 15));
        testStudent.setGender("MALE");
        testStudent.setPhone("+919876543210");
        testStudent.setUserId(studentUser.getId());
        testStudent = studentRepository.save(testStudent);

        // 3. Create Fee Head
        testHead = new FeeHead();
        testHead.setCode("TUIT-" + UUID.randomUUID().toString().substring(0, 6));
        testHead.setName("Tuition Fee AY 2026");
        testHead.setDescription("Core tuition fee");
        testHead.setActive(true);
        testHead = feeHeadRepository.save(testHead);

        // 4. Create Fee Structure with component
        testStructure = new FeeStructure();
        testStructure.setCode("FS-CS-" + UUID.randomUUID().toString().substring(0, 6));
        testStructure.setName("B.Tech CS Fee Structure");
        testStructure.setActive(true);
        testStructure.setAcademicYearId(testAcademicYear.getId());

        FeeStructureComponent component = new FeeStructureComponent();
        component.setFeeStructure(testStructure);
        component.setFeeHead(testHead);
        component.setAmount(new BigDecimal("35000.00"));
        testStructure.getComponents().add(component);

        testStructure = feeStructureRepository.save(testStructure);
    }

    @Test
    @DisplayName("GET student-fees and student-fees/student/{studentId} succeed with HTTP 200 and components when open-in-view=false")
    @WithMockUser(authorities = {"ROLE_FINANCE", "FEE_ASSIGNMENT_VIEW"})
    void testGetStudentFeesWithComponentsWhenOpenInViewIsFalse() throws Exception {
        // 1. Assign fee structure to student creating StudentFee with StudentFeeComponent
        StudentFee assignedFee = studentFeeService.assignFeeStructure(
                testStudent.getId(),
                testStructure.getId(),
                testAcademicYear.getId()
        );

        Long feeId = assignedFee.getId();

        // 2. GET /api/v1/finance/student-fees (Finance Management endpoint)
        mockMvc.perform(get("/api/v1/finance/student-fees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[?(@.id == " + feeId + ")].studentId").value(testStudent.getId().intValue()))
                .andExpect(jsonPath("$[?(@.id == " + feeId + ")].components", hasSize(1)))
                .andExpect(jsonPath("$[?(@.id == " + feeId + ")].components[0].feeHeadId").value(testHead.getId().intValue()))
                .andExpect(jsonPath("$[?(@.id == " + feeId + ")].components[0].feeHeadName").value("Tuition Fee AY 2026"))
                .andExpect(jsonPath("$[?(@.id == " + feeId + ")].components[0].feeHeadCode").value(testHead.getCode()))
                .andExpect(jsonPath("$[?(@.id == " + feeId + ")].components[0].grossAmount").value(35000.00));

        // 3. GET /api/v1/finance/student-fees/student/{studentId} (Student Profile endpoint)
        mockMvc.perform(get("/api/v1/finance/student-fees/student/" + testStudent.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(feeId))
                .andExpect(jsonPath("$[0].studentId").value(testStudent.getId().intValue()))
                .andExpect(jsonPath("$[0].grossAmount").value(35000.00))
                .andExpect(jsonPath("$[0].components", hasSize(1)))
                .andExpect(jsonPath("$[0].components[0].feeHeadId").value(testHead.getId().intValue()))
                .andExpect(jsonPath("$[0].components[0].feeHeadName").value("Tuition Fee AY 2026"))
                .andExpect(jsonPath("$[0].components[0].feeHeadCode").value(testHead.getCode()))
                .andExpect(jsonPath("$[0].components[0].grossAmount").value(35000.00));

        // 4. GET /api/v1/finance/student-fees/{id}
        mockMvc.perform(get("/api/v1/finance/student-fees/" + feeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(feeId))
                .andExpect(jsonPath("$.studentId").value(testStudent.getId().intValue()))
                .andExpect(jsonPath("$.components", hasSize(1)))
                .andExpect(jsonPath("$.components[0].feeHeadId").value(testHead.getId().intValue()))
                .andExpect(jsonPath("$.components[0].feeHeadName").value("Tuition Fee AY 2026"));
    }

    @Test
    @DisplayName("GET student-fees enforces authorization when user lacks permissions")
    @WithMockUser(authorities = {"ROLE_STUDENT"})
    void testGetStudentFeesUnauthorizedWithoutPermission() throws Exception {
        mockMvc.perform(get("/api/v1/finance/student-fees"))
                .andExpect(status().isForbidden());
    }
}
