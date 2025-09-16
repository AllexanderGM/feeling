package com.feeling.domain.dto.user;

/**
 * DTO para status público del usuario (sin información sensible)
 * Usado en UserPublicResponseDTO y UserSuggestionResponseDTO
 */
public record UserPublicStatusDTO(
        Boolean verified,
        Boolean profileComplete,
        Boolean approved,
        String approvalStatus,
        String categoryInterest
) {
}