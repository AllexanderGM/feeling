package com.feeling.domain.dto.user;

import com.feeling.domain.dto.auth.UserStatusDTO;
import com.feeling.domain.dto.auth.UserProfileDataDTO;

/**
 * DTO estandarizado para respuestas que incluyen datos completos del usuario
 * Base común para responses con status + profile
 */
public record UserStandardResponseDTO(
        UserStatusDTO status,
        UserProfileDataDTO profile
) {
}