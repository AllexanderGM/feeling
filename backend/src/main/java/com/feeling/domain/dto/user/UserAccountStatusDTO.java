package com.feeling.domain.dto.user;

import java.time.LocalDateTime;

/**
 * DTO para estado de cuenta del usuario
 */
public record UserAccountStatusDTO(
        Boolean accountDeactivated,
        LocalDateTime deactivationDate,
        String deactivationReason
) {
}