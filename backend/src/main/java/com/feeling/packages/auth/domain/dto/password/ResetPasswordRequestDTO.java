package com.feeling.packages.auth.domain.dto.password;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Solicitud para restablecer una contraseña olvidada mediante token temporal.
 * <p>
 * Se utiliza tras la verificación del correo para establecer una nueva credencial
 * que reemplaza a la anterior comprometida u olvidada.
 *
 * @param token           Token de recuperación enviado por email al usuario
 * @param password        Nueva contraseña propuesta por el usuario
 * @param confirmPassword Confirmación explícita de la nueva contraseña
 */
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
    /**
     * Verifica que la confirmación coincida con la nueva contraseña.
     *
     * @return {@code true} si ambas cadenas son idénticas
     */
    public boolean passwordsMatch() {
        return password != null && password.equals(confirmPassword);
    }
}
