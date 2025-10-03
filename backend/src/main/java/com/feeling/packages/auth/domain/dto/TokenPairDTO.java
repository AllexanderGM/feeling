package com.feeling.packages.auth.domain.dto;

/**
 * DTO para par de tokens JWT
 * Usado en respuestas de autenticación y refresh
 */
public record TokenPairDTO(
        String accessToken,
        String refreshToken
) {
}