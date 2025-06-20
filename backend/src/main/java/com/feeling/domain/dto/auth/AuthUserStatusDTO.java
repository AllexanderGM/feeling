package com.feeling.domain.dto.auth;

public record AuthUserStatusDTO(
        String email,
        boolean fullyRegistered,
        boolean verified,
        boolean profileComplete
) {
}
