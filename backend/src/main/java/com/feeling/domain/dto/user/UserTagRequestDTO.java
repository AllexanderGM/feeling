package com.feeling.domain.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserTagRequestDTO(
        @NotBlank(message = "El nombre del tag es obligatorio")
        @Size(min = 2, max = 30, message = "El tag debe tener entre 2 y 30 caracteres")
        String name
) {
}
