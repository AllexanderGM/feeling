package com.feeling.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.feeling.packages.auth.domain.dto.AuthLoginResponseDTO;
import com.feeling.packages.user.domain.dto.UserDTOMapper;
import com.feeling.packages.user.domain.enums.ApprovalStatus;
import com.feeling.packages.user.domain.enums.UserRoleList;
import com.feeling.packages.user.infrastructure.entities.User;
import com.feeling.packages.user.infrastructure.entities.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests de estructura de DTOs para asegurar compatibilidad durante refactoring
 * Phase 1.2: Integration Tests Creation
 *
 * @deprecated This test uses deprecated DTOs. Structure is now unified in UserResponseDTO
 */
@Deprecated(since = "1.8", forRemoval = true)
@SpringBootTest
@DisplayName("User DTO Structure Integration Tests")
public class UserDTOStructureIntegrationTest {

    private ObjectMapper objectMapper;
    private User testUser;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

        UserRole userRole = new UserRole();
        userRole.setUserRoleList(UserRoleList.CLIENT);

        testUser = User.builder()
            .id(1L)
            .name("Test")
            .lastName("User")
            .email("test@example.com")
            .phone("+123456789")
            .phoneCode("+57")
            .country("Colombia")
            .city("Bogotá")
            .department("Cundinamarca")
            .description("Test user description")
            .images(Arrays.asList("main.jpg", "image1.jpg", "image2.jpg"))
            .verified(true)
            .profileComplete(true)
            .approvalStatus(ApprovalStatus.APPROVED)
            .userRole(userRole)
            .availableAttempts(10)
            .createdAt(LocalDateTime.now())
            .lastActive(LocalDateTime.now())
            .publicAccount(false)
            .searchVisibility(true)
            .locationPublic(true)
            .showAge(true)
            .showLocation(true)
            .showPhone(false)
            .showMeInSearch(true)
            .notificationsEmailEnabled(true)
            .notificationsPhoneEnabled(false)
            .notificationsMatchesEnabled(true)
            .notificationsEventsEnabled(true)
            .notificationsLoginEnabled(false)
            .notificationsPaymentsEnabled(true)
            .profileViews(100L)
            .likesReceived(25L)
            .matchesCount(5L)
            .popularityScore(85.5)
            // Note: profileCompletenessPercentage is calculated, not set directly
            .accountDeactivated(false)
            .build();
    }

    @Test
    @DisplayName("Test AuthLoginResponseDTO Structure - Critical for Login Flow")
    void testAuthLoginResponseDTOStructure() throws Exception {
        // Este test asegura que la estructura de login no se rompa
        AuthLoginResponseDTO loginResponse = UserDTOMapper.toAuthLoginResponseDTO(testUser, "access-token", "refresh-token");

        // Serializar a JSON
        String json = objectMapper.writeValueAsString(loginResponse);
        JsonNode jsonNode = objectMapper.readTree(json);

        // Verificar estructura principal
        assertTrue(jsonNode.has("tokens"), "Must have tokens object");
        assertTrue(jsonNode.has("status"), "Must have status object");
        assertTrue(jsonNode.has("profile"), "Must have profile object");
        assertTrue(jsonNode.has("privacy"), "Must have privacy object");
        assertTrue(jsonNode.has("notifications"), "Must have notifications object");
        assertTrue(jsonNode.has("metrics"), "Must have metrics object");
        assertTrue(jsonNode.has("matches"), "Must have matches object");
        assertTrue(jsonNode.has("auth"), "Must have auth object");
        assertTrue(jsonNode.has("account"), "Must have account object");

        // Verificar estructura de tokens
        JsonNode tokens = jsonNode.get("tokens");
        assertTrue(tokens.has("accessToken"), "Tokens must have accessToken");
        assertTrue(tokens.has("refreshToken"), "Tokens must have refreshToken");

        // Verificar campos críticos de status
        JsonNode status = jsonNode.get("status");
        assertTrue(status.has("verified"), "Status must have verified");
        assertTrue(status.has("profileComplete"), "Status must have profileComplete");
        assertTrue(status.has("approved"), "Status must have approved");
        assertTrue(status.has("role"), "Status must have role");

        // Verificar campos críticos de profile
        JsonNode profile = jsonNode.get("profile");
        assertTrue(profile.has("name"), "Profile must have name");
        assertTrue(profile.has("email"), "Profile must have email");
        assertTrue(profile.has("phone"), "Profile must have phone");
        assertTrue(profile.has("images"), "Profile must have images");

        // Validar que se puede deserializar de vuelta
        AuthLoginResponseDTO deserialized = objectMapper.readValue(json, AuthLoginResponseDTO.class);
        assertNotNull(deserialized);
        assertEquals("access-token", deserialized.accessToken());
        assertEquals("refresh-token", deserialized.refreshToken());
    }

    @Test
    @DisplayName("Test UserPublicResponseDTO Structure - Critical for Matching")
    void testUserPublicResponseDTOStructure() throws Exception {
        com.feeling.packages.user.domain.dto.UserResponseDTO publicResponse = UserDTOMapper.toUserPublicResponseDTO(testUser);

        String json = objectMapper.writeValueAsString(publicResponse);
        JsonNode jsonNode = objectMapper.readTree(json);

        // Verificar estructura principal
        assertTrue(jsonNode.has("status"), "Must have status object");
        assertTrue(jsonNode.has("profile"), "Must have profile object");

        // Verificar que tiene campos necesarios
        JsonNode profile = jsonNode.get("profile");
        assertTrue(profile.has("name"), "Profile must have name");
        assertTrue(profile.has("email"), "Profile must have email");
        assertTrue(profile.has("images"), "Profile must have images");
        assertTrue(profile.has("description"), "Profile must have description");

        // Validar deserialización
        com.feeling.packages.user.domain.dto.UserResponseDTO deserialized = objectMapper.readValue(json, com.feeling.packages.user.domain.dto.UserResponseDTO.class);
        assertNotNull(deserialized);
        assertNotNull(deserialized.profile());
        assertEquals("Test", deserialized.profile().name());
    }

    @Test
    @DisplayName("Test UserPublicResponseDTO vs UserStandardResponseDTO Differences")
    void testPublicVsStandardDifferences() throws Exception {
        com.feeling.packages.user.domain.dto.UserResponseDTO publicDTO = UserDTOMapper.toUserPublicResponseDTO(testUser);
        com.feeling.packages.user.domain.dto.UserResponseDTO standardDTO = UserDTOMapper.toUserStandardResponseDTO(testUser);

        String publicJson = objectMapper.writeValueAsString(publicDTO);
        String standardJson = objectMapper.writeValueAsString(standardDTO);

        JsonNode publicNode = objectMapper.readTree(publicJson);
        JsonNode standardNode = objectMapper.readTree(standardJson);

        // Both should have phone in profile
        assertTrue(publicNode.get("profile").has("phone"), "Public profile must have phone");
        assertTrue(standardNode.get("profile").has("phone"), "Standard profile must have phone");

        // Ambos deben tener campos básicos
        assertEquals(
            publicNode.get("profile").get("name").asText(),
            standardNode.get("profile").get("name").asText(),
            "Both should have same name"
        );
    }

    @Test
    @DisplayName("Test UserExtendedResponseDTO Complete Structure")
    void testUserExtendedResponseDTOStructure() throws Exception {
        com.feeling.packages.user.domain.dto.UserResponseDTO extended = UserDTOMapper.toUserExtendedResponseDTO(testUser);

        String json = objectMapper.writeValueAsString(extended);
        JsonNode jsonNode = objectMapper.readTree(json);

        // Verificar secciones principales (note: account is null in extended, only in admin operations)
        List<String> requiredSections = Arrays.asList(
            "status", "profile", "privacy", "notifications",
            "metrics", "auth"
        );

        for (String section : requiredSections) {
            assertTrue(jsonNode.has(section), "Must have " + section + " section");
        }

        // Verificar campos específicos de cada sección
        JsonNode privacy = jsonNode.get("privacy");
        assertTrue(privacy.has("publicAccount"), "Privacy must have publicAccount");
        assertTrue(privacy.has("searchVisibility"), "Privacy must have searchVisibility");

        JsonNode notifications = jsonNode.get("notifications");
        assertTrue(notifications.has("notificationsEmailEnabled"), "Notifications must have email settings");

        JsonNode metrics = jsonNode.get("metrics");
        assertTrue(metrics.has("profileViews"), "Metrics must have profileViews");
        assertTrue(metrics.has("likesReceived"), "Metrics must have likesReceived");

        // Validar deserialización
        com.feeling.packages.user.domain.dto.UserResponseDTO deserialized = objectMapper.readValue(json, com.feeling.packages.user.domain.dto.UserResponseDTO.class);
        assertNotNull(deserialized);
        assertEquals(testUser.getProfileViews(), deserialized.metrics().profileViews());
    }

    @Test
    @DisplayName("Test JSON Field Consistency Across DTOs")
    void testFieldConsistencyAcrossDTOs() throws Exception {
        // Test que campos comunes tengan el mismo nombre en JSON
        com.feeling.packages.user.domain.dto.UserResponseDTO standard = UserDTOMapper.toUserStandardResponseDTO(testUser);
        com.feeling.packages.user.domain.dto.UserResponseDTO publicDTO = UserDTOMapper.toUserPublicResponseDTO(testUser);
        com.feeling.packages.user.domain.dto.UserResponseDTO extended = UserDTOMapper.toUserExtendedResponseDTO(testUser);

        String standardJson = objectMapper.writeValueAsString(standard);
        String publicJson = objectMapper.writeValueAsString(publicDTO);
        String extendedJson = objectMapper.writeValueAsString(extended);

        JsonNode standardNode = objectMapper.readTree(standardJson);
        JsonNode publicNode = objectMapper.readTree(publicJson);
        JsonNode extendedNode = objectMapper.readTree(extendedJson);

        // Verificar que campos comunes tengan estructura consistente
        assertEquals(
            standardNode.get("profile").get("name").asText(),
            publicNode.get("profile").get("name").asText(),
            "Name field must be consistent across DTOs"
        );

        assertEquals(
            standardNode.get("profile").get("email").asText(),
            extendedNode.get("profile").get("email").asText(),
            "Email field must be consistent across DTOs"
        );

        assertEquals(
            standardNode.get("status").get("verified").asBoolean(),
            extendedNode.get("status").get("verified").asBoolean(),
            "Verified field must be consistent across DTOs"
        );
    }

    @Test
    @DisplayName("Test DTO Size and Performance Characteristics")
    void testDTOSizeAndPerformance() throws Exception {
        // Test para medir el impacto de performance de cada DTO
        long startTime = System.nanoTime();

        com.feeling.packages.user.domain.dto.UserResponseDTO extended = UserDTOMapper.toUserExtendedResponseDTO(testUser);
        String extendedJson = objectMapper.writeValueAsString(extended);

        long extendedTime = System.nanoTime() - startTime;

        startTime = System.nanoTime();
        com.feeling.packages.user.domain.dto.UserResponseDTO standard = UserDTOMapper.toUserStandardResponseDTO(testUser);
        String standardJson = objectMapper.writeValueAsString(standard);
        long standardTime = System.nanoTime() - startTime;

        // Log sizes for analysis
        System.out.println("Extended DTO JSON size: " + extendedJson.length() + " characters");
        System.out.println("Standard DTO JSON size: " + standardJson.length() + " characters");
        System.out.println("Extended serialization time: " + extendedTime + " ns");
        System.out.println("Standard serialization time: " + standardTime + " ns");

        // Assertion básica - Standard debe ser más pequeño que Extended
        assertTrue(standardJson.length() < extendedJson.length(),
            "Standard DTO should be smaller than Extended DTO");
    }

    /**
     * Test que valida la estructura actual para detectar cambios no intencionados
     */
    @Test
    @DisplayName("Test Current Structure Baseline - Regression Detection")
    void testCurrentStructureBaseline() throws Exception {
        // Este test falla si cambiamos estructura sin actualizar el test
        com.feeling.packages.user.domain.dto.UserResponseDTO extended = UserDTOMapper.toUserExtendedResponseDTO(testUser);
        String json = objectMapper.writeValueAsString(extended);
        JsonNode jsonNode = objectMapper.readTree(json);

        // Contar campos esperados en el nivel superior (note: account is null, matches is null in this version)
        int expectedTopLevelFields = 8; // status, profile, privacy, notifications, metrics, matches, auth, account
        assertEquals(expectedTopLevelFields, jsonNode.size(),
            "Expected exactly " + expectedTopLevelFields + " top-level fields in UserResponseDTO");

        // Verificar estructura específica que no debe cambiar sin planning
        assertTrue(jsonNode.get("status").has("role"), "Status must have role field");
        assertTrue(jsonNode.get("profile").has("phone"), "Profile must have phone field");
        assertTrue(jsonNode.get("privacy").has("publicAccount"), "Privacy must have publicAccount field");
    }
}
