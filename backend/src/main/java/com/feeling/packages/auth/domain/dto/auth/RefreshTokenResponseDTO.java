package com.feeling.packages.auth.domain.dto.auth;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.views.AuthViews;

/**
 * Respuesta emitida después de refrescar un token JWT.
 *
 * @param tokens  Nuevo par de tokens generado tras la validación.
 * @param message Mensaje de confirmación para mostrar al usuario.
 */
public record RefreshTokenResponseDTO(
    @JsonView(AuthViews.Session.Basic.class)
    TokenResponseDTO tokens,

    @JsonView(AuthViews.Session.Basic.class)
    String message
) {

    /**
     * Constructor de conveniencia para mantener compatibilidad.
     */
    public RefreshTokenResponseDTO(String accessToken, String refreshToken, String message) {
        this(new TokenResponseDTO(accessToken, refreshToken), message);
    }
}
