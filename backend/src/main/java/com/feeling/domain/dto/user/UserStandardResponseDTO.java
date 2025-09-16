package com.feeling.domain.dto.user;

import com.feeling.domain.dto.auth.UserStatusDTO;
import com.feeling.domain.dto.auth.UserProfileDataDTO;

/**
 * DTO estandarizado para respuestas que incluyen datos completos del usuario
 * Extiende UserBaseResponseDTO con información completa de status
 */
public record UserStandardResponseDTO(
        UserStatusDTO status,
        UserProfileDataDTO profile
) {

    /**
     * Constructor desde UserBaseResponseDTO (conversión)
     */
    public UserStandardResponseDTO(UserBaseResponseDTO base) {
        this(base.status(), base.profile());
    }
}