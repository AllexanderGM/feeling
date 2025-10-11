package com.feeling.packages.auth.domain.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Solicitud para reenviar el código de verificación de email.
 * <p>
 * El dominio utiliza este DTO para validar la dirección sobre la que
 * se generará un nuevo token de verificación.
 *
 * @param email Correo del usuario que necesita un nuevo código de verificación
 */

public record AuthResendCodeRequestDTO(
        @NotBlank(message = "Email es requerido")
        @Email(message = "Email debe tener un formato válido")
        String email
) {
}
