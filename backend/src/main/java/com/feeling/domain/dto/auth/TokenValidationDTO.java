package com.feeling.domain.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Respuesta de validación de token")
public record TokenValidationDTO(
        @Schema(description = "Token válido", example = "true")
        boolean valid,

        @Schema(description = "Email asociado al token", example = "usuario@ejemplo.com")
        String email,

        @Schema(description = "Mensaje informativo", example = "Token válido")
        String message,

        @Schema(description = "Tiempo restante en minutos", example = "15")
        Long minutesRemaining
) {
}