package com.feeling.packages.auth.domain.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Solicitud genérica para validar tokens emitidos por el servicio de autenticación.
 * <p>
 * Se utiliza en escenarios donde se necesita confirmar la vigencia de un token
 * (restablecimiento de contraseña, verificación, etc.).
 *
 * @param token Token que se desea validar
 */
public record ValidateTokenRequestDTO(
    @NotBlank(message = "Token es obligatorio")
    String token
) {}
