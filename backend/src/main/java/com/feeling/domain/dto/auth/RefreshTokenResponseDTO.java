package com.feeling.domain.dto.auth;

public record RefreshTokenResponseDTO(
        String accessToken,
        String message
) {
}