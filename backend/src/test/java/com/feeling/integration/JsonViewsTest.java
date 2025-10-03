package com.feeling.integration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.feeling.packages.auth.domain.dto.UserProfileDataDTO;
import com.feeling.packages.auth.domain.dto.UserStatusDTO;
import com.feeling.domain.dto.views.UserViews;
import com.feeling.packages.user.domain.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests para verificar que las JsonViews controlan correctamente la serialización
 * Phase 2.3: JsonViews Testing
 * @deprecated This test uses deprecated DTOs. JsonViews functionality is now in UserResponseDTO
 */
@Deprecated(since = "1.8", forRemoval = true)
@DisplayName("JsonViews Serialization Tests")
public class JsonViewsTest {

    private ObjectMapper objectMapper;
    private com.feeling.packages.user.domain.dto.UserResponseDTO testUserDTO;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

        // Crear DTO de test con todos los campos
        UserStatusDTO status = new UserStatusDTO(
                1L, true, true, true, "APPROVED", "CLIENT", 10,
                LocalDateTime.now(), LocalDateTime.now()
        );

        UserProfileDataDTO profile = new UserProfileDataDTO(
                "John", "Doe", "john@example.com", LocalDate.of(1990, 1, 1), 30,
                "123456789", "+1234567890", "+1", "USA", "New York", "NY", "Manhattan",
                "Test description", Arrays.asList("img1.jpg", "img2.jpg"), "main.jpg",
                "NETWORKING", "Male", Arrays.asList("tag1", "tag2"),
                25, 35, 50, "Test Church", "Custom Church"
        );

        UserPrivacyDTO privacy = new UserPrivacyDTO(
                true, true, true, true, true, false, true
        );

        UserNotificationDTO notifications = new UserNotificationDTO(
                true, false, true, true, false, true
        );

        UserMetricsDTO metrics = new UserMetricsDTO(
                100L, 25L, 5L, 85.5, 95.0
        );

        UserMatchesDTO matches = new UserMatchesDTO(
                10, 2, 5, 10, 3L, 1L, 2L, 5L
        );

        com.feeling.packages.auth.domain.dto.AuthProviderInfoDTO auth = new com.feeling.packages.auth.domain.dto.AuthProviderInfoDTO(
                null, null, null, null
        );

        UserAccountStatusDTO account = new UserAccountStatusDTO(
                false, null, null
        );

