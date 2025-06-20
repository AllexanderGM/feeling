package com.feeling.domain.dto.auth;

public record AuthLoginResponseDTO(
        String image,
        String email,
        String name,
        String lastName,
        String role,
        String token,
        Boolean verified,
        Boolean completeProfile
) {
}
