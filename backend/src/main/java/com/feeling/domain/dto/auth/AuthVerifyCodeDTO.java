package com.feeling.domain.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthVerifyCodeDTO(
        @Email(message = "El correo debe ser válido")
        String email,

        @NotBlank(message = "El código es obligatorio")
        String code
) {
}
