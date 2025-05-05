package com.tours.domain.dto.auth;

public record AuthResponseDTO(
        String image,
        String email,
        String name,
        String lastName,
        String role,
        String token
) {
}
