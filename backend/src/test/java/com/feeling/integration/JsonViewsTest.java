package com.feeling.integration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.feeling.packages.auth.domain.dto.response.AuthProviderInfoDTO;
import com.feeling.packages.user.domain.dto.analytics.UserPerformanceMetricsDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserAccountStatusDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserDataDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserMatchesDTO;
import com.feeling.packages.user.domain.dto.profile.core.UserStatusDTO;
import com.feeling.packages.user.domain.dto.profile.preferences.UserNotificationDTO;
import com.feeling.packages.user.domain.dto.profile.preferences.UserPrivacyDTO;
import com.feeling.packages.user.domain.dto.profile.response.UserResponseDTO;
import com.feeling.packages.user.domain.dto.views.UserViews;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Tests para verificar que las JsonViews controlan correctamente la serialización
 * Phase 2.3: JsonViews Testing
 *
 * @deprecated This test uses deprecated DTOs. JsonViews functionality is now in UserResponseDTO
 */
@Deprecated(since = "1.8", forRemoval = true)
@DisplayName("JsonViews Serialization Tests")
public class JsonViewsTest {

    private ObjectMapper objectMapper;
    private UserResponseDTO testUserDTO;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

        // Crear DTO de test con todos los campos
        UserStatusDTO status = new UserStatusDTO(
            true,
            true,
            LocalDateTime.now().minusDays(1),
            true,
            "APPROVED",
            "CLIENT",
            10,
            LocalDateTime.now().minusMonths(1),
            false,
            null,
            null,
            false,
            false,
            false,
            false
        );

        UserDataDTO profile = new UserDataDTO(
            100L,
            "John",
            "Doe",
            "john@example.com",
            LocalDate.of(1990, 1, 1),
            30,
            "Software Engineer",
            "123456789",
            "+1234567890",
            "+1",
            "USA",
            "New York",
            "NY",
            "Manhattan",
            "Test description",
            Arrays.asList("img1.jpg", "img2.jpg"),
            "main.jpg",
            "NETWORKING",
            "Male",
            Arrays.asList("tag1", "tag2"),
            25,
            35,
            50,
            "Single",
            175,
            "Brown",
            "Black",
            "Athletic",
            "University",
            "Test Church",
            "Christian",
            "Prayer moments",
            "Meditation",
            "Active",
            "Long-term"
        );

        UserPrivacyDTO privacy = new UserPrivacyDTO(
            true, true, true, true, true, false, true
        );

        UserNotificationDTO notifications = new UserNotificationDTO(
            true, false, true, true, false, true
        );

        UserPerformanceMetricsDTO metrics = new UserPerformanceMetricsDTO(
            100L, 25L, 5L, 85.5, 95.0
        );

        UserMatchesDTO matches = new UserMatchesDTO(
            10, 2, 5, 10, 3L, 1L, 2L, 5L
        );

        AuthProviderInfoDTO auth = new AuthProviderInfoDTO(
            null, null, null, null
        );

        UserAccountStatusDTO account = new UserAccountStatusDTO(
            false, null, null
        );

