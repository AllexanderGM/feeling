package com.feeling.domain.dto.auth;

import java.time.LocalDateTime;

public record UserStatusDTO(
        Boolean verified,
        Boolean profileComplete,
        Boolean approved,
        String role,
        Integer availableAttempts,
        LocalDateTime createdAt,
        LocalDateTime lastActive
) {
}