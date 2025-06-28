package com.feeling.domain.dto.auth;

public record AuthLoginResponseDTO(
        String image,
        String email,
        String name,
        String lastName,
        String role,
        String accessToken,
        String refreshToken,
        Boolean verified,
        Boolean completeProfile
) {
}