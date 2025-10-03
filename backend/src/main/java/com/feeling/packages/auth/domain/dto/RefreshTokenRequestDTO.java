// RefreshTokenRequestDTO.java
package com.feeling.packages.auth.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequestDTO(
        @NotBlank(message = "Refresh token es requerido")
        String refreshToken
) {
}