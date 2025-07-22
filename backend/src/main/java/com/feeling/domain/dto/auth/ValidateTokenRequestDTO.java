package com.feeling.domain.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record ValidateTokenRequestDTO(
    @NotBlank(message = "Token es obligatorio")
    String token
) {}