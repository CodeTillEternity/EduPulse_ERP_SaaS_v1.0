package com.erp.auth.service;

import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RoleServiceTest {

    private UserRepository userRepository;
    private RoleService roleService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        roleService = new RoleService(userRepository);
    }

    @Test
    @DisplayName("Should query repository and return user roles on cache miss")
    void testGetUserRoles() {
        AppUser user = new AppUser("john_admin", "password", "john@college.edu", Role.ADMIN, true);
        when(userRepository.findByUsernameIgnoreCase("john_admin")).thenReturn(Optional.of(user));

        List<String> roles = roleService.getUserRoles("john_admin");

        assertNotNull(roles);
        assertEquals(1, roles.size());
        assertEquals("ADMIN", roles.get(0));
        verify(userRepository, times(1)).findByUsernameIgnoreCase("john_admin");
    }

    @Test
    @DisplayName("Should update user role and persist changes for cache eviction")
    void testUpdateUserRole() {
        AppUser user = new AppUser("jane_student", "password", "jane@college.edu", Role.STUDENT, true);
        when(userRepository.findByUsernameIgnoreCase("jane_student")).thenReturn(Optional.of(user));

        roleService.updateUserRole("jane_student", Role.FACULTY);

        assertEquals(Role.FACULTY, user.getRole());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Should return empty list for unknown user")
    void testGetUserRolesUnknown() {
        when(userRepository.findByUsernameIgnoreCase("ghost")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("ghost")).thenReturn(Optional.empty());

        List<String> roles = roleService.getUserRoles("ghost");

        assertNotNull(roles);
        assertTrue(roles.isEmpty());
    }
}
