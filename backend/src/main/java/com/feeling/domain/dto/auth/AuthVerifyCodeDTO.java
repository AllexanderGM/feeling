package com.feeling.domain.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AuthVerifyCodeDTO(
        @NotBlank(message = "El correo electrónico es obligatorio")
        @Email(message = "El formato del correo electrónico no es válido")
        String email,

        @NotBlank(message = "El código de verificación es obligatorio")
        @Pattern(regexp = "\\d{6}", message = "El código debe ser de 6 dígitos")
        String code
) {
}
