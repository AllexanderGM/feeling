package com.feeling.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.feeling.domain.dto.user.*;
import com.feeling.domain.dto.auth.UserProfileDataDTO;
import com.feeling.domain.dto.auth.UserStatusDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests básicos de compatibilidad para DTOs durante refactoring
 * Phase 1.2: Integration Tests Creation - Simplified Version
 */
@DisplayName("User DTO Compatibility Tests")
public class UserDTOCompatibilityTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("Test UserStandardResponseDTO Serialization")
    void testUserStandardResponseDTOSerialization() throws Exception {
        UserStatusDTO status = new UserStatusDTO(
                true, true, true, "APPROVED", "CLIENT", 10,
                LocalDateTime.now(), LocalDateTime.now()
        );

        UserProfileDataDTO profile = new UserProfileDataDTO(
                "Test", "User", "test@example.com", null, 25, "123456789",
                "+123456789", "+57", "Colombia", "Bogotá", "Cundinamarca",
                "Localidad", "Test description", Arrays.asList("img1.jpg", "img2.jpg"),
                "main.jpg", "NETWORKING", "Male", Arrays.asList("tag1", "tag2"),
                20, 30, 50, "Church", "Custom Church"
        );

        UserStandardResponseDTO dto = new UserStandardResponseDTO(status, profile);

        // Test serialization
        String json = objectMapper.writeValueAsString(dto);
        assertNotNull(json);
        assertTrue(json.contains("\"name\":\"Test\""));
        assertTrue(json.contains("\"email\":\"test@example.com\""));
        assertTrue(json.contains("\"verified\":true"));

        // Test deserialization
        UserStandardResponseDTO deserialized = objectMapper.readValue(json, UserStandardResponseDTO.class);
        assertNotNull(deserialized);
        assertEquals("Test", deserialized.profile().name());
        assertEquals("test@example.com", deserialized.profile().email());
        assertTrue(deserialized.status().verified());
    }

    @Test
    @DisplayName("Test UserPublicResponseDTO Serialization")
    void testUserPublicResponseDTOSerialization() throws Exception {
        UserPublicStatusDTO status = new UserPublicStatusDTO(
                true, true, true, "APPROVED", "NETWORKING"
        );

        UserProfileDataDTO profile = new UserProfileDataDTO(
                "Test", "User", "test@example.com", null, 25, "123456789",
                "+123456789", "+57", "Colombia", "Bogotá", "Cundinamarca",
                "Localidad", "Test description", Arrays.asList("img1.jpg"),
                "main.jpg", "NETWORKING", "Male", Arrays.asList("tag1"),
                20, 30, 50, "Church", "Custom Church"
        );

        UserPublicResponseDTO dto = new UserPublicResponseDTO(status, profile);

        // Test serialization
        String json = objectMapper.writeValueAsString(dto);
        assertNotNull(json);
        assertTrue(json.contains("\"phone\":\"123456789\""));

        // Test deserialization
        UserPublicResponseDTO deserialized = objectMapper.readValue(json, UserPublicResponseDTO.class);
        assertNotNull(deserialized);
        assertEquals("Test", deserialized.profile().name());
        assertEquals("123456789", deserialized.profile().phone());
    }

    @Test
    @DisplayName("Test UserSuggestionResponseDTO Structure")
    void testUserSuggestionResponseDTOStructure() throws Exception {
        UserPublicStatusDTO status = new UserPublicStatusDTO(
                true, true, true, "APPROVED", "NETWORKING"
        );

        UserSuggestionResponseDTO.UserSuggestionProfileDTO profile =
                new UserSuggestionResponseDTO.UserSuggestionProfileDTO(
                        "Test", "User", "test@example.com", null, 25, "123456789",
                        "Colombia", "Bogotá", "Cundinamarca", "Localidad",
                        "Test description", Arrays.asList("img1.jpg"), "main.jpg",
                        "NETWORKING", "Male", Arrays.asList("tag1"),
                        20, 30, 50, "Church", "Custom Church"
                );

        UserSuggestionResponseDTO dto = new UserSuggestionResponseDTO(status, profile);

        // Test serialization
        String json = objectMapper.writeValueAsString(dto);
        assertNotNull(json);
        assertFalse(json.contains("\"phone\""), "Should not contain phone field");
        assertFalse(json.contains("\"phoneCode\""), "Should not contain phoneCode field");
        assertTrue(json.contains("\"name\":\"Test\""));

        // Test deserialization
        UserSuggestionResponseDTO deserialized = objectMapper.readValue(json, UserSuggestionResponseDTO.class);
        assertNotNull(deserialized);
        assertEquals("Test", deserialized.profile().name());
        assertEquals("test@example.com", deserialized.profile().email());
    }

    @Test
    @DisplayName("Test JSON Field Names Consistency")
    void testJSONFieldNamesConsistency() throws Exception {
        // Test que los nombres de campos JSON sean consistentes
        UserStatusDTO status = new UserStatusDTO(
                true, true, true, "APPROVED", "CLIENT", 10,
                LocalDateTime.now(), LocalDateTime.now()
        );

        UserProfileDataDTO profile = new UserProfileDataDTO(
                "Test", "User", "test@example.com", null, 25, "123456789",
                "+123456789", "+57", "Colombia", "Bogotá", "Cundinamarca",
                "Localidad", "Test description", Arrays.asList("img1.jpg"),
                "main.jpg", "NETWORKING", "Male", Arrays.asList("tag1"),
                20, 30, 50, "Church", "Custom Church"
        );

        UserStandardResponseDTO standardDTO = new UserStandardResponseDTO(status, profile);
        String standardJson = objectMapper.writeValueAsString(standardDTO);

        // Verificar campos críticos
        assertTrue(standardJson.contains("\"verified\":true"));
        assertTrue(standardJson.contains("\"profileComplete\":true"));
        assertTrue(standardJson.contains("\"name\":\"Test\""));
        assertTrue(standardJson.contains("\"email\":\"test@example.com\""));
        assertTrue(standardJson.contains("\"phone\":\"123456789\""));
        assertTrue(standardJson.contains("\"country\":\"Colombia\""));
    }

    @Test
    @DisplayName("Test DTO Constructor Compatibility")
    void testDTOConstructorCompatibility() {
        // Test que los constructors funcionen correctamente
        assertDoesNotThrow(() -> {
            UserPublicStatusDTO status = new UserPublicStatusDTO(
                    true, true, true, "APPROVED", "NETWORKING"
            );
            assertNotNull(status);
            assertTrue(status.verified());
        });

        assertDoesNotThrow(() -> {
            UserStandardResponseDTO dto = new UserStandardResponseDTO(null, null);
            assertNotNull(dto);
        });

        assertDoesNotThrow(() -> {
            UserSuggestionResponseDTO dto = new UserSuggestionResponseDTO(null, null);
            assertNotNull(dto);
        });
    }
}