        testUserDTO = new UserResponseDTO(
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
        assertTrue(jsonNode.has("complaintStatus"), "Should include complaintStatus");
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
        assertFalse(jsonNode.get("profile").has("email"), "Should NOT include email");
        assertFalse(jsonNode.get("profile").has("document"), "Should NOT include document");
        assertFalse(jsonNode.get("profile").has("dateOfBirth"), "Should NOT include dateOfBirth");

        // NO debe incluir características físicas en PUBLIC
        assertFalse(jsonNode.get("profile").has("gender"), "Should NOT include gender");
        assertFalse(jsonNode.get("profile").has("maritalStatus"), "Should NOT include maritalStatus");
        assertFalse(jsonNode.get("profile").has("height"), "Should NOT include height");
        assertFalse(jsonNode.get("profile").has("eyeColor"), "Should NOT include eyeColor");
        assertFalse(jsonNode.get("profile").has("hairColor"), "Should NOT include hairColor");
        assertFalse(jsonNode.get("profile").has("bodyType"), "Should NOT include bodyType");
        assertFalse(jsonNode.get("profile").has("education"), "Should NOT include education");

        // NO debe incluir datos espirituales en PUBLIC
        assertFalse(jsonNode.get("profile").has("church"), "Should NOT include church");
        assertFalse(jsonNode.get("profile").has("customChurch"), "Should NOT include customChurch");
        assertFalse(jsonNode.get("profile").has("religion"), "Should NOT include religion");
        assertFalse(jsonNode.get("profile").has("spiritualMoments"), "Should NOT include spiritualMoments");
        assertFalse(jsonNode.get("profile").has("spiritualPractices"), "Should NOT include spiritualPractices");

        // NO debe incluir datos de relación en PUBLIC
        assertFalse(jsonNode.get("profile").has("sexualRole"), "Should NOT include sexualRole");
        assertFalse(jsonNode.get("profile").has("relationshipType"), "Should NOT include relationshipType");

        // SÍ debe incluir phoneCode en PUBLIC (según requerimiento)
        assertTrue(jsonNode.get("profile").has("phoneCode"), "Should include phoneCode in PUBLIC");

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
        assertTrue(jsonNode.has("complaintStatus"), "Should include complaintStatus");
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

//    @Test
//     @DisplayName("Test Admin View - Should Show Everything")
//     void testAdminView() throws JsonProcessingException {
//         String json = objectMapper
//             .writerWithView(UserViews.Admin.class)
//             .writeValueAsString(testUserDTO);
//
//         JsonNode jsonNode = objectMapper.readTree(json);
//
//         // Debe incluir TODOS los campos
//         assertTrue(jsonNode.has("complaintStatus"), "Should include complaintStatus");
//         assertTrue(jsonNode.has("profile"), "Should include profile");
//         assertTrue(jsonNode.has("privacy"), "Should include privacy");
//         assertTrue(jsonNode.has("notifications"), "Should include notifications");
//         assertTrue(jsonNode.has("analytics"), "Should include analytics");
//         assertTrue(jsonNode.has("matches"), "Should include matches");
//         assertTrue(jsonNode.has("auth"), "Should include auth");
//         assertTrue(jsonNode.has("account"), "Should include account");
//
//         // Debe incluir todos los campos de profile
//         assertTrue(jsonNode.get("profile").has("phone"), "Should include phone");
//         assertTrue(jsonNode.get("profile").has("document"), "Should include document");
//         assertTrue(jsonNode.get("profile").has("dateOfBirth"), "Should include dateOfBirth");
//
//         System.out.println("Admin View JSON length: " + json.length());
//     }

    @Test
    @DisplayName("Test Suggestions View - Should Exclude Phone")
    void testSuggestionsView() throws JsonProcessingException {
        String json = objectMapper
            .writerWithView(UserViews.Suggestions.class)
            .writeValueAsString(testUserDTO);

        JsonNode jsonNode = objectMapper.readTree(json);

        // Debe incluir campos para matching
        assertTrue(jsonNode.has("complaintStatus"), "Should include complaintStatus");
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
    @DisplayName("Test View Size Comparison")
    void testViewSizeComparison() throws JsonProcessingException {
        String publicJson = objectMapper
            .writerWithView(UserViews.Public.class)
            .writeValueAsString(testUserDTO);

        String internalJson = objectMapper
            .writerWithView(UserViews.Internal.class)
            .writeValueAsString(testUserDTO);

        // Admin view removed - admins see all fields without view restrictions
        // String adminJson = objectMapper
        //     .writerWithView(UserViews.Admin.class)
        //     .writeValueAsString(testUserDTO);

        String suggestionsJson = objectMapper
            .writerWithView(UserViews.Suggestions.class)
            .writeValueAsString(testUserDTO);

        // Verificar que las vistas tienen diferentes tamaños
        assertTrue(publicJson.length() < internalJson.length(),
            "Public view should be smaller than internal view");

        // assertTrue(internalJson.length() < adminJson.length(),
        //     "Internal view should be smaller than admin view");

        assertTrue(suggestionsJson.length() < internalJson.length(),
            "Suggestions view should be smaller than internal view");

        System.out.println("Size comparison:");
        System.out.println("Public: " + publicJson.length() + " characters");
        System.out.println("Suggestions: " + suggestionsJson.length() + " characters");
        System.out.println("Internal: " + internalJson.length() + " characters");
        // System.out.println("Admin: " + adminJson.length() + " characters");
    }

    @Test
    @DisplayName("Test No View Specified - Should Show Everything")
    void testNoViewSpecified() throws JsonProcessingException {
        String json = objectMapper.writeValueAsString(testUserDTO);
        JsonNode jsonNode = objectMapper.readTree(json);

        // Sin vista especificada, debe mostrar todos los campos
        assertTrue(jsonNode.has("complaintStatus"), "Should include all fields when no view specified");
        assertTrue(jsonNode.has("privacy"), "Should include all fields when no view specified");
        assertTrue(jsonNode.has("account"), "Should include all fields when no view specified");

        System.out.println("No View JSON length: " + json.length());
    }
}
