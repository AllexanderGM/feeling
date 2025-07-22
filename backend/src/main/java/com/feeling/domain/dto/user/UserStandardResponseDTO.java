package com.feeling.domain.dto.user;

import com.feeling.domain.dto.auth.UserStatusDTO;
import com.feeling.domain.dto.auth.UserProfileDataDTO;

/**
 * DTO estandarizado para respuestas que incluyen datos completos del usuario
 * Mantiene la misma estructura que AuthLoginResponseDTO pero sin tokens
 */
public record UserStandardResponseDTO(
        UserStatusDTO status,
        UserProfileDataDTO profile
) {
}