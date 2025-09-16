package com.feeling.domain.dto.user;

import com.feeling.domain.dto.auth.UserStatusDTO;
import com.feeling.domain.dto.auth.UserProfileDataDTO;

/**
 * DTO base para todas las respuestas de usuario
 * Contiene la estructura común: status + profile
 */
public record UserBaseResponseDTO(
        UserStatusDTO status,
        UserProfileDataDTO profile
) {
}