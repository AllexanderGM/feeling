package com.feeling.integration;

import com.feeling.packages.user.domain.dto.UserPartialUpdateDTO;
import com.feeling.domain.dto.validation.ValidationGroups;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests para validar que los grupos de validación funcionan correctamente
 * Phase 2.2: Validation DTOs Testing
 */
@DisplayName("Validation Groups Tests")
public class ValidationGroupsTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = jakarta.validation.Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Test Create User Validation Group")
    void testCreateUserValidationGroup() {
        // DTO válido para creación
        UserPartialUpdateDTO validDto = new UserPartialUpdateDTO(
                "John", "Doe", "john@example.com", LocalDate.of(1990, 1, 1),
                "+1234567890", "+1", "USA", "New York", "NY", "Manhattan",
                "Test description", null, null, "NETWORKING", "Male", null,
                25, 35, 50, null, null,
                null, null, null, null, null, null, null,
                null, null, null, null, null, null,
                null, null, null, null, null
        );

        Set<ConstraintViolation<UserPartialUpdateDTO>> violations =
            validator.validate(validDto, ValidationGroups.CreateUser.class);

        assertTrue(violations.isEmpty(), "Valid DTO should pass CreateUser validation");

        // DTO inválido para creación (sin nombre)
        UserPartialUpdateDTO invalidDto = new UserPartialUpdateDTO(
                null, "Doe", "john@example.com", LocalDate.of(1990, 1, 1),
                "+1234567890", "+1", "USA", "New York", "NY", "Manhattan",
                "Test description", null, null, "NETWORKING", "Male", null,
                25, 35, 50, null, null,
                null, null, null, null, null, null, null,
                null, null, null, null, null, null,
                null, null, null, null, null
        );

        violations = validator.validate(invalidDto, ValidationGroups.CreateUser.class);
        assertFalse(violations.isEmpty(), "Invalid DTO should fail CreateUser validation");

        // Verificar que el error específico es sobre el nombre
        boolean hasNameError = violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("name"));
        assertTrue(hasNameError, "Should have validation error for name field");
    }

    @Test
    @DisplayName("Test Update Preferences Validation Group")
    void testUpdatePreferencesValidationGroup() {
        // Preferencias válidas usando UserPartialUpdateDTO
        UserPartialUpdateDTO validUpdate = new UserPartialUpdateDTO(
                Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty(),
                Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty(),
                Optional.of("NETWORKING"), Optional.empty(), Optional.empty(), Optional.empty(),
                Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty(),
                Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty(),
                Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty(),
                Optional.empty(), Optional.empty(), Optional.empty(),
                Optional.of(25), Optional.of(35), Optional.empty(), Optional.of(50),
                Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty(),
                Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty(),
                Optional.empty(), Optional.empty(), Optional.empty(),
                Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty(),
                Optional.empty(), Optional.empty(),
                Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty(),
                Optional.empty(), Optional.empty()
        );

        Set<ConstraintViolation<UserPartialUpdateDTO>> violations =
            validator.validate(validUpdate, ValidationGroups.UpdatePreferences.class);

        assertTrue(violations.isEmpty(), "Valid preferences should pass validation");
        assertTrue(validUpdate.hasPreferenceUpdates(), "Should detect preference updates");
    }

    @Test
    @DisplayName("Test Admin Operation Validation Group")
    void testAdminOperationValidationGroup() {
        // DTO con campos de admin válidos
        UserPartialUpdateDTO adminDto = new UserPartialUpdateDTO(
                "John", "Doe", "john@example.com", LocalDate.of(1990, 1, 1),
                "+1234567890", "+1", "USA", "New York", "NY", "Manhattan",
                "Test description", null, null, "NETWORKING", "Male", null,
                25, 35, 50, null, null,
                null, null, null, null, null, null, null,
                null, null, null, null, null, null,
                true, "APPROVED", "CLIENT", false, null  // Campos de admin
        );

        Set<ConstraintViolation<UserPartialUpdateDTO>> violations =
            validator.validate(adminDto, ValidationGroups.AdminOperation.class);

        assertTrue(violations.isEmpty(), "Valid admin fields should pass validation");

        // DTO con campos de admin inválidos (sin estado de verificación)
        UserPartialUpdateDTO invalidAdminDto = new UserPartialUpdateDTO(
                "John", "Doe", "john@example.com", LocalDate.of(1990, 1, 1),
                "+1234567890", "+1", "USA", "New York", "NY", "Manhattan",
                "Test description", null, null, "NETWORKING", "Male", null,
                25, 35, 50, null, null,
                null, null, null, null, null, null, null,
                null, null, null, null, null, null,
                null, "APPROVED", "CLIENT", false, null  // verified = null
        );

        violations = validator.validate(invalidAdminDto, ValidationGroups.AdminOperation.class);
        assertFalse(violations.isEmpty(), "Missing verified field should fail admin validation");
    }

    @Test
    @DisplayName("Test Cross-Field Validation")
    void testCrossFieldValidation() {
        // Test validación cruzada: showPhone = true pero sin teléfono
        UserPartialUpdateDTO dtoWithPhoneIssue = new UserPartialUpdateDTO(
                "John", "Doe", "john@example.com", LocalDate.of(1990, 1, 1),
                null, null, "USA", "New York", "NY", "Manhattan",  // Sin teléfono
                "Test description", null, null, "NETWORKING", "Male", null,
                25, 35, 50, null, null,
                null, null, null, null, null, true, null,  // showPhone = true
                null, null, null, null, null, null,
                null, null, null, null, null
        );

        Set<ConstraintViolation<UserPartialUpdateDTO>> violations =
            validator.validate(dtoWithPhoneIssue, ValidationGroups.UpdatePrivacy.class);

        assertFalse(violations.isEmpty(), "Should fail when showPhone=true but phone is null");

        // Verificar que hay un error en la validación cruzada
        boolean hasPhoneVisibilityError = violations.stream()
                .anyMatch(v -> v.getMessage().contains("mostrar el teléfono"));
        assertTrue(hasPhoneVisibilityError, "Should have phone visibility validation error");
    }

    @Test
    @DisplayName("Test No Validation When No Groups Specified")
    void testNoValidationWhenNoGroups() {
        // DTO inválido pero sin grupos de validación
        UserPartialUpdateDTO invalidDto = new UserPartialUpdateDTO(
                null, null, "invalid-email", null,  // Campos inválidos
                null, null, null, null, null, null,
                null, null, null, null, null, null,
                null, null, null, null, null,
                null, null, null, null, null, null, null,
                null, null, null, null, null, null,
                null, null, null, null, null
        );

        // Sin grupos de validación, solo validaciones sin grupos se ejecutan
        Set<ConstraintViolation<UserPartialUpdateDTO>> violations = validator.validate(invalidDto);

        // Puede tener algunas violaciones de validaciones sin grupos, pero no las específicas de grupos
        System.out.println("Violations without groups: " + violations.size());
    }
}