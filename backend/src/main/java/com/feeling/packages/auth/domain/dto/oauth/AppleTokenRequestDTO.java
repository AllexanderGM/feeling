package com.feeling.packages.auth.domain.dto.oauth;

import jakarta.validation.constraints.NotBlank;

/**
 * Solicitud para iniciar el flujo de autenticación con Apple Sign In.
 * <p>
 * Se usa como contenedor del token y código de autorización entregados por Apple,
 * permitiendo que el servicio valide las credenciales externas antes de crear
 * o vincular un usuario dentro de la plataforma.
 *
 * @param identityToken     Token JWT emitido por Apple que contiene la identidad del usuario
 * @param authorizationCode Código de autorización opcional que permite solicitar tokens adicionales
 */
public record AppleTokenRequestDTO(
    @NotBlank(message = "Token de Apple es obligatorio")
    String identityToken,

    String authorizationCode
) {
}
