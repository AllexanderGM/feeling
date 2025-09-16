package com.feeling.domain.dto.user;

import com.feeling.domain.dto.auth.UserProfileDataDTO;

/**
 * DTO para datos públicos del usuario (sin información sensible)
 * Mantiene la estructura base pero solo con perfil público
 */
public record UserPublicResponseDTO(
        UserPublicStatusDTO status,
        UserProfileDataDTO profile
) {
}