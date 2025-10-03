package com.feeling.packages.auth.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record ValidateTokenRequestDTO(
    @NotBlank(message = "Token es obligatorio")
    String token
) {}