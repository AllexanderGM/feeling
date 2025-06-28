// RefreshTokenRequestDTO.java
package com.feeling.domain.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequestDTO(
        @NotBlank(message = "Refresh token es requerido")
        String refreshToken
) {
}