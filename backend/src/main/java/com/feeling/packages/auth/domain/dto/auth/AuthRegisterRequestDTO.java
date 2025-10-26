package com.feeling.packages.auth.domain.dto.auth;

import com.feeling.packages.auth.infrastructure.validation.PasswordMatch;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Solicitud de registro para usuarios locales.
 * <p>
 * Reúne la información mínima exigida por el dominio para crear una cuenta tradicional
 * y disparar el proceso de verificación de correo electrónico.
 *
 * @param name            Nombre del usuario a registrar
 * @param lastName        Apellido del usuario a registrar
 * @param email           Correo que funcionará como identificador de la cuenta
 * @param password        Contraseña inicial en texto plano que será cifrada antes de persistirla
 * @param confirmPassword Confirmación de la contraseña para validar que coincidan
 */

@PasswordMatch(message = "Las contraseñas no coinciden")
public record AuthRegisterRequestDTO(
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    String name,

    @NotBlank(message = "El apellido es obligatorio")
    @Size(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres")
    String lastName,

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El formato del correo electrónico no es válido")
    String email,

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres")
    String password,

    @NotBlank(message = "La confirmación de contraseña es obligatoria")
    String confirmPassword
) {
}
