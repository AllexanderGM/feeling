package com.feeling.packages.auth.domain.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Solicitud de autenticación local mediante email y contraseña.
 * <p>
 * Este DTO encapsula las credenciales provistas por el usuario final para que
 * el dominio ejecute el flujo de validación y emisión de tokens.
 *
 * @param email    Correo electrónico utilizado como identificador de acceso
 * @param password Contraseña en texto plano que será autenticada contra el directorio local
 */

public record AuthLoginRequestDTO(
    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El formato del correo electrónico no es válido")
    String email,

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres")
    String password
) {
}
