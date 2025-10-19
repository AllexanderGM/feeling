package com.feeling.packages.auth.domain.dto.auth;

import com.fasterxml.jackson.annotation.JsonView;
import com.feeling.packages.auth.domain.dto.views.AuthViews;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Resultado de validar un token administrado por el servicio de autenticación.
 *
 * @param valid            Indica si el token conserva su vigencia.
 * @param email            Email asociado al token validado.
 * @param message          Mensaje contextual para el cliente.
 * @param minutesRemaining Minutos restantes antes de su expiración.
 */
@Schema(description = "Respuesta de validación de token")
public record TokenValidationDTO(
    @Schema(description = "Token válido", example = "true")
    @JsonView(AuthViews.Session.Basic.class)
    boolean valid,

    @Schema(description = "Email asociado al token", example = "usuario@ejemplo.com")
    @JsonView(AuthViews.Session.Basic.class)
    String email,

    @Schema(description = "Mensaje informativo", example = "Token válido")
    @JsonView(AuthViews.Session.Basic.class)
    String message,

    @Schema(description = "Tiempo restante en minutos", example = "15")
    @JsonView(AuthViews.Session.Basic.class)
    Long minutesRemaining
) {
}
