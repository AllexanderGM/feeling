package com.feeling.domain.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Datos para restablecimiento de contraseña")
public record ResetPasswordRequestDTO(
        @Schema(description = "Token de recuperación", example = "abc123xyz789")
        @NotBlank(message = "El token es obligatorio")
        String token,

        @Schema(description = "Nueva contraseña", example = "NuevaPassword123!")
        @NotBlank(message = "La nueva contraseña es obligatoria")
        @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
        String password,

        @Schema(description = "Confirmación de la nueva contraseña", example = "NuevaPassword123!")
        @NotBlank(message = "La confirmación de contraseña es obligatoria")
        String confirmPassword
) {
    public boolean passwordsMatch() {
        return password != null && password.equals(confirmPassword);
    }
}