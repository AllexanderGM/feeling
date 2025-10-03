package com.feeling.packages.auth.domain.dto;

import java.time.LocalDateTime;

public record UserStatusDTO(
        Long id,
        Boolean verified,
        Boolean profileComplete,
        Boolean approved,
        String approvalStatus,
        String role,
        Integer availableAttempts,
        LocalDateTime createdAt,
        LocalDateTime lastActive
) {
}