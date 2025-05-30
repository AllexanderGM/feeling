package com.feeling.domain.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record GoogleTokenRequestDTO(
        @NotBlank(message = "El token de acceso de Google es obligatorio")
        String accessToken,

        String tokenType,
        String scope
) {
}
