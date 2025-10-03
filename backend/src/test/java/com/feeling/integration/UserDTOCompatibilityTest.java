package com.feeling.integration;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

/**
 * Tests básicos de compatibilidad para DTOs durante refactoring
 * Phase 1.2: Integration Tests Creation - Simplified Version
 * @deprecated This test uses deprecated DTOs that no longer exist. Functionality is now in UserResponseDTO
 *             These tests have been disabled as the DTOs (UserStandardResponseDTO, UserPublicResponseDTO,
 *             UserSuggestionResponseDTO) were removed during the DTO consolidation refactoring.
 *
 *             The DTOs were consolidated into a single UserResponseDTO with different factory methods
 *             for different access levels (public, standard, extended).
 *
 *             See UserResponseDTO and UserResponseFactory for the current implementation.
 */
@Deprecated(since = "1.8", forRemoval = true)
@DisplayName("User DTO Compatibility Tests (DISABLED)")
public class UserDTOCompatibilityTest {

    @Test
    @DisplayName("Compatibility tests disabled - DTOs consolidated into UserResponseDTO")
    void testDisabled() {
        // These tests have been disabled as the DTOs they test no longer exist.
        // The functionality has been consolidated into UserResponseDTO with factory methods:
        // - UserDTOMapper.toUserStandardResponseDTO() -> UserResponseDTO
        // - UserDTOMapper.toUserPublicResponseDTO() -> UserResponseDTO
        // - UserDTOMapper.toUserExtendedResponseDTO() -> UserResponseDTO
        //
        // See UserDTOStructureIntegrationTest for current DTO structure tests.
        System.out.println("UserDTOCompatibilityTest disabled - DTOs consolidated");
    }
}
