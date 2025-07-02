package com.feeling.domain.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthResendCodeRequestDTO(
        @NotBlank(message = "Email es requerido")
        @Email(message = "Email debe tener un formato válido")
        String email
) {
}
