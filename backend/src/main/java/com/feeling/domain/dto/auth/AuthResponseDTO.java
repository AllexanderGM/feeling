package com.feeling.domain.dto.auth;

public record AuthResponseDTO(
        String image,
        String email,
        String name,
        String lastName,
        String role,
        String token
) {
}
