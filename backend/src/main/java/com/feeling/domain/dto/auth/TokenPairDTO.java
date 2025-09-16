package com.feeling.domain.dto.auth;

/**
 * DTO para par de tokens JWT
 * Usado en respuestas de autenticación y refresh
 */
public record TokenPairDTO(
        String accessToken,
        String refreshToken
) {
}