        testUserDTO = new com.feeling.packages.user.domain.dto.UserResponseDTO(
                status, profile, privacy, metrics, matches, auth, account, notifications
        );
    }

    @Test
    @DisplayName("Test Public View - Should Only Show Basic Info")
    void testPublicView() throws JsonProcessingException {
        String json = objectMapper
                .writerWithView(UserViews.Public.class)
                .writeValueAsString(testUserDTO);

        JsonNode jsonNode = objectMapper.readTree(json);

        // Debe incluir campos públicos
        assertTrue(jsonNode.has("status"), "Should include status");
        assertTrue(jsonNode.has("profile"), "Should include profile");
        assertTrue(jsonNode.get("profile").has("name"), "Should include name");
        assertTrue(jsonNode.get("profile").has("age"), "Should include age");
        assertTrue(jsonNode.get("profile").has("country"), "Should include country");

        // NO debe incluir campos privados
        assertFalse(jsonNode.has("privacy"), "Should NOT include privacy");
        assertFalse(jsonNode.has("notifications"), "Should NOT include notifications");
        assertFalse(jsonNode.has("auth"), "Should NOT include auth");
        assertFalse(jsonNode.has("account"), "Should NOT include account");

        // NO debe incluir datos sensibles en profile
        assertFalse(jsonNode.get("profile").has("phone"), "Should NOT include phone");
        assertFalse(jsonNode.get("profile").has("document"), "Should NOT include document");
        assertFalse(jsonNode.get("profile").has("dateOfBirth"), "Should NOT include dateOfBirth");

        System.out.println("Public View JSON length: " + json.length());
    }

    @Test
    @DisplayName("Test Internal View - Should Show All User Data")
    void testInternalView() throws JsonProcessingException {
        String json = objectMapper
                .writerWithView(UserViews.Internal.class)
                .writeValueAsString(testUserDTO);

        JsonNode jsonNode = objectMapper.readTree(json);

        // Debe incluir todos los campos de usuario
        assertTrue(jsonNode.has("status"), "Should include status");
        assertTrue(jsonNode.has("profile"), "Should include profile");
        assertTrue(jsonNode.has("privacy"), "Should include privacy");
        assertTrue(jsonNode.has("notifications"), "Should include notifications");
        assertTrue(jsonNode.has("metrics"), "Should include metrics");
        assertTrue(jsonNode.has("matches"), "Should include matches");
        assertTrue(jsonNode.has("auth"), "Should include auth");

        // NO debe incluir campos de admin
        assertFalse(jsonNode.has("account"), "Should NOT include account (admin only)");

        // Debe incluir datos sensibles en profile
        assertTrue(jsonNode.get("profile").has("phone"), "Should include phone");
        assertTrue(jsonNode.get("profile").has("document"), "Should include document");
        assertTrue(jsonNode.get("profile").has("dateOfBirth"), "Should include dateOfBirth");
        assertTrue(jsonNode.get("profile").has("agePreferenceMin"), "Should include preferences");

        System.out.println("Internal View JSON length: " + json.length());
    }

    @Test
    @DisplayName("Test Admin View - Should Show Everything")
    void testAdminView() throws JsonProcessingException {
        String json = objectMapper
                .writerWithView(UserViews.Admin.class)
                .writeValueAsString(testUserDTO);

        JsonNode jsonNode = objectMapper.readTree(json);

        // Debe incluir TODOS los campos
        assertTrue(jsonNode.has("status"), "Should include status");
        assertTrue(jsonNode.has("profile"), "Should include profile");
        assertTrue(jsonNode.has("privacy"), "Should include privacy");
        assertTrue(jsonNode.has("notifications"), "Should include notifications");
        assertTrue(jsonNode.has("metrics"), "Should include metrics");
        assertTrue(jsonNode.has("matches"), "Should include matches");
        assertTrue(jsonNode.has("auth"), "Should include auth");
        assertTrue(jsonNode.has("account"), "Should include account");

        // Debe incluir todos los campos de profile
        assertTrue(jsonNode.get("profile").has("phone"), "Should include phone");
        assertTrue(jsonNode.get("profile").has("document"), "Should include document");
        assertTrue(jsonNode.get("profile").has("dateOfBirth"), "Should include dateOfBirth");

        System.out.println("Admin View JSON length: " + json.length());
    }

    @Test
    @DisplayName("Test Suggestions View - Should Exclude Phone")
    void testSuggestionsView() throws JsonProcessingException {
        String json = objectMapper
                .writerWithView(UserViews.Suggestions.class)
                .writeValueAsString(testUserDTO);

        JsonNode jsonNode = objectMapper.readTree(json);

        // Debe incluir campos para matching
        assertTrue(jsonNode.has("status"), "Should include status");
        assertTrue(jsonNode.has("profile"), "Should include profile");
        assertTrue(jsonNode.get("profile").has("name"), "Should include name");
        assertTrue(jsonNode.get("profile").has("age"), "Should include age");
        assertTrue(jsonNode.get("profile").has("description"), "Should include description");
        assertTrue(jsonNode.get("profile").has("images"), "Should include images");

        // NO debe incluir teléfono (característica crítica para sugerencias)
        assertFalse(jsonNode.get("profile").has("phone"), "Should NOT include phone in suggestions");
        assertFalse(jsonNode.get("profile").has("phoneCode"), "Should NOT include phoneCode in suggestions");

        // NO debe incluir configuraciones privadas
        assertFalse(jsonNode.has("privacy"), "Should NOT include privacy");
        assertFalse(jsonNode.has("notifications"), "Should NOT include notifications");

        System.out.println("Suggestions View JSON length: " + json.length());
    }

    @Test
    @DisplayName("Test Matched View - Should Include Contact Info")
    void testMatchedView() throws JsonProcessingException {
        String json = objectMapper
                .writerWithView(UserViews.Matched.class)
                .writeValueAsString(testUserDTO);

        JsonNode jsonNode = objectMapper.readTree(json);

        // Para usuarios que han hecho match, debe incluir información de contacto
        if (jsonNode.has("profile")) {
            assertTrue(jsonNode.get("profile").has("phone"), "Should include phone for matched users");
            assertTrue(jsonNode.get("profile").has("phoneCode"), "Should include phoneCode for matched users");
        }

        System.out.println("Matched View JSON length: " + json.length());
    }

    @Test
    @DisplayName("Test Metrics View - Should Only Show Metrics")
    void testMetricsView() throws JsonProcessingException {
        String json = objectMapper
                .writerWithView(UserViews.Metrics.class)
                .writeValueAsString(testUserDTO);

        JsonNode jsonNode = objectMapper.readTree(json);

        // Debe incluir métricas
        assertTrue(jsonNode.has("metrics"), "Should include metrics");

        // NO debe incluir otros campos
        assertFalse(jsonNode.has("privacy"), "Should NOT include privacy");
        assertFalse(jsonNode.has("notifications"), "Should NOT include notifications");
        assertFalse(jsonNode.has("auth"), "Should NOT include auth");

        System.out.println("Metrics View JSON length: " + json.length());
    }

    @Test
    @DisplayName("Test View Size Comparison")
    void testViewSizeComparison() throws JsonProcessingException {
        String publicJson = objectMapper
                .writerWithView(UserViews.Public.class)
                .writeValueAsString(testUserDTO);

        String internalJson = objectMapper
                .writerWithView(UserViews.Internal.class)
                .writeValueAsString(testUserDTO);

        String adminJson = objectMapper
                .writerWithView(UserViews.Admin.class)
                .writeValueAsString(testUserDTO);

        String suggestionsJson = objectMapper
                .writerWithView(UserViews.Suggestions.class)
                .writeValueAsString(testUserDTO);

        // Verificar que las vistas tienen diferentes tamaños
        assertTrue(publicJson.length() < internalJson.length(),
                "Public view should be smaller than internal view");

        assertTrue(internalJson.length() < adminJson.length(),
                "Internal view should be smaller than admin view");

        assertTrue(suggestionsJson.length() < internalJson.length(),
                "Suggestions view should be smaller than internal view");

        System.out.println("Size comparison:");
        System.out.println("Public: " + publicJson.length() + " characters");
        System.out.println("Suggestions: " + suggestionsJson.length() + " characters");
        System.out.println("Internal: " + internalJson.length() + " characters");
        System.out.println("Admin: " + adminJson.length() + " characters");
    }

    @Test
    @DisplayName("Test No View Specified - Should Show Everything")
    void testNoViewSpecified() throws JsonProcessingException {
        String json = objectMapper.writeValueAsString(testUserDTO);
        JsonNode jsonNode = objectMapper.readTree(json);

        // Sin vista especificada, debe mostrar todos los campos
        assertTrue(jsonNode.has("status"), "Should include all fields when no view specified");
        assertTrue(jsonNode.has("privacy"), "Should include all fields when no view specified");
        assertTrue(jsonNode.has("account"), "Should include all fields when no view specified");

        System.out.println("No View JSON length: " + json.length());
    }
}