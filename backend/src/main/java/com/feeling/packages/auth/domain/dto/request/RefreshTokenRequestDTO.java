package com.feeling.packages.auth.domain.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Solicitud para renovar el par de tokens JWT.
 * <p>
 * Centraliza el refresh token que debe validarse antes de emitir nuevas credenciales.
 *
 * @param refreshToken Token de refresco previamente emitido por el servicio
 */
public record RefreshTokenRequestDTO(
        @NotBlank(message = "Refresh token es requerido")
        String refreshToken
) {
}
