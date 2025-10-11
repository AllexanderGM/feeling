package com.feeling.packages.auth.domain.dto.response;

/**
 * Respuesta emitida después de refrescar un token JWT.
 *
 * @param tokens Nuevo par de tokens generado tras la validación
 * @param message Mensaje de confirmación para mostrar al usuario
 */
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
