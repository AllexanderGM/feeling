package com.feeling.packages.auth.domain.dto;

public record RefreshTokenResponseDTO(
        TokenPairDTO tokens,
        String message
) {

    /**
     * Constructor de conveniencia para mantener compatibilidad
     */
    public RefreshTokenResponseDTO(String accessToken, String refreshToken, String message) {
        this(new TokenPairDTO(accessToken, refreshToken), message);
    }

    /**
     * Getters para compatibilidad hacia atrás
     */
    public String accessToken() {
        return tokens.accessToken();
    }

    public String refreshToken() {
        return tokens.refreshToken();
    }
}