package com.feeling.packages.auth.domain.dto;

public record AuthUserStatusDTO(
        String email,
        boolean fullyRegistered,
        boolean verified,
        boolean profileComplete
) {
}
