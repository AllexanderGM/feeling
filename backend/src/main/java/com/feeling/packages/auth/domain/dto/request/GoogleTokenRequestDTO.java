package com.feeling.packages.auth.domain.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Solicitud para procesar tokens emitidos por Google OAuth.
 * <p>
 * Agrupa la información que el dominio necesita para validar el token
 * y transformarlo en credenciales internas (registro o login social).
 *
 * @param accessToken Token de acceso emitido por Google
 * @param tokenType Tipo de token entregado por Google (opcional)
 * @param scope Alcance concedido al token (opcional)
 */
public record GoogleTokenRequestDTO(
        @NotBlank(message = "El token de acceso de Google es obligatorio")
        String accessToken,

        String tokenType,
        String scope
) {
}
