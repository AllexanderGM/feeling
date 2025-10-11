package com.feeling.packages.auth.domain.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Solicitud para confirmar la verificación de correo electrónico.
 * <p>
 * Contiene el par email-código que el dominio valida para completar
 * el proceso de activación de cuenta.
 *
 * @param email Correo que recibió el código de verificación
 * @param code Código de seis dígitos ingresado por el usuario
 */

public record AuthVerifyCodeDTO(
        @NotBlank(message = "El correo electrónico es obligatorio")
        @Email(message = "El formato del correo electrónico no es válido")
        String email,

        @NotBlank(message = "El código de verificación es obligatorio")
        @Pattern(regexp = "\\d{6}", message = "El código debe ser de 6 dígitos")
        String code
) {
}
