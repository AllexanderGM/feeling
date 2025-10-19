package com.feeling.packages.auth.domain.dto.password;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Solicitud que inicia el flujo de recuperación de contraseña.
 * <p>
 * El dominio usa este DTO para validar la dirección de correo y
 * enviar el token de restablecimiento correspondiente.
 *
 * @param email Correo del usuario que requiere iniciar el proceso de recuperación
 */
@Schema(description = "Datos para solicitud de recuperación de contraseña")
public record ForgotPasswordRequestDTO(
    @Schema(description = "Email del usuario", example = "usuario@ejemplo.com")
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email no es válido")
    String email
) {
